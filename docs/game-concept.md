# Game concept

`item-sorting` — a mobile shelf-sorting puzzle. Front-facing view of a stocked shelf wall.
The player rearranges goods by swapping them; three identical goods on the same shelf are
packed away, revealing the stock behind them. A board is cleared when every shelf is empty.

---

## Board model

- **Board** = grid of shelves. First board of a run: 3 columns × 5 rows = **15 shelves**.
- **Shelf** = 3 slots wide × up to 4 rows deep. The front row is playable; the rows behind
  it are stock.
- First board: 15 shelves × 3 slots × 4 rows = **180 items** — 45 playable, 135 in stock.
- Occupancy is all-or-nothing per row: a shelf row holds exactly 3 items or does not exist.
  There are never 1- or 2-item rows, and never gaps inside a row.
- A shelf with zero rows left is **exhausted** and stays visibly empty for the rest of the
  board. Shelves are never restocked; the board depletes towards victory.

## Visibility

- **Front row** — fully rendered, selectable.
- **Next row** — darkened silhouette: the outline identifies the item, the colour does not.
  Not selectable.
- **Remaining rows** — not rendered individually; the shelf carries a depth indicator
  (stacked edge or pips) for how many rows are left.

One row of lookahead is what makes the "which shelf do I advance" decision informed.
Rendering four overlapping layers would be unreadable at phone size.

## Rules

- **Drag & drop** — press a front-row item and drag it; it lifts slightly (105%) and
  follows the finger. Hovering a valid destination (another item in swap mode, an empty
  slot in holes mode) shrinks it to 95% with a short shake — the "you can drop here" cue.
  Releasing there executes the move; releasing anywhere else snaps the item back home.
  Silhouettes and exhausted shelves are never drag sources or targets.
- **Movement** — two variants under playtest, toggleable in the prototype:
  - **Swap**: tapping a second front-row item swaps the two. Range is global — any playable
    item with any other, regardless of distance. Movement is free and unlimited; the whole
    game is deciding which shelf advances.
  - **Holes**: boards start with a few empty slots (full triples removed at generation, so
    counts stay multiples of 3). An item only moves into an empty slot; tapping another
    item reselects. Empty slots are a conserved resource — swaps of position, not creation.
    Digging a front row empty advances the stock behind it and *permanently burns 3 slots
    of space*, so excavation is a costly deliberate tool. Deadlock adds a second condition:
    zero empty slots visible. This variant adds early-game tension and self-inflicted
    (fairer) defeats at the cost of the clean no-gaps look.
- **Match** — a shelf clears when its three front slots hold the same item type. Both
  shelves touched by a swap are evaluated, so a single swap can clear two shelves.
- **Advance** — when a front row clears, the row behind slides forward and becomes
  playable; the shelf loses one row of depth and its silhouette resolves to full colour.
- **No cascades** — generation guarantees no row is ever a ready-made triple, so a revealed
  row can never clear on its own. Every clear is the result of a deliberate swap.
- **Victory** — every item on the board cleared.
- **Defeat** — deadlock ends the run: hard restart from a fresh seed. No timer, no lives,
  no move limit, no undo, no shuffle.

## What the player actually decides

Because swaps are global, gathering three visible copies of a type into one shelf is always
mechanically possible. A move therefore comes down to two choices:

1. **Which type to collect** — among the types with 3+ copies currently in front rows.
2. **Which shelf to collect it in** — that shelf is the one that advances and reveals new
   stock.

**Deadlock** means no type has three or more copies across the front rows. With `V` visible
items that requires every present type to hold ≤2 copies, so it takes at least `ceil(V / 2)`
distinct types in play. Two consequences follow:

- **A full board is essentially safe.** By pigeonhole, if the board uses fewer than `V / 2`
  types, some type must have 3+ copies visible. With 45 playable slots, any type count under
  ~22 guarantees a legal move while all 15 shelves are still stocked.
- **All the danger is in the endgame.** As shelves exhaust, `V` shrinks and the threshold
  collapses with it: 4 active shelves means 12 visible items, and 6 distinct types among
  them is enough to end the run. The type count decides how lethal that stretch is.

So the skill is managing the visible pool over the whole board: advance the shelves that
keep duplicates flowing, and avoid stranding the last copies of a type behind the very items
that need them.

## Difficulty dial

The pressure on a board is the ratio of distinct types to the deadlock threshold at a full
board — `2 × types / (3 × shelves)`. Approaching 1 means the board sits right at the edge
from the start. This is what escalation tunes, and it is why **type count has to grow with
the grid**: adding shelves adds visible items, which by itself makes the board *safer*.

| Board | Shelves | Playable slots | Types | Ratio |
| --- | --- | --- | --- | --- |
| Early run | 3 × 5 = 15 | 45 | ~10 | 0.44 |
| Mid run | 3 × 5 = 15 | 45 | ~16 | 0.71 |
| Late run | 3 × 6 = 18 | 54 | ~22 | 0.81 |

Numbers are a starting point to be tuned by playing, not a balanced curve.

## Generation

Boards are generated by **reverse simulation**, which guarantees a solution exists:

1. Start from an empty board and the board's chosen set of item types.
2. Repeatedly apply the inverse of a clear: pick a shelf with fewer than its full depth,
   push a new front row of three identical items of a random type onto it, then scatter
   those three items by swapping them with three front-row slots anywhere on the board
   (including slots in the shelf itself, which leaves that copy in place).
3. Each shelf receives exactly one push per row of depth — 60 reverse moves for a 15-shelf,
   4-deep board.

Every reverse step inverts a legal forward move, so replaying the sequence backwards is a
valid solution. Item counts come out as multiples of three by construction, and a deadlock
is always the player's doing rather than the seed's.

Two constraints on top of the basic loop:

- **No ready-made triples.** Scatter targets are chosen so that no front row is left holding
  three identical items — both the row just pushed and any row it scatters into. The early
  pushes are the tight case (an almost-empty board has few slots to scatter into), so pushes
  spread across all shelves first, and later scatters are used to break up rows left as
  triples while they are still at the front. Needs retries or backtracking.
- **Validation pass.** After generating, assert that no row anywhere is a triple and that
  the recorded sequence replays as a valid solution.

## Run structure

- A run is a **sequence of boards**. Clearing one advances to the next, harder board; a
  deadlock ends the run.
- Escalation moves two dials together: **distinct types per board** and **grid size**, with
  types growing faster than slots so the ratio above keeps climbing. Shelf depth stays at 4.
- No meta-progression between runs at this stage.

## Presentation notes

- Portrait, mobile renderer. 3 shelf columns × 3 slots = 9 item widths across the screen —
  roughly 100 px per item on a 1080 px-wide device. Tappable, but the art has to read at
  that size and silhouettes have to stay distinguishable from one another. A 4-column grid
  would push items under a comfortable tap target.
- Feedback beats: drag lift (105%), droppable hint (95% + shake), swap/move (eased position
  exchange), match (pop on the three items), advance (row slides forward, silhouette
  resolves), exhausted shelf (empty-shelf treatment as a progress signal).
- Because defeat is a hard restart, silhouette readability is a fairness requirement, not
  polish: the player has to be able to trust one row of lookahead.

## Open decisions

- **Movement mechanic: swap vs holes.** Both are playable in the prototype behind a toggle;
  the decision comes from playtesting. Note: holes-variant solvability is validated
  empirically (bot playthroughs), not proven by the generation replay, since punching
  removes items after the proof.
- Item catalogue size and theming, and how the per-board type set is drawn from it.
- Whether the catalogue needs items that are visually distinct *as silhouettes*, which may
  constrain the art direction more than the coloured sprites suggest.
- Tuning of the difficulty table above.
