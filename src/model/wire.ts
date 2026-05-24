import { holePairKey, holeRefEquals, isHoleInBoard } from "./board";
import { HoleRef, MutationResult, ProjectFile, TerminalRef, Wire, createId, isTerminalRef, toUtcTimestamp } from "./types";

export function hasDuplicateWire(wires: Wire[], from: HoleRef, to: HoleRef): boolean {
  const key = holePairKey(from, to);
  return wires.some((wire) => {
    if (isTerminalRef(wire.from) || isTerminalRef(wire.to)) return false;
    return holePairKey(wire.from as HoleRef, wire.to as HoleRef) === key;
  });
}

export function connectProjectHoles(
  project: ProjectFile,
  from: HoleRef,
  to: HoleRef,
  color?: string,
  thickness?: number
): MutationResult {
  if (!project.board || !isHoleInBoard(project.board, from) || !isHoleInBoard(project.board, to)) {
    return { project, error: "Cannot connect holes outside the current board." };
  }

  if (holeRefEquals(from, to)) {
    return { project, error: "Cannot create a wire from a hole to itself." };
  }

  if (hasDuplicateWire(project.wires, from, to)) {
    return { project, error: "A wire between those holes already exists." };
  }

  const nextWire: Wire = { id: createId("wire"), from, to, color, thickness };
  return {
    project: { ...project, wires: [...project.wires, nextWire], updatedAt: toUtcTimestamp() }
  };
}

export function connectTerminalToHole(
  project: ProjectFile,
  terminal: TerminalRef,
  hole: HoleRef,
  color?: string,
  thickness?: number
): MutationResult {
  if (!project.board || !isHoleInBoard(project.board, hole)) {
    return { project, error: "Target hole is outside the board." };
  }
  const fc = project.freeComponents.find((c) => c.id === terminal.componentId);
  if (!fc) {
    return { project, error: "Battery not found." };
  }
  const duplicate = project.wires.some(
    (w) =>
      isTerminalRef(w.from) &&
      w.from.componentId === terminal.componentId &&
      w.from.terminal === terminal.terminal
  );
  if (duplicate) {
    return { project, error: "That terminal already has a wire." };
  }
  const nextWire: Wire = { id: createId("wire"), from: terminal, to: hole, color, thickness };
  return {
    project: { ...project, wires: [...project.wires, nextWire], updatedAt: toUtcTimestamp() }
  };
}

function updateWireProp<K extends keyof Wire>(project: ProjectFile, wireId: string, prop: K, value: Wire[K]): MutationResult {
  if (!project.wires.some((w) => w.id === wireId)) {
    return { project, error: "Wire not found." };
  }
  return {
    project: {
      ...project,
      wires: project.wires.map((w) => w.id === wireId ? { ...w, [prop]: value } : w),
      updatedAt: toUtcTimestamp(),
    },
  };
}

export function setWireThickness(project: ProjectFile, wireId: string, thickness: number): MutationResult {
  return updateWireProp(project, wireId, "thickness", thickness);
}

export function setWireColor(project: ProjectFile, wireId: string, color: string): MutationResult {
  return updateWireProp(project, wireId, "color", color);
}

export function disconnectProjectWire(project: ProjectFile, wireId: string): MutationResult {
  const exists = project.wires.some((wire) => wire.id === wireId);
  if (!exists) {
    return { project, error: "Wire not found." };
  }

  return {
    project: {
      ...project,
      wires: project.wires.filter((wire) => wire.id !== wireId),
      updatedAt: toUtcTimestamp()
    }
  };
}
