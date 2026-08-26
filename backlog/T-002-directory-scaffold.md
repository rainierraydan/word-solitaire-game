---
id: T-002
title: Directory scaffold and HTML shell
status: blocked
depends_on: [T-001]
blocks: [T-003, T-005, T-012]
estimate: S
area: infra
---

## Goal

The repo structure from CLAUDE.md (`src/data`, `src/game`, `src/ui`, `src/main.ts`) plus an
`index.html` carrying the non-negotiable mobile meta and base CSS.

## Context

Every subsequent ticket writes into this structure. The viewport meta and gesture-blocking CSS
come from docs/ui-conventions.md §Mobile constraints and are document-level, so they belong to
the shell rather than to any component.

## Acceptance criteria

- [ ] `src/data/`, `src/game/`, `src/ui/`, and `src/main.ts` exist and match CLAUDE.md's layout.
- [ ] `index.html` contains exactly the viewport meta from docs/ui-conventions.md
      (`width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no`).
- [ ] Base CSS: `html, body { margin: 0; overflow: hidden; overscroll-behavior: none; }` and the
      app root uses `100dvh` (never `100vh`).
- [ ] `npm run dev` shows an empty page with no console errors; `typecheck` and `lint` pass.

## Notes

`main.ts` stays a minimal boot stub — real boot wiring is T-016. No game code here.
