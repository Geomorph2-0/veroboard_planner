export type ComponentType = "resistor" | "capacitor" | "diode" | "inductor" | "crystal" | "ic" | "connector" | "led";
export type BoardType = "stripboard" | "perfboard";

export interface HoleRef {
  row: number;
  col: number;
}

export interface TerminalRef {
  kind: "terminal";
  componentId: string;
  terminal: "pos" | "neg";
}

export type WireEndpoint = HoleRef | TerminalRef;

export function isTerminalRef(ep: WireEndpoint): ep is TerminalRef {
  return "kind" in ep && ep.kind === "terminal";
}

export interface FreeComponent {
  id: string;
  type: "battery";
  label: string;
  value: string;
  tolerance?: string;
  x: number;
  y: number;
}

export interface Board {
  boardId: string;
  rows: number;
  cols: number;
  type: BoardType;
  holePitchMm?: number;
}

export interface Wire {
  id: string;
  from: WireEndpoint;
  to: WireEndpoint;
  color?: string;
  thickness?: number;
}

export interface Component {
  id: string;
  type: ComponentType;
  label: string;
  value: string;
  tolerance?: string;
  voltageRating?: string;
  holeA: HoleRef;
  holeB: HoleRef;
}

export interface ProjectFile {
  version: string;
  projectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  board: Board | null;
  components: Component[];
  wires: Wire[];
  freeComponents: FreeComponent[];
}

export interface MutationResult {
  project: ProjectFile;
  error?: string;
}

export const PROJECT_FILE_VERSION = "1.0.0";

export function toUtcTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function createId(prefix: string): string {
  const randomId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;

  return `${prefix}-${randomId}`;
}

export function createBoard(type: BoardType, rows: number = 14, cols: number = 24): Board {
  return {
    boardId: createId("board"),
    rows: Math.max(1, Math.floor(rows)),
    cols: Math.max(1, Math.floor(cols)),
    type
  };
}

export function createProjectWithoutBoard(): ProjectFile {
  const createdAt = toUtcTimestamp();
  return {
    version: PROJECT_FILE_VERSION,
    projectId: createId("project"),
    name: "Untitled Project",
    createdAt,
    updatedAt: createdAt,
    board: null,
    components: [],
    wires: [],
    freeComponents: []
  };
}

export function createEmptyProject(rows: number = 14, cols: number = 24): ProjectFile {
  const createdAt = toUtcTimestamp();
  return {
    version: PROJECT_FILE_VERSION,
    projectId: createId("project"),
    name: "Untitled Veroboard Project",
    createdAt,
    updatedAt: createdAt,
    board: createBoard("stripboard", rows, cols),
    components: [],
    wires: [],
    freeComponents: []
  };
}
