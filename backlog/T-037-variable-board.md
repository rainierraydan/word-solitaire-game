---
id: T-037
title: Variable board geometry from game state
status: done
depends_on: [T-006, T-012]
blocks: [T-038, T-039]
estimate: M
area: state
---

## Goal

The number of foundation slots and tableau columns comes from the game state instead of fixed
constants, so levels (T-039) can vary the board — user request 2026-08-27.

## Context

`FOUNDATION_IDS`/`TABLEAU_IDS` stay as the *maximum* pile sets (5 foundations, 8 columns — the
type-level universe); `State` gains `foundationCount`, `tableauCount`, and `level`, and active
piles are the prefix of each list. Inactive piles exist but stay empty and get no DOM slot. The
`--card-w` formula derives from a `--columns` CSS variable set by the board builder.

## Acceptance criteria

- [ ] `State` carries `foundationCount`, `tableauCount`, `level`; serialization round-trips them.
- [ ] Actions and tap routing only ever target *active* piles; moves to inactive piles are
      rejected as invalid.
- [ ] `createBoard` builds exactly the active slots; board metrics and layout skip absent slots.
- [ ] Card width derives from the active column count (`--columns`); at 8 columns and 360px the
      T-020 legibility floor still holds.
- [ ] docs/ui-conventions.md sizing formula updated; unit tests for active-pile guards.
