---
id: T-024
title: Desktop keyboard support
status: blocked
depends_on: [T-018]
blocks: []
estimate: S
area: interaction
---

## Goal

Keyboard shortcuts for desktop play: `Space` draws from the stock.

## Context

docs/ui-conventions.md §Input lists `Space` to draw and `Ctrl/Cmd+Z` to undo. Undo was removed
by decision 2026-08-26, so the undo binding is dropped — this ticket is the draw shortcut and
the plumbing for any future bindings.

## Acceptance criteria

- [ ] `Space` triggers the same draw/recycle path as tapping the stock, including invalid
      feedback when both piles are empty.
- [ ] The default `Space` page-scroll is prevented; no other key is intercepted.
- [ ] Shortcuts do nothing harmful on mobile (no visible controls change; soft keyboards are
      never summoned).
- [ ] Keyboard handling lives in the input layer alongside T-017, routed through the same action
      dispatch — no duplicate game calls.

## Notes

Doc drift: ui-conventions.md still mentions `Ctrl/Cmd+Z` and unlimited undo. Flag for a docs
update — do not edit docs in this ticket.
