---
id: T-039
title: Level system and progression
status: done
depends_on: [T-011, T-021, T-038]
blocks: []
estimate: M
area: interaction
---

## Goal

Levels raise difficulty: more categories in play and a tighter board as the player advances.
Winning shows a "level cleared" notice and moves to the next level — user request 2026-08-27.

## Context

Curve agreed 2026-08-27 (categories/columns/foundations): L1 4/5/4 · L2 5/6/4 · L3 6/6/4 ·
L4 7/7/4 · L5 8/7/3 · L6 9/8/3 · L7+ 10/8/3. Difficulty leans on fewer foundation slots rather
than ever-more columns, keeping the T-020 legibility floor at 8 columns.

## Acceptance criteria

- [ ] `levelConfig(level)` implements the agreed curve, clamping level ≥ 1 and capping at the
      last entry; category count never exceeds the content pool.
- [ ] Winning shows a level-cleared overlay; continuing advances one level and deals fresh with
      a new random seed.
- [ ] The level persists in `localStorage` (validated on read, corrupt values fall back to 1)
      and `?level=N` overrides it; "New deal" re-deals the same level.
- [ ] The menu shows the current level next to the seed.
- [ ] Levels 1, 4, and 7 verified in mobile emulation at 360×640: board fits, correct slot and
      column counts, playable.
