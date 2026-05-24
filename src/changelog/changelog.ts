export const CURRENT_VERSION = "0.5.10";

export interface ChangeEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "0.5.7",
    date: "2026-05-24",
    title: "Bug fixes & polish",
    items: [
      "Wire gauge and battery type now survive save/load (were silently reset on reload)",
      "Moving a battery is now undoable",
      "Two-digit row numbers no longer overlap board holes"
    ]
  },
  {
    version: "0.5.5",
    date: "2026-05-19",
    title: "Zoom, wire tools & batteries",
    items: [
      "Smooth zoom + pan on the canvas — scroll wheel, Ctrl +/−/0, and zoom controls",
      "Wire colour picker — choose from 21 colours before placing or recolour a selected wire",
      "Wire gauge (AWG 12–24) — set per wire in the ribbon or inspector",
      "9V battery (Hi-Watt) — drag onto the canvas; connect + and − terminals to board holes",
      "Li-Ion 18650 battery — drag onto the canvas; distinct terminal positions"
    ]
  },
  {
    version: "0.5.4",
    date: "2026-05-16",
    title: "File menu polish",
    items: [
      "Print is disabled when no board is open",
      "New Project prompts to save first when a board is open"
    ]
  },
  {
    version: "0.5.0",
    date: "2026-05-16",
    title: "Login & What's New",
    items: [
      "Login required — sign in or create an account to access the planner",
      "What's New popup on sign-in shows changes since your last visit"
    ]
  },
  {
    version: "0.4.0",
    date: "2026-05-16",
    title: "Inspector editing",
    items: [
      "Click any field in the Inspector to edit label, value, tolerance, or voltage rating inline",
      "Board summary shows a per-type component breakdown",
      "Selected wire shows its hole positions; selected component shows hole A/B coordinates"
    ]
  },
  {
    version: "0.3.1",
    date: "2026-05-15",
    title: "Ribbon polish",
    items: [
      "Wire and Components are now distinct labelled groups in the ribbon"
    ]
  },
  {
    version: "0.3.0",
    date: "2026-05-15",
    title: "New component types",
    items: [
      "Added Diode, Inductor, Crystal, IC (DIP), and Connector",
      "IC requires diagonal placement (pin 1 → last pin); Connector requires linear placement",
      "Derived package labels (DIP-8, 6-pin) shown in popup and inspector"
    ]
  },
  {
    version: "0.2.0",
    date: "2026-05-14",
    title: "Ribbon, themes & LED symbol",
    items: [
      "Replaced sidebar toolbar with Office-style ribbon",
      "Light theme now default; dark/light toggle in View tab",
      "Physical LED dome symbol (toggle between dome and schematic in View tab)",
      "Wire colour picker as split-button dropdown",
      "File menu as dropdown (New, Open, Save, Print)"
    ]
  },
  {
    version: "0.1.2",
    date: "2026-05-13",
    title: "Components & z-order",
    items: [
      "Fixed component z-order",
      "Intermediate holes visible through component body"
    ]
  },
  {
    version: "0.1.0",
    date: "2026-05-13",
    title: "Initial release",
    items: [
      "Stripboard and perfboard canvas",
      "Wire placement with colour",
      "Resistor and Capacitor components",
      "Undo / redo",
      "Save and load project as JSON"
    ]
  }
];
