# Architecture

Three layers, strictly separated:

```
State  (logical facts)  →  layout(state)  (pixel positions)  →  render(state)  (DOM writes)
```

```ts
type State = {
  piles: Record<PileId, CardId[]>; // ordered, bottom → top
  faceUp: Set<CardId>;
  seed: number;
  // ...
};

function layout(state: State): Map<CardId, { x: number; y: number; z: number }>;

function render(state: State) {
  for (const [id, pos] of layout(state)) {
    const el = cardEls[id];
    el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    el.style.zIndex = String(pos.z);
    el.classList.toggle("face-up", state.faceUp.has(id));
  }
}
```

## Invariants

Load-bearing. Breaking one costs a refactor.

- **State is pure data.** No DOM references, no pixel coordinates. Piles are ordered arrays of
  card ids. `src/game/` must not import anything DOM-related.
- **Pixel math never leaks into state, and a DOM read never influences game logic.**
- **`render()` is full and idempotent.** Recomputing every card costs well under a millisecond.
  Do not write partial or diffing render paths.
- **Card elements are created once per deal** (each game draws its own card subset) and never
  destroyed or reordered while that game runs.
  Movement is `transform` only.
- **All mutation goes through explicit action functions** (`drawFromStock`, `playCardToFoundation`,
  …) that take a state and return a new one. This is what makes undo, seeded replay, and unit
  tests cheap.
- **The content file is the single source of truth.** Category count, word counts, deck size,
  progress display, and win condition all derive from it at runtime.
- **Deals are seeded.** An explicit seed in state, surfaced via `?seed=`.

## Why DOM and not canvas

The game is discrete and event-driven — state changes only on player input, so there is no
per-frame render loop to justify canvas.

- Fanned columns mean cards are partially occluded. `event.target` resolves hit testing exactly,
  where canvas would need manual reverse-z-order traversal plus visible-region math.
- Text renders crisply at any device pixel ratio for free — no `devicePixelRatio` scaling, no
  font-loading race against first paint.
- CSS transitions animate card movement on the compositor with no interpolation code.

Sole canvas exception: an overlay for the win animation, mounted only for that moment.
