import type { ActionResult } from '../game/actions';
import { canPickCard, routeCardTap, routeDrop, routePileTap } from '../game/route';
import { findPile, PILE_IDS, tableauRun, type CardId, type PileId, type State } from '../game/state';
import { isWon } from '../game/win';
import { shake } from './feedback';
import { attachPointerInput, type TapTarget } from './input';

type ControllerArgs = {
  board: HTMLElement;
  cardEls: Map<CardId, HTMLElement>;
  getState: () => State;
  setState: (state: State) => void;
  repaint: () => void;
  onWin: () => void;
};

/**
 * Wires the input layer to the game rules: taps auto-route, drags let the
 * player pick the destination. The dragged element is the card itself; every
 * outcome ends in a repaint so state stays the single source of truth.
 */
export function attachGameController(args: ControllerArgs): void {
  const { board, cardEls, getState, setState, repaint, onWin } = args;
  // The dragged run: each element with its offset from the pointer at grab time.
  let lifted: { el: HTMLElement; dx: number; dy: number }[] = [];

  const apply = (result: ActionResult, feedbackEl: HTMLElement | undefined): void => {
    if (result.ok) {
      setState(result.state);
    } else if (feedbackEl !== undefined) {
      shake(feedbackEl);
    }
    repaint();
    if (result.ok && isWon(result.state)) {
      onWin();
    }
  };

  const elFor = (target: TapTarget): HTMLElement | undefined => {
    if (target.kind === 'card') return cardEls.get(target.cardId);
    const el = board.querySelector(`[data-pile-id="${target.pileId}"]`);
    return el instanceof HTMLElement ? el : undefined;
  };

  const dropTargetAt = (x: number, y: number): PileId | undefined => {
    const el = document.elementFromPoint(x, y);
    if (!(el instanceof Element)) return undefined;
    const cardEl = el.closest('[data-card-id]');
    const coveredCardId = cardEl instanceof HTMLElement ? cardEl.dataset['cardId'] : undefined;
    if (coveredCardId !== undefined) {
      return findPile(getState(), coveredCardId);
    }
    const pileEl = el.closest('[data-pile-id]');
    if (pileEl instanceof HTMLElement) {
      return PILE_IDS.find((id) => id === pileEl.dataset['pileId']);
    }
    return undefined;
  };

  attachPointerInput(board, {
    onTap: (target) => {
      const state = getState();
      const result =
        target.kind === 'card'
          ? routeCardTap(state, target.cardId)
          : routePileTap(state, target.pileId);
      apply(result, elFor(target));
    },

    onDragStart: (cardId, x, y) => {
      const state = getState();
      if (!canPickCard(state, cardId)) return false;
      const run = tableauRun(state, cardId) ?? [cardId];
      const els = run
        .map((id) => cardEls.get(id))
        .filter((el): el is HTMLElement => el !== undefined);
      if (els.length !== run.length) return false;
      lifted = els.map((el, i) => {
        const rect = el.getBoundingClientRect();
        el.classList.add('dragging');
        el.style.zIndex = String(1000 + i);
        return { el, dx: rect.left - x, dy: rect.top - y };
      });
      return true;
    },

    onDragMove: (_cardId, x, y) => {
      const origin = board.getBoundingClientRect();
      for (const { el, dx, dy } of lifted) {
        el.style.transform = `translate3d(${x + dx - origin.left}px, ${y + dy - origin.top}px, 0)`;
      }
    },

    onDrop: (cardId, x, y) => {
      // Resolve the target before lifting the dragging class: the dragged
      // cards ignore pointer events, so elementFromPoint sees what is under them.
      const target = dropTargetAt(x, y);
      for (const { el } of lifted) {
        el.classList.remove('dragging');
      }
      lifted = [];
      const result =
        target === undefined
          ? ({ ok: false, reason: 'no drop target' } as const)
          : routeDrop(getState(), cardId, target);
      apply(result, cardEls.get(cardId));
    },

    onDragCancel: () => {
      for (const { el } of lifted) {
        el.classList.remove('dragging');
      }
      lifted = [];
      repaint();
    },
  });
}
