# Lessons

Patterns and rules derived from corrections during this project. Updated after any mistake.

## Format

```
### Rule title
- **What:** The rule
- **Why:** The reason / incident that prompted it
- **Apply when:** The context where this kicks in
```

---

### No co-author credits in commits
- **What:** Never append `Co-Authored-By` lines to commit messages
- **Why:** User does not want Claude or Anthropic credited in the project's git history
- **Apply when:** Every commit in this project

### Suggest versioning after every commit
- **What:** After any commit, suggest tagging and pushing with the recommended version bump — never tag or push without user approval
- **Why:** User wants control over when releases happen but wants the recommendation surfaced automatically
- **Apply when:** End of every task that includes a commit. Format: "Suggest tagging this as vX.Y.Z — [one-line reason]. Push too?"
- **Scheme:** Patch (x.x.1) = fix/refactor, no new visible behaviour · Minor (x.1.x) = new visible feature or behaviour · Major (1.x.x) = full redesign or structural overhaul

### Review .gitignore after every session
- **What:** After each working session, scan the project tree for new files or directories that should be ignored (generated outputs, editor artifacts, OS files, secrets, local config) and update `.gitignore` if anything is missing
- **Why:** User wants this caught proactively, not after something sensitive or noisy gets committed
- **Apply when:** End of every session that touches the codebase

### Where to store notes the user asks to "put down" or "take note of"
- **What:** Project-specific rules and workflow guidance go in `tasks/lessons.md`. Cross-project memory goes in `.claude/memory/`. When in doubt, prefer `tasks/lessons.md` for anything scoped to this project
- **Why:** User clarified this when asked whether a versioning rule should go in memory or lessons
- **Apply when:** Any time the user says "take note", "remember this", or "put this down"
