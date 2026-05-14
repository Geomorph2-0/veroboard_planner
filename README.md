# Veroboard Planner

A browser-based tool for designing veroboard (stripboard and perfboard) circuits. Plan your layouts visually before soldering — place wires, resistors, and capacitors on a realistic board canvas, then save your design as a JSON file.

---

## What it does

- **Two board types** — Stripboard (copper strips connecting holes per row) and Perfboard (individually isolated holes)
- **Wire routing** — click two holes to connect them with a colour-coded arc
- **Components** — place resistors and capacitors across any two holes, with label, value, tolerance, and voltage rating
- **Undo / Redo** — full history with Ctrl+Z / Ctrl+Shift+Z (up to 50 steps)
- **Keyboard shortcuts** — Delete or Backspace removes the selected wire or component
- **Save & Load** — export your design as JSON; reload it later
- **Dark / Light theme** — toggle with the ☀/☾ button in the toolbar

---

## Using the app

1. **Add a board** — on launch you'll see the board picker. Choose Stripboard or Perfboard, set the row and column count, then click **Add Board**.
2. **Select a tool** in the left toolbar: Wire, Resistor, or Capacitor.
3. **Click two holes** on the canvas to place a wire or component. The first click highlights the starting hole; the second completes it.
4. **Select an item** by clicking a wire or component body. Press Delete (or use the toolbar buttons) to remove it.
5. **Save** with the Save JSON button. **Load** a previous design with Load JSON.

---

## Running locally

### Requirements

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Install and start

```bash
git clone https://github.com/Geomorph2-0/veroboard_planner.git
cd veroboard_planner
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The output goes to `dist/` and can be served from any static host.

### Run tests

```bash
npm test
```
