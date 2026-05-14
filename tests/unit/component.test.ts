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
