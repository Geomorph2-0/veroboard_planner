import { holeRefEquals } from "../model/board";
import { HoleRef } from "../model/types";

export type EditorTool = "wire" | "resistor" | "capacitor" | "diode" | "inductor" | "crystal" | "ic" | "connector" | "led";

export function togglePendingHole(current: HoleRef | null, clicked: HoleRef): HoleRef | null {
  if (!current) {
    return clicked;
  }

  if (holeRefEquals(current, clicked)) {
    return null;
  }

  return current;
}

export function describeTool(tool: EditorTool): string {
  if (tool === "wire") {
    return "Wire mode";
  }

  if (tool === "resistor") {
    return "Resistor placement mode";
  }

  if (tool === "led") return "LED placement mode";
  if (tool === "diode") return "Diode placement mode";
  if (tool === "inductor") return "Inductor placement mode";
  if (tool === "crystal") return "Crystal placement mode";
  if (tool === "ic") return "IC: click pin 1 (top-left), then last pin (bottom-right) diagonally";
  if (tool === "connector") return "Connector: click first pin, then last pin (same row/col for single-row; 1 row apart for double-row)";
  return "Capacitor placement mode";
}
