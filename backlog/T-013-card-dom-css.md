---
id: T-013
title: Card DOM structure and CSS, including the flip
status: blocked
depends_on: [T-006, T-012]
blocks: [T-015, T-020]
estimate: M
area: layout
---

## Goal

A card element factory: one DOM element per card, two faces, pure-CSS flip, category and word
cards visually distinct.

## Context

docs/architecture.md: card elements are created once at boot and never destroyed or reordered —
movement is `transform` only. docs/ui-conventions.md: flip via `preserve-3d` +
`backface-visibility: hidden`, no box-shadow/filter on cards, transitions ~`.22s ease-out`.

## Acceptance criteria

- [ ] `createCardElement(card)` builds a card with a back face and a front face showing the
      label; exactly one element per deck card exists after boot, none created or removed
      afterwards.
- [ ] The flip animates purely in CSS by toggling a `face-up` class — no JS animation code.
- [ ] Card CSS contains no `box-shadow`, `filter`, or `backdrop-filter`; edge treatment is a
      flat border or inset highlight.
- [ ] Transitions animate only `transform` and `opacity`, around `.22s ease-out`.
- [ ] Category cards are distinguishable from word cards at a glance (background, border, or
      marker) in both face-up states, verified at 360×640.
- [ ] Face-up cards in a fan expose ≥ ~28px of tappable height, extended with a transparent
      `::after` if the visible strip is thinner.
- [ ] Sizes come from the T-012 custom properties only.

## Notes

Font sizing and word fitting are T-020 — here the label just needs to render. Keep the DOM per
card minimal (one wrapper, two faces); hit testing relies on `event.target` resolving to the
card element.
