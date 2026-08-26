---
id: T-014
title: layout(state) — logical piles to pixel positions
status: blocked
depends_on: [T-006, T-012]
blocks: [T-015]
estimate: M
area: layout
---

## Goal

`layout(state)` returning `Map<CardId, { x, y, z }>` for every card, from pile membership and
board metrics.

## Context

docs/architecture.md: the middle layer. Pixel math lives here and only here — state stays pure,
render just writes. Fanned tableau columns use `--fan-y` for face-up and the tighter
`--fan-y-down` for face-down offsets.

## Acceptance criteria

- [ ] Every card in the state receives a position; stock, waste, and foundation piles stack
      cards on one spot; tableau columns fan vertically.
- [ ] Face-down cards in a fan use the tighter offset; face-up cards the wider one.
- [ ] `z` follows pile order (bottom → top), so overlaps render correctly.
- [ ] Board metrics enter as an explicit argument (measured once from the DOM/custom properties
      by the caller), making the function pure and unit-testable without a browser — covered by
      tests with a fixed metrics fixture.
- [ ] No game-logic decisions in the function: it reads state, never mutates it, and no DOM read
      feeds back into `src/game/`.

## Notes

Recomputing all positions per call is the design — no caching, no diffing. If the fanned column
overflows 360×640 the fix is compressing `--fan-y` (a T-012 variable), never scrolling.
