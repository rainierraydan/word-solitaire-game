import { describe, expect, it } from 'vitest';
import { CATEGORIES, type Category } from '../data/categories';
import { buildDeck, deal } from './deal';
import { FOUNDATION_IDS, TABLEAU_IDS } from './state';

// Different category and word counts than the real content, so anything
// hardcoded from CATEGORIES breaks here.
const FIXTURE: Category[] = [
  { id: 'x', name: 'X', words: Array.from({ length: 12 }, (_, i) => `x${i}`) },
  { id: 'y', name: 'Y', words: Array.from({ length: 10 }, (_, i) => `y${i}`) },
  { id: 'z', name: 'Z', words: Array.from({ length: 8 }, (_, i) => `z${i}`) },
];

function expectedDeckSize(categories: Category[]): number {
  return categories.length + categories.reduce((n, c) => n + c.words.length, 0);
}

describe('buildDeck', () => {
  it.each([
    ['real content', CATEGORIES],
    ['fixture with different counts', FIXTURE],
  ])('builds one card per category plus one per word (%s)', (_, categories) => {
    const deck = buildDeck(categories);
    expect(deck).toHaveLength(expectedDeckSize(categories));
    expect(deck.filter((c) => c.kind === 'category')).toHaveLength(categories.length);
  });
});

describe('deal', () => {
  it.each([
    ['real content', CATEGORIES],
    ['fixture with different counts', FIXTURE],
  ])('deals 0-6 face-down plus one face-up per column, left to right (%s)', (_, categories) => {
    const state = deal(categories, 42);
    TABLEAU_IDS.forEach((columnId, i) => {
      const column = state.piles[columnId];
      expect(column).toHaveLength(i + 1);
      const faceUpInColumn = column.filter((id) => state.faceUp.has(id));
      expect(faceUpInColumn).toEqual([column[column.length - 1]]);
    });
    expect(state.faceUp.size).toBe(TABLEAU_IDS.length);
  });

  it('puts the remainder in the stock face-down; waste and foundations empty', () => {
    const state = deal(CATEGORIES, 42);
    expect(state.piles.stock).toHaveLength(expectedDeckSize(CATEGORIES) - 28);
    for (const id of state.piles.stock) {
      expect(state.faceUp.has(id)).toBe(false);
    }
    expect(state.piles.waste).toEqual([]);
    for (const foundationId of FOUNDATION_IDS) {
      expect(state.piles[foundationId]).toEqual([]);
    }
  });

  it('stores the seed and the post-deal PRNG state', () => {
    const state = deal(CATEGORIES, 42);
    expect(state.seed).toBe(42);
    expect(state.rngState).not.toBe(42);
  });

  it('is pure: same seed gives a deep-equal state, different seeds differ', () => {
    const inputSnapshot = JSON.stringify(FIXTURE);
    expect(deal(FIXTURE, 42)).toEqual(deal(FIXTURE, 42));
    expect(deal(FIXTURE, 42).piles).not.toEqual(deal(FIXTURE, 43).piles);
    expect(JSON.stringify(FIXTURE)).toBe(inputSnapshot);
  });
});
