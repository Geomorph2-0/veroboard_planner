import { isHoleInBoard } from "../model/board";
import { PlaceComponentInput, placeProjectComponent } from "../model/component";
import { connectProjectHoles } from "../model/wire";
import { HoleRef, ProjectFile } from "../model/types";

export function validateBoardDimensions(rows: number, cols: number): string | null {
  if (!Number.isFinite(rows) || !Number.isFinite(cols)) {
    return "Board dimensions must be numbers.";
  }

  if (rows < 1 || cols < 1) {
    return "Board dimensions must be at least 1x1.";
  }

  if (rows > 200 || cols > 200) {
    return "Board dimensions are too large for the MVP editor.";
  }

  return null;
}

export function validateHoleSelection(project: ProjectFile, hole: HoleRef): string | null {
  if (!project.board || !isHoleInBoard(project.board, hole)) {
    return "Selected hole is outside board limits.";
  }

  return null;
}

export function validateWirePlacement(project: ProjectFile, from: HoleRef, to: HoleRef): string | null {
  const result = connectProjectHoles(project, from, to);
  return result.error ?? null;
}

export function validateComponentPlacement(project: ProjectFile, input: PlaceComponentInput): string | null {
  const result = placeProjectComponent(project, input);
  return result.error ?? null;
}
