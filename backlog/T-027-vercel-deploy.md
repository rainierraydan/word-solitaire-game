---
id: T-027
title: Vercel deployment
status: done
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

## Deployment record (2026-08-27)

- Production: **https://item-sorting-game.vercel.app** (project `item-sorting-game`, CLI deploy).
- No `vercel.json`. The pre-existing project carried a stale `outputDirectory: "web"` setting
  that broke the first deploy; fixed in Project Settings (framework `vite`, output default) —
  settings fix, not a config file, per this ticket's criteria.
- Verified in production: dealt board on load, vertical slice playable (draw → open category →
  file word, with reveals), `?seed=123` reproduces the known deal.
- Lighthouse (mobile, simulated 4G): performance 100, **interactive 0.82s**, FCP 0.80s, TBT 0ms.
  Bundle: 4.15 kB JS + 1.14 kB CSS (gzip).
- The Vercel project is NOT git-connected — deploys are manual via `npx vercel deploy --prod`.
  Connecting the GitHub repo in the Vercel dashboard would enable auto-deploy on push to main.
- Verified by the user on a real phone in portrait, 2026-08-27 — gestures confirmed working.
