---
id: T-006
title: State model and core types
status: ready
depends_on: [T-003]
blocks: [T-007, T-008, T-009, T-010, T-013, T-014]
estimate: M
area: state
---

## Goal

The pure-data `State` type and card/pile types in `src/game/`, with serialization helpers and
basic selectors.

## Context

docs/architecture.md: state is pure data — ordered pile arrays of card ids, a `faceUp` set, the
seed, no DOM references, no pixels. Every rule ticket (T-007 through T-011) builds on these
types, as does the UI (which may import game types; never the reverse).

## Acceptance criteria

- [ ] Types: `CardId`; `Card { id, kind: "category" | "word", categoryId, label }`; `PileId`
      covering stock, waste, 5 foundation slots, and 7 tableau columns; `State` with
      `piles: Record<PileId, CardId[]>` (ordered bottom → top), `faceUp`, `seed`, PRNG state,
      and completed categories.
- [ ] Slot and column counts are named constants in one place; nothing derived from the content
      file (category count, word counts, deck size) appears as a literal anywhere.
- [ ] `State` round-trips through JSON via explicit serialize/deserialize helpers (covers the
      `faceUp` set) — verified by a unit test.
- [ ] Selectors with unit tests: top card of a pile, the open category of a foundation (derived
      from its bottom card, not stored redundantly), whether a pile is empty.
- [ ] No DOM imports in `src/game/`; lint override passes.

## Notes

A foundation's open category is derivable — its bottom card is the category card. Do not store
it twice. Completed categories do need explicit tracking, since completion clears the pile.
