---
id: T-008
title: Stock and waste actions — draw and reshuffle-recycle
status: ready
depends_on: [T-005, T-006]
blocks: [T-018, T-028]
estimate: M
area: state
---

## Goal

Pure action functions `drawFromStock(state)` and `recycleWaste(state)`.

## Context

Drawing reveals the top stock card onto the waste. When the stock empties, the waste is
**reshuffled randomly** back into the stock — decision 2026-08-26, superseding the in-order
recycle described in docs/game-spec.md §Stock. Reshuffling matters because only the top waste
card is playable: an in-order recycle would replay the exact same sequence every pass, while a
reshuffle changes which cards become reachable. Passes remain unlimited.

## Acceptance criteria

- [ ] `drawFromStock` moves exactly the top stock card to the waste, face-up; input state is not
      mutated (all actions take a state and return a new one).
- [ ] `recycleWaste` on an empty stock moves every waste card into the stock face-down in an
      order drawn from the state's PRNG; the waste ends empty; the PRNG state advances.
- [ ] Deterministic: the same pre-recycle state always produces the same post-recycle order
      (test), keeping seeded replays reproducible.
- [ ] `recycleWaste` with a non-empty stock, and `drawFromStock` with an empty stock, are
      rejected (returned as invalid, not silently no-op'd — the UI needs to know to give
      feedback or route to recycle).
- [ ] Both empty (stock and waste) → draw and recycle are invalid.
- [ ] Unit tests for each case; no DOM access.

## Notes

Doc drift: game-spec.md §Stock still describes the in-order recycle. Flag for a docs update —
do not fix docs inside this ticket.
