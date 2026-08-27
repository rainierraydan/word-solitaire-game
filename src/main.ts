import { CATEGORIES } from './data/categories';
import { validateContent } from './data/validate';
import { deal } from './game/deal';
import { showLevelCleared } from './ui/banner';
import { createBoard, getFoundationLabels, measureBoardMetrics } from './ui/board';
import { createCardElements } from './ui/card';
import { attachGameController } from './ui/controller';
import { createMenu } from './ui/menu';
import { render } from './ui/render';

const MAX_SEED = 0xffffffff;
const MAX_LEVEL = 999;
const LEVEL_KEY = 'item-sorting:level';

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

function isValidLevel(raw: string | null): raw is string {
  return raw !== null && /^\d+$/.test(raw) && Number(raw) >= 1 && Number(raw) <= MAX_LEVEL;
}

function resolveLevel(search: string): number {
  const param = new URLSearchParams(search).get('level');
  if (isValidLevel(param)) return Number(param);
  try {
    const stored = localStorage.getItem(LEVEL_KEY);
    if (isValidLevel(stored)) return Number(stored);
  } catch {
    // storage unavailable (private mode): start at level 1
  }
  return 1;
}

function saveLevel(level: number): void {
  try {
    localStorage.setItem(LEVEL_KEY, String(level));
  } catch {
    // storage unavailable: the level just won't survive a reload
  }
}

function showBootError(root: HTMLElement, error: unknown): void {
  const pre = document.createElement('pre');
  pre.className = 'boot-error';
  pre.textContent = error instanceof Error ? error.message : String(error);
  root.replaceChildren(pre);
}

let stopResizeListener: (() => void) | undefined;

/** Builds a whole game: each deal has its own card set and board shape. */
function startGame(root: HTMLElement, level: number, seed: number): void {
  let state = deal(CATEGORIES, seed, level);
  const board = createBoard(root, {
    foundationCount: state.foundationCount,
    tableauCount: state.tableauCount,
  });
  const cardEls = createCardElements(state.cards);
  board.append(...cardEls.values());

  const foundationLabels = getFoundationLabels(board);
  let metrics = measureBoardMetrics(board);
  const paint = (): void => render(state, cardEls, foundationLabels, metrics);
  paint();

  stopResizeListener?.();
  const onResize = (): void => {
    metrics = measureBoardMetrics(board);
    paint();
  };
  window.addEventListener('resize', onResize);
  stopResizeListener = (): void => window.removeEventListener('resize', onResize);

  createMenu(board, {
    getSeed: () => state.seed,
    getLevel: () => state.level,
    onNewDeal: () => startGame(root, level, randomSeed()),
  });

  attachGameController({
    board,
    cardEls,
    getState: () => state,
    setState: (next) => {
      state = next;
    },
    repaint: paint,
    onWin: () => {
      showLevelCleared(board, level, () => {
        const nextLevel = level + 1;
        saveLevel(nextLevel);
        startGame(root, nextLevel, randomSeed());
      });
    },
  });
}

const app = document.querySelector('#app');
if (!(app instanceof HTMLElement)) {
  throw new Error('Missing #app root element');
}
try {
  const { warnings } = validateContent(CATEGORIES);
  for (const warning of warnings) {
    console.warn(warning);
  }
  startGame(app, resolveLevel(location.search), resolveSeed(location.search));
} catch (error) {
  showBootError(app, error);
  throw error;
}
