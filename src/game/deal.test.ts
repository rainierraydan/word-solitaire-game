import { describe, expect, it } from 'vitest';
import { CATEGORIES, type Category } from '../data/categories';
import { buildDeck, deal } from './deal';
import { levelConfig } from './levels';
import { activeFoundationIds, activeTableauIds, countWords, TABLEAU_IDS } from './state';

// A small pool with counts unlike the real content, so nothing hardcoded survives.
const SMALL_POOL: Category[] = [
  { id: 'x', name: 'X', words: Array.from({ length: 12 }, (_, i) => `x${i}`) },
  { id: 'y', name: 'Y', words: Array.from({ length: 10 }, (_, i) => `y${i}`) },
  { id: 'z', name: 'Z', words: Array.from({ length: 8 }, (_, i) => `z${i}`) },
];

describe('buildDeck', () => {
  it('builds one card per category plus one per word', () => {
    const deck = buildDeck(SMALL_POOL);
    expect(deck).toHaveLength(3 + 30);
    expect(deck.filter((c) => c.kind === 'category')).toHaveLength(3);
  });
});

describe('deal', () => {
  it.each([1, 4, 7])('level %i: per-level columns, 0..C-1 face-down plus one face-up', (level) => {
    const config = levelConfig(level);
    const state = deal(CATEGORIES, 42, level);
    expect(state.level).toBe(level);
    expect(state.tableauCount).toBe(config.columnCount);
    expect(state.foundationCount).toBe(config.foundationCount);

    activeTableauIds(state).forEach((columnId, i) => {
      const column = state.piles[columnId];
      expect(column).toHaveLength(i + 1);
      const faceUpInColumn = column.filter((id) => state.faceUp.has(id));
      expect(faceUpInColumn).toEqual([column[column.length - 1]]);
    });
    for (const columnId of TABLEAU_IDS.slice(config.columnCount)) {
      expect(state.piles[columnId]).toEqual([]);
    }
    expect(state.faceUp.size).toBe(config.columnCount);
  });

  it("draws the level's category count with 2-8 words each", () => {
    const state = deal(CATEGORIES, 42, 1);
    const categoryCards = Object.values(state.cards).filter((c) => c.kind === 'category');
    expect(categoryCards).toHaveLength(levelConfig(1).categoryCount);
    for (const card of categoryCards) {
      const words = countWords(state, card.categoryId);
      expect(words).toBeGreaterThanOrEqual(2);
      expect(words).toBeLessThanOrEqual(8);
    }
  });

  it('always covers the tableau plus at least one stock card', () => {
    for (const seed of [1, 2, 3, 4, 5, 99]) {
      for (const level of [1, 5, 7]) {
        const state = deal(CATEGORIES, seed, level);
        expect(state.piles.stock.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('starts with waste and foundations empty', () => {
    const state = deal(CATEGORIES, 42, 3);
    expect(state.piles.waste).toEqual([]);
    for (const foundationId of activeFoundationIds(state)) {
      expect(state.piles[foundationId]).toEqual([]);
    }
  });

  it('stores the seed and the post-deal PRNG state', () => {
    const state = deal(CATEGORIES, 42, 1);
    expect(state.seed).toBe(42);
    expect(state.rngState).not.toBe(42);
  });

  it('is reproducible: same seed and level deep-equal; different seeds differ', () => {
    const inputSnapshot = JSON.stringify(CATEGORIES);
    expect(deal(CATEGORIES, 42, 3)).toEqual(deal(CATEGORIES, 42, 3));
    expect(deal(CATEGORIES, 42, 3).cards).not.toEqual(deal(CATEGORIES, 43, 3).cards);
    expect(JSON.stringify(CATEGORIES)).toBe(inputSnapshot);
  });

  it('draws different subsets for different seeds', () => {
    const ids = (seed: number): string =>
      Object.values(deal(CATEGORIES, seed, 5).cards)
        .filter((c) => c.kind === 'category')
        .map((c) => c.categoryId)
        .sort()
        .join(',');
    const draws = new Set([ids(1), ids(2), ids(3), ids(4)]);
    expect(draws.size).toBeGreaterThan(1);
  });

  it('clamps the category count to the pool size', () => {
    const state = deal(SMALL_POOL, 42, 4); // level 4 wants 7 categories, pool has 3
    const categoryCards = Object.values(state.cards).filter((c) => c.kind === 'category');
    expect(categoryCards).toHaveLength(3);
  });

  it('fails loudly when the pool cannot cover the tableau', () => {
    // Level 7 needs 37 cards; SMALL_POOL maxes out at 3 + 30 = 33.
    expect(() => deal(SMALL_POOL, 42, 7)).toThrowError(/content pool too small/);
  });
});
