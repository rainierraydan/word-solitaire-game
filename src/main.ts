import { CATEGORIES } from './data/categories';
import { validateContent } from './data/validate';
import { deal } from './game/deal';
import { createBoard, getFoundationLabels, measureBoardMetrics } from './ui/board';
import { createCardElements } from './ui/card';
import { attachGameController } from './ui/controller';
import { createMenu } from './ui/menu';
import { render } from './ui/render';

const MAX_SEED = 0xffffffff;

function randomSeed(): number {
  return Math.floor(Math.random() * (MAX_SEED + 1));
}

function resolveSeed(search: string): number {
  const raw = new URLSearchParams(search).get('seed');
  if (raw !== null && /^\d+$/.test(raw) && Number(raw) <= MAX_SEED) {
    return Number(raw);
  }
  return randomSeed();
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

  const foundationLabels = getFoundationLabels(board);
  let metrics = measureBoardMetrics(board);
  const paint = (): void => render(state, cardEls, foundationLabels, metrics);
  paint();
  window.addEventListener('resize', () => {
    metrics = measureBoardMetrics(board);
    paint();
  });

  createMenu(board, {
    getSeed: () => state.seed,
    onNewDeal: () => {
      state = deal(CATEGORIES, randomSeed());
      paint();
    },
  });

  attachGameController({
    board,
    cardEls,
    getState: () => state,
    setState: (next) => {
      state = next;
    },
    repaint: paint,
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
