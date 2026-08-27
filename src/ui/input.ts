import { PILE_IDS, type CardId, type PileId } from '../game/state';

export type TapTarget = { kind: 'card'; cardId: CardId } | { kind: 'pile'; pileId: PileId };

const TAP_MAX_DISTANCE_PX = 10;
const TAP_MAX_DURATION_MS = 250;

/**
 * Pointer-Events-only tap layer: emits "tapped X" and nothing else. Slower or
 * longer gestures are ignored here (drag territory, T-025). Double taps just
 * fire the handler once per tap.
 */
export function attachTapListener(board: HTMLElement, onTap: (target: TapTarget) => void): void {
  let start: { x: number; y: number; time: number; pointerId: number } | null = null;

  board.addEventListener('pointerdown', (event) => {
    start = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerId: event.pointerId,
    };
  });

  board.addEventListener('pointerup', (event) => {
    if (start === null || event.pointerId !== start.pointerId) return;
    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    const elapsed = performance.now() - start.time;
    start = null;
    if (moved > TAP_MAX_DISTANCE_PX || elapsed > TAP_MAX_DURATION_MS) return;
    const target = resolveTapTarget(event.target);
    if (target !== null) onTap(target);
  });
}

function resolveTapTarget(target: EventTarget | null): TapTarget | null {
  if (!(target instanceof Element)) return null;
  const cardEl = target.closest('[data-card-id]');
  if (cardEl instanceof HTMLElement) {
    const cardId = cardEl.dataset['cardId'];
    if (cardId !== undefined) return { kind: 'card', cardId };
  }
  const pileEl = target.closest('[data-pile-id]');
  if (pileEl instanceof HTMLElement) {
    const pileId = PILE_IDS.find((id) => id === pileEl.dataset['pileId']);
    if (pileId !== undefined) return { kind: 'pile', pileId };
  }
  return null;
}
