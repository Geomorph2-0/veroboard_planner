import { BoardType, ComponentType, HoleRef, PROJECT_FILE_VERSION, ProjectFile } from "../model/types";

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string.`);
  }
}

function assertNumber(value: unknown, label: string): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${label} must be a number.`);
  }
}

function parseHoleRef(value: unknown, label: string): HoleRef {
  assertObject(value, label);
  assertNumber(value.row, `${label}.row`);
  assertNumber(value.col, `${label}.col`);
  return {
    row: Math.floor(value.row),
    col: Math.floor(value.col)
  };
}

function parseComponentType(value: unknown): ComponentType {
  if (value === "resistor" || value === "capacitor") {
    return value;
  }

  throw new Error("Component type must be 'resistor' or 'capacitor'.");
}

export function serializeProject(project: ProjectFile): string {
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function deserializeProject(rawText: string): ProjectFile {
  const parsed = JSON.parse(rawText) as unknown;
  assertObject(parsed, "Project file");

  assertString(parsed.version, "version");
  assertString(parsed.projectId, "projectId");
  assertString(parsed.name, "name");
  assertString(parsed.createdAt, "createdAt");
  assertString(parsed.updatedAt, "updatedAt");

  const hasBoard = parsed.board !== null && parsed.board !== undefined;
  let boardObj: Record<string, unknown> | null = null;
  if (hasBoard) {
    assertObject(parsed.board, "board");
    boardObj = parsed.board as Record<string, unknown>;
    assertString(boardObj.boardId, "board.boardId");
    assertNumber(boardObj.rows, "board.rows");
    assertNumber(boardObj.cols, "board.cols");
  }

  if (!Array.isArray(parsed.wires)) {
    throw new Error("wires must be an array.");
  }

  if (!Array.isArray(parsed.components)) {
    throw new Error("components must be an array.");
  }

  const wires = parsed.wires.map((wire, index) => {
    assertObject(wire, `wires[${index}]`);
    assertString(wire.id, `wires[${index}].id`);
    const from = parseHoleRef(wire.from, `wires[${index}].from`);
    const to = parseHoleRef(wire.to, `wires[${index}].to`);

    if (wire.color !== undefined) {
      assertString(wire.color, `wires[${index}].color`);
    }

    return {
      id: wire.id,
      from,
      to,
      color: wire.color
    };
  });

  const components = parsed.components.map((component, index) => {
    assertObject(component, `components[${index}]`);
    assertString(component.id, `components[${index}].id`);
    assertString(component.label, `components[${index}].label`);
    assertString(component.value, `components[${index}].value`);

    if (component.tolerance !== undefined) {
      assertString(component.tolerance, `components[${index}].tolerance`);
    }

    if (component.voltageRating !== undefined) {
      assertString(component.voltageRating, `components[${index}].voltageRating`);
    }

    return {
      id: component.id,
      type: parseComponentType(component.type),
      label: component.label,
      value: component.value,
      tolerance: component.tolerance,
      voltageRating: component.voltageRating,
      holeA: parseHoleRef(component.holeA, `components[${index}].holeA`),
      holeB: parseHoleRef(component.holeB, `components[${index}].holeB`)
    };
  });

  const boardType: BoardType =
    boardObj?.type === "perfboard" ? "perfboard" : "stripboard";

  return {
    version: parsed.version || PROJECT_FILE_VERSION,
    projectId: parsed.projectId,
    name: parsed.name,
    createdAt: parsed.createdAt,
    updatedAt: parsed.updatedAt,
    board: hasBoard && boardObj
      ? {
          boardId: String(boardObj.boardId),
          rows: Math.floor(Number(boardObj.rows)),
          cols: Math.floor(Number(boardObj.cols)),
          type: boardType,
          holePitchMm:
            boardObj.holePitchMm !== undefined ? Number(boardObj.holePitchMm) : undefined
        }
      : null,
    wires,
    components
  };
}
