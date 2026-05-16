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
- [ ] Wire colour picker — let user choose the colour of each wire
- [ ] Snap-to-grid visual feedback while placing components
- [ ] Multi-select and bulk delete
- [ ] Export canvas as PNG or SVG image

### Later
- [ ] More component types — diodes, transistors, ICs (DIP packages)
- [ ] Netlist / connectivity check — highlight which holes are electrically connected
- [ ] Auto-save to localStorage
- [ ] Project manager — multiple named projects in-browser
- [ ] Zoom and pan on large boards
- [ ] Mobile / touch support

### v0.5.4 — File menu UX
- [x] Print disabled (greyed out) when no board is open
- [x] New project prompts to save first if a board is open (Save & New / Discard / Cancel)
