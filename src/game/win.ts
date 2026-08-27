import type { State } from './state';

/** Won when every category present in the deck has been completed. */
export function isWon(state: State): boolean {
  const categoryIds = new Set(Object.values(state.cards).map((card) => card.categoryId));
  if (categoryIds.size === 0) return false;
  return [...categoryIds].every((id) => state.completedCategoryIds.includes(id));
}
