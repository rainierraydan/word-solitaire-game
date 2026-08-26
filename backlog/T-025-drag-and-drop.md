---
id: T-025
title: Drag-and-drop enhancement
status: blocked
depends_on: [T-019]
blocks: []
estimate: L
area: interaction
---

## Goal

Dragging a card to a legal destination as an enhancement layered over tap-to-move — never a
replacement for it.

## Context

docs/ui-conventions.md §Input: dragging a ~48px card with a finger is imprecise, so tap remains
primary. `setPointerCapture()` on `pointerdown` is mandatory or the gesture dies when the finger
leaves the element. The tap/drag threshold (~10px within ~250ms) already lives in T-017.

## Acceptance criteria

- [ ] A gesture crossing the drag threshold lifts the card and it follows the pointer
      (`transform` only); `setPointerCapture` is called on `pointerdown`.
- [ ] Legal drop targets are exactly the tap-to-move rules: matching open foundation, empty
      foundation slot for category cards, empty tableau column for tableau top cards.
- [ ] Dropping on a legal target executes the same T-009/T-010 action functions the tap router
      uses — no second rules implementation.
- [ ] Dropping anywhere else animates the card back to its layout position; state unchanged.
- [ ] Tap-to-move still works everywhere, unchanged — regression-checked after the drag layer
      lands.
- [ ] While dragging, the card renders above everything (z), and no other card reacts.
- [ ] Verified with touch emulation at 360×640 and with a desktop mouse.

## Notes

The drag ghost is the card element itself, not a clone — the element-per-card invariant stands.
On drop, hand the element back to `render`/`layout` for its final position so the state stays
the single source of truth.
