import { EditorTool } from "../../editor/interactions";

export type RibbonTab = "home" | "insert" | "view";

export const COMPONENT_ITEMS: { type: EditorTool; icon: string; label: string }[] = [
  { type: "resistor",  icon: "▭",  label: "Resistor"  },
  { type: "capacitor", icon: "⊣⊢", label: "Capacitor" },
  { type: "led",       icon: "◉",  label: "LED"        },
  { type: "diode",     icon: "▷|", label: "Diode"      },
  { type: "inductor",  icon: "∿",  label: "Inductor"   },
  { type: "crystal",   icon: "◇",  label: "Crystal"    },
  { type: "ic",        icon: "▣",  label: "IC"         },
];

export const COMPONENT_TOOLS = new Set(COMPONENT_ITEMS.map(c => c.type));

export const BATTERY_ITEMS = [
  { subType: "9v" as const,    icon: "🔋", label: "Hi-Watt", dragKey: "battery-9v" },
  { subType: "18650" as const, icon: "⚡", label: "Li-Ion",  dragKey: "battery-18650" },
];

export const RIBBON_TABS: { id: RibbonTab; label: string }[] = [
  { id: "home",   label: "Home"   },
  { id: "insert", label: "Insert" },
  { id: "view",   label: "View"   },
];
