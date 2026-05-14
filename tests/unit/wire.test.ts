import { describe, expect, it } from "vitest";
import { connectProjectHoles, disconnectProjectWire } from "../../src/model/wire";
import { createEmptyProject } from "../../src/model/types";

describe("wire model", () => {
  it("creates a wire between two valid holes", () => {
    const project = createEmptyProject(4, 4);
    const result = connectProjectHoles(project, { row: 0, col: 0 }, { row: 0, col: 1 });

    expect(result.error).toBeUndefined();
    expect(result.project.wires).toHaveLength(1);
  });

  it("rejects duplicate wire endpoints", () => {
    const project = createEmptyProject(4, 4);
    const first = connectProjectHoles(project, { row: 1, col: 1 }, { row: 1, col: 2 });
    const second = connectProjectHoles(first.project, { row: 1, col: 2 }, { row: 1, col: 1 });

    expect(second.error).toBe("A wire between those holes already exists.");
    expect(second.project.wires).toHaveLength(1);
  });

  it("rejects same-hole wire", () => {
    const project = createEmptyProject(4, 4);
    const result = connectProjectHoles(project, { row: 2, col: 2 }, { row: 2, col: 2 });

    expect(result.error).toBe("Cannot create a wire from a hole to itself.");
    expect(result.project.wires).toHaveLength(0);
  });

  it("disconnects a wire by id", () => {
    const project = createEmptyProject(4, 4);
    const connected = connectProjectHoles(project, { row: 0, col: 0 }, { row: 0, col: 1 });
    const wireId = connected.project.wires[0].id;
    const disconnected = disconnectProjectWire(connected.project, wireId);

    expect(disconnected.error).toBeUndefined();
    expect(disconnected.project.wires).toHaveLength(0);
  });
});
