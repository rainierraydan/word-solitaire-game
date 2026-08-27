import { isTableauId, PILE_IDS, type CardId, type PileId, type State } from '../game/state';

export type BoardMetrics = {
  fanY: number;
  fanYDown: number;
  slots: Partial<Record<PileId, { x: number; y: number }>>; // inactive piles have no slot
};

export type CardPosition = { x: number; y: number; z: number };

/**
 * Maps every card in a pile to pixels. Stock, waste, and foundations stack on
 * one spot; tableau columns fan vertically, each card advancing by its own
 * face-up or face-down offset. Cards of completed categories sit in no pile
 * and receive no position — the renderer hides them.
 */
export function layout(state: State, metrics: BoardMetrics): Map<CardId, CardPosition> {
  const positions = new Map<CardId, CardPosition>();
  for (const pileId of PILE_IDS) {
    const base = metrics.slots[pileId];
    if (base === undefined) continue; // inactive pile: nothing to place
    const fanned = isTableauId(pileId);
    let y = base.y;
    state.piles[pileId].forEach((cardId, i) => {
      positions.set(cardId, { x: base.x, y, z: i + 1 });
      if (fanned) {
        y += state.faceUp.has(cardId) ? metrics.fanY : metrics.fanYDown;
      }
    });
  }
  return positions;
}
