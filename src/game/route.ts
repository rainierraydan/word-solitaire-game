import {
  drawFromStock,
  invalid,
  moveToColumn,
  playToFoundation,
  recycleWaste,
  type ActionResult,
} from './actions';
import {
  findPile,
  FOUNDATION_IDS,
  isFoundationId,
  isPileEmpty,
  isTableauId,
  openCategoryId,
  TABLEAU_IDS,
  topCard,
  type CardId,
  type PileId,
  type State,
} from './state';

/**
 * Routes a tapped card to its best legal destination, deterministically:
 * matching open foundation > leftmost empty foundation slot (category cards) >
 * leftmost empty tableau column (tableau sources only).
 */
export function routeCardTap(state: State, cardId: CardId): ActionResult {
  const pile = findPile(state, cardId);
  if (pile === undefined) return invalid(`card "${cardId}" is not in any pile`);
  if (pile === 'stock') return drawFromStock(state);

  const card = state.cards[cardId];
  if (card === undefined) return invalid(`unknown card "${cardId}"`);
  if (!isTableauId(pile) && pile !== 'waste') {
    return invalid('cards on a foundation cannot be moved');
  }
  if (topCard(state, pile) !== cardId) return invalid('card is covered');

  if (card.kind === 'word') {
    const open = FOUNDATION_IDS.find((id) => openCategoryId(state, id) === card.categoryId);
    if (open !== undefined) return playToFoundation(state, cardId, open);
  } else {
    const empty = FOUNDATION_IDS.find((id) => isPileEmpty(state, id));
    if (empty !== undefined) return playToFoundation(state, cardId, empty);
  }

  if (isTableauId(pile)) {
    const emptyColumn = TABLEAU_IDS.find((id) => isPileEmpty(state, id));
    if (emptyColumn !== undefined) return moveToColumn(state, cardId, emptyColumn);
  }
  return invalid('no legal destination');
}

/** A tap on a bare pile: only the empty stock does something (recycle). */
export function routePileTap(state: State, pileId: PileId): ActionResult {
  if (pileId === 'stock') return recycleWaste(state);
  return invalid('nothing to play here');
}

/** Whether a card can be lifted for a drag: top of the waste or of a tableau column. */
export function canPickCard(state: State, cardId: CardId): boolean {
  const pile = findPile(state, cardId);
  if (pile === undefined || (!isTableauId(pile) && pile !== 'waste')) return false;
  return topCard(state, pile) === cardId;
}

/** Routes a drop onto a specific pile through the same actions the tap router uses. */
export function routeDrop(state: State, cardId: CardId, target: PileId): ActionResult {
  if (isFoundationId(target)) return playToFoundation(state, cardId, target);
  if (isTableauId(target)) return moveToColumn(state, cardId, target);
  return invalid('cards cannot be dropped there');
}
