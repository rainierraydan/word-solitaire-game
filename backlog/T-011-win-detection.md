---
id: T-011
title: Win detection
status: done
depends_on: [T-009]
blocks: [T-022, T-028]
estimate: S
area: state
---

## Goal

`isWon(state)`: true when every category has been completed.

## Context

docs/game-spec.md §Win. The win condition derives from the content file at runtime — completing
all categories, however many there are.

## Acceptance criteria

- [ ] `isWon` returns true iff the completed-categories record covers every category in
      `CATEGORIES` (parameterized by content, tested against two fixtures of different sizes).
- [ ] Completing all but one category is not a win (test).
- [ ] Pure function, no DOM access.

## Notes

Tiny on purpose — the UI reaction (T-022 win animation) is separate. Deals are not guaranteed
solvable; the escape is the new-deal control (T-021), per spec.
