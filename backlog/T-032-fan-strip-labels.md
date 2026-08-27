---
id: T-032
title: Word visible on the fan strip of stacked cards
status: done
depends_on: [T-020, T-030]
blocks: []
estimate: S
area: layout
---

## Goal

Every face-up card in a tableau fan shows its word on the visible top strip, so a stacked
same-category pile reads as a list — user request 2026-08-27.

## Context

T-030 made same-category stacks common; the centered label hides under the covering card,
leaving stacked words unreadable. The face-up fan offset (`--fan-y`, 28% of card height) is the
budget the label must fit in.

## Acceptance criteria

- [ ] The label of a covered face-up card is fully visible inside the `--fan-y` strip at 360px
      viewport width (single line, no clipping) for every placeholder word.
- [ ] Fully visible cards show the same top-aligned label — one layout, no special casing.
- [ ] Two-line category names still fit on an uncovered card.
- [ ] Verified in mobile emulation at 360×640 and desktop.

## Notes

CSS-only: top-align the front face text. The T-020 character budget is unchanged.
