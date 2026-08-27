---
id: T-023
title: localStorage persistence with payload validation
status: ready
depends_on: [T-018, T-019]
blocks: []
estimate: M
area: infra
---

## Goal

In-progress games survive a backgrounded or reloaded tab: state persists to `localStorage` and
restores on boot, with a validated payload.

## Context

docs/deployment.md §Persistence. A schema change or corrupted entry must fall back to a fresh
deal, never crash. Per decision 2026-08-26 there is no undo, so the payload is the current
state only — no history stack.

## Acceptance criteria

- [ ] Every state change (draw, recycle, any move) persists the serialized state; reloading
      mid-game restores the exact board: piles, face-up set, seed, PRNG state, completed
      categories.
- [ ] The payload carries a schema version; a version mismatch falls back to a fresh deal.
- [ ] A corrupted or hand-edited payload (inject garbage JSON, wrong types, unknown card ids)
      falls back to a fresh deal with no crash — covered by unit tests of the
      validate-and-restore function.
- [ ] Restore also cross-checks the payload against the current content file: any card id that
      no longer exists invalidates the save (content updates must not resurrect stale decks).
- [ ] An explicit `?seed=` in the URL takes precedence: it starts a fresh deal with that seed
      instead of restoring (boundary rule, documented in code).
- [ ] A won game does not restore into the win screen — cleared on win.

## Notes

Serialization helpers exist from T-006. Storage writes can be synchronous — payloads are small
without a history stack.
