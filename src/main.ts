import { CATEGORIES } from './data/categories';
import { validateContent } from './data/validate';
import { deal } from './game/deal';
import { routeCardTap, routePileTap } from './game/route';
import { createBoard, measureBoardMetrics } from './ui/board';
import { createCardElements } from './ui/card';
import { shake } from './ui/feedback';
import { attachTapListener, type TapTarget } from './ui/input';
import { render } from './ui/render';

const MAX_SEED = 0xffffffff;

function resolveSeed(search: string): number {
  const raw = new URLSearchParams(search).get('seed');
  if (raw !== null && /^\d+$/.test(raw) && Number(raw) <= MAX_SEED) {
    return Number(raw);
  }
  return Math.floor(Math.random() * (MAX_SEED + 1));
}

function showBootError(root: HTMLElement, error: unknown): void {
  const pre = document.createElement('pre');
  pre.className = 'boot-error';
  pre.textContent = error instanceof Error ? error.message : String(error);
  root.replaceChildren(pre);
}

function boot(root: HTMLElement): void {
  const { warnings } = validateContent(CATEGORIES);
  for (const warning of warnings) {
    console.warn(warning);
  }

  let state = deal(CATEGORIES, resolveSeed(location.search));
  const board = createBoard(root);
  const cardEls = createCardElements(state.cards);
  board.append(...cardEls.values());

  let metrics = measureBoardMetrics(board);
  const paint = (): void => render(state, cardEls, metrics);
  paint();
  window.addEventListener('resize', () => {
    metrics = measureBoardMetrics(board);
    paint();
  });

  attachTapListener(board, (target: TapTarget) => {
    const result =
      target.kind === 'card'
        ? routeCardTap(state, target.cardId)
        : routePileTap(state, target.pileId);
    if (result.ok) {
      state = result.state;
      paint();
      return;
    }
    const el =
      target.kind === 'card'
        ? cardEls.get(target.cardId)
        : board.querySelector(`[data-pile-id="${target.pileId}"]`);
    if (el instanceof HTMLElement) {
      shake(el);
    }
  });
}

const app = document.querySelector('#app');
if (!(app instanceof HTMLElement)) {
  throw new Error('Missing #app root element');
}
try {
  boot(app);
} catch (error) {
  showBootError(app, error);
  throw error;
}
