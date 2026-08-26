---
id: T-012
title: Board shell — regions, sizing variables, responsive fit
status: blocked
depends_on: [T-002]
blocks: [T-013, T-014]
estimate: M
area: layout
---

## Goal

The static board: top row with 5 foundation slots, stock and waste, 7 tableau column areas
below, all sized from CSS custom properties.

## Context

docs/ui-conventions.md §Sizing and §Mobile constraints, docs/game-spec.md §Board. One set of
custom properties (`--gap`, `--card-w`, `--card-h`, `--fan-y`, `--fan-y-down`) drives every
dimension; changing one rescales the whole board.

## Acceptance criteria

- [ ] Board layout matches the spec sketch: foundations left, stock/waste top-right, 7 columns
      below.
- [ ] All dimensions derive from the `:root` custom properties defined per ui-conventions.md;
      no hardcoded pixel sizes in component CSS (`--gap` excepted as the base unit).
- [ ] `.board` carries `touch-action: none`, `user-select: none`, and transparent tap highlight.
- [ ] Safe areas respected via `env(safe-area-inset-*)`: top row clears a notch, bottom clears
      the iOS home bar (verify with devtools device emulation of a notched phone).
- [ ] At 360×640 CSS px the full board fits with no scrolling and no overflow in either axis —
      verified in mobile emulation, not just by resizing a desktop window.
- [ ] Slot count and column count come from the same constants as the state model where markup
      is generated — no second literal.

## Notes

Card elements themselves are T-013; this ticket delivers the empty stage. Number of foundation
slots (5) and columns (7) are design constants, not content-derived — a named constant is
enough.
