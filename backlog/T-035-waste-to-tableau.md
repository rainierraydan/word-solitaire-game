---
id: T-035
title: Allow waste cards onto the tableau
status: done
depends_on: [T-030]
blocks: []
estimate: S
area: state
---

## Goal

The top waste card can move onto the tableau — an empty column or a matching same-category
stack — user request 2026-08-27, superseding the waste-is-never-a-source decision of 2026-08-26.

## Context

With same-category stacking (T-030) and blocks (T-036), keeping the waste locked out of the
tableau makes drawn cards dead weight until their foundation opens. docs/game-spec.md §Tableau
must be updated in the same change.

## Acceptance criteria

- [ ] `moveToColumn` accepts the waste top as a source (single card); covered waste cards and
      the stock stay illegal.
- [ ] Target rules unchanged: empty column, or face-up same-category top.
- [ ] Tap routing for a waste card: open foundation first, then leftmost same-category stack.
      A tap never routes the waste to an *empty* column (accidental dumps); dragging does.
- [ ] Tableau taps gain the same stack destination: foundation > leftmost same-category stack >
      leftmost empty column.
- [ ] docs/game-spec.md updated; unit tests per case.
