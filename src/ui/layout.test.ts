import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../data/categories';
import { deal } from '../game/deal';
import { PILE_IDS, serializeState, type PileId } from '../game/state';
import { layout, type BoardMetrics } from './layout';

function makeMetrics(): BoardMetrics {
  const slots = Object.fromEntries(
    PILE_IDS.map((id, i) => [id, { x: i * 100, y: id.startsWith('tableau') ? 200 : 50 }]),
  ) as Record<PileId, { x: number; y: number }>;
  return { fanY: 20, fanYDown: 10, slots };
}

describe('layout', () => {
  const metrics = makeMetrics();

  it('positions every dealt card', () => {
    const state = deal(CATEGORIES, 42);
    const positions = layout(state, metrics);
    expect(positions.size).toBe(Object.keys(state.cards).length);
  });

  it('stacks stock, waste, and foundation cards on the slot spot', () => {
    const state = deal(CATEGORIES, 42);
    const positions = layout(state, metrics);
    const base = metrics.slots.stock;
    for (const cardId of state.piles.stock) {
      const pos = positions.get(cardId);
      expect(pos).toMatchObject({ x: base.x, y: base.y });
    }
  });

  it('fans tableau columns: tight offset after face-down cards, wide after face-up', () => {
    const state = deal(CATEGORIES, 42);
    const positions = layout(state, metrics);
    const column = state.piles['tableau-2']; // 2 face-down + 1 face-up
    const base = metrics.slots['tableau-2'];
    const ys = column.map((id) => {
      const pos = positions.get(id);
      if (pos === undefined) throw new Error(`no position for ${id}`);
      return pos.y;
    });
    expect(ys).toEqual([base.y, base.y + metrics.fanYDown, base.y + 2 * metrics.fanYDown]);
  });

  it('advances by the wide offset after a face-up card', () => {
    const state = deal(CATEGORIES, 42);
    // Make the whole first three-card column face-up.
    for (const id of state.piles['tableau-2']) {
      state.faceUp.add(id);
    }
    const positions = layout(state, metrics);
    const base = metrics.slots['tableau-2'];
    const ys = state.piles['tableau-2'].map((id) => positions.get(id)?.y);
    expect(ys).toEqual([base.y, base.y + metrics.fanY, base.y + 2 * metrics.fanY]);
  });

  it('assigns z following pile order, bottom to top', () => {
    const state = deal(CATEGORIES, 42);
    const positions = layout(state, metrics);
    const zs = state.piles['tableau-6'].map((id) => positions.get(id)?.z);
    expect(zs).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('does not mutate the state', () => {
    const state = deal(CATEGORIES, 42);
    const before = serializeState(state);
    layout(state, metrics);
    expect(serializeState(state)).toBe(before);
  });
});
