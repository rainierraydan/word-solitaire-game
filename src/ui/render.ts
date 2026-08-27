import {
  foundationProgress,
  FOUNDATION_IDS,
  type CardId,
  type FoundationId,
  type State,
} from '../game/state';
import { layout, type BoardMetrics } from './layout';

/**
 * Full, idempotent render: recomputes every card from layout(state) and
 * writes transform, z-index, and the face-up class. Cards without a position
 * (completed categories) fade out via the off-board class. Foundation labels
 * get their name and filed/total counter. No elements are created, removed,
 * or reordered here.
 */
export function render(
  state: State,
  cardEls: Map<CardId, HTMLElement>,
  foundationLabels: Map<FoundationId, HTMLElement>,
  metrics: BoardMetrics,
): void {
  const positions = layout(state, metrics);
  const onFoundation = new Set(FOUNDATION_IDS.flatMap((id) => state.piles[id]));
  for (const [cardId, el] of cardEls) {
    const pos = positions.get(cardId);
    el.classList.toggle('off-board', pos === undefined);
    if (pos === undefined) continue;
    el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    el.style.zIndex = String(pos.z);
    el.classList.toggle('face-up', state.faceUp.has(cardId));
    el.classList.toggle('on-foundation', onFoundation.has(cardId));
  }
  for (const [foundationId, label] of foundationLabels) {
    const progress = foundationProgress(state, foundationId);
    label.hidden = progress === undefined;
    label.textContent =
      progress === undefined ? '' : `${progress.name} ${progress.filed}/${progress.total}`;
  }
}
