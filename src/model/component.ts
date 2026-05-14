import { holePairKey, holeRefEquals, isHoleInBoard } from "./board";
import { Component, ComponentType, HoleRef, MutationResult, ProjectFile, createId, toUtcTimestamp } from "./types";

export interface PlaceComponentInput {
  type: ComponentType;
  label: string;
  value: string;
  tolerance?: string;
  voltageRating?: string;
  holeA: HoleRef;
  holeB: HoleRef;
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

  const component: Component = {
    id: createId("component"),
    type: input.type,
    label: input.label.trim() || `${input.type.toUpperCase()}-${project.components.length + 1}`,
    value: input.value.trim() || "unset",
    tolerance: input.tolerance?.trim() || undefined,
    voltageRating: input.voltageRating?.trim() || undefined,
    holeA: input.holeA,
    holeB: input.holeB
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
