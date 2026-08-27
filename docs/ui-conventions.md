# UI conventions

## Sizing

Board dimensions derive from CSS custom properties so one change rescales everything. Never
hardcode pixel sizes in component CSS.

```css
:root {
  --gap: 4px;
  --columns: 7; /* overridden per game by the board builder */
  --card-w: calc((100vw - (var(--columns) + 1) * var(--gap)) / var(--columns));
  --card-h: calc(var(--card-w) * 1.4);
  --fan-y: calc(var(--card-h) * 0.28); /* face-up overlap */
  --fan-y-down: calc(var(--card-h) * 0.12); /* tighter for face-down */
}
```

## Animation and paint

- Animate **only `transform` and `opacity`.** Never `left`, `top`, `width`, `height` — they
  trigger layout.
- **No `box-shadow` on cards.** With the whole deck animating, paint cost compounds on mobile
  GPUs. Use a flat border, an inset highlight, or a pre-rendered shadow in the background.
- No `filter` or `backdrop-filter` on cards.
- Card flip is pure CSS: `transform-style: preserve-3d` with `backface-visibility: hidden` faces.
  Do not animate flips in JS.
- Keep transitions around `.22s ease-out`. Long animations make a card game feel sluggish.

## Input

- **Pointer Events only** (`pointerdown` / `pointermove` / `pointerup`). One code path covers
  finger, mouse, and stylus. Do not write Touch Events.
- **Tap-to-move is the primary interaction.** A single tap routes the card to its best legal
  destination: a matching open foundation, or an empty slot if it is a category card. Ambiguous
  taps resolve deterministically (leftmost), never with a prompt.
- Dragging a ~48px card with a finger is imprecise. Drag is an enhancement layered on top, never
  the only way to play. If implemented, call `setPointerCapture()` on `pointerdown` — otherwise
  the gesture is lost as soon as the finger leaves the element.
- Tap vs drag threshold: under ~10px of movement within ~250ms is a tap.
- Double-tap and double-click behave the same as a single tap. Do not overload them.
- **Invalid moves get non-punishing feedback** (a short shake, no state change). Never silently do
  nothing, and never block input with a modal.
- Hover affordances go behind `@media (hover: hover)` so phones do not inherit sticky hover states.
- Desktop keyboard: `Space` draws from stock, `Ctrl/Cmd+Z` undoes.
- Undo is unlimited, via a state history stack.

## Mobile constraints

Non-negotiable and easy to regress.

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
/>
```

```css
html,
body {
  margin: 0;
  overflow: hidden;
  overscroll-behavior: none;
}
.board,
.card {
  touch-action: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
```

- `touch-action: none` plus `overscroll-behavior: none` are **required**. Without both, the browser
  eats gestures with pull-to-refresh, double-tap zoom, and text selection.
- Use `env(safe-area-inset-*)` so the top row clears the notch and the bottom clears the iOS
  home-gesture bar.
- Use `100dvh`, never `100vh` — browser chrome makes `100vh` overflow.
- **The board fits without scrolling at 360×640 CSS px.** If the fanned tableau does not fit,
  compress `--fan-y`. Never introduce scroll.
- At least ~28px of tappable height per face-up card in a fan. Expand with a transparent `::after`
  if the visible strip is thinner.
- **Card text must stay legible at ~48px card width** (7 columns in portrait). Scale font size from
  `--card-w` (around `calc(var(--card-w) * 0.22)`), allow two lines with `text-wrap: balance`. This
  is the hardest visual problem in the project — treat it as a constraint, not polish.
- Category cards must be visually distinguishable from word cards at a glance — different
  background, border, or a small marker — so the board is scannable instantly.
- If audio is added: create the `AudioContext` inside the first `pointerdown` handler and call
  `resume()` there. iOS blocks audio until a real user gesture.
