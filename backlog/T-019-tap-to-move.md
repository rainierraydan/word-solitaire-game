---
id: T-019
title: Tap-to-move routing and invalid-move feedback
status: done
depends_on: [T-009, T-010, T-017]
blocks: [T-023, T-025, T-027]
estimate: M
area: interaction
---

## Goal

A single tap routes a playable card to its best legal destination; illegal taps get a short
shake. Completes the playable vertical slice: deal → draw → file a card onto a foundation.

## Context

docs/ui-conventions.md §Input: tap-to-move is the primary interaction. Ambiguity resolves
deterministically (leftmost), never with a prompt. Invalid moves get non-punishing feedback —
never silence, never a modal.

## Acceptance criteria

- [ ] Word card (waste top or tableau top) with its category open → files onto that foundation.
- [ ] Category card → opens on the leftmost empty foundation slot.
- [ ] Tableau top card with no legal foundation move → moves to the leftmost empty tableau
      column, if one exists (last-resort destination; tableau sources only — the waste never
      routes to a column, per decision 2026-08-26).
- [ ] No legal destination → the card shakes briefly (transform-only animation) and state does
      not change; tapping a covered card behaves the same.
- [ ] Multiple legal destinations of the same kind resolve to the leftmost, deterministically.
- [ ] All moves go through T-009/T-010 action functions; the router only picks the destination.
- [ ] Vertical slice verified end-to-end in mobile emulation at 360×640: from a fresh deal,
      draw from stock, open a category, file at least one word onto it.

## Notes

Routing priority: matching open foundation > empty foundation slot (category cards) > empty
column (tableau cards). Completion/slot-release needs no UI code — it falls out of T-009 plus
re-render; still, watch it happen once during verification.
