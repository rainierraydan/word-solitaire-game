import { CATEGORIES } from './data/categories';
import { validateContent } from './data/validate';
import { deal } from './game/deal';
import { createBoard, measureBoardMetrics } from './ui/board';
import { createCardElements } from './ui/card';
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

  const state = deal(CATEGORIES, resolveSeed(location.search));
  const board = createBoard(root);
  const cardEls = createCardElements(state.cards);
  board.append(...cardEls.values());

  const paint = (): void => render(state, cardEls, measureBoardMetrics(board));
  paint();
  window.addEventListener('resize', paint);
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
