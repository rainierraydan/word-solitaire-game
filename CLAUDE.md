# CLAUDE.md

Operating rules for Claude working on this repository. Read the linked docs on demand — do not
load them all upfront.

## Project

`item-sorting` — a browser solitaire where cards are sorted by **semantic category** instead of
rank or suit. Category cards open a foundation slot; word cards are filed onto the matching
category. Mobile-first (phone in portrait), desktop fully supported. Static site on Vercel.

Stack: **vanilla TypeScript + Vite, DOM and CSS for rendering, zero runtime dependencies.**
Canvas is deliberately not used for the board. Do not change the stack without asking.

## Repo structure

```
src/
  data/          content: categories and their words — single source of truth
  game/          rules, state, actions, deal, PRNG. No DOM access here.
  ui/            layout, render, input, card elements. No game rules here.
  main.ts        boot: validate content, deal, render
docs/
  game-spec.md            rules, layout, deal algorithm, content file format
  architecture.md         state/layout/render layers and invariants
  ui-conventions.md       CSS, animation, input and mobile constraints
  deployment.md           Vercel, startup, persistence, PWA
  commit-conventions.md   commit message format
backlog/
  README.md      index, dependency graph, ticket template
  T-*.md         one file per work item
```

## Commands

```
npm run dev         # dev server
npm run build       # production build
npm run preview     # serve the build locally
npm run test        # unit tests (rules and content validator)
npm run typecheck   # tsc --noEmit
```

## Code quality

- Clear names, single-responsibility functions, no duplicated logic, fail fast at boundaries.
- **Modularize when it adds clarity or enables reuse — not by default.** A second concrete use
  justifies extracting a module; a hypothetical third does not. Three similar lines beat a
  premature abstraction.
- Keep functions short enough to read at a glance. If a function needs section comments to
  navigate, split it.
- Prefer pure functions for data transformations; isolate side effects at the edges. Game rules
  must be testable without a DOM.
- Validate at system boundaries (content file, `localStorage`, URL params). Trust internal calls.
- TypeScript `strict` is on. No `any`, no non-null assertions to silence the checker.
- **Nothing derived from the content file may be hardcoded** — category counts, word counts, deck
  size. Adding a category must require no code change.

## Backlog system

One file per item in `backlog/`, named `<id>-<slug>.md`. Template and index live in
[backlog/README.md](backlog/README.md).

- `status: blocked` **iff** any entry in `depends_on` is not `done`; otherwise `ready`.
- `blocks` is the exact inverse of `depends_on`. Keep them consistent.
- **Done items are kept, not deleted** — deleting breaks `depends_on` edges and destroys the graph.
- Split anything too large for one focused session.
- "Works well" is not acceptance criteria. Write criteria someone else can verify objectively.
- Update `backlog/README.md` whenever an item is added or changes status.

## Commit conventions

See [docs/commit-conventions.md](docs/commit-conventions.md). Conventional Commits
(`feat` / `fix` / `refactor` / `docs` / `chore`), `feat!` or `BREAKING CHANGE:` when behavior
breaks. No automated release pipeline — the convention exists to keep history readable.

## How we work

- **Communicate with the user in Spanish.** Code, comments, identifiers, file content, and commit
  messages stay in English.
- **Work one backlog item at a time.** Never start a `blocked` item. Touch only what the item
  covers, and update its status file when done.
- **Git workflow actions require explicit user authorization.** Never commit, branch, open PRs, or
  merge on your own initiative — propose the action (scope + message) and wait. This includes docs
  and backlog hygiene commits.
- **Confirm before destructive or shared-state actions** (force push, branch deletes, rewriting
  history, production deploys). Local edits and tests do not need confirmation.
- **Do not invent scope.** Spotted issues outside scope: mention them, do not silently fix.
- **Out-of-scope improvements go to `backlog/` as `status: icebox`.** Ask before adding. Do not
  add silently and do not skip the question.
- **No premature abstractions.** Used once means do not generalize. Wait for the second use.
- **No dead code, no TODO comments, no commented-out blocks.** Delete what is not needed.
- **No comments explaining what the code does.** Comment only when the _why_ is non-obvious.
- **Verify before claiming success.** Run the dev server and exercise the feature. A clean
  typecheck or passing test is not feature-correct. For anything touching layout or input, verify
  in mobile emulation at 360×640 — desktop mouse testing misses `touch-action`, safe-area,
  hit-target and hover-state bugs. If you could not run it, say so.
- **Plan documents go in conversation, not in files.** No `PLAN.md` or `NOTES.md` unless asked.
  Backlog items are the exception — they are the plan.
