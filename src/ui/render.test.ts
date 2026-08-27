// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../data/categories';
import { deal } from '../game/deal';
import { FOUNDATION_IDS, PILE_IDS, type FoundationId, type PileId, type State } from '../game/state';
import { createCardElements } from './card';
import type { BoardMetrics } from './layout';
import { render } from './render';

function makeMetrics(): BoardMetrics {
  const slots = Object.fromEntries(
    PILE_IDS.map((id, i) => [id, { x: i * 100, y: id.startsWith('tableau') ? 200 : 50 }]),
  ) as Record<PileId, { x: number; y: number }>;
  return { fanY: 20, fanYDown: 10, slots };
}

function setup(): {
  state: State;
  els: Map<string, HTMLElement>;
  labels: Map<FoundationId, HTMLElement>;
  container: HTMLElement;
} {
  const state = deal(CATEGORIES, 42);
  const els = createCardElements(state.cards);
  const container = document.createElement('div');
  container.append(...els.values());
  const labels = new Map(
    FOUNDATION_IDS.map((id) => {
      const label = document.createElement('div');
      container.append(label);
      return [id, label] as const;
    }),
  );
  return { state, els, labels, container };
}

function domSnapshot(container: HTMLElement): string[] {
  return [...container.children].map((el) => el.outerHTML);
}

describe('render', () => {
  const metrics = makeMetrics();

  it('writes transform, z-index, and face-up for every dealt card', () => {
    const { state, els, labels } = setup();
    render(state, els, labels, metrics);
    for (const [cardId, el] of els) {
      expect(el.style.transform).toMatch(/^translate3d\(-?\d+(\.\d+)?px, -?\d+(\.\d+)?px, 0\)$/);
      expect(el.style.zIndex).not.toBe('');
      expect(el.classList.contains('face-up')).toBe(state.faceUp.has(cardId));
      expect(el.classList.contains('off-board')).toBe(false);
    }
  });

  it('is idempotent: a second render leaves the DOM byte-identical', () => {
    const { state, els, labels, container } = setup();
    render(state, els, labels, metrics);
    const first = domSnapshot(container);
    render(state, els, labels, metrics);
    expect(domSnapshot(container)).toEqual(first);
  });

  it('creates, removes, and reorders nothing', () => {
    const { state, els, labels, container } = setup();
    const before = [...container.children];
    render(state, els, labels, metrics);
    const after = [...container.children];
    expect(after.length).toBe(before.length);
    after.forEach((el, i) => expect(el).toBe(before[i]));
  });

  it('marks cards missing from every pile as off-board', () => {
    const { state, els, labels } = setup();
    const removed = state.piles.stock.pop();
    if (removed === undefined) throw new Error('expected a non-empty stock');
    render(state, els, labels, metrics);
    expect(els.get(removed)?.classList.contains('off-board')).toBe(true);
    render({ ...state, piles: { ...state.piles, stock: [...state.piles.stock, removed] } }, els, labels, metrics);
    expect(els.get(removed)?.classList.contains('off-board')).toBe(false);
  });

  it('writes name and filed/total on open foundation labels, hides the rest', () => {
    const { state, els, labels } = setup();
    const categoryCard = Object.values(state.cards).find((c) => c.kind === 'category');
    if (categoryCard === undefined) throw new Error('expected a category card');
    state.piles['foundation-2'] = [categoryCard.id];
    render(state, els, labels, metrics);

    const open = labels.get('foundation-2');
    const total = Object.values(state.cards).filter(
      (c) => c.kind === 'word' && c.categoryId === categoryCard.categoryId,
    ).length;
    expect(open?.hidden).toBe(false);
    expect(open?.textContent).toBe(`${categoryCard.label} 0/${total}`);
    expect(labels.get('foundation-0')?.hidden).toBe(true);
    expect(labels.get('foundation-0')?.textContent).toBe('');
  });
});
