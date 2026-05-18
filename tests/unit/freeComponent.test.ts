import { describe, expect, it } from "vitest";
import { placeFreeComponent, moveFreeComponent, removeFreeComponent } from "../../src/model/freeComponent";
import { connectTerminalToHole } from "../../src/model/wire";
import { createEmptyProject } from "../../src/model/types";

describe("freeComponent model", () => {
  it("places a battery", () => {
    const project = createEmptyProject(4, 4);
    const { project: updated, id } = placeFreeComponent(project, "battery", 100, 80);
    expect(updated.freeComponents).toHaveLength(1);
    expect(updated.freeComponents[0].type).toBe("battery");
    expect(updated.freeComponents[0].value).toBe("9V");
    expect(id).toMatch(/^free-/);
  });

  it("moves a battery", () => {
    const project = createEmptyProject(4, 4);
    const { project: placed, id } = placeFreeComponent(project, "battery", 100, 80);
    const moved = moveFreeComponent(placed, id, 200, 150);
    expect(moved.freeComponents[0].x).toBe(200);
    expect(moved.freeComponents[0].y).toBe(150);
  });

  it("removes a battery and its terminal wires", () => {
    const project = createEmptyProject(4, 4);
    const { project: placed, id } = placeFreeComponent(project, "battery", 100, 80);
    const terminal = { kind: "terminal" as const, componentId: id, terminal: "pos" as const };
    const wired = connectTerminalToHole(placed, terminal, { row: 0, col: 0 });
    expect(wired.project.wires).toHaveLength(1);
    const removed = removeFreeComponent(wired.project, id);
    expect(removed.error).toBeUndefined();
    expect(removed.project.freeComponents).toHaveLength(0);
    expect(removed.project.wires).toHaveLength(0);
  });

  it("rejects removal of non-existent battery", () => {
    const project = createEmptyProject(4, 4);
    const result = removeFreeComponent(project, "free-nonexistent");
    expect(result.error).toBeTruthy();
  });

  it("connects battery terminal to board hole", () => {
    const project = createEmptyProject(4, 4);
    const { project: placed, id } = placeFreeComponent(project, "battery", 100, 80);
    const terminal = { kind: "terminal" as const, componentId: id, terminal: "neg" as const };
    const result = connectTerminalToHole(placed, terminal, { row: 1, col: 1 });
    expect(result.error).toBeUndefined();
    expect(result.project.wires).toHaveLength(1);
  });

  it("rejects duplicate terminal wire", () => {
    const project = createEmptyProject(4, 4);
    const { project: placed, id } = placeFreeComponent(project, "battery", 100, 80);
    const terminal = { kind: "terminal" as const, componentId: id, terminal: "pos" as const };
    const first = connectTerminalToHole(placed, terminal, { row: 0, col: 0 });
    const second = connectTerminalToHole(first.project, terminal, { row: 0, col: 1 });
    expect(second.error).toBeTruthy();
  });
});
