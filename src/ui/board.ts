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

export type BoardShape = { foundationCount: number; tableauCount: number };

/**
 * Builds the board for a given shape: the active foundation slots and
 * stock/waste on top, the active tableau columns below. Card width derives
 * from the column count via the --columns variable.
 */
export function createBoard(root: HTMLElement, shape: BoardShape): HTMLElement {
  const foundations = group(
    'foundations',
    FOUNDATION_IDS.slice(0, shape.foundationCount).map((id) => {
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
    TABLEAU_IDS.slice(0, shape.tableauCount).map((id) => slot(id, 'column')),
  );

  const board = group('board', [group('board-top', [foundations, stockWaste]), tableau]);
  // --card-w is resolved where it is declared (:root), so the column count
  // must be overridden there, not on the board element. Both rows must fit:
  // the top row holds the foundations plus stock and waste.
  const widthUnits = Math.max(shape.tableauCount, shape.foundationCount + 2);
  document.documentElement.style.setProperty('--columns', String(widthUnits));
  root.replaceChildren(board);
  return board;
}

/** The progress label element of each active foundation slot, for render to write. */
export function getFoundationLabels(board: HTMLElement): Map<FoundationId, HTMLElement> {
  const labels = new Map<FoundationId, HTMLElement>();
  for (const foundationId of FOUNDATION_IDS) {
    const label = board.querySelector(`[data-pile-id="${foundationId}"] .slot-label`);
    if (label instanceof HTMLElement) {
      labels.set(foundationId, label);
    }
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

/** Measures the positions of the slots present on the board; re-run on resize. */
export function measureBoardMetrics(board: HTMLElement): BoardMetrics {
  const origin = board.getBoundingClientRect();
  const entries: [PileId, { x: number; y: number }][] = [];
  for (const pileId of PILE_IDS) {
    const el = board.querySelector(`[data-pile-id="${pileId}"]`);
    if (!(el instanceof HTMLElement)) continue; // inactive pile: no slot
    const rect = el.getBoundingClientRect();
    entries.push([pileId, { x: rect.left - origin.left, y: rect.top - origin.top }]);
  }
  return {
    fanY: resolveLength(board, '--fan-y'),
    fanYDown: resolveLength(board, '--fan-y-down'),
    slots: Object.fromEntries(entries) as BoardMetrics['slots'],
  };
}
