import { describe, expect, it } from "vitest";
import { placeProjectComponent, removeProjectComponent } from "../../src/model/component";
import { createEmptyProject } from "../../src/model/types";

describe("component model", () => {
  it("places a resistor", () => {
    const project = createEmptyProject(4, 4);
    const result = placeProjectComponent(project, {
      type: "resistor",
      label: "R1",
      value: "1k",
      holeA: { row: 0, col: 0 },
      holeB: { row: 0, col: 2 }
    });

    expect(result.error).toBeUndefined();
    expect(result.project.components).toHaveLength(1);
    expect(result.project.components[0].type).toBe("resistor");
  });

  it("prevents component overlap on identical hole pair", () => {
    const project = createEmptyProject(4, 4);
    const first = placeProjectComponent(project, {
      type: "resistor",
      label: "R1",
      value: "1k",
      holeA: { row: 1, col: 0 },
      holeB: { row: 1, col: 2 }
    });

    const second = placeProjectComponent(first.project, {
      type: "capacitor",
      label: "C1",
      value: "10nF",
      holeA: { row: 1, col: 2 },
      holeB: { row: 1, col: 0 }
    });

    expect(second.error).toBe("A component already occupies that hole pair.");
    expect(second.project.components).toHaveLength(1);
  });

  it("places an LED", () => {
    const project = createEmptyProject(4, 4);
    const result = placeProjectComponent(project, {
      type: "led",
      label: "D1",
      value: "Red",
      holeA: { row: 0, col: 0 },
      holeB: { row: 0, col: 2 }
    });

    expect(result.error).toBeUndefined();
    expect(result.project.components).toHaveLength(1);
    expect(result.project.components[0].type).toBe("led");
  });

  it.each([
    { type: "diode" as const,     label: "D1", value: "1N4148", holeA: { row: 0, col: 0 }, holeB: { row: 0, col: 2 } },
    { type: "inductor" as const,  label: "L1", value: "100µH",  holeA: { row: 0, col: 0 }, holeB: { row: 0, col: 2 } },
    { type: "crystal" as const,   label: "X1", value: "16MHz",  holeA: { row: 0, col: 0 }, holeB: { row: 0, col: 2 } },
    { type: "ic" as const,        label: "U1", value: "NE555",  holeA: { row: 0, col: 0 }, holeB: { row: 2, col: 2 } },
    { type: "connector" as const, label: "J1", value: "2-pin",  holeA: { row: 0, col: 0 }, holeB: { row: 0, col: 2 } },
  ])("places a $type", ({ type, label, value, holeA, holeB }) => {
    const project = createEmptyProject(4, 4);
    const result = placeProjectComponent(project, { type, label, value, holeA, holeB });
    expect(result.error).toBeUndefined();
    expect(result.project.components[0].type).toBe(type);
  });

  it("removes an existing component", () => {
    const project = createEmptyProject(4, 4);
    const placed = placeProjectComponent(project, {
      type: "capacitor",
      label: "C1",
      value: "22uF",
      holeA: { row: 2, col: 1 },
      holeB: { row: 2, col: 2 }
    });

    const id = placed.project.components[0].id;
    const removed = removeProjectComponent(placed.project, id);

    expect(removed.error).toBeUndefined();
    expect(removed.project.components).toHaveLength(0);
  });
});
