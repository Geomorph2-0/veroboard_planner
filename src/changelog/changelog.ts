export const CURRENT_VERSION = "0.3.1";

export interface ChangeEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

export const CHANGELOG: ChangeEntry[] = [
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
