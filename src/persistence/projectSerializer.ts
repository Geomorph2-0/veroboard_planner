import { BoardType, ComponentType, COMPONENT_TYPES, FreeComponent, HoleRef, PROJECT_FILE_VERSION, ProjectFile, TerminalRef, WireEndpoint } from "../model/types";

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

function parseWireEndpoint(value: unknown, label: string): WireEndpoint {
  assertObject(value, label);
  if (value.kind === "terminal") {
    assertString(value.componentId, `${label}.componentId`);
    if (value.terminal !== "pos" && value.terminal !== "neg") {
      throw new Error(`${label}.terminal must be "pos" or "neg".`);
    }
    return { kind: "terminal", componentId: String(value.componentId), terminal: value.terminal as "pos" | "neg" } as TerminalRef;
  }
  return parseHoleRef(value, label);
}

function parseComponentType(value: unknown): ComponentType {
  if (COMPONENT_TYPES.includes(value as ComponentType)) return value as ComponentType;
  throw new Error(`Unknown component type: ${String(value)}`);
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
    const from = parseWireEndpoint(wire.from, `wires[${index}].from`);
    const to = parseWireEndpoint(wire.to, `wires[${index}].to`);

    if (wire.color !== undefined) {
      assertString(wire.color, `wires[${index}].color`);
    }

    return {
      id: wire.id as string,
      from,
      to,
      color: wire.color as string | undefined,
      thickness: typeof wire.thickness === "number" ? wire.thickness : undefined,
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
      id: component.id as string,
      type: parseComponentType(component.type),
      label: component.label as string,
      value: component.value as string,
      tolerance: component.tolerance as string | undefined,
      voltageRating: component.voltageRating as string | undefined,
      holeA: parseHoleRef(component.holeA, `components[${index}].holeA`),
      holeB: parseHoleRef(component.holeB, `components[${index}].holeB`)
    };
  });

  const freeComponents: FreeComponent[] = Array.isArray(parsed.freeComponents)
    ? parsed.freeComponents.map((fc, index) => {
        assertObject(fc, `freeComponents[${index}]`);
        assertString(fc.id, `freeComponents[${index}].id`);
        assertString(fc.label, `freeComponents[${index}].label`);
        assertString(fc.value, `freeComponents[${index}].value`);
        assertNumber(fc.x, `freeComponents[${index}].x`);
        assertNumber(fc.y, `freeComponents[${index}].y`);
        const subType = fc.subType === "18650" ? "18650" : "9v";
        return {
          id: fc.id as string,
          type: "battery" as const,
          subType,
          label: fc.label as string,
          value: fc.value as string,
          tolerance: typeof fc.tolerance === "string" ? fc.tolerance : undefined,
          x: Number(fc.x),
          y: Number(fc.y)
        };
      })
    : [];

  const boardType: BoardType =
    boardObj?.type === "perfboard" ? "perfboard" : "stripboard";

  return {
    version: parsed.version || PROJECT_FILE_VERSION,
    projectId: parsed.projectId as string,
    name: parsed.name as string,
    createdAt: parsed.createdAt as string,
    updatedAt: parsed.updatedAt as string,
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
    components,
    freeComponents
  };
}
