import { describe, expect, it } from 'vitest';
import type { Category } from '../data/categories';
import { buildDeck } from './deal';
import { createEmptyState, type State } from './state';
import { isWon } from './win';

const TWO_CATEGORIES: Category[] = [
  { id: 'a', name: 'A', words: ['a1', 'a2'] },
  { id: 'b', name: 'B', words: ['b1', 'b2', 'b3'] },
];

const THREE_CATEGORIES: Category[] = [
  ...TWO_CATEGORIES,
  { id: 'c', name: 'C', words: ['c1'] },
];

function makeState(categories: Category[], completed: string[]): State {
  const state = createEmptyState(1);
  for (const card of buildDeck(categories)) {
    state.cards[card.id] = card;
  }
  state.completedCategoryIds = completed;
  return state;
}

describe('isWon', () => {
  it.each([
    ['two categories', TWO_CATEGORIES, ['a', 'b']],
    ['three categories', THREE_CATEGORIES, ['a', 'b', 'c']],
  ])('is true when every category is completed (%s)', (_, categories, completed) => {
    expect(isWon(makeState(categories, completed))).toBe(true);
  });

  it.each([
    ['two categories', TWO_CATEGORIES, ['a']],
    ['three categories', THREE_CATEGORIES, ['a', 'b']],
  ])('is false with all but one completed (%s)', (_, categories, completed) => {
    expect(isWon(makeState(categories, completed))).toBe(false);
  });

  it('is false for a state with no cards', () => {
    expect(isWon(createEmptyState(1))).toBe(false);
  });
});
