import { FreeComponent, MutationResult, ProjectFile, createId, toUtcTimestamp } from "./types";

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

export function placeFreeComponent(
  project: ProjectFile,
  type: "battery",
  x: number,
  y: number,
  label?: string,
  value?: string
): { project: ProjectFile; id: string } {
  const id = createId("free");
  const fc: FreeComponent = {
    id,
    type,
    label: label ?? `BAT-${project.freeComponents.length + 1}`,
    value: value ?? "9V",
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
