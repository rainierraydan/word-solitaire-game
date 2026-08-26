---
id: T-021
title: New-deal and settings control
status: blocked
depends_on: [T-016]
blocks: []
estimate: S
area: interaction
---

## Goal

A small unobtrusive button giving access to "new deal" and minimal settings, plus the current
seed for bug reports.

## Context

docs/deployment.md: settings and a "new deal" control live behind a small unobtrusive button.
docs/game-spec.md §Win: deals are not guaranteed solvable — new deal is the escape hatch, so
the game is incomplete without it. Added to the backlog by decision 2026-08-26.

## Acceptance criteria

- [ ] A single small button on the board (out of the way of play areas), tap target ≥ 44px even
      if the visual is smaller, present at 360×640 without overlapping cards or safe areas.
- [ ] "New deal" starts a fresh game with a new random seed; the board re-deals immediately.
- [ ] The current seed is visible and selectable/copyable from the settings surface, so any deal
      can be reported and reproduced via `?seed=`.
- [ ] The settings surface never blocks input with a modal the player cannot dismiss with one
      tap outside it.
- [ ] Verified in mobile emulation at 360×640.

## Notes

Keep settings minimal — new deal + seed is enough for now. More entries (sound, theme) get
their own tickets if they ever exist.
