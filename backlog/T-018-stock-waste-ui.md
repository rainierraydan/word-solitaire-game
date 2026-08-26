---
id: T-018
title: Stock and waste interaction
status: blocked
depends_on: [T-008, T-017]
blocks: [T-023, T-024, T-027]
estimate: S
area: interaction
---

## Goal

Tapping the stock draws to the waste; tapping the empty stock reshuffle-recycles the waste.

## Context

First interactive feature — together with T-019 it completes the playable vertical slice.
Wires the T-008 actions to the T-017 input layer and re-renders.

## Acceptance criteria

- [ ] Tap on the stock draws: the top card animates to the waste and lands face-up, exactly one
      card per tap.
- [ ] Tap on the empty stock with a non-empty waste recycles: the waste reshuffles into the
      stock face-down, waste empties visually, next tap draws again.
- [ ] Tap with both empty produces invalid-move feedback (no crash, no silent nothing) —
      reuse/foreshadow the T-019 shake.
- [ ] State changes go exclusively through the T-008 action functions followed by `render` —
      no DOM-side game logic.
- [ ] Verified in mobile emulation at 360×640, including a full cycle: draw the whole stock,
      recycle, draw again.

## Notes

The waste shows its top card; deeper waste cards stack underneath (layout already handles it).
