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
  tableauRun,
  topCard,
  type CardId,
  type PileId,
  type State,
  type TableauId,
} from './state';

/** The leftmost column whose face-up top card belongs to categoryId. */
function matchingColumn(
  state: State,
  categoryId: string,
  exclude: PileId | undefined,
): TableauId | undefined {
  return TABLEAU_IDS.find((id) => {
    if (id === exclude) return false;
    const top = topCard(state, id);
    return (
      top !== undefined && state.faceUp.has(top) && state.cards[top]?.categoryId === categoryId
    );
  });
}

/**
 * Routes a tapped card — or the tableau block it belongs to — to its best
 * legal destination, deterministically: matching open foundation (or leftmost
 * empty slot for blocks holding the category card) > leftmost same-category
 * stack > leftmost empty column (tableau sources only — a tap never dumps the
 * waste onto an empty column; dragging does).
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

  let holdsCategoryCard = card.kind === 'category';
  if (isTableauId(pile)) {
    const block = tableauRun(state, cardId);
    if (block === undefined) return invalid('card is covered');
    holdsCategoryCard = block.some((id) => state.cards[id]?.kind === 'category');
  } else if (topCard(state, 'waste') !== cardId) {
    return invalid('card is covered');
  }

  if (holdsCategoryCard) {
    const empty = FOUNDATION_IDS.find((id) => isPileEmpty(state, id));
    if (empty !== undefined) return playToFoundation(state, cardId, empty);
  } else {
    const open = FOUNDATION_IDS.find((id) => openCategoryId(state, id) === card.categoryId);
    if (open !== undefined) return playToFoundation(state, cardId, open);
  }

  const stack = matchingColumn(state, card.categoryId, pile);
  if (stack !== undefined) return moveToColumn(state, cardId, stack);

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

/** Whether a card can be lifted for a drag: the waste top, or the head of a tableau run. */
export function canPickCard(state: State, cardId: CardId): boolean {
  const pile = findPile(state, cardId);
  if (pile === 'waste') return topCard(state, 'waste') === cardId;
  if (pile !== undefined && isTableauId(pile)) return tableauRun(state, cardId) !== undefined;
  return false;
}

/** Routes a drop onto a specific pile through the same actions the tap router uses. */
export function routeDrop(state: State, cardId: CardId, target: PileId): ActionResult {
  if (isFoundationId(target)) return playToFoundation(state, cardId, target);
  if (isTableauId(target)) return moveToColumn(state, cardId, target);
  return invalid('cards cannot be dropped there');
}
