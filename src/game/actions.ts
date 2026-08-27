import { shuffle } from './rng';
import {
  isTableauId,
  openCategoryId,
  PILE_IDS,
  topCard,
  type CardId,
  type FoundationId,
  type PileId,
  type State,
  type TableauId,
} from './state';

export type ActionResult = { ok: true; state: State } | { ok: false; reason: string };

function invalid(reason: string): ActionResult {
  return { ok: false, reason };
}

function cloneState(state: State): State {
  const entries: [PileId, CardId[]][] = PILE_IDS.map((id) => [id, [...state.piles[id]]]);
  return {
    cards: state.cards, // cards never change after the deal
    piles: Object.fromEntries(entries) as Record<PileId, CardId[]>,
    faceUp: new Set(state.faceUp),
    seed: state.seed,
    rngState: state.rngState,
    completedCategoryIds: [...state.completedCategoryIds],
  };
}

function findPile(state: State, cardId: CardId): PileId | undefined {
  return PILE_IDS.find((pileId) => state.piles[pileId].includes(cardId));
}

/** Flips the newly exposed top card of a tableau column face-up. */
function revealTop(state: State, pileId: PileId): void {
  if (!isTableauId(pileId)) return;
  const top = topCard(state, pileId);
  if (top !== undefined) {
    state.faceUp.add(top);
  }
}

export function drawFromStock(state: State): ActionResult {
  const card = topCard(state, 'stock');
  if (card === undefined) {
    return invalid('stock is empty');
  }
  const next = cloneState(state);
  next.piles.stock.pop();
  next.piles.waste.push(card);
  next.faceUp.add(card);
  return { ok: true, state: next };
}

export function recycleWaste(state: State): ActionResult {
  if (state.piles.stock.length > 0) {
    return invalid('stock is not empty');
  }
  if (state.piles.waste.length === 0) {
    return invalid('waste is empty');
  }
  const next = cloneState(state);
  const rng = { state: next.rngState };
  next.piles.stock = shuffle(next.piles.waste, rng);
  next.piles.waste = [];
  next.rngState = rng.state;
  for (const card of next.piles.stock) {
    next.faceUp.delete(card);
  }
  return { ok: true, state: next };
}

/** A card is playable only from the top of the waste or of a tableau column. */
function playableSource(state: State, cardId: CardId): { pile: PileId } | { error: string } {
  const source = findPile(state, cardId);
  if (source === undefined) return { error: `card "${cardId}" is not in any pile` };
  if (source === 'stock') return { error: 'cards cannot be played from the stock' };
  if (!isTableauId(source) && source !== 'waste') {
    return { error: 'cards on a foundation cannot be moved' };
  }
  if (topCard(state, source) !== cardId) return { error: `card "${cardId}" is covered` };
  return { pile: source };
}

function wordCount(state: State, categoryId: string): number {
  return Object.values(state.cards).filter(
    (card) => card.kind === 'word' && card.categoryId === categoryId,
  ).length;
}

export function playToFoundation(
  state: State,
  cardId: CardId,
  foundationId: FoundationId,
): ActionResult {
  const source = playableSource(state, cardId);
  if ('error' in source) {
    return invalid(source.error);
  }
  const card = state.cards[cardId];
  if (card === undefined) {
    return invalid(`unknown card "${cardId}"`);
  }

  const open = openCategoryId(state, foundationId);
  if (open === undefined && card.kind !== 'category') {
    return invalid('an empty slot accepts only a category card');
  }
  if (open !== undefined && (card.kind !== 'word' || card.categoryId !== open)) {
    return invalid(`foundation is open for "${open}"`);
  }

  const next = cloneState(state);
  next.piles[source.pile].pop();
  next.piles[foundationId].push(cardId);
  next.faceUp.add(cardId);
  revealTop(next, source.pile);

  const filedWords = next.piles[foundationId].length - 1;
  if (card.kind === 'word' && filedWords === wordCount(next, card.categoryId)) {
    for (const id of next.piles[foundationId]) {
      next.faceUp.delete(id);
    }
    next.piles[foundationId] = [];
    next.completedCategoryIds.push(card.categoryId);
  }
  return { ok: true, state: next };
}

export function moveToEmptyColumn(
  state: State,
  cardId: CardId,
  columnId: TableauId,
): ActionResult {
  const source = findPile(state, cardId);
  if (source === undefined || !isTableauId(source)) {
    return invalid('only tableau cards can move to an empty column');
  }
  if (topCard(state, source) !== cardId) {
    return invalid(`card "${cardId}" is covered`);
  }
  if (state.piles[columnId].length > 0) {
    return invalid(`column "${columnId}" is not empty`);
  }
  const next = cloneState(state);
  next.piles[source].pop();
  next.piles[columnId].push(cardId);
  revealTop(next, source);
  return { ok: true, state: next };
}
