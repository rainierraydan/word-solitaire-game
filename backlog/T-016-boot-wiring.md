---
id: T-016
title: Boot wiring — validate, seed, deal, first paint
status: blocked
depends_on: [T-004, T-007, T-015]
blocks: [T-017, T-021, T-022, T-026]
estimate: M
area: infra
---

## Goal

`main.ts`: on page load, validate content, resolve the seed, deal, build card elements, render.
A fresh board is on screen immediately — no splash, no menu.

## Context

docs/deployment.md §Startup behavior and docs/architecture.md's boot sequence. This is where
the game becomes visible end-to-end for the first time; input arrives in T-017.

## Acceptance criteria

- [ ] Page load shows a fully dealt board with no interaction required and no console errors.
- [ ] Content validation runs before dealing; a validation failure renders a legible error
      (message visible on the page, not only the console) instead of a broken board.
- [ ] `?seed=123` deals the identical board on every reload; the resolved seed is stored in
      state. An absent or invalid `seed` param falls back to a random seed without crashing —
      URL params are validated at the boundary.
- [ ] Word-length validator warnings surface in the console but do not block boot.
- [ ] Verified in mobile emulation at 360×640: dealt board fits, cards legibly face-up where
      dealt face-up.

## Notes

localStorage restore lands later (T-023) and will slot in before the fresh-deal fallback. Keep
boot linear and small: validate → seed → deal → create elements → render.
