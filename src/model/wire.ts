import { holePairKey, holeRefEquals, isHoleInBoard } from "./board";
import { HoleRef, MutationResult, ProjectFile, Wire, createId, toUtcTimestamp } from "./types";

export function hasDuplicateWire(wires: Wire[], from: HoleRef, to: HoleRef): boolean {
  const key = holePairKey(from, to);
  return wires.some((wire) => holePairKey(wire.from, wire.to) === key);
}

export function connectProjectHoles(
  project: ProjectFile,
  from: HoleRef,
  to: HoleRef,
  color: string = "#e26d1a"
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

  const nextWire: Wire = {
    id: createId("wire"),
    from,
    to,
    color
  };

  return {
    project: {
      ...project,
      wires: [...project.wires, nextWire],
      updatedAt: toUtcTimestamp()
    }
  };
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
