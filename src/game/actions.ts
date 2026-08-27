import { shuffle } from './rng';
import {
  countWords,
  findPile,
  isTableauId,
  openCategoryId,
  PILE_IDS,
  tableauRun,
  topCard,
  type CardId,
  type FoundationId,
  type PileId,
  type State,
  type TableauId,
} from './state';

export type ActionResult = { ok: true; state: State } | { ok: false; reason: string };

export function invalid(reason: string): ActionResult {
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

/** The playable unit at a card: the waste top alone, or its tableau run. */
function playableRun(state: State, cardId: CardId): { pile: PileId; run: CardId[] } | { error: string } {
  const source = findPile(state, cardId);
  if (source === undefined) return { error: `card "${cardId}" is not in any pile` };
  if (source === 'stock') return { error: 'cards cannot be played from the stock' };
  if (!isTableauId(source) && source !== 'waste') {
    return { error: 'cards on a foundation cannot be moved' };
  }
  if (source === 'waste') {
    if (topCard(state, 'waste') !== cardId) return { error: `card "${cardId}" is covered` };
    return { pile: source, run: [cardId] };
  }
  const run = tableauRun(state, cardId);
  if (run === undefined) return { error: `card "${cardId}" is covered` };
  return { pile: source, run };
}

/**
 * Files a card — or a whole tableau run — onto a foundation. An empty slot
 * needs the run to include the category card (which lands first); an open
 * foundation takes only words of its category. Atomic: any illegal card in
 * the run rejects the whole move.
 */
export function playToFoundation(
  state: State,
  cardId: CardId,
  foundationId: FoundationId,
): ActionResult {
  const source = playableRun(state, cardId);
  if ('error' in source) {
    return invalid(source.error);
  }
  const card = state.cards[cardId];
  if (card === undefined) {
    return invalid(`unknown card "${cardId}"`);
  }

  const categoryCards = source.run.filter((id) => state.cards[id]?.kind === 'category');
  const words = source.run.filter((id) => state.cards[id]?.kind === 'word');
  const open = openCategoryId(state, foundationId);
  if (open === undefined && categoryCards.length === 0) {
    return invalid('an empty slot accepts only a category card');
  }
  if (open !== undefined && (categoryCards.length > 0 || card.categoryId !== open)) {
    return invalid(`foundation is open for "${open}"`);
  }

  const next = cloneState(state);
  next.piles[source.pile] = next.piles[source.pile].slice(0, -source.run.length);
  next.piles[foundationId].push(...categoryCards, ...words);
  for (const id of source.run) {
    next.faceUp.add(id);
  }
  revealTop(next, source.pile);

  const filedWords = next.piles[foundationId].length - 1;
  if (filedWords > 0 && filedWords === countWords(next, card.categoryId)) {
    for (const id of next.piles[foundationId]) {
      next.faceUp.delete(id);
    }
    next.piles[foundationId] = [];
    next.completedCategoryIds.push(card.categoryId);
  }
  return { ok: true, state: next };
}

/**
 * Moves the waste top card or a tableau block onto a column: an empty column
 * takes anything (the escape valve); a non-empty one only cards of the same
 * category as its face-up top (word or category card).
 */
export function moveToColumn(state: State, cardId: CardId, columnId: TableauId): ActionResult {
  const source = findPile(state, cardId);
  let unit: CardId[];
  if (source === 'waste') {
    if (topCard(state, 'waste') !== cardId) {
      return invalid(`card "${cardId}" is covered`);
    }
    unit = [cardId];
  } else if (source !== undefined && isTableauId(source)) {
    if (source === columnId) {
      return invalid('card is already on that column');
    }
    const block = tableauRun(state, cardId);
    if (block === undefined) {
      return invalid(`card "${cardId}" is covered`);
    }
    unit = block;
  } else {
    return invalid('only waste and tableau cards can move to a column');
  }

  const targetTop = topCard(state, columnId);
  if (targetTop !== undefined) {
    const moving = state.cards[cardId];
    const resting = state.cards[targetTop];
    const sameCategory =
      moving !== undefined &&
      resting !== undefined &&
      state.faceUp.has(targetTop) &&
      moving.categoryId === resting.categoryId;
    if (!sameCategory) {
      return invalid(`column "${columnId}" only takes cards of its top card's category`);
    }
  }

  const next = cloneState(state);
  next.piles[source] = next.piles[source].slice(0, -unit.length);
  next.piles[columnId].push(...unit);
  revealTop(next, source);
  return { ok: true, state: next };
}
