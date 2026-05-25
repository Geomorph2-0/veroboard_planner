import { holePairKey, holeRefEquals, isHoleInBoard } from "./board";
import { Component, ComponentType, ConnectorSubType, HoleRef, MutationResult, ProjectFile, createId, toUtcTimestamp } from "./types";

function connectorOccupiedHoles(holeA: HoleRef, holeB: HoleRef, subType?: ConnectorSubType): HoleRef[] {
  const isDouble = subType === "male-double" || subType === "female-double";
  const minRow = Math.min(holeA.row, holeB.row);
  const maxRow = Math.max(holeA.row, holeB.row);
  const minCol = Math.min(holeA.col, holeB.col);
  const maxCol = Math.max(holeA.col, holeB.col);
  const holes: HoleRef[] = [];
  if (isDouble) {
    for (let row = minRow; row <= maxRow; row++)
      for (let col = minCol; col <= maxCol; col++)
        holes.push({ row, col });
  } else if (holeA.row === holeB.row) {
    for (let col = minCol; col <= maxCol; col++)
      holes.push({ row: holeA.row, col });
  } else {
    for (let row = minRow; row <= maxRow; row++)
      holes.push({ row, col: holeA.col });
  }
  return holes;
}

function hasConnectorOverlap(components: Component[], holeA: HoleRef, holeB: HoleRef, subType?: ConnectorSubType): boolean {
  const newKeys = new Set(connectorOccupiedHoles(holeA, holeB, subType).map(h => `${h.row}:${h.col}`));
  return components
    .filter(c => c.type === "connector")
    .some(c => connectorOccupiedHoles(c.holeA, c.holeB, c.connectorSubType).some(h => newKeys.has(`${h.row}:${h.col}`)));
}

export interface PlaceComponentInput {
  type: ComponentType;
  label: string;
  value: string;
  tolerance?: string;
  voltageRating?: string;
  holeA: HoleRef;
  holeB: HoleRef;
  connectorSubType?: ConnectorSubType;
}

function hasPairOverlap(components: Component[], holeA: HoleRef, holeB: HoleRef): boolean {
  const pairKey = holePairKey(holeA, holeB);
  return components.some((component) => holePairKey(component.holeA, component.holeB) === pairKey);
}

export function placeProjectComponent(project: ProjectFile, input: PlaceComponentInput): MutationResult {
  if (!project.board || !isHoleInBoard(project.board, input.holeA) || !isHoleInBoard(project.board, input.holeB)) {
    return { project, error: "Cannot place a component outside the board." };
  }

  if (holeRefEquals(input.holeA, input.holeB)) {
    return { project, error: "Components must span two distinct holes." };
  }

  if (hasPairOverlap(project.components, input.holeA, input.holeB)) {
    return { project, error: "A component already occupies that hole pair." };
  }

  if (input.type === "connector" && hasConnectorOverlap(project.components, input.holeA, input.holeB, input.connectorSubType)) {
    return { project, error: "Connectors cannot overlap or cross each other." };
  }

  if (input.type === "ic") {
    const rd = Math.abs(input.holeA.row - input.holeB.row);
    const cd = Math.abs(input.holeA.col - input.holeB.col);
    if (rd < 1 || cd < 1) {
      return { project, error: "IC: click pin 1 (top-left) then the last pin (bottom-right) diagonally." };
    }
  }

  if (input.type === "connector") {
    const rd = Math.abs(input.holeA.row - input.holeB.row);
    const isDouble = input.connectorSubType === "male-double" || input.connectorSubType === "female-double";
    if (isDouble) {
      if (rd !== 1) {
        return { project, error: "Double-row connector: click top-left pin, then bottom-right pin (exactly 1 row apart)." };
      }
    } else {
      const sameRow = input.holeA.row === input.holeB.row;
      const sameCol = input.holeA.col === input.holeB.col;
      if (!sameRow && !sameCol) {
        return { project, error: "Connector: both pins must be in the same row or same column." };
      }
    }
  }

  const component: Component = {
    id: createId("component"),
    type: input.type,
    label: input.label.trim() || `${input.type.toUpperCase()}-${project.components.length + 1}`,
    value: input.value.trim() || "unset",
    tolerance: input.tolerance?.trim() || undefined,
    voltageRating: input.voltageRating?.trim() || undefined,
    holeA: input.holeA,
    holeB: input.holeB,
    connectorSubType: input.connectorSubType
  };

  return {
    project: {
      ...project,
      components: [...project.components, component],
      updatedAt: toUtcTimestamp()
    }
  };
}

export function removeProjectComponent(project: ProjectFile, componentId: string): MutationResult {
  const exists = project.components.some((component) => component.id === componentId);
  if (!exists) {
    return { project, error: "Component not found." };
  }

  return {
    project: {
      ...project,
      components: project.components.filter((component) => component.id !== componentId),
      updatedAt: toUtcTimestamp()
    }
  };
}
