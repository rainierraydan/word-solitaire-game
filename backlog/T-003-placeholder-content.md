---
id: T-003
title: Placeholder content set
status: blocked
depends_on: [T-002]
blocks: [T-004, T-006, T-020]
estimate: S
area: data
---

## Goal

`src/data/categories.ts`: a development content set exporting `CATEGORIES: Category[]` per the
game-spec format.

## Context

All development runs against this set; real content is a separate late ticket (T-029). The
constraints below are deliberate: more categories than foundation slots so slot release gets
exercised, uneven counts so any hardcoded per-category count breaks loudly, short words so the
narrow-card legibility problem stays visible.

## Acceptance criteria

- [ ] At least 6 categories (more than the 5 foundation slots).
- [ ] Total cards (categories + words) ≥ 29; target around 42.
- [ ] Word counts are uneven: at least 3 distinct counts across categories.
- [ ] Every word is ≤ 8 characters, short and unambiguous.
- [ ] No duplicate words across categories, no duplicate ids or names, no empty category.
- [ ] Exports the `Category` type and `CATEGORIES` exactly as specified in docs/game-spec.md.

## Notes

This is throwaway content — plain, obvious categories (colors, animals, numbers…) are fine.
Do not polish it; T-029 replaces it.
