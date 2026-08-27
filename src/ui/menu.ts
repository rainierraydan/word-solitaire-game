import './menu.css';

type MenuOptions = {
  getSeed: () => number;
  onNewDeal: () => void;
};

/**
 * Small unobtrusive control in the bottom-right corner: opens a panel with
 * the current seed (copyable, for `?seed=` bug reports) and "New deal".
 * A tap outside the panel closes it.
 */
export function createMenu(board: HTMLElement, options: MenuOptions): void {
  const button = document.createElement('button');
  button.className = 'menu-button';
  button.textContent = '☰';
  button.setAttribute('aria-label', 'Game menu');

  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop hidden';

  const panel = document.createElement('div');
  panel.className = 'menu-panel hidden';

  const seedLabel = document.createElement('div');
  seedLabel.className = 'menu-seed';

  const newDeal = document.createElement('button');
  newDeal.className = 'menu-new-deal';
  newDeal.textContent = 'New deal';

  panel.append(seedLabel, newDeal);

  const setOpen = (open: boolean): void => {
    backdrop.classList.toggle('hidden', !open);
    panel.classList.toggle('hidden', !open);
    if (open) {
      seedLabel.textContent = `Seed: ${options.getSeed()}`;
    }
  };

  button.addEventListener('click', () => setOpen(true));
  backdrop.addEventListener('click', () => setOpen(false));
  newDeal.addEventListener('click', () => {
    options.onNewDeal();
    setOpen(false);
  });

  board.append(button, backdrop, panel);
}
