---
id: T-029
title: Real content authoring
status: done
depends_on: [T-004, T-020]
blocks: [T-038]
estimate: M
area: data
---

## Goal

Replace the placeholder set with the shipping content: ~20 categories of ~12 words each, the
pool the randomized deal (T-038) draws subsets from.

## Context

Size decision 2026-08-27 (user), superseding the 10 × 5–6 target of 2026-08-26: games now use a
random subset of categories (per level, T-039) and a random 2–8 words per chosen category
(T-038), so the full pool must be much larger than any single game. English, per the same
decision. Depends on T-020 so words are chosen against the measured character budget.

## Acceptance criteria

- [ ] ~20 categories with ~12 words each (240+ cards in the pool).
- [ ] Every word fits the T-020 budget (≤ 8 chars); category names ≤ 7 chars or multi-word.
      The validator passes with zero errors and zero length warnings.
- [ ] No duplicate words across categories; each word belongs unambiguously to its category for
      a general audience — no trivia knowledge required.
- [ ] Words within a category vary in length and first letters where possible.
- [ ] Legibility spot-checked at 360×640 on the new content.

## Notes

Category names render on cards too — they compete for the same ~48px and are often the longer
strings. Check them against the budget as strictly as the words.
