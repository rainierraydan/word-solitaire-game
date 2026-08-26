---
id: T-022
title: Win animation — canvas overlay
status: blocked
depends_on: [T-011, T-016]
blocks: []
estimate: M
area: polish
---

## Goal

Detect the win in the UI and celebrate it with a canvas overlay, then offer a new deal.

## Context

docs/architecture.md: the sole canvas exception is an overlay for the win animation, mounted
only for that moment. Everything else stays DOM.

## Acceptance criteria

- [ ] After the action that completes the last category, the win state is detected via
      `isWon(state)` and the overlay mounts; the overlay element exists in the DOM only during
      the celebration — never before, removed after.
- [ ] The animation runs on the canvas (particles, cascade — implementer's choice), sized to the
      viewport including safe areas, and does not break the `overflow: hidden` / no-scroll
      constraints.
- [ ] A tap anywhere (or an explicit control) dismisses the overlay and offers/starts a new
      deal.
- [ ] The animation loop stops (no rAF leak) once the overlay is dismissed.
- [ ] Verified in mobile emulation by playing a tiny two-category test content set to
      completion, or by a debug seed/state shortcut removed before merge.

## Notes

Keep the celebration under a few seconds before the new-deal affordance appears — long
animations make a card game feel sluggish.
