# Commit Convention Guide

Commits follow Conventional Commits so the history stays readable and easy to scan.
There is no automated changelog or release pipeline in this repository — nothing breaks
if a commit deviates, but the history becomes less useful.

---

## Prefix meanings

1. **feat**: new functionality
2. **fix**: bug fix
3. **refactor**: internal changes without modifying behavior
4. **docs**: documentation changes
5. **chore**: maintenance, tooling, or configuration changes

An optional scope narrows the subject: `feat(inventory): ...`

---

## Examples

```bash
feat: add drag and drop sorting for inventory items
fix: prevent item snapping back when dropped on a full slot
refactor: split sorting rules out of the board scene script
docs: document the item data format
chore: update export presets for mobile
feat(scoring): award bonus for fully sorted shelves
```

---

## Breaking changes

Declare a breaking change when a change alters existing behavior in a way that breaks
current usage — for example changing the save-file format, renaming or removing
configuration keys, or removing an existing feature.

Option 1 (explicit):

```
feat: redesign save format

BREAKING CHANGE: existing save files can no longer be loaded
```

Option 2 (shortcut):

```
feat!: redesign save format
```

Not breaking changes: internal refactors, performance improvements, UI changes that do
not affect the player's workflow, build or tooling changes.

---

## Guidelines

- Use `feat` only for player-facing changes
- Use `chore` for tooling and configuration changes
- Use `refactor` for internal code improvements
- Use `!` or `BREAKING CHANGE` only when behavior breaks existing usage
