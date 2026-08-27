---
id: T-026
title: PWA manifest and icons
status: ready
depends_on: [T-016]
blocks: []
estimate: S
area: infra
---

## Goal

An installable web app: `manifest.json` with standalone display, name, theme color, and icons.

## Context

docs/deployment.md §PWA: the game installs to the home screen and opens without browser chrome.

## Acceptance criteria

- [ ] `manifest.json` served and linked from `index.html` with `display: "standalone"`, `name`,
      `short_name`, `theme_color`, `background_color`, and icons at 192×192 and 512×512
      (plus a maskable variant).
- [ ] `theme-color` meta in `index.html` matches the manifest.
- [ ] Chrome devtools Application panel reports the manifest valid and the app installable.
- [ ] Installed launch (or devtools standalone emulation) opens without browser chrome and the
      board still fits — safe-area handling from T-012 holds in standalone mode.
- [ ] Icon assets add no runtime JS and respect the bundle budget.

## Notes

The docs ask for a manifest only — no service worker/offline scope here. If a target browser
refuses installation without one, note it and raise a separate ticket rather than growing this
one.
