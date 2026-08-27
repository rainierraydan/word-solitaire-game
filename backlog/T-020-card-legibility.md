---
id: T-020
title: Card text legibility at ~48px width
status: done
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

## Measured budget (2026-08-27, on completion)

At 360px viewport (card 46.85px, face inner width 45px words / 43px categories,
font `max(calc(var(--card-w) * 0.2), 9px)` = 9.37px, floor **9px**):

- **Word cards (regular): 8 characters per line** — "Standard" measures 41.3px of 45px.
- **Category cards (semibold 600): 7 characters per line** — an 8-char sample measures 43.4px
  of 43px, over budget by a hair. Longer category names must be multi-word so they wrap
  (`text-wrap: balance`, two lines confirmed with "Musical Sounds").
- 10 characters (50.3px) does not fit on one line in either style.
- `MAX_WORD_LENGTH = 8` in the validator agrees with the measured word budget — unchanged.
  T-029 must also keep single-word category names ≤ 7 characters or make them multi-word.
