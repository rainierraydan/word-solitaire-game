---
id: T-029
title: Real content authoring
status: blocked
depends_on: [T-004, T-020]
blocks: []
estimate: M
area: data
---

## Goal

Replace the placeholder set with the shipping content: 10 categories of 5–6 words each.

## Context

Deliberately last among content work: it depends on the legibility ticket (T-020) so words are
chosen against the measured character budget instead of a guess. The target size was decided
2026-08-26 — ~10 × 5–6 (≈ 63–70 cards) for a session noticeably richer than Klondike without
doubling its length; the earlier ~15 × 5 idea was dropped.

## Acceptance criteria

- [ ] Exactly 10 categories, each with 5 or 6 words, with both counts present (uneven by
      construction).
- [ ] Every word and category name fits the character budget recorded in T-020; the validator
      passes with zero errors and zero length warnings.
- [ ] No duplicate words across categories; each word belongs unambiguously to its category for
      a general audience — no trivia knowledge required.
- [ ] Words within a category vary in length and first letters where possible, so cards are
      distinguishable at a glance.
- [ ] One full game played to completion on the real set (device or emulation) with no
      legibility regressions at 360×640.

## Notes

Category names render on cards too — they compete for the same ~48px and are often the longer
strings. Check them against the budget as strictly as the words.
