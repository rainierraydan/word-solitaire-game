---
id: T-015
title: render(state) — full, idempotent DOM writes
status: blocked
depends_on: [T-013, T-014]
blocks: [T-016]
estimate: M
area: layout
---

## Goal

`render(state)`: write every card's transform, z-index, and face-up class from `layout(state)`.

## Context

docs/architecture.md: render is full and idempotent — recomputing every card costs well under a
millisecond, so no partial or diffing paths. Combined with CSS transitions, a plain re-render
animates card movement for free.

## Acceptance criteria

- [ ] One call positions every card via `translate3d`, sets `zIndex`, and toggles `face-up` —
      exactly the writes shown in docs/architecture.md, nothing else.
- [ ] Idempotent: calling twice with the same state leaves identical style/class attributes
      (asserted in a test over the card elements).
- [ ] No DOM elements are created, removed, or reordered by render.
- [ ] Animation check in the dev server: moving a card between piles in two successive states
      transitions smoothly (compositor transform), no jumps or layout thrash.

## Notes

Render may re-measure board metrics on resize before calling layout; wire a resize listener
that re-renders. Keep it dumb — anything conditional belongs in layout or state.
