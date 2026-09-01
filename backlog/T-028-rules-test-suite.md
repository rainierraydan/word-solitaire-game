---
id: T-028
title: Rules and validator test suite — playthrough and invariants
status: done
depends_on: [T-004, T-007, T-008, T-010, T-011]
blocks: []
estimate: M
area: state
---

## Goal

A consolidated test layer on top of the per-ticket unit tests: a seeded full-game playthrough
and cross-cutting invariant checks.

## Context

Each rules ticket ships its own unit tests; what nothing covers is the composition — a whole
game driven only through action functions, and invariants that must hold after every action.
Pure game logic with no DOM makes this cheap, which is the point of the architecture.

## Acceptance criteria

- [x] A scripted playthrough test: from a fixed seed, a recorded move sequence reaches
      `isWon(state) === true` using only exported action functions. The reshuffle-recycle is
      exercised at least once in the sequence.
- [x] An invariant helper asserted after every step of the playthrough: every card id is in
      exactly one pile or completed, no card duplicated or lost; `faceUp` only contains existing
      cards; every foundation is empty or has a category card at its bottom.
- [x] The full rule suite runs against a second content fixture with different category/word
      counts, proving no content-derived number is hardcoded anywhere in `src/game/`.
- [x] Everything runs in `npm run test` with no browser and no DOM.

## Notes

Building the winning move sequence by hand is fiddly — a tiny two-category fixture keeps it
short. The invariant helper is the durable asset; reuse it in future rule tickets.

Shipped: the helper is `checkInvariants` in `src/game/invariants.ts` (pure, vitest-free);
the recorded playthroughs live in `src/game/playthrough.test.ts`, generated with a throwaway
greedy solver and replayed verbatim over two fixtures (2 categories/level 1, 3/level 2).
