---
id: T-020
title: Card text legibility at ~48px width
status: blocked
depends_on: [T-003, T-013]
blocks: [T-029]
estimate: M
area: layout
---

## Goal

Every word and category name renders legibly on a ~48px-wide card, and the resulting character
budget is written down for the real-content ticket.

## Context

docs/ui-conventions.md calls this the hardest visual problem in the project — a constraint, not
polish. 7 columns in portrait at 360px leaves ~48px per card. Font size scales from `--card-w`
(around `calc(var(--card-w) * 0.22)`), up to two lines with `text-wrap: balance`.

## Acceptance criteria

- [ ] At 360px viewport width, every placeholder word and category name renders fully — no
      clipping, no ellipsis, no horizontal overflow (checked for every entry in the content set,
      not a sample).
- [ ] Font size derives from `--card-w`; no fixed px font sizes on card faces.
- [ ] Two-line wrapping works for multi-word category names via `text-wrap: balance`.
- [ ] The computed font size at 48px card width stays at or above a floor agreed during the work
      (record it) — shrinking text to fit is bounded, not unlimited.
- [ ] The resulting character budget (max characters per line at minimum card width) is recorded
      in this ticket on completion, and `MAX_WORD_LENGTH` in the validator (T-004) is updated if
      it disagrees with the measured budget.
- [ ] Verified in mobile emulation at 360×640 and at a desktop width for regression.

## Notes

The placeholder set (all words ≤ 8 chars) is the test bed. If 8 proves too generous or too
strict, this ticket is where the number changes — T-029 then authors against the measured
budget.
