---
id: T-004
title: Content validator
status: blocked
depends_on: [T-003]
blocks: [T-016, T-028, T-029]
estimate: M
area: data
---

## Goal

A pure `validateContent(categories)` function that fails loudly on invalid content, plus unit
tests for every failure mode.

## Context

docs/game-spec.md §Validation. The content file is the single source of truth; a bad entry must
be caught at boot with a legible message, not surface as a broken deal.

## Acceptance criteria

- [ ] Throws (or returns a structured error) naming the offender for each of: duplicate category
      `id`, duplicate category `name`, the same word in two categories, a category with zero
      words, deck smaller than 29 cards.
- [ ] Warns (non-fatal, listing the words) on any word longer than `MAX_WORD_LENGTH`, a named
      exported constant set to 8.
- [ ] Unit tests cover each failure mode with a minimal bad fixture, the warning path, and a
      passing run against the real `CATEGORIES`.
- [ ] No DOM access; runs under Vitest without a browser.

## Notes

Boot wiring (run before deal, render failure legibly) is T-016. The threshold of 8 characters
was confirmed 2026-08-26 from the ~48px card width; T-020 establishes the real character budget
and may revise the constant.
