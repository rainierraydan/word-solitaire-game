---
id: T-031
title: Foundation category label and progress counter
status: done
depends_on: [T-015]
blocks: []
estimate: S
area: layout
---

## Goal

Each open foundation shows its category name and a filed/total counter (e.g. `Fruits 1/4`) that
stays visible while word cards stack on top — user request 2026-08-27.

## Context

Filing a word covers the category card, so the player loses sight of what the slot holds. The
label is derived state: category name from the bottom card, filed count from the pile, total
from the content-derived word count. No new state is stored.

## Acceptance criteria

- [ ] An open foundation shows the category name plus `filed/total`, updating on every render;
      hidden when the slot is empty (including after completion frees the slot).
- [ ] Totals derive from the content file at runtime — no hardcoded counts (tested via a
      selector unit test with uneven fixtures).
- [ ] The label renders above stacked cards, never intercepts input (pointer-events none), and
      is legible at 360×640 without overflowing the slot.
- [ ] Rendering stays full and idempotent; the label is written by `render` from a pure selector.
- [ ] Verified in mobile emulation at 360×640 and desktop.

## Notes

Label elements are created once in the board shell (one per foundation slot); `render` only
writes text and visibility, preserving the no-create/no-remove render invariant.
