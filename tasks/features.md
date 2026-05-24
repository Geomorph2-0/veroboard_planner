# Feature Tracker

Updated before every commit. Present to user for verification before pushing.

---

## Shipped

### v0.1.0 — Initial build
- [x] SVG board canvas with realistic veroboard aesthetic (warm phenolic colour, copper strips, annular pads)
- [x] Dual board type support — Stripboard (copper strips per row) and Perfboard (isolated pads)
- [x] Empty-canvas start — user picks board type and size before anything appears
- [x] Board picker UI with SVG previews of each board type
- [x] Wire placement — click two holes to connect them with a colour-coded bezier arc
- [x] Resistor placement — spans two holes, renders body with colour bands and leads
- [x] Capacitor placement — spans two holes, renders cylindrical body with polarity stripe
- [x] Component labels displayed above each component on canvas
- [x] Component draft fields — label, value, tolerance (resistor), voltage rating (capacitor)
- [x] Wire and component selection by click
- [x] Delete / Backspace key removes selected wire or component
- [x] Toolbar Remove Wire / Remove Component buttons
- [x] Undo / Redo — 50-step history (Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y)
- [x] Board type toggle in toolbar (switch between Stripboard and Perfboard after creation)
- [x] Board resize — change rows/cols via toolbar inputs
- [x] Project name editable in toolbar
- [x] Save project as JSON file
- [x] Load project from JSON file
- [x] Dark theme (default) and Light theme toggle (☀/☾)
- [x] Inspector panel — shows board info, selection details, project metadata
- [x] Status bar messages for all actions
- [x] Keyboard-safe — shortcuts disabled when typing in inputs
- [x] Axis labels (row/col numbers) on canvas

### v0.1.2 — Ribbon toolbar + print + dark theme
- [x] Replaced vertical sidebar toolbar with Office-style horizontal ribbon (File / Home / Insert / View tabs)
- [x] File tab — New, Open, Save, Print actions
- [x] Home tab — Tools, History (Undo/Redo), Selection groups
- [x] Insert tab — Board type toggle, board resize, component draft fields
- [x] View tab — Dark / Light theme toggle
- [x] Print function outputs board canvas only (ribbon and inspector hidden via CSS)
- [x] New Project action resets store to empty canvas
- [x] Deep Forge dark theme — darker near-black base with sharper copper accents
- [x] Feedback button in tab bar (far right) — links to Tally feedback form

---

## Planned

### Near-term
- [ ] Cut copper strip — mark a break in a stripboard row between two holes
- [ ] Snap-to-grid visual feedback while placing components
- [ ] Multi-select and bulk delete
- [ ] Export canvas as PNG or SVG image

### Later
- [ ] More component types — transistors, MOSFETs, relays, switches, potentiometers
- [ ] Netlist / connectivity check — highlight which holes are electrically connected
- [ ] Auto-save to localStorage
- [ ] Project manager — multiple named projects in-browser
- [ ] Mobile / touch support

### v0.5.4 — File menu UX
- [x] Print disabled (greyed out) when no board is open
- [x] New project prompts to save first if a board is open (Save & New / Discard / Cancel)

### v0.5.7 — Optimisation pass + row label fix
- [x] Wire `thickness` now survives save/load (was silently dropped on deserialize)
- [x] Battery `subType` now survives save/load (Li-Ion no longer reloads as 9V)
- [x] `COMPONENT_TYPES as const` array in `types.ts` — serializer imports it, eliminating duplicate list
- [x] `setWireColor`/`setWireThickness` unified via shared `updateWireProp` helper in `wire.ts`
- [x] `moveBattery` now pushes to undo history (battery moves are now undoable)
- [x] `BATTERY_ITEMS`, `RIBBON_TABS` hoisted to module level in `Ribbon.tsx`
- [x] Board row labels use dedicated `LEFT_PAD` constant — 2-digit numbers no longer overlap holes

### v0.5.5 — Zoom, wire tools, and batteries
- [x] SVG viewBox-based zoom + pan replaces CSS scale (dead zones eliminated)
- [x] Browser zoom prevention — non-passive wheel listener scoped to canvas wrapper only
- [x] Wire recolouring — inline 21-colour palette in Inspector for selected wires
- [x] Wire AWG thickness — 12–24 AWG inline buttons in Ribbon and Inspector
- [x] Wire render order fixed — wires render above copper pads (no punch-through dots)
- [x] 9V battery (PP3 / Hi-Watt) — drag-drop free component; pos/neg terminals snap to board holes
- [x] Li-Ion 18650 battery — drag-drop; `subType: "18650"`; rectangle body (rx=4); both terminals 24×10 rects
- [x] Battery sub-picker in Ribbon — click Battery → portal dropdown grid (Hi-Watt / Li-Ion, max 3-col)
- [x] AddBoard centering regression fixed (zoom layout change had broken it)
- [x] Wire colour/AWG controls centred in Ribbon; colour dropdown widened to 160px
- [x] `research/Battery/Li-Ion/18650/` — 11 renamed reference images + README
