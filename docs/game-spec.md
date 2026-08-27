# Game spec

## Concept

A Klondike-shaped solitaire where the matching rule is semantic. The deck holds two card kinds:

- **Category cards** — each names a category (`Fruits`, `Countries`, …).
- **Word cards** — each holds one word belonging to exactly one category (`Mango` → `Fruits`).

The player opens a category on a foundation slot with its category card, then files every word
card of that category onto it.

## Content file

`src/data/categories.ts` is the single source of truth. Every count in the game derives from it
at runtime.

```ts
export type Category = { id: string; name: string; words: string[] };

export const CATEGORIES: Category[] = [
  { id: "fruits", name: "Fruits", words: ["Mango", "Papaya", "Fig", "Lychee"] },
  { id: "instruments", name: "Instruments", words: ["Cello", "Oboe", "Sitar"] },
];
```

Word counts may differ per category. Deck size is `CATEGORIES.length + sum(words.length)`.

### Validation

Runs at boot and as a unit test. Fails loudly and legibly on:

- duplicate category `id` or `name`
- the same word in two categories (breaks the one-word-one-category invariant)
- a category with zero words
- deck smaller than 29 cards (28 for the tableau, plus stock)
- warn on words longer than the configured max length — they will not fit legibly on a narrow
  mobile card

## Deal

1. Build the deck: one card per category, one per word.
2. Shuffle with a seeded PRNG (mulberry32). Store the seed in state and expose it via `?seed=`
   so any deal is reproducible for bug reports and tests.
3. Deal the tableau: **7 columns.** The **rightmost** gets 7 face-down cards plus 1 face-up.
   Each column to its left gets one fewer face-down, down to the leftmost with 0 face-down and
   1 face-up. Total dealt: 28. _(Mirrored relative to standard Klondike — intentional.)_
4. Remaining cards form the stock.

## Board

```
┌───────────────────────────────────────────────────────┐
│  [F1] [F2] [F3] [F4] [F5]              [STOCK] [WASTE]│
│                                                       │
│   T1    T2    T3    T4    T5    T6    T7              │
│   ▣     ▣     ▣     ▣     ▣     ▣     ▣               │
│         ▤     ▤     ▤     ▤     ▤     ▤               │
│              ...                      ▤ ×7            │
└───────────────────────────────────────────────────────┘
```

- **Stock**: top-right. Tap to reveal the next card to the waste.
- **Foundations**: 5 slots to the left of the stock, all starting empty.
- **Tableau**: 7 columns below, fanned vertically so face-up cards stay partly readable.

## Rules

### Foundations

- An empty slot accepts only a **category card**, which opens that category there.
- An open foundation accepts only word cards matching its category.
- A category is **complete** when all its words are filed on it.
- **On completion the foundation clears and the slot becomes reusable.** Essential: with 15
  categories and 5 slots, permanent occupancy would make 10 categories unplayable.
- Cards on a foundation cannot be moved back out.

### Tableau

- Only the top card of a column may be played.
- When a face-up card leaves and reveals a face-down card, that card flips face-up.
- **No rank or color sequencing** — the tableau is storage to be excavated.
- A single tableau top card may move onto an **empty column** (any card — the escape valve
  against burying) or onto a column whose face-up top card belongs to the **same category**
  (word or category card), so a group can be gathered below before its foundation opens
  (decision 2026-08-27, superseding the empty-column-only rule). The waste is never a source
  for tableau moves.

### Stock

- Only the top waste card is playable.
- When the stock empties, the waste is **reshuffled randomly** back into the stock, drawing from
  the state's seeded PRNG so replays stay reproducible (decision 2026-08-26, superseding the
  earlier in-order recycle). Only the top waste card is playable, so an in-order recycle would
  replay the same sequence every pass; reshuffling changes which cards become reachable.
  Unlimited passes — the deck is large and there is no sequencing to exploit.

### Win

All categories completed. Shuffles are **not** guaranteed solvable; the game relies on unlimited
undo plus a "new deal" control rather than a solver. Revisit only if playtesting shows frequent
dead ends.
