---
id: T-033
title: Move same-category runs as a unit
status: done
depends_on: [T-025, T-030]
blocks: []
estimate: M
area: state
---

## Goal

A consecutive same-category face-up stack (a "run") moves as one unit: onto its open foundation,
onto an empty foundation slot when it includes the category card, onto a same-category column,
or onto an empty column — user request 2026-08-27.

## Context

T-030 lets players gather a category below; without run moves each gathered card must be
unstacked one by one, which cancels the benefit. A run is the cards from the grabbed card to the
top of its column, all face-up and of one category (a single top card is a run of one — one code
path).

## Acceptance criteria

- [ ] `tableauRun(state, cardId)` returns the run iff every card from `cardId` to the column top
      is face-up and of one category; undefined otherwise (covered by other categories).
- [ ] `moveToColumn` moves the whole run, preserving order; target rules unchanged (empty or
      same-category face-up top).
- [ ] `playToFoundation` files a whole tableau run: onto the matching open foundation (words
      only), or onto an empty slot when the run includes the category card (which lands first).
      Mixed or mismatched runs are rejected atomically — no partial moves.
- [ ] Completion triggers when the run fills the category, exactly as single-card filing.
- [ ] Tap routing and drag pickup treat runs like single cards (tap auto-routes the run; drag
      lifts the whole run visually, all cards following the pointer).
- [ ] The waste is still single-card only.
- [ ] Unit tests per rule; UI verified in mobile emulation at 360×640.

## Notes

Foundation pile order puts the category card first regardless of its position in the run;
within a category, word order on the foundation is meaningless.
