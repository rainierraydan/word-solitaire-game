import {
  FOUNDATION_IDS,
  PILE_IDS,
  TABLEAU_IDS,
  type FoundationId,
  type PileId,
} from '../game/state';
import type { BoardMetrics } from './layout';
import './board.css';

function slot(pileId: PileId, className: string): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  el.dataset['pileId'] = pileId;
  return el;
}

function group(className: string, children: HTMLElement[]): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  el.append(...children);
  return el;
}

/** Builds the static board: foundations and stock/waste on top, tableau columns below. */
export function createBoard(root: HTMLElement): HTMLElement {
  const foundations = group(
    'foundations',
    FOUNDATION_IDS.map((id) => {
      const el = slot(id, 'slot');
      const label = document.createElement('div');
      label.className = 'slot-label';
      label.hidden = true;
      el.append(label);
      return el;
    }),
  );
  const stockWaste = group('stock-waste', [slot('stock', 'slot'), slot('waste', 'slot')]);
  const tableau = group(
    'tableau',
    TABLEAU_IDS.map((id) => slot(id, 'column')),
  );

  const board = group('board', [group('board-top', [foundations, stockWaste]), tableau]);
  root.replaceChildren(board);
  return board;
}

/** The progress label element of each foundation slot, for render to write. */
export function getFoundationLabels(board: HTMLElement): Map<FoundationId, HTMLElement> {
  const labels = new Map<FoundationId, HTMLElement>();
  for (const foundationId of FOUNDATION_IDS) {
    const label = board.querySelector(`[data-pile-id="${foundationId}"] .slot-label`);
    if (!(label instanceof HTMLElement)) {
      throw new Error(`missing label element for "${foundationId}"`);
    }
    labels.set(foundationId, label);
  }
  return labels;
}

/** Resolves a CSS length variable to pixels by measuring a probe element. */
function resolveLength(container: HTMLElement, variable: string): number {
  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.height = `var(${variable})`;
  container.append(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
}

/** Measures slot positions and fan offsets once; re-run on resize. */
export function measureBoardMetrics(board: HTMLElement): BoardMetrics {
  const origin = board.getBoundingClientRect();
  const entries: [PileId, { x: number; y: number }][] = PILE_IDS.map((pileId) => {
    const el = board.querySelector(`[data-pile-id="${pileId}"]`);
    if (!(el instanceof HTMLElement)) {
      throw new Error(`missing slot element for pile "${pileId}"`);
    }
    const rect = el.getBoundingClientRect();
    return [pileId, { x: rect.left - origin.left, y: rect.top - origin.top }];
  });
  return {
    fanY: resolveLength(board, '--fan-y'),
    fanYDown: resolveLength(board, '--fan-y-down'),
    slots: Object.fromEntries(entries) as BoardMetrics['slots'],
  };
}
