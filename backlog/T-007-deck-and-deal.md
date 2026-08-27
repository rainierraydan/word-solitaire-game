---
id: T-007
title: Deck construction and deal algorithm
status: done
depends_on: [T-005, T-006]
blocks: [T-016, T-028]
estimate: M
area: state
---

## Goal

`buildDeck(categories)` and `deal(seed)`: from content to a fully dealt initial `State`.

## Context

docs/game-spec.md §Deal. One card per category plus one per word, shuffled with the seeded PRNG,
dealt into 7 tableau columns with the remainder as stock.

## Acceptance criteria

- [ ] Deck size equals `CATEGORIES.length + sum(words.length)` — verified by a test that also
      runs against a second fixture with different counts, proving nothing is hardcoded.
- [ ] Tableau: 7 columns, face-down counts 0–6 from left to right, plus 1 face-up on each;
      28 cards dealt in total. Rightmost column: 6 face-down + 1 face-up.
- [ ] Remaining cards form the stock face-down; waste and all foundations start empty.
- [ ] The seed and the post-deal PRNG state are stored in the returned `State`.
- [ ] Same seed → identical `State` (deep-equality test); the function is pure.

## Notes

Resolves the spec's internal off-by-one: docs/game-spec.md says the rightmost column gets
"7 face-down plus 1 face-up", which contradicts its own total of 28 and the validator minimum.
Decision 2026-08-26: 6 face-down + 1 face-up, total 28. The mirrored-vs-Klondike direction
(deepest column on the right) stands. `?seed=` URL parsing is boot-boundary work — T-016.
