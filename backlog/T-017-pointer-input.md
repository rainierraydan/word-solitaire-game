---
id: T-017
title: Pointer input layer and tap detection
status: ready
depends_on: [T-016]
blocks: [T-018, T-019]
estimate: M
area: interaction
---

## Goal

A single Pointer Events input layer that resolves taps to a card or pile and dispatches to a
handler — the routing decisions themselves come in T-018/T-019.

## Context

docs/ui-conventions.md §Input: Pointer Events only (one code path for finger, mouse, stylus);
a tap is < ~10px movement within ~250ms; double-tap behaves as single tap.

## Acceptance criteria

- [ ] Uses `pointerdown` / `pointermove` / `pointerup` exclusively — no Touch Events APIs
      anywhere (verifiable by grep for `touchstart|touchend|touchmove`).
- [ ] Tap detection honors the thresholds: under ~10px movement within ~250ms; slower or longer
      gestures are not taps (they become drag territory for T-025, ignored for now).
- [ ] Event delegation resolves `event.target` to a `CardId` or `PileId` (stock, empty slots and
      empty columns must be tappable even with no card on them).
- [ ] Double-tap and double-click trigger the same handler as single tap, once per tap — no
      zoom, no special casing.
- [ ] Verified in mobile emulation at 360×640: taps land on fanned, partially occluded cards
      correctly (topmost hit wins).

## Notes

Keep the layer declarative: it emits "tapped X", nothing else. No game rules here — that
separation is what lets drag (T-025) reuse it.
