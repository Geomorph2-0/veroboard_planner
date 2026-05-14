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

## Workflow Preferences

- Enter plan mode for any non-trivial task (3+ steps or architectural decisions)
- Use subagents for research and parallel exploration
- After corrections: capture lessons
- Never mark complete without verifying it works
