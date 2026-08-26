---
id: T-005
title: Seeded PRNG and shuffle
status: blocked
depends_on: [T-002]
blocks: [T-007, T-008]
estimate: S
area: state
---

## Goal

`src/game/`: mulberry32 PRNG with serializable state, plus a pure Fisher–Yates shuffle driven
by it.

## Context

docs/game-spec.md §Deal: deals are seeded and reproducible via `?seed=`. The stock recycle
(T-008) also reshuffles through this PRNG, so the generator's state must live in game state and
survive serialization — a bare closure is not enough.

## Acceptance criteria

- [ ] `mulberry32` produces an identical sequence for an identical seed (test with known values).
- [ ] The PRNG's internal state is a plain serializable value (a number) that can be stored in
      `State` and resumed: generating after a save/restore round-trip continues the sequence.
- [ ] `shuffle(array, rng)` is pure: returns a new array, does not mutate the input.
- [ ] Same seed → same shuffled order; different seeds → different order (test).
- [ ] No DOM access; `src/game/` lint override passes.

## Notes

Keep the API minimal: seed in, `{ next, state }` out. No global PRNG instance.
