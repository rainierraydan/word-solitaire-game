import { PILE_IDS, type CardId, type PileId } from '../game/state';

export type TapTarget = { kind: 'card'; cardId: CardId } | { kind: 'pile'; pileId: PileId };

export type PointerHandlers = {
  onTap: (target: TapTarget) => void;
  /** Return true to lift the card; false swallows the gesture. */
  onDragStart: (cardId: CardId, x: number, y: number) => boolean;
  onDragMove: (cardId: CardId, x: number, y: number) => void;
  onDrop: (cardId: CardId, x: number, y: number) => void;
  onDragCancel: (cardId: CardId) => void;
};

const TAP_MAX_DISTANCE_PX = 10;
const TAP_MAX_DURATION_MS = 250;

/**
 * Pointer-Events-only input layer: emits taps and drag lifecycle events,
 * nothing else. A tap is < ~10px within ~250ms; crossing the distance
 * threshold turns the gesture into a drag on cards. Double taps just fire
 * the handler once per tap.
 */
export function attachPointerInput(board: HTMLElement, handlers: PointerHandlers): void {
  let gesture: {
    pointerId: number;
    x: number;
    y: number;
    time: number;
    target: TapTarget | null;
    dragging: boolean;
  } | null = null;

  board.addEventListener('pointerdown', (event) => {
    gesture = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      target: resolveTapTarget(event.target),
      dragging: false,
    };
    if (gesture.target?.kind === 'card') {
      try {
        // Without capture the gesture dies as soon as the finger leaves the card.
        board.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic events carry no active pointer; capture is irrelevant there.
      }
    }
  });

  board.addEventListener('pointermove', (event) => {
    if (gesture === null || event.pointerId !== gesture.pointerId) return;
    const target = gesture.target;
    if (target === null || target.kind !== 'card') return;
    if (!gesture.dragging) {
      const moved = Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y);
      if (moved <= TAP_MAX_DISTANCE_PX) return;
      if (!handlers.onDragStart(target.cardId, event.clientX, event.clientY)) {
        gesture = null;
        return;
      }
      gesture.dragging = true;
    }
    handlers.onDragMove(target.cardId, event.clientX, event.clientY);
  });

  board.addEventListener('pointerup', (event) => {
    if (gesture === null || event.pointerId !== gesture.pointerId) return;
    const ended = gesture;
    gesture = null;
    if (ended.dragging && ended.target?.kind === 'card') {
      handlers.onDrop(ended.target.cardId, event.clientX, event.clientY);
      return;
    }
    const moved = Math.hypot(event.clientX - ended.x, event.clientY - ended.y);
    const elapsed = performance.now() - ended.time;
    if (moved > TAP_MAX_DISTANCE_PX || elapsed > TAP_MAX_DURATION_MS) return;
    if (ended.target !== null) handlers.onTap(ended.target);
  });

  board.addEventListener('pointercancel', (event) => {
    if (gesture === null || event.pointerId !== gesture.pointerId) return;
    const ended = gesture;
    gesture = null;
    if (ended.dragging && ended.target?.kind === 'card') {
      handlers.onDragCancel(ended.target.cardId);
    }
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
