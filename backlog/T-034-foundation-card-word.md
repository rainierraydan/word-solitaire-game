---
id: T-034
title: Center the top card's word on foundations
status: done
depends_on: [T-031, T-032]
blocks: []
estimate: S
area: layout
---

## Goal

The last card filed on a foundation shows its word vertically centered, clear of the progress
label strip — user request 2026-08-27.

## Context

T-032 top-aligned card labels so fan strips read as lists, but on foundations the label strip
(T-031) sits exactly over that top-aligned text, hiding the last filed word. Foundations don't
fan, so centering costs nothing there.

## Acceptance criteria

- [ ] Cards on a foundation render their label vertically centered; tableau/waste cards keep the
      top-aligned label.
- [ ] The word does not collide with the progress label strip at 360×640.
- [ ] The class driving this is written by `render` from pile membership — full and idempotent,
      no new DOM.
- [ ] Verified in mobile emulation at 360×640.
