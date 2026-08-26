---
id: T-010
title: Tableau actions — reveal on expose, empty-column move
status: blocked
depends_on: [T-006]
blocks: [T-019, T-028]
estimate: M
area: state
---

## Goal

Tableau rules as pure functions: top-card-only play, automatic reveal of exposed face-down
cards, and the single-card move onto an empty column.

## Context

docs/game-spec.md §Rules/Tableau. There is no sequencing rule — the tableau is storage to be
excavated. The empty-column move is the only tableau-to-tableau move, a limited escape valve
against burying.

## Acceptance criteria

- [ ] Only the top card of a column is playable; attempts on covered cards are rejected.
- [ ] When any action removes a column's top card and the next card down is face-down, that card
      flips face-up as part of the same action (tested via foundation play and via the
      empty-column move).
- [ ] `moveToEmptyColumn(state, cardId, columnId)`: source must be the top card of another
      tableau column (waste is not a legal source — decision 2026-08-26); target must be an
      empty tableau column. All other combinations rejected.
- [ ] Rejections are explicit invalid results, not silent no-ops.
- [ ] Pure functions, unit tests per rule, no DOM access.

## Notes

Reveal is part of the removing action, not a separate step the UI must remember to call —
otherwise undoing to a consistent state and replaying seeds gets fragile.
