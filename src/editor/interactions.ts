import { holeRefEquals } from "../model/board";
import { HoleRef } from "../model/types";

export type EditorTool = "wire" | "resistor" | "capacitor" | "led";

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

  if (tool === "led") {
    return "LED placement mode";
  }

  return "Capacitor placement mode";
}
