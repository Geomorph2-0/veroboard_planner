# Feature Tracker

Updated before every commit. Present to user for verification before pushing.

---

## Shipped

### v0.5.11 — In-app changelog catch-up
- [x] `CURRENT_VERSION` bumped to `0.5.10`; changelog entries added for v0.4.0, v0.5.0, v0.5.4, v0.5.5, v0.5.7 — returning users will now see all missing What's New entries on next sign-in

### v0.5.10 — E2E test foundation + Ribbon split
- [x] First Playwright E2E suite (`tests/e2e/`): board add, wire place/select/delete, resistor place + undo/redo, and a save→reload→re-open round-trip
- [x] Env-gated auth bypass (`VITE_E2E_AUTH_BYPASS`) in `AuthGate.tsx` — inert in normal builds; lets E2E reach the canvas without Supabase login
- [x] `data-testid`s added to AddBoard, Ribbon controls, and ComponentPopup for stable test targeting
- [x] Split the 586-line `Ribbon.tsx` into a 154-line container + `constants.ts`, `shared/` (button/group/divider), `parts/` (TitleBar, FileMenuBtn, WireBtn, ComponentsMenuBtn, BatteryMenuBtn), `tabs/` (Home/Insert/View)
- [x] Internal refactor + tests — zero user-visible behaviour change

### v0.5.9 — BoardCanvas refactor
- [x] Split the 855-line `BoardCanvas.tsx` into focused modules (internal refactor, zero user-visible behaviour change)
- [x] Extracted `constants.ts` and `geometry.ts` (`holeCenter` / `wireEndpointPos` / `wireColor` / `arcPath`)
- [x] Extracted 10 component body renderers into `bodies/` plus a shared `bodies/types.ts`
- [x] Extracted `parts/ZoomControls.tsx` and `hooks/useZoomPan.ts`
- [x] Fixed a React Rules-of-Hooks bug — early `null` return moved after all hook calls
- [x] Extracted `hooks/useBatteryDrag.ts` for free-component drag handling
- [x] Extracted render layers `parts/BoardSurface.tsx`, `parts/WireLayer.tsx`, `parts/ComponentLayer.tsx`, `parts/FreeComponentLayer.tsx`
- [x] `BoardCanvas.tsx` reduced to a ~150-line orchestrator

### v0.5.8 — Docs restructure
- [x] `features.md` relocated from `tasks/` to `docs/` and linked from README
- [x] `tasks/` added to `.gitignore` — `todo.md` and `lessons.md` now untracked
- [x] README rewritten to reflect current feature set and architecture

### v0.5.7 — Optimisation pass + row label fix
- [x] Wire `thickness` now survives save/load (was silently dropped on deserialize)
- [x] Battery `subType` now survives save/load (Li-Ion no longer reloads as 9V)
- [x] `COMPONENT_TYPES as const` array in `types.ts` — serializer imports it, eliminating duplicate list
- [x] `setWireColor`/`setWireThickness` unified via shared `updateWireProp` helper in `wire.ts`
- [x] `moveBattery` now pushes to undo history (battery moves are now undoable)
- [x] `BATTERY_ITEMS`, `RIBBON_TABS` hoisted to module level in `Ribbon.tsx`
- [x] Board row labels use dedicated `LEFT_PAD` constant — 2-digit numbers no longer overlap holes

### v0.5.6 — Tracking files + session rules
- [x] Recorded the v0.5.5 shipped section in the feature tracker; cleared stale planned items
- [x] Reset `tasks/todo.md` to a clean state (no pending backlog)
- [x] Tightened session workflow rules

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

### v0.5.4 — File menu UX
- [x] Print disabled (greyed out) when no board is open
- [x] New project prompts to save first if a board is open (Save & New / Discard / Cancel)

### v0.5.3 — Translucent component bodies
- [x] Component bodies render semi-transparent so underlying holes/strips stay visible
- [x] Removed the `midHoles` overlay from the canvas, simplifying `BoardCanvas.tsx`

### v0.5.2 — Supabase env guard
- [x] Show a visible error page when Supabase environment variables are missing (instead of a blank crash)

### v0.5.1 — .gitignore hardening
- [x] Expanded `.gitignore` to exclude env files, editor directories, Playwright output, coverage reports, and the `research/` folder

### v0.5.0 — Auth gate + What's New
- [x] Login required before the planner is accessible — `AuthGate` wraps the root and shows `AuthPage` until a session exists
- [x] `AuthPage` login/signup with display name, email, password
- [x] What's New popup on sign-in — full changelog for new users, only new-since-last-login versions for returning users
- [x] Dismissal records the current version in Supabase user metadata
- [x] Log out button added to the ribbon title bar
- [x] Changelog hardcoded in `src/changelog/changelog.ts`

### v0.4.0 — Inspector inline editing
- [x] Selected components have editable label/value/tolerance/voltage fields — click to edit, Enter/blur to save, Escape to cancel (undoable)
- [x] Board group shows a per-type component breakdown
- [x] Derived info — IC shows DIP-N package; connectors show pin count and orientation
- [x] Hole A/B positions shown for all selected components
- [x] Wire colour swatch shown when a wire is selected

### v0.3.1 — Ribbon group split
- [x] Wire and Components each get their own labelled ribbon group with a divider between them (previously shared one cluster)

### v0.3.0 — Diode, inductor, crystal, IC, connector
- [x] Added diode, inductor, crystal, IC, and connector component types
- [x] IC requires diagonal hole selection (pin 1 top-left → last pin bottom-right); connector requires linear selection (same row or column)
- [x] Placement validated at the model layer with descriptive errors
- [x] Derived default labels (DIP-8, 6-pin) computed from hole geometry
- [x] SVG bodies use absolute coordinates — IC renders as a DIP package with per-row pin leads; connector as an orientation-aware housing with gold pin dots

### v0.2.0 — LED + UI rework
- [x] Added LED component with dome-style physical symbol (coloured circle, cathode flat, glassy highlight); schematic/physical toggle in View tab
- [x] Light theme is now the default on first load
- [x] Wire split-button in ribbon — colour picker dropdown (21 colours) via React portal, colour dot shows active selection
- [x] File tab replaced with a portal dropdown menu (New, Open, Save, Print) so it no longer switches the ribbon panel
- [x] Expanded wire colour palette to 21 entries

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

### v0.1.1 — README + tracker + workflow
- [x] Added README covering project overview, usage instructions, and local setup
- [x] Added feature tracker listing shipped and planned features, verified before every commit
- [x] Restored CLAUDE.md workflow/principles alongside project architecture

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
