import { create } from "zustand";
import { validateBoardDimensions } from "../editor/validation";
import { removeProjectComponent, placeProjectComponent } from "../model/component";
import { resizeBoard } from "../model/board";
import { connectProjectHoles, connectTerminalToHole, disconnectProjectWire } from "../model/wire";
import { moveFreeComponent, placeFreeComponent, removeFreeComponent } from "../model/freeComponent";
import {
  BoardType,
  Component,
  ComponentType,
  HoleRef,
  ProjectFile,
  TerminalRef,
  createBoard,
  createProjectWithoutBoard,
  toUtcTimestamp
} from "../model/types";
import { loadProjectFromFile, saveProjectToFile } from "../persistence/fileIO";
import { EditorTool } from "../editor/interactions";

export interface ComponentDraft {
  label: string;
  value: string;
  tolerance: string;
  voltageRating: string;
}

const defaultDraft: ComponentDraft = {
  label: "",
  value: "",
  tolerance: "",
  voltageRating: ""
};

const MAX_HISTORY = 50;

export interface PlannerState {
  project: ProjectFile;
  past: ProjectFile[];
  future: ProjectFile[];
  tool: EditorTool;
  pendingHole: HoleRef | null;
  selectedWireId: string | null;
  selectedComponentId: string | null;
  statusMessage: string;
  componentDraft: ComponentDraft;
  wireColour: string | null;

  setTool: (tool: EditorTool) => void;
  setWireColour: (colour: string | null) => void;
  setPendingHole: (hole: HoleRef | null) => void;
  setSelectedWireId: (id: string | null) => void;
  setSelectedComponentId: (id: string | null) => void;
  setStatusMessage: (message: string) => void;
  updateComponentDraft: (patch: Partial<ComponentDraft>) => void;
  setProjectName: (name: string) => void;
  addBoard: (type: BoardType, rows: number, cols: number) => void;
  setBoardType: (type: BoardType) => void;
  resizeProjectBoard: (rows: number, cols: number) => boolean;
  connectHoles: (from: HoleRef, to: HoleRef) => boolean;
  placeComponent: (type: ComponentType, holeA: HoleRef, holeB: HoleRef, draft?: Partial<ComponentDraft>) => boolean;
  disconnectWire: (wireId: string) => boolean;
  removeComponent: (componentId: string) => boolean;
  updateComponent: (id: string, fields: Partial<Pick<Component, "label" | "value" | "tolerance" | "voltageRating">>) => void;
  dropBattery: (x: number, y: number) => void;
  moveBattery: (id: string, x: number, y: number) => void;
  removeBattery: (id: string) => boolean;
  connectTerminal: (terminal: TerminalRef, hole: HoleRef) => boolean;
  selectedFreeComponentId: string | null;
  setSelectedFreeComponentId: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  newProject: () => void;
  saveProject: () => void;
  loadProject: (file: File) => Promise<boolean>;
}

function pushHistory(past: ProjectFile[], current: ProjectFile): ProjectFile[] {
  return [...past, current].slice(-MAX_HISTORY);
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  project: createProjectWithoutBoard(),
  past: [],
  future: [],
  tool: "wire",
  pendingHole: null,
  selectedWireId: null,
  selectedComponentId: null,
  selectedFreeComponentId: null,
  statusMessage: "Add a board to get started.",
  componentDraft: defaultDraft,
  wireColour: null,

  setWireColour: (colour) => set({ wireColour: colour }),

  setTool: (tool) => {
    set({
      tool,
      pendingHole: null,
      selectedWireId: null,
      selectedComponentId: null,
      selectedFreeComponentId: null,
      statusMessage: `Switched to ${tool} mode.`
    });
  },

  setPendingHole: (hole) => set({ pendingHole: hole }),
  setSelectedWireId: (id) => set({ selectedWireId: id }),
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  setStatusMessage: (message) => set({ statusMessage: message }),

  updateComponentDraft: (patch) => {
    set((state) => ({ componentDraft: { ...state.componentDraft, ...patch } }));
  },

  setProjectName: (name) => {
    set((state) => ({
      past: pushHistory(state.past, state.project),
      future: [],
      project: { ...state.project, name, updatedAt: toUtcTimestamp() }
    }));
  },

  addBoard: (type, rows, cols) => {
    set((state) => ({
      past: pushHistory(state.past, state.project),
      future: [],
      project: {
        ...state.project,
        board: createBoard(type, rows, cols),
        components: [],
        wires: [],
        updatedAt: toUtcTimestamp()
      },
      pendingHole: null,
      selectedWireId: null,
      selectedComponentId: null,
      statusMessage: `${type === "stripboard" ? "Stripboard" : "Perfboard"} added.`
    }));
  },

  setBoardType: (type) => {
    const { project } = get();
    if (!project.board) return;
    set((state) => ({
      past: pushHistory(state.past, state.project),
      future: [],
      project: {
        ...state.project,
        board: { ...state.project.board!, type },
        updatedAt: toUtcTimestamp()
      },
      statusMessage: `Switched to ${type === "stripboard" ? "Stripboard" : "Perfboard"}.`
    }));
  },

  resizeProjectBoard: (rows, cols) => {
    const { project } = get();
    if (!project.board) {
      set({ statusMessage: "Add a board first." });
      return false;
    }
    const error = validateBoardDimensions(rows, cols);
    if (error) {
      set({ statusMessage: error });
      return false;
    }
    set((state) => ({
      past: pushHistory(state.past, state.project),
      future: [],
      project: resizeBoard(state.project, rows, cols),
      pendingHole: null,
      selectedWireId: null,
      selectedComponentId: null,
      statusMessage: `Board resized to ${rows}×${cols}.`
    }));
    return true;
  },

  connectHoles: (from, to) => {
    const { project, past } = get();
    if (!project.board) { set({ statusMessage: "Add a board first." }); return false; }
    const colour = get().wireColour ?? undefined;
    const result = connectProjectHoles(project, from, to, colour);
    if (result.error) { set({ statusMessage: result.error }); return false; }
    set({ past: pushHistory(past, project), future: [], project: result.project, statusMessage: "Wire created." });
    return true;
  },

  placeComponent: (type, holeA, holeB, draft?) => {
    const { project, componentDraft, past } = get();
    if (!project.board) { set({ statusMessage: "Add a board first." }); return false; }
    const merged = { ...componentDraft, ...draft };
    const defaultLabel = `${type.toUpperCase()}-${project.components.length + 1}`;
    const result = placeProjectComponent(project, {
      type,
      label: merged.label || defaultLabel,
      value: merged.value || "unset",
      tolerance: merged.tolerance || undefined,
      voltageRating: merged.voltageRating || undefined,
      holeA,
      holeB
    });
    if (result.error) { set({ statusMessage: result.error }); return false; }
    set({ past: pushHistory(past, project), future: [], project: result.project, statusMessage: `${type} placed.` });
    return true;
  },

  disconnectWire: (wireId) => {
    const { project, past } = get();
    if (!project.board) return false;
    const result = disconnectProjectWire(project, wireId);
    if (result.error) { set({ statusMessage: result.error }); return false; }
    set({ past: pushHistory(past, project), future: [], project: result.project, selectedWireId: null, statusMessage: "Wire removed." });
    return true;
  },

  removeComponent: (componentId) => {
    const { project, past } = get();
    if (!project.board) return false;
    const result = removeProjectComponent(project, componentId);
    if (result.error) { set({ statusMessage: result.error }); return false; }
    set({ past: pushHistory(past, project), future: [], project: result.project, selectedComponentId: null, statusMessage: "Component removed." });
    return true;
  },

  updateComponent: (id, fields) => {
    const { project, past } = get();
    const updated = {
      ...project,
      components: project.components.map(c => c.id === id ? { ...c, ...fields } : c),
      updatedAt: toUtcTimestamp()
    };
    set({ past: pushHistory(past, project), future: [], project: updated });
  },

  setSelectedFreeComponentId: (id) => set({ selectedFreeComponentId: id }),

  dropBattery: (x, y) => {
    const { project, past } = get();
    const { project: newProject } = placeFreeComponent(project, "battery", x, y);
    set({ past: pushHistory(past, project), future: [], project: newProject, statusMessage: "Battery placed." });
  },

  moveBattery: (id, x, y) => {
    const { project } = get();
    set({ project: moveFreeComponent(project, id, x, y) });
  },

  removeBattery: (id) => {
    const { project, past } = get();
    const result = removeFreeComponent(project, id);
    if (result.error) { set({ statusMessage: result.error }); return false; }
    set({ past: pushHistory(past, project), future: [], project: result.project, selectedFreeComponentId: null, statusMessage: "Battery removed." });
    return true;
  },

  connectTerminal: (terminal, hole) => {
    const { project, past } = get();
    const colour = get().wireColour ?? undefined;
    const result = connectTerminalToHole(project, terminal, hole, colour);
    if (result.error) { set({ statusMessage: result.error }); return false; }
    set({ past: pushHistory(past, project), future: [], project: result.project, statusMessage: "Wire connected." });
    return true;
  },

  undo: () => {
    const { past, project, future } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      project: previous,
      future: [project, ...future].slice(0, MAX_HISTORY),
      pendingHole: null,
      selectedWireId: null,
      selectedComponentId: null,
      statusMessage: "Undo."
    });
  },

  redo: () => {
    const { past, project, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: pushHistory(past, project),
      project: next,
      future: future.slice(1),
      pendingHole: null,
      selectedWireId: null,
      selectedComponentId: null,
      statusMessage: "Redo."
    });
  },

  newProject: () => {
    set({
      project: createProjectWithoutBoard(),
      past: [],
      future: [],
      pendingHole: null,
      selectedWireId: null,
      selectedComponentId: null,
      statusMessage: "New project. Add a board to get started."
    });
  },

  saveProject: () => {
    saveProjectToFile(get().project);
    set({ statusMessage: "Project saved to JSON." });
  },

  loadProject: async (file) => {
    try {
      const loaded = await loadProjectFromFile(file);
      set({
        project: loaded,
        past: [],
        future: [],
        pendingHole: null,
        selectedWireId: null,
        selectedComponentId: null,
        statusMessage: "Project loaded."
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load project.";
      set({ statusMessage: message });
      return false;
    }
  }
}));
