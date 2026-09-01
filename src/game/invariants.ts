import { FOUNDATION_IDS, isActivePile, PILE_IDS, type State } from './state';

/**
 * Cross-cutting invariants that must hold after every action. Returns one
 * message per violation; an empty array means the state is consistent.
 */
export function checkInvariants(state: State): string[] {
  const problems: string[] = [];

  const located = new Map<string, string>();
  for (const pileId of PILE_IDS) {
    for (const cardId of state.piles[pileId]) {
      if (state.cards[cardId] === undefined) {
        problems.push(`pile "${pileId}" holds unknown card "${cardId}"`);
      }
      const already = located.get(cardId);
      if (already !== undefined) {
        problems.push(`card "${cardId}" is in both "${already}" and "${pileId}"`);
      } else {
        located.set(cardId, pileId);
      }
    }
    if (!isActivePile(state, pileId) && state.piles[pileId].length > 0) {
      problems.push(`inactive pile "${pileId}" holds cards`);
    }
  }

  for (const card of Object.values(state.cards)) {
    const completed = state.completedCategoryIds.includes(card.categoryId);
    const pile = located.get(card.id);
    if (completed && pile !== undefined) {
      problems.push(`card "${card.id}" of completed category is still in "${pile}"`);
    }
    if (!completed && pile === undefined) {
      problems.push(`card "${card.id}" is in no pile and not completed`);
    }
  }

  for (const cardId of state.faceUp) {
    if (state.cards[cardId] === undefined) {
      problems.push(`faceUp contains unknown card "${cardId}"`);
    } else if (!located.has(cardId)) {
      problems.push(`faceUp contains card "${cardId}" which is in no pile`);
    }
  }

  for (const pileId of FOUNDATION_IDS) {
    const bottom = state.piles[pileId][0];
    if (bottom !== undefined && state.cards[bottom]?.kind !== 'category') {
      problems.push(`foundation "${pileId}" has non-category bottom card "${bottom}"`);
    }
  }

  return problems;
}
