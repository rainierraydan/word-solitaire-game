import './banner.css';

/** Full-board overlay shown when a level is cleared; the button advances. */
export function showLevelCleared(board: HTMLElement, level: number, onNext: () => void): void {
  const overlay = document.createElement('div');
  overlay.className = 'level-cleared';

  const panel = document.createElement('div');
  panel.className = 'level-cleared-panel';

  const title = document.createElement('div');
  title.className = 'level-cleared-title';
  title.textContent = `Level ${level} cleared!`;

  const next = document.createElement('button');
  next.className = 'level-cleared-next';
  next.textContent = `Play level ${level + 1}`;
  next.addEventListener('click', () => {
    overlay.remove();
    onNext();
  });

  panel.append(title, next);
  overlay.append(panel);
  board.append(overlay);
}
