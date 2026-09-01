import { describe, expect, it } from 'vitest';
import { CATEGORIES, type Category } from '../data/categories';
import {
  drawFromStock,
  moveToColumn,
  playToFoundation,
  recycleWaste,
  type ActionResult,
} from './actions';
import { buildDeck, deal } from './deal';
import { checkInvariants } from './invariants';
import { isWon } from './win';
import { createEmptyState, isFoundationId, isTableauId, type PileId, type State } from './state';

// Two fixtures with different category counts, word counts, and board shapes:
// the same suite passing on both proves no content-derived number is
// hardcoded in src/game/.
const TWO_CATEGORIES: Category[] = [
  { id: 'a', name: 'Alpha', words: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'] },
  { id: 'b', name: 'Beta', words: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'] },
];

const THREE_CATEGORIES: Category[] = [
  { id: 'p', name: 'P', words: Array.from({ length: 10 }, (_, i) => `p${i}`) },
  { id: 'q', name: 'Q', words: Array.from({ length: 9 }, (_, i) => `q${i}`) },
  { id: 'r', name: 'R', words: Array.from({ length: 8 }, (_, i) => `r${i}`) },
];

// Winning sequences recorded from a scripted solver against the deal of the
// given seed and level, replayed verbatim through the exported actions only.
// Format: 'draw', 'recycle', or '<cardId>><pileId>'.
const PLAYTHROUGHS = [
  {
    name: 'two categories on the level-1 board',
    categories: TWO_CATEGORIES,
    seed: 105,
    level: 1,
    moves: `draw draw draw recycle category:a>foundation-0 word:a:a1>foundation-0
      word:b:b6>tableau-1 word:a:a6>foundation-0 word:b:b7>tableau-1 word:b:b5>tableau-1
      word:b:b4>tableau-1 word:a:a2>foundation-0 word:b:b3>tableau-1 word:a:a4>foundation-0
      word:a:a8>foundation-0 word:a:a5>foundation-0 word:a:a7>foundation-0 draw
      category:b>foundation-1 word:b:b3>foundation-1 word:b:b8>foundation-1 draw
      word:b:b1>foundation-1 draw word:a:a3>foundation-0`,
  },
  {
    name: 'three categories on the level-2 board',
    categories: THREE_CATEGORIES,
    seed: 23,
    level: 2,
    moves: `draw draw draw draw draw recycle category:p>foundation-0 word:p:p0>foundation-0
      word:p:p6>foundation-0 category:r>foundation-1 word:r:r7>foundation-1
      word:r:r2>foundation-1 word:r:r6>foundation-1 word:r:r4>foundation-1
      word:r:r3>foundation-1 word:p:p7>foundation-0 word:p:p2>foundation-0
      word:r:r5>foundation-1 word:p:p9>foundation-0 word:q:q6>tableau-1
      word:r:r0>foundation-1 word:q:q0>tableau-1 word:p:p3>foundation-0 draw draw
      category:q>foundation-2 word:q:q0>foundation-2 word:q:q3>foundation-2
      word:q:q5>foundation-2 word:q:q2>foundation-2 word:q:q8>foundation-2 draw
      word:r:r1>foundation-1 draw word:p:p1>foundation-0 draw word:p:p8>foundation-0`,
  },
];

function expectOk(result: ActionResult): State {
  if (!result.ok) throw new Error(`expected ok, got: ${result.reason}`);
  return result.state;
}

function applyMove(state: State, move: string): State {
  if (move === 'draw') return expectOk(drawFromStock(state));
  if (move === 'recycle') return expectOk(recycleWaste(state));
  const [cardId, target] = move.split('>');
  if (cardId === undefined || target === undefined) {
    throw new Error(`malformed move "${move}"`);
  }
  const pileId = target as PileId;
  if (isFoundationId(pileId)) return expectOk(playToFoundation(state, cardId, pileId));
  if (isTableauId(pileId)) return expectOk(moveToColumn(state, cardId, pileId));
  throw new Error(`move "${move}" targets neither a foundation nor a column`);
}

describe.each(PLAYTHROUGHS)('playthrough: $name', ({ categories, seed, level, moves }) => {
  const sequence = moves.trim().split(/\s+/);

  it('replays the recorded sequence to a win, holding invariants after every action', () => {
    let state = deal(categories, seed, level);
    expect(checkInvariants(state)).toEqual([]);

    for (const move of sequence) {
      expect(isWon(state)).toBe(false);
      state = applyMove(state, move);
      expect(checkInvariants(state)).toEqual([]);
    }
    expect(isWon(state)).toBe(true);
  });

  it('exercises the reshuffle-recycle and every action kind at least once', () => {
    expect(sequence).toContain('draw');
    expect(sequence).toContain('recycle');
    expect(sequence.some((m) => m.includes('>foundation-'))).toBe(true);
    expect(sequence.some((m) => m.includes('>tableau-'))).toBe(true);
  });
});

describe('deal invariants', () => {
  it('holds for both fixtures across seeds', () => {
    for (const { categories, level } of PLAYTHROUGHS) {
      for (const seed of [1, 2, 3, 4, 5]) {
        expect(checkInvariants(deal(categories, seed, level))).toEqual([]);
      }
    }
  });

  it('holds for the real content across levels', () => {
    for (const level of [1, 4, 7]) {
      for (const seed of [1, 2, 3]) {
        expect(checkInvariants(deal(CATEGORIES, seed, level))).toEqual([]);
      }
    }
  });
});

describe('checkInvariants', () => {
  function consistentState(): State {
    const state = createEmptyState(1);
    for (const card of buildDeck(TWO_CATEGORIES)) {
      state.cards[card.id] = card;
    }
    state.piles.stock = Object.keys(state.cards);
    return state;
  }

  it('accepts a consistent state', () => {
    expect(checkInvariants(consistentState())).toEqual([]);
  });

  it('flags a card present in two piles', () => {
    const state = consistentState();
    state.piles.waste = ['word:a:a1'];
    expect(checkInvariants(state).join('\n')).toMatch(/in both "stock" and "waste"/);
  });

  it('flags a lost card', () => {
    const state = consistentState();
    state.piles.stock = state.piles.stock.filter((id) => id !== 'word:a:a1');
    expect(checkInvariants(state).join('\n')).toMatch(/"word:a:a1" is in no pile/);
  });

  it('flags a completed category with cards still on the board', () => {
    const state = consistentState();
    state.completedCategoryIds.push('a');
    expect(checkInvariants(state).join('\n')).toMatch(/completed category is still in "stock"/);
  });

  it('flags faceUp entries that do not exist or are in no pile', () => {
    const state = consistentState();
    state.faceUp.add('word:zz:ghost');
    expect(checkInvariants(state).join('\n')).toMatch(/faceUp contains unknown card/);
  });

  it('flags a foundation whose bottom card is not a category card', () => {
    const state = consistentState();
    state.piles.stock = state.piles.stock.filter((id) => id !== 'word:a:a1');
    state.piles['foundation-0'] = ['word:a:a1'];
    expect(checkInvariants(state).join('\n')).toMatch(/non-category bottom card/);
  });
});
