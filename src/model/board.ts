import { Board, HoleRef, ProjectFile, isTerminalRef, toUtcTimestamp } from "./types";

export const MIN_BOARD_DIMENSION = 1;

export function isHoleInBoard(board: Board, hole: HoleRef): boolean {
  return hole.row >= 0 && hole.col >= 0 && hole.row < board.rows && hole.col < board.cols;
}

export function holeRefEquals(a: HoleRef, b: HoleRef): boolean {
  return a.row === b.row && a.col === b.col;
}

export function normalizeHolePair(a: HoleRef, b: HoleRef): [HoleRef, HoleRef] {
  if (a.row < b.row) {
    return [a, b];
  }

  if (a.row > b.row) {
    return [b, a];
  }

  if (a.col <= b.col) {
    return [a, b];
  }

  return [b, a];
}

export function holePairKey(a: HoleRef, b: HoleRef): string {
  const [left, right] = normalizeHolePair(a, b);
  return `${left.row}:${left.col}-${right.row}:${right.col}`;
}

export function resizeBoard(project: ProjectFile, rows: number, cols: number): ProjectFile {
  if (!project.board) return project;

  const safeRows = Math.max(MIN_BOARD_DIMENSION, Math.floor(rows));
  const safeCols = Math.max(MIN_BOARD_DIMENSION, Math.floor(cols));

  const nextBoard = {
    ...project.board,
    rows: safeRows,
    cols: safeCols
  };

  const nextWires = project.wires.filter((wire) => {
    const fromOk = isTerminalRef(wire.from) || isHoleInBoard(nextBoard, wire.from);
    const toOk = isTerminalRef(wire.to) || isHoleInBoard(nextBoard, wire.to);
    return fromOk && toOk;
  });

  const nextComponents = project.components.filter(
    (component) => isHoleInBoard(nextBoard, component.holeA) && isHoleInBoard(nextBoard, component.holeB)
  );

  return {
    ...project,
    board: nextBoard,
    wires: nextWires,
    components: nextComponents,
    updatedAt: toUtcTimestamp()
  };
}
