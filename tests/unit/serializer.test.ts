import { describe, expect, it } from "vitest";
import { createEmptyProject } from "../../src/model/types";
import { connectProjectHoles } from "../../src/model/wire";
import { serializeProject, deserializeProject } from "../../src/persistence/projectSerializer";

describe("project serializer", () => {
  it("round-trips a project", () => {
    const project = createEmptyProject(4, 4);
    const connected = connectProjectHoles(project, { row: 0, col: 0 }, { row: 0, col: 1 }).project;

    const serialized = serializeProject(connected);
    const restored = deserializeProject(serialized);

    expect(restored.board?.rows).toBe(4);
    expect(restored.board?.cols).toBe(4);
    expect(restored.wires).toHaveLength(1);
  });

  it("throws for invalid structure", () => {
    expect(() => deserializeProject('{"bad":true}')).toThrowError();
  });
});
