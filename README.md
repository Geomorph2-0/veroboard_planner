# Veroboard Planner

A browser-based layout tool for stripboard and perfboard circuits. Plan your design visually before you pick up a soldering iron — route wires, place components, drop batteries, then export as JSON.

![Canvas screenshot](docs/screenshot.png)

---

## Features

**Board**
- Stripboard (copper strips per row) and Perfboard (isolated pads) — switch type at any time
- Configurable grid size (rows × cols)
- Realistic canvas: annular pads, copper strips, bezier wire arcs rendered above pads

**Wiring**
- Click two holes to draw a wire arc
- 7 AWG thickness options (12–24 AWG) — set globally or per-wire
- 21-colour palette — set globally or per-wire after selection
- Duplicate and self-loop prevention

**Components**
- Resistor, capacitor, LED, diode, inductor, crystal, IC, connector
- Each stores label, value, tolerance, and voltage rating
- Inspector panel for editing selected component fields

**Batteries**
- 9V PP3 (Hi-Watt) and Li-Ion 18650 — drag from the Ribbon, drop anywhere on the canvas
- Positive and negative terminals snap-connect to any board hole via wire tool

**Editor**
- Undo / Redo — up to 50 steps (Ctrl+Z / Ctrl+Shift+Z), including battery moves
- Delete selected wire, component, or battery with Delete / Backspace
- Zoom (Ctrl+scroll or Ctrl+± / Ctrl+0 to reset) and pan (middle-click drag)
- Save design as JSON; reload from file
- Dark / Light theme toggle

---

<!-- ## Stack

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript |
| Build | Vite |
| State | Zustand (undo/redo history) |
| Styling | CSS Modules |
| Tests | Vitest + Playwright | -->

**Architecture** — strict layer separation:

```
model/        Pure domain logic. No React. Returns MutationResult {project, error?}.
editor/       Interaction helpers and validation.
persistence/  JSON serialize / deserialize + browser file I/O.
state/        Zustand store. Single source of truth. Calls model, owns undo history.
components/   React UI. Reads store, calls actions.
```

---

## Running locally

**Requirements:** Node.js v18+, npm

```bash
git clone https://github.com/Geomorph2-0/veroboard_planner.git
cd veroboard_planner
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Build for production**

```bash
npm run build        # type-check + Vite build → dist/
```

**Tests**

```bash
npm test             # unit + e2e
npm run test:unit    # unit only
npm run test:e2e     # Playwright e2e
```

---

## Project status

Active development. See [features.md](docs/features.md) for the shipped feature log and planned backlog.