import type { Category } from '../data/categories';
import { createRng, shuffle } from './rng';
import { createEmptyState, TABLEAU_IDS, type Card, type State } from './state';

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

/**
 * Deals the initial state: column i (left → right) gets i face-down cards plus
 * one face-up; the remainder becomes the face-down stock.
 */
export function deal(categories: Category[], seed: number): State {
  const state = createEmptyState(seed);
  const rng = createRng(seed);
  const deck = shuffle(buildDeck(categories), rng);
  for (const card of deck) {
    state.cards[card.id] = card;
  }

  let cursor = 0;
  TABLEAU_IDS.forEach((columnId, i) => {
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
