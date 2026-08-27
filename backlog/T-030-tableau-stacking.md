---
id: T-030
title: Tableau same-category stacking rule
status: done
depends_on: [T-010]
blocks: [T-025]
estimate: M
area: state
---

## Goal

A card may be moved onto a tableau column whose top card belongs to the same category, without
that category being open on a foundation — user request 2026-08-27, superseding the
empty-column-only rule.

## Context

Playtesting on the production build showed the tableau is too rigid: words of a group cannot be
gathered below while waiting for a foundation slot. This extends T-010's `moveToEmptyColumn`
into a general `moveToColumn`: empty column (any card, escape valve, as before) or same-category
stack. docs/game-spec.md §Tableau must be updated in the same change.

## Acceptance criteria

- [ ] `moveToColumn(state, cardId, columnId)`: legal iff the source is the top card of another
      tableau column AND the target column is empty OR its top card is face-up and has the same
      `categoryId` (word or category card).
- [ ] Waste remains an illegal source (decision 2026-08-26 stands).
- [ ] Different-category targets are rejected with an explicit invalid result.
- [ ] Reveal-on-expose still fires on the source column.
- [ ] docs/game-spec.md §Tableau describes the new rule.
- [ ] Unit tests per case; no DOM access.

## Notes

Single-card moves only — moving a stacked run is out of scope until requested. Tap routing
priority is unchanged (foundation > empty foundation > empty column); same-category stacking is
reachable via drag (T-025), not via tap auto-routing, so taps stay predictable.
