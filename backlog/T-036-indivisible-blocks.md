---
id: T-036
title: Same-category stacks move as indivisible blocks
status: done
depends_on: [T-033]
blocks: []
estimate: S
area: state
---

## Goal

Once two or more same-category cards are stacked on a column they form a block: grabbing any
card of it moves the whole block, and it can no longer be split — user request 2026-08-27.

## Context

T-033 let a run move as a unit but still allowed grabbing a sub-run (e.g. only the top card),
splitting the stack. Playtesting showed splitting adds no gameplay. The unit becomes the
*maximal* face-up same-category sequence containing the grabbed card. The face-up top section of
a column is single-category by construction (stacking only ever adds matching cards), so the
block is well-defined.

## Acceptance criteria

- [ ] `tableauRun` expands downward to the start of the same-category face-up sequence: grabbing
      the top or a middle card of a block yields the whole block.
- [ ] Blocks cannot be split by drag or tap — any grab point moves every card of the block, to
      every destination (foundation, matching stack, empty column).
- [ ] Single cards behave exactly as before (a block of one).
- [ ] docs/game-spec.md describes blocks; unit tests per case.
