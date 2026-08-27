---
id: T-038
title: Randomized category and word selection per game
status: done
depends_on: [T-007, T-029, T-037]
blocks: [T-039]
estimate: M
area: state
---

## Goal

Each game plays a random subset of the content: the level decides how many categories enter;
which ones, and how many words each contributes (2–8), is drawn from the seeded PRNG — user
request 2026-08-27.

## Context

With a 20 × 12 pool (T-029) no two games feel alike. Everything stays seed-deterministic so
`?seed=` reproduces the exact same selection and deal.

## Acceptance criteria

- [ ] `deal(categories, seed, level)` picks `categoryCount` categories at random, then 2–8
      random words from each (bounded by the category's pool).
- [ ] Dealability guarantee: if the drawn deck is smaller than the tableau plus one stock card,
      word counts are topped up (seeded, deterministic) until it fits; impossible fits fail
      loudly.
- [ ] Same seed + level → identical selection and deal (deep-equality test); different seeds
      differ.
- [ ] Completion and win derive from the *drawn* subset (a category completes at its drawn word
      count, the game is won when all drawn categories complete) — existing derivations, tested
      against the subset.
- [ ] docs/game-spec.md §Deal updated.
