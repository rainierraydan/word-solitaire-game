# Backlog

One file per work item, named `<id>-<slug>.md` (e.g. `T-007-tap-to-move.md`).

Rules live in [CLAUDE.md](../CLAUDE.md#backlog-system). This file is the index: keep the status
table, the dependency graph, and the critical path current whenever an item is added or changes
status.

## Ticket template

```markdown
---
id: T-007
title: Tap-to-move routing
status: blocked # blocked | ready | in-progress | done | icebox
depends_on: [T-003, T-005]
blocks: [T-011]
estimate: M # S | M | L
area: interaction # data | state | layout | interaction | polish | infra | idea
---

## Goal

One sentence on what this delivers.

## Context

Why this exists, and which part of the spec it implements.

## Acceptance criteria

- [ ] Specific, verifiable statements — someone else can confirm completion without asking you.

## Notes

Gotchas, pointers, constraints.
```

## Status

| ID                  | Title | Status | Area | Depends on |
| ------------------- | ----- | ------ | ---- | ---------- |
| _(to be generated)_ |       |        |      |            |

## Dependency graph

```mermaid
graph LR
  %% to be generated
```

## Critical path

_(to be generated)_
