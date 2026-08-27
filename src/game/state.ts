import { createRng } from './rng';

export type CardId = string;

export type Card = {
  id: CardId;
  kind: 'category' | 'word';
  categoryId: string;
  label: string;
};

// Design constants, not content-derived: the board has a fixed number of
// foundation slots and tableau columns. The id lists are the single source —
// counts and types derive from them.
export const FOUNDATION_IDS = [
  'foundation-0',
  'foundation-1',
  'foundation-2',
  'foundation-3',
  'foundation-4',
] as const;

export const TABLEAU_IDS = [
  'tableau-0',
  'tableau-1',
  'tableau-2',
  'tableau-3',
  'tableau-4',
  'tableau-5',
  'tableau-6',
] as const;

export type FoundationId = (typeof FOUNDATION_IDS)[number];
export type TableauId = (typeof TABLEAU_IDS)[number];
export type PileId = 'stock' | 'waste' | FoundationId | TableauId;

export const PILE_IDS: readonly PileId[] = ['stock', 'waste', ...FOUNDATION_IDS, ...TABLEAU_IDS];

export function isTableauId(pileId: PileId): pileId is TableauId {
  return (TABLEAU_IDS as readonly PileId[]).includes(pileId);
}

export function isFoundationId(pileId: PileId): pileId is FoundationId {
  return (FOUNDATION_IDS as readonly PileId[]).includes(pileId);
}

export type State = {
  cards: Record<CardId, Card>;
  piles: Record<PileId, CardId[]>; // ordered bottom → top
  faceUp: Set<CardId>;
  seed: number;
  rngState: number;
  completedCategoryIds: string[];
};

function emptyPiles(): Record<PileId, CardId[]> {
  // Object.fromEntries widens keys to string; PILE_IDS covers every PileId.
  const entries: [PileId, CardId[]][] = PILE_IDS.map((id) => [id, []]);
  return Object.fromEntries(entries) as Record<PileId, CardId[]>;
}

export function createEmptyState(seed: number): State {
  return {
    cards: {},
    piles: emptyPiles(),
    faceUp: new Set(),
    seed,
    rngState: createRng(seed).state,
    completedCategoryIds: [],
  };
}

type SerializedState = Omit<State, 'faceUp'> & { faceUp: CardId[] };

export function serializeState(state: State): string {
  const serialized: SerializedState = { ...state, faceUp: [...state.faceUp] };
  return JSON.stringify(serialized);
}

export function deserializeState(json: string): State {
  const parsed = JSON.parse(json) as SerializedState;
  return { ...parsed, faceUp: new Set(parsed.faceUp) };
}

export function findPile(state: State, cardId: CardId): PileId | undefined {
  return PILE_IDS.find((pileId) => state.piles[pileId].includes(cardId));
}

/**
 * The maximal same-category, face-up block containing cardId on its tableau
 * column — the indivisible unit that moves together. Grabbing any card of a
 * stack yields the whole stack; a lone top card is a block of one. Undefined
 * when the card is covered by another category, face-down, or off the tableau.
 */
export function tableauRun(state: State, cardId: CardId): CardId[] | undefined {
  const pile = findPile(state, cardId);
  if (pile === undefined || !isTableauId(pile)) return undefined;
  const categoryId = state.cards[cardId]?.categoryId;
  if (categoryId === undefined) return undefined;
  const column = state.piles[pile];
  const partOfBlock = (id: CardId | undefined): boolean =>
    id !== undefined && state.faceUp.has(id) && state.cards[id]?.categoryId === categoryId;

  let start = column.indexOf(cardId);
  while (start > 0 && partOfBlock(column[start - 1])) {
    start--;
  }
  const block = column.slice(start);
  return block.every((id) => partOfBlock(id)) ? block : undefined;
}

export function topCard(state: State, pileId: PileId): CardId | undefined {
  const pile = state.piles[pileId];
  return pile[pile.length - 1];
}

export function isPileEmpty(state: State, pileId: PileId): boolean {
  return state.piles[pileId].length === 0;
}

/** The category open on a foundation, derived from its bottom card. */
export function openCategoryId(state: State, foundationId: FoundationId): string | undefined {
  const bottom = state.piles[foundationId][0];
  if (bottom === undefined) return undefined;
  return state.cards[bottom]?.categoryId;
}

/** Word cards a category holds, derived from the deck at runtime. */
export function countWords(state: State, categoryId: string): number {
  return Object.values(state.cards).filter(
    (card) => card.kind === 'word' && card.categoryId === categoryId,
  ).length;
}

export type FoundationProgress = { name: string; filed: number; total: number };

/** Display data for an open foundation: category name plus filed/total words. */
export function foundationProgress(
  state: State,
  foundationId: FoundationId,
): FoundationProgress | undefined {
  const bottom = state.piles[foundationId][0];
  if (bottom === undefined) return undefined;
  const category = state.cards[bottom];
  if (category === undefined) return undefined;
  return {
    name: category.label,
    filed: state.piles[foundationId].length - 1,
    total: countWords(state, category.categoryId),
  };
}
