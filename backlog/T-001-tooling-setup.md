---
id: T-001
title: Tooling setup — Vite, TypeScript strict, ESLint, Vitest
status: done
depends_on: []
blocks: [T-002]
estimate: M
area: infra
---

## Goal

A working toolchain: Vite, TypeScript strict, ESLint, and Vitest, with npm scripts matching
CLAUDE.md's Commands section plus `lint`.

## Context

The repo holds only docs. Every other ticket assumes `dev`, `build`, `preview`, `test`, and
`typecheck` exist and work. The project ships zero runtime dependencies — everything installed
here is a devDependency.

## Acceptance criteria

- [ ] `npm run dev` serves a page; `npm run build` emits `dist/`; `npm run preview` serves the
      build; `npm run test` runs Vitest with at least one passing placeholder test;
      `npm run typecheck` runs `tsc --noEmit` cleanly; `npm run lint` runs ESLint with zero errors.
- [ ] `tsconfig.json` has `strict: true`.
- [ ] `package.json` has an empty or absent `dependencies` field — devDependencies only.
- [ ] ESLint config includes an override for `src/game/**` that forbids DOM globals (`window`,
      `document`) and imports from `src/ui`, enforcing the architecture invariant mechanically.
- [ ] CLAUDE.md's Commands section is updated to list `npm run lint`.

## Notes

The `lint` script is an addition to CLAUDE.md's Commands list, agreed 2026-08-26. The
`src/game/**` override is written against a path pattern, so it is valid before the directory
exists (created in T-002).
