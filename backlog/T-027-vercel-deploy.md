---
id: T-027
title: Vercel deployment
status: ready
depends_on: [T-018, T-019]
blocks: []
estimate: S
area: infra
---

## Goal

The static Vite build deployed on Vercel, playable at the assigned URL.

## Context

docs/deployment.md. Deploying right after the vertical slice (T-018 + T-019) — rather than at
the end — puts the game on real phones early, which is where the layout and input constraints
actually get tested.

## Acceptance criteria

- [ ] The production URL loads a dealt board immediately (no splash, no menu), playable through
      the vertical slice: draw, open a category, file a word.
- [ ] `?seed=` works in production.
- [ ] Vercel's default static detection is used; no `vercel.json` exists unless something
      genuinely required it, in which case the reason is recorded here.
- [ ] Lighthouse on the production URL with 4G throttling reports interactive well under one
      second.
- [ ] Verified on at least one real phone in portrait.

## Notes

Creating the Vercel project and linking the repo needs the user's account — coordinate rather
than assume credentials. Subsequent merges to main auto-deploy; that pipeline is Vercel's
default, not extra work here.
