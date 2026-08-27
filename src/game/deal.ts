import type { Category } from '../data/categories';
import { levelConfig } from './levels';
import { createRng, nextFloat, shuffle, type Rng } from './rng';
import { activeTableauIds, createEmptyState, type Card, type State } from './state';

const MIN_WORDS_PER_CATEGORY = 2;
const MAX_WORDS_PER_CATEGORY = 8;

export function buildDeck(categories: Category[]): Card[] {
  return categories.flatMap((category) => [
    {
      id: `category:${category.id}`,
      kind: 'category' as const,
      categoryId: category.id,
      label: category.name,
    },
    ...category.words.map((word) => ({
      id: `word:${category.id}:${word}`,
      kind: 'word' as const,
      categoryId: category.id,
      label: word,
    })),
  ]);
}

function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(nextFloat(rng) * (max - min + 1));
}

/**
 * Draws the game's content: the level says how many categories play; which
 * ones, and how many of their words (2-8, bounded by the pool), comes from
 * the seeded PRNG. Word counts are topped up if the drawn deck cannot cover
 * the tableau plus one stock card.
 */
function drawSubset(
  categories: Category[],
  rng: Rng,
  categoryCount: number,
  minDeckSize: number,
): Category[] {
  const chosen = shuffle(categories, rng).slice(0, Math.min(categoryCount, categories.length));
  const pools = chosen.map((category) => shuffle(category.words, rng));
  const counts = pools.map((pool) => {
    const min = Math.min(MIN_WORDS_PER_CATEGORY, pool.length);
    const max = Math.min(MAX_WORDS_PER_CATEGORY, pool.length);
    return randomInt(rng, min, max);
  });

  const expandable = (limit: (poolSize: number) => number): number[] =>
    counts
      .map((_, i) => i)
      .filter((i) => {
        const pool = pools[i];
        const count = counts[i];
        return pool !== undefined && count !== undefined && count < limit(pool.length);
      });

  let deckSize = chosen.length + counts.reduce((n, c) => n + c, 0);
  while (deckSize < minDeckSize) {
    // Prefer staying within the 2-8 range; break the cap only if unavoidable.
    const candidates = ((): number[] => {
      const within = expandable((poolSize) => Math.min(MAX_WORDS_PER_CATEGORY, poolSize));
      return within.length > 0 ? within : expandable((poolSize) => poolSize);
    })();
    const pick = candidates[Math.floor(nextFloat(rng) * candidates.length)];
    if (pick === undefined) {
      throw new Error(
        `content pool too small: cannot reach ${minDeckSize} cards with ${chosen.length} categories`,
      );
    }
    counts[pick] = (counts[pick] ?? 0) + 1;
    deckSize++;
  }

  return chosen.map((category, i) => ({
    ...category,
    words: (pools[i] ?? []).slice(0, counts[i] ?? 0),
  }));
}

/**
 * Deals the initial state for a level: column i (left → right) gets i
 * face-down cards plus one face-up; the remainder becomes the face-down stock.
 */
export function deal(categories: Category[], seed: number, level = 1): State {
  const config = levelConfig(level);
  const state = createEmptyState(seed, {
    level,
    foundationCount: config.foundationCount,
    tableauCount: config.columnCount,
  });
  const rng = createRng(seed);

  const tableauSize = (config.columnCount * (config.columnCount + 1)) / 2;
  const subset = drawSubset(categories, rng, config.categoryCount, tableauSize + 1);
  const deck = shuffle(buildDeck(subset), rng);
  for (const card of deck) {
    state.cards[card.id] = card;
  }

  let cursor = 0;
  activeTableauIds(state).forEach((columnId, i) => {
    const column = deck.slice(cursor, cursor + i + 1);
    cursor += i + 1;
    const top = column[column.length - 1];
    if (top === undefined) {
      throw new Error(`deck of ${deck.length} cards is too small to deal the tableau`);
    }
    state.piles[columnId] = column.map((card) => card.id);
    state.faceUp.add(top.id);
  });

  state.piles.stock = deck.slice(cursor).map((card) => card.id);
  state.rngState = rng.state;
  return state;
}
