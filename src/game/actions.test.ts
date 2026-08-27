import { describe, expect, it } from 'vitest';
import type { Category } from '../data/categories';
import {
  drawFromStock,
  moveToEmptyColumn,
  playToFoundation,
  recycleWaste,
  type ActionResult,
} from './actions';
import { buildDeck } from './deal';
import { createEmptyState, serializeState, type State } from './state';

// Uneven word counts: completion must derive from content, never from a literal.
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

describe('drawFromStock', () => {
  it('moves exactly the top stock card to the waste, face-up, without mutating input', () => {
    const state = makeState();
    state.piles.stock = ['word:a:a1', 'word:a:a2'];
    const before = serializeState(state);

    const next = expectOk(drawFromStock(state));
    expect(next.piles.stock).toEqual(['word:a:a1']);
    expect(next.piles.waste).toEqual(['word:a:a2']);
    expect(next.faceUp.has('word:a:a2')).toBe(true);
    expect(serializeState(state)).toBe(before);
  });

  it('rejects drawing from an empty stock', () => {
    expect(expectInvalid(drawFromStock(makeState()))).toMatch(/stock is empty/);
  });
});

describe('recycleWaste', () => {
  function wasteState(): State {
    const state = makeState();
    state.piles.waste = ['word:b:b1', 'word:b:b2', 'word:b:b3', 'word:a:a1', 'word:a:a2'];
    state.faceUp = new Set(state.piles.waste);
    return state;
  }

  it('reshuffles the whole waste into the stock face-down and advances the PRNG', () => {
    const state = wasteState();
    const next = expectOk(recycleWaste(state));
    expect(next.piles.waste).toEqual([]);
    expect([...next.piles.stock].sort()).toEqual([...state.piles.waste].sort());
    for (const id of next.piles.stock) {
      expect(next.faceUp.has(id)).toBe(false);
    }
    expect(next.rngState).not.toBe(state.rngState);
  });

  it('is deterministic for the same pre-recycle state', () => {
    expect(expectOk(recycleWaste(wasteState()))).toEqual(expectOk(recycleWaste(wasteState())));
  });

  it('does not mutate the input state', () => {
    const state = wasteState();
    const before = serializeState(state);
    recycleWaste(state);
    expect(serializeState(state)).toBe(before);
  });

  it('rejects recycling while the stock is not empty', () => {
    const state = wasteState();
    state.piles.stock = ['word:a:a1'];
    state.piles.waste = ['word:a:a2'];
    expect(expectInvalid(recycleWaste(state))).toMatch(/stock is not empty/);
  });

  it('rejects both draw and recycle when stock and waste are both empty', () => {
    const state = makeState();
    expect(expectInvalid(drawFromStock(state))).toMatch(/stock is empty/);
    expect(expectInvalid(recycleWaste(state))).toMatch(/waste is empty/);
  });
});

describe('playToFoundation', () => {
  it('opens an empty slot with a category card', () => {
    const state = makeState();
    state.piles['tableau-0'] = ['category:a'];
    state.faceUp.add('category:a');
    const next = expectOk(playToFoundation(state, 'category:a', 'foundation-0'));
    expect(next.piles['foundation-0']).toEqual(['category:a']);
    expect(next.piles['tableau-0']).toEqual([]);
  });

  it('rejects a word card on an empty slot', () => {
    const state = makeState();
    state.piles.waste = ['word:a:a1'];
    expect(expectInvalid(playToFoundation(state, 'word:a:a1', 'foundation-0'))).toMatch(
      /empty slot accepts only a category card/,
    );
  });

  it('files a matching word from the waste onto an open foundation', () => {
    const state = makeState();
    state.piles['foundation-0'] = ['category:a'];
    state.piles.waste = ['word:a:a1'];
    const next = expectOk(playToFoundation(state, 'word:a:a1', 'foundation-0'));
    expect(next.piles['foundation-0']).toEqual(['category:a', 'word:a:a1']);
    expect(next.piles.waste).toEqual([]);
  });

  it('rejects a word of another category and a second category card', () => {
    const state = makeState();
    state.piles['foundation-0'] = ['category:a'];
    state.piles.waste = ['word:b:b1'];
    state.piles['tableau-0'] = ['category:b'];
    expect(expectInvalid(playToFoundation(state, 'word:b:b1', 'foundation-0'))).toMatch(
      /open for "a"/,
    );
    expect(expectInvalid(playToFoundation(state, 'category:b', 'foundation-0'))).toMatch(
      /open for "a"/,
    );
  });

  it('rejects covered tableau cards and cards in the stock', () => {
    const state = makeState();
    state.piles['tableau-0'] = ['category:a', 'word:b:b1'];
    state.piles.stock = ['category:b'];
    expect(expectInvalid(playToFoundation(state, 'category:a', 'foundation-0'))).toMatch(
      /covered/,
    );
    expect(expectInvalid(playToFoundation(state, 'category:b', 'foundation-0'))).toMatch(
      /cannot be played from the stock/,
    );
  });

  it('never takes a card back off a foundation', () => {
    const state = makeState();
    state.piles['foundation-0'] = ['category:a'];
    expect(expectInvalid(playToFoundation(state, 'category:a', 'foundation-1'))).toMatch(
      /cannot be moved/,
    );
  });

  it('completes a category on its last word, clears the pile, and frees the slot', () => {
    const state = makeState();
    state.piles['foundation-0'] = ['category:a', 'word:a:a1'];
    state.piles.waste = ['word:a:a2'];
    state.piles['tableau-0'] = ['category:b'];
    state.faceUp = new Set(['category:a', 'word:a:a1', 'word:a:a2', 'category:b']);

    const completed = expectOk(playToFoundation(state, 'word:a:a2', 'foundation-0'));
    expect(completed.piles['foundation-0']).toEqual([]);
    expect(completed.completedCategoryIds).toEqual(['a']);

    const reopened = expectOk(playToFoundation(completed, 'category:b', 'foundation-0'));
    expect(reopened.piles['foundation-0']).toEqual(['category:b']);
  });

  it('derives completion from the content word count, not a literal', () => {
    const state = makeState();
    state.piles['foundation-1'] = ['category:b', 'word:b:b1'];
    state.piles.waste = ['word:b:b2', 'word:b:b3'];

    const afterSecond = expectOk(playToFoundation(state, 'word:b:b3', 'foundation-1'));
    expect(afterSecond.completedCategoryIds).toEqual([]);

    const afterThird = expectOk(playToFoundation(afterSecond, 'word:b:b2', 'foundation-1'));
    expect(afterThird.piles['foundation-1']).toEqual([]);
    expect(afterThird.completedCategoryIds).toEqual(['b']);
  });

  it('reveals the exposed face-down card when playing from the tableau', () => {
    const state = makeState();
    state.piles['tableau-0'] = ['word:b:b1', 'category:a'];
    state.faceUp = new Set(['category:a']);
    const next = expectOk(playToFoundation(state, 'category:a', 'foundation-0'));
    expect(next.faceUp.has('word:b:b1')).toBe(true);
  });

  it('does not mutate the input state', () => {
    const state = makeState();
    state.piles['tableau-0'] = ['category:a'];
    const before = serializeState(state);
    playToFoundation(state, 'category:a', 'foundation-0');
    expect(serializeState(state)).toBe(before);
  });
});

describe('moveToEmptyColumn', () => {
  it('moves a top tableau card to an empty column and reveals the card underneath', () => {
    const state = makeState();
    state.piles['tableau-0'] = ['word:b:b1', 'word:a:a1'];
    state.faceUp = new Set(['word:a:a1']);
    const before = serializeState(state);

    const next = expectOk(moveToEmptyColumn(state, 'word:a:a1', 'tableau-3'));
    expect(next.piles['tableau-0']).toEqual(['word:b:b1']);
    expect(next.piles['tableau-3']).toEqual(['word:a:a1']);
    expect(next.faceUp.has('word:b:b1')).toBe(true);
    expect(serializeState(state)).toBe(before);
  });

  it('rejects the waste and the stock as sources', () => {
    const state = makeState();
    state.piles.waste = ['word:a:a1'];
    state.piles.stock = ['word:a:a2'];
    expect(expectInvalid(moveToEmptyColumn(state, 'word:a:a1', 'tableau-0'))).toMatch(
      /only tableau cards/,
    );
    expect(expectInvalid(moveToEmptyColumn(state, 'word:a:a2', 'tableau-0'))).toMatch(
      /only tableau cards/,
    );
  });

  it('rejects covered cards and non-empty target columns', () => {
    const state = makeState();
    state.piles['tableau-0'] = ['word:a:a1', 'word:a:a2'];
    state.piles['tableau-1'] = ['word:b:b1'];
    expect(expectInvalid(moveToEmptyColumn(state, 'word:a:a1', 'tableau-2'))).toMatch(/covered/);
    expect(expectInvalid(moveToEmptyColumn(state, 'word:a:a2', 'tableau-1'))).toMatch(
      /not empty/,
    );
  });
});
