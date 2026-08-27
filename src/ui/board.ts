import { FOUNDATION_IDS, TABLEAU_IDS, type PileId } from '../game/state';
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
export function createBoard(root: HTMLElement): void {
  const foundations = group(
    'foundations',
    FOUNDATION_IDS.map((id) => slot(id, 'slot')),
  );
  const stockWaste = group('stock-waste', [slot('stock', 'slot'), slot('waste', 'slot')]);
  const tableau = group(
    'tableau',
    TABLEAU_IDS.map((id) => slot(id, 'column')),
  );

  const board = group('board', [group('board-top', [foundations, stockWaste]), tableau]);
  root.replaceChildren(board);
}
