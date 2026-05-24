import { FreeComponent, MutationResult, ProjectFile, createId, toUtcTimestamp } from "./types";

// ── 9V Hi-Watt (PP3) ──────────────────────────────────────────────────────
export const BATTERY_WIDTH = 64;
export const BATTERY_HEIGHT = 92;
export const BATTERY_TERMINAL_OFFSET = 16;
export const BATTERY_POS_TERM_W = 10;
export const BATTERY_POS_TERM_H = 10;
export const BATTERY_NEG_TERM_W = 14;
export const BATTERY_NEG_TERM_H = 10;

export function batteryPosTerminalPos(fc: FreeComponent): { x: number; y: number } {
  return { x: fc.x - BATTERY_TERMINAL_OFFSET, y: fc.y - BATTERY_HEIGHT / 2 - BATTERY_POS_TERM_H / 2 };
}

export function batteryNegTerminalPos(fc: FreeComponent): { x: number; y: number } {
  return { x: fc.x + BATTERY_TERMINAL_OFFSET, y: fc.y - BATTERY_HEIGHT / 2 - BATTERY_NEG_TERM_H / 2 };
}

// ── Li-Ion 18650 ──────────────────────────────────────────────────────────
export const LIION_WIDTH = 38;
export const LIION_HEIGHT = 90;
export const LIION_CAP_H = 10;
export const LIION_BASE_H = 8;
export const LIION_TERM_W = 24;
export const LIION_TERM_H = 10;

export function liionPosTerminalPos(fc: FreeComponent): { x: number; y: number } {
  return { x: fc.x, y: fc.y - LIION_HEIGHT / 2 - LIION_TERM_H / 2 };
}

export function liionNegTerminalPos(fc: FreeComponent): { x: number; y: number } {
  return { x: fc.x, y: fc.y + LIION_HEIGHT / 2 + LIION_TERM_H / 2 };
}

// ── Shared mutations ───────────────────────────────────────────────────────
export function placeFreeComponent(
  project: ProjectFile,
  type: "battery",
  x: number,
  y: number,
  subType?: "9v" | "18650",
  label?: string,
  value?: string
): { project: ProjectFile; id: string } {
  const id = createId("free");
  const is18650 = subType === "18650";
  const fc: FreeComponent = {
    id,
    type,
    subType: subType ?? "9v",
    label: label ?? `BAT-${project.freeComponents.length + 1}`,
    value: value ?? (is18650 ? "3.7V" : "9V"),
    x,
    y
  };
  return {
    project: {
      ...project,
      freeComponents: [...project.freeComponents, fc],
      updatedAt: toUtcTimestamp()
    },
    id
  };
}

export function moveFreeComponent(
  project: ProjectFile,
  id: string,
  x: number,
  y: number
): ProjectFile {
  return {
    ...project,
    freeComponents: project.freeComponents.map((fc) =>
      fc.id === id ? { ...fc, x, y } : fc
    ),
    updatedAt: toUtcTimestamp()
  };
}

export function removeFreeComponent(project: ProjectFile, id: string): MutationResult {
  if (!project.freeComponents.some((fc) => fc.id === id)) {
    return { project, error: "Free component not found." };
  }
  return {
    project: {
      ...project,
      freeComponents: project.freeComponents.filter((fc) => fc.id !== id),
      wires: project.wires.filter(
        (w) =>
          !(("kind" in w.from) && w.from.componentId === id) &&
          !(("kind" in w.to) && w.to.componentId === id)
      ),
      updatedAt: toUtcTimestamp()
    }
  };
}
