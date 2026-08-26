# Deployment

Static Vite build on Vercel. Add `vercel.json` only if genuinely needed — the default static
detection should be enough.

## Startup behavior

**The game starts immediately on page load** at the Vercel-assigned URL. No splash screen, no
menu, no "click to start": the page loads and a fresh deal is on screen, ready to play. Settings
and a "new deal" control live behind a small unobtrusive button.

## Persistence

In-progress games persist to `localStorage` so a backgrounded tab does not lose state. Validate
the stored payload on read — a schema change or a corrupted entry must fall back to a fresh deal
rather than crash.

## PWA

Ship a `manifest.json` with `display: "standalone"`, name, theme color, and icons so the game can
be installed to the home screen and open without browser chrome.

## Budget

This is a text-and-CSS game with zero runtime dependencies. Target interactive in well under a
second on 4G. Flag it in review if a change makes the bundle grow meaningfully.
