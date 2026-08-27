---
id: T-009
title: Foundation actions — open, file, complete, release slot
status: ready
depends_on: [T-006]
blocks: [T-011, T-019]
estimate: M
area: state
---

## Goal

Pure action functions for playing a card to a foundation, including category completion and
slot release.

## Context

docs/game-spec.md §Rules/Foundations. Slot release is essential: with more categories than the
5 slots, permanent occupancy makes the game unwinnable.

## Acceptance criteria

- [ ] An empty slot accepts only a category card, which opens that category; word cards are
      rejected.
- [ ] An open foundation accepts only word cards of its category; other words and category cards
      are rejected.
- [ ] Filing the last word of a category clears the foundation pile, records the category as
      completed, and leaves the slot accepting a new category card — verified by a test that
      opens a second category on the same slot.
- [ ] Completion is derived from the content file's word count for that category (test against a
      fixture with uneven counts — no hardcoded count survives).
- [ ] No action exists that takes a card off a foundation; cards played there never come back.
- [ ] All actions are pure (state in, new state out) with unit tests per rule; no DOM access.

## Notes

The action should return an invalid result (not throw, not silently no-op) on illegal plays, so
the UI layer can drive invalid-move feedback (T-019).
