import { describe, expect, it } from 'vitest';
import {
  createEmptyState,
  deserializeState,
  isPileEmpty,
  openCategoryId,
  PILE_IDS,
  serializeState,
  topCard,
  type Card,
  type State,
} from './state';

function makeCard(id: string, kind: Card['kind'], categoryId: string): Card {
  return { id, kind, categoryId, label: id };
}

function makeState(): State {
  const state = createEmptyState(42);
  const cards = [
    makeCard('cat:fruits', 'category', 'fruits'),
    makeCard('word:mango', 'word', 'fruits'),
    makeCard('word:fig', 'word', 'fruits'),
  ];
  for (const card of cards) {
    state.cards[card.id] = card;
  }
  state.piles['foundation-0'] = ['cat:fruits', 'word:mango'];
  state.piles['tableau-2'] = ['word:fig'];
  state.faceUp = new Set(['cat:fruits', 'word:mango', 'word:fig']);
  state.completedCategoryIds = ['colors'];
  return state;
}

describe('createEmptyState', () => {
  it('creates every pile empty and seeds the PRNG from the seed', () => {
    const state = createEmptyState(7);
    for (const pileId of PILE_IDS) {
      expect(state.piles[pileId]).toEqual([]);
    }
    expect(state.seed).toBe(7);
    expect(state.rngState).toBe(7);
    expect(state.faceUp.size).toBe(0);
    expect(state.completedCategoryIds).toEqual([]);
  });
});

describe('serialization', () => {
  it('round-trips through JSON, including the faceUp set', () => {
    const state = makeState();
    const restored = deserializeState(serializeState(state));
    expect(restored.piles).toEqual(state.piles);
    expect(restored.cards).toEqual(state.cards);
    expect(restored.faceUp).toEqual(state.faceUp);
    expect(restored.faceUp).toBeInstanceOf(Set);
    expect(restored.seed).toBe(state.seed);
    expect(restored.rngState).toBe(state.rngState);
    expect(restored.completedCategoryIds).toEqual(state.completedCategoryIds);
  });
});

describe('selectors', () => {
  it('topCard returns the last card of a pile, or undefined when empty', () => {
    const state = makeState();
    expect(topCard(state, 'foundation-0')).toBe('word:mango');
    expect(topCard(state, 'tableau-2')).toBe('word:fig');
    expect(topCard(state, 'stock')).toBeUndefined();
  });

  it('isPileEmpty reflects pile contents', () => {
    const state = makeState();
    expect(isPileEmpty(state, 'stock')).toBe(true);
    expect(isPileEmpty(state, 'foundation-0')).toBe(false);
  });

  it('openCategoryId derives the open category from the bottom card', () => {
    const state = makeState();
    expect(openCategoryId(state, 'foundation-0')).toBe('fruits');
    expect(openCategoryId(state, 'foundation-1')).toBeUndefined();
  });
});
