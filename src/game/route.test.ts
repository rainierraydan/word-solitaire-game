import { describe, expect, it } from 'vitest';
import type { Category } from '../data/categories';
import type { ActionResult } from './actions';
import { buildDeck } from './deal';
import { routeCardTap, routePileTap } from './route';
import { createEmptyState, type State } from './state';

const FIXTURE: Category[] = [
  { id: 'a', name: 'A', words: ['a1', 'a2'] },
  { id: 'b', name: 'B', words: ['b1', 'b2', 'b3'] },
];

function makeState(): State {
  const state = createEmptyState(1);
  for (const card of buildDeck(FIXTURE)) {
    state.cards[card.id] = card;
  }
  return state;
}

function expectOk(result: ActionResult): State {
  if (!result.ok) throw new Error(`expected ok, got: ${result.reason}`);
  return result.state;
}

function expectInvalid(result: ActionResult): string {
  if (result.ok) throw new Error('expected an invalid result');
  return result.reason;
}

describe('routeCardTap', () => {
  it('draws when the tapped card sits on the stock', () => {
    const state = makeState();
    state.piles.stock = ['word:a:a1'];
    const next = expectOk(routeCardTap(state, 'word:a:a1'));
    expect(next.piles.waste).toEqual(['word:a:a1']);
  });

  it('files a word onto its open foundation, from waste and from tableau', () => {
    const state = makeState();
    state.piles['foundation-2'] = ['category:a'];
    state.piles.waste = ['word:a:a1'];
    state.piles['tableau-4'] = ['word:a:a2'];

    const fromWaste = expectOk(routeCardTap(state, 'word:a:a1'));
    expect(fromWaste.piles['foundation-2']).toEqual(['category:a', 'word:a:a1']);

    const fromTableau = expectOk(routeCardTap(state, 'word:a:a2'));
    expect(fromTableau.piles['foundation-2']).toEqual(['category:a', 'word:a:a2']);
  });

  it('opens a category card on the leftmost empty foundation slot', () => {
    const state = makeState();
    state.piles['foundation-0'] = ['category:b'];
    state.piles.waste = ['category:a'];
    const next = expectOk(routeCardTap(state, 'category:a'));
    expect(next.piles['foundation-1']).toEqual(['category:a']);
  });

  it('moves a tableau card with no foundation move to the leftmost empty column', () => {
    const state = makeState();
    state.piles['tableau-2'] = ['word:b:b1', 'word:a:a1'];
    state.faceUp = new Set(['word:a:a1']);
    const next = expectOk(routeCardTap(state, 'word:a:a1'));
    expect(next.piles['tableau-0']).toEqual(['word:a:a1']);
    expect(next.faceUp.has('word:b:b1')).toBe(true);
  });

  it('never routes a waste card to a tableau column', () => {
    const state = makeState();
    state.piles.waste = ['word:a:a1'];
    expect(expectInvalid(routeCardTap(state, 'word:a:a1'))).toMatch(/no legal destination/);
  });

  it('prefers the matching foundation over an empty column for a tableau word', () => {
    const state = makeState();
    state.piles['foundation-1'] = ['category:a'];
    state.piles['tableau-3'] = ['word:a:a1'];
    const next = expectOk(routeCardTap(state, 'word:a:a1'));
    expect(next.piles['foundation-1']).toEqual(['category:a', 'word:a:a1']);
    expect(next.piles['tableau-0']).toEqual([]);
  });

  it('shakes covered cards and foundation cards: explicit invalid results', () => {
    const state = makeState();
    state.piles['tableau-0'] = ['word:a:a1', 'word:a:a2'];
    state.piles['foundation-0'] = ['category:a'];
    expect(expectInvalid(routeCardTap(state, 'word:a:a1'))).toMatch(/covered/);
    expect(expectInvalid(routeCardTap(state, 'category:a'))).toMatch(/cannot be moved/);
  });

  it('is invalid when a word has no open foundation and no empty column', () => {
    const state = makeState();
    state.piles['tableau-0'] = ['word:a:a1'];
    for (const id of ['tableau-1', 'tableau-2', 'tableau-3', 'tableau-4', 'tableau-5', 'tableau-6'] as const) {
      state.piles[id] = [`filler:${id}`];
    }
    expect(expectInvalid(routeCardTap(state, 'word:a:a1'))).toMatch(/no legal destination/);
  });
});

describe('routePileTap', () => {
  it('recycles the waste on an empty-stock tap', () => {
    const state = makeState();
    state.piles.waste = ['word:a:a1', 'word:a:a2', 'word:b:b1'];
    const next = expectOk(routePileTap(state, 'stock'));
    expect(next.piles.waste).toEqual([]);
    expect(next.piles.stock).toHaveLength(3);
  });

  it('is invalid with stock and waste both empty', () => {
    expect(expectInvalid(routePileTap(makeState(), 'stock'))).toMatch(/waste is empty/);
  });

  it('is invalid on any other bare pile', () => {
    const state = makeState();
    expect(expectInvalid(routePileTap(state, 'foundation-0'))).toMatch(/nothing to play/);
    expect(expectInvalid(routePileTap(state, 'tableau-0'))).toMatch(/nothing to play/);
    expect(expectInvalid(routePileTap(state, 'waste'))).toMatch(/nothing to play/);
  });
});
