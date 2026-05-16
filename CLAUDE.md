# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Type-check + production build
npm test             # Run all unit tests
npm run test:watch   # Watch mode
npm run test:unit    # Unit tests only (tests/unit/)
npm run test:e2e     # Playwright e2e tests
```

Run a single test file:
```bash
npx vitest run tests/unit/wire.test.ts
```

## Architecture

**Stack**: React 18 + TypeScript + Vite + Zustand + CSS Modules + Vitest + Playwright

**Layer structure** — data flows strictly downward:
```
src/model/        Pure domain logic. No React deps. Returns MutationResult {project, error?}.
src/editor/       Interaction helpers and validation (calls model functions).
src/persistence/  JSON serialize/deserialize + browser file save/load.
src/state/        Zustand store. Single source of truth. Calls model layer, manages undo/redo history.
src/components/   React UI. Reads from store, calls store actions.
```

**Key data model** (`src/model/types.ts`):
- `ProjectFile` — top-level project object. `board` is `Board | null` (null = no board added yet).
- `Board` — has `type: "stripboard" | "perfboard"`. Stripboard renders copper strips per row; perfboard has isolated pads.
- `Wire` — connects two `HoleRef` positions with an arc.
- `Component` — resistor or capacitor, spans two holes (`holeA`, `holeB`).

**State** (`src/state/store.ts`):
- Zustand store with `past: ProjectFile[]` and `future: ProjectFile[]` for undo/redo (max 50 steps).
- Every mutation that changes `project` pushes to `past` and clears `future`.
- Initial state has `board: null` — user must add a board via `addBoard()`.

**Board picker** (`src/components/AddBoard/`):
- Shown when `project.board === null`. User picks stripboard or perfboard with row/col inputs.
- On confirm, calls `store.addBoard(type, rows, cols)`.

**Canvas** (`src/components/BoardCanvas/`):
- SVG-based. Returns `null` when `project.board === null`.
- Copper strips only rendered when `board.type === "stripboard"`.
- Pad style differs: annular ring (stripboard) vs filled dot (perfboard).
- Wires rendered as quadratic bezier arcs above the board surface.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

### Tasks folder rules (mandatory)
- **At session start**: Read `tasks/todo.md`, `tasks/lessons.md`, and `tasks/features.md` before doing any work
- **Before implementing**: Add the planned work as checkable items in `tasks/todo.md`
- **During implementation**: Mark each item `[x]` as soon as it is done — never batch
- **After any user correction**: Immediately update `tasks/lessons.md` with the rule and why
- **Before every commit**: Update `tasks/features.md` with any shipped features under the correct version section
- **At session end**: Ensure `tasks/todo.md` reflects the true state of all items and `tasks/features.md` is current

## Git Conventions

- **No co-author credits**: Never add `Co-Authored-By:` or any Claude/AI attribution lines to commit messages in this repo.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
