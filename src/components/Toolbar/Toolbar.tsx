import { ChangeEvent, useEffect, useState } from "react";
import { EditorTool } from "../../editor/interactions";
import { BoardType } from "../../model/types";
import { ComponentDraft } from "../../state/store";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  projectName: string;
  tool: EditorTool;
  boardType: BoardType | null;
  rows: number;
  cols: number;
  componentDraft: ComponentDraft;
  canDisconnectWire: boolean;
  canRemoveComponent: boolean;
  canUndo: boolean;
  canRedo: boolean;
  theme: "dark" | "light";
  onProjectNameChange: (name: string) => void;
  onToolChange: (tool: EditorTool) => void;
  onBoardTypeChange: (type: BoardType) => void;
  onResizeBoard: (rows: number, cols: number) => void;
  onComponentDraftChange: (patch: Partial<ComponentDraft>) => void;
  onDisconnectSelectedWire: () => void;
  onRemoveSelectedComponent: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSaveProject: () => void;
  onLoadProject: (file: File) => void;
  onToggleTheme: () => void;
}

const TOOLS: { id: EditorTool; label: string; icon: string }[] = [
  { id: "wire", label: "Wire", icon: "⌇" },
  { id: "resistor", label: "Resistor", icon: "▭" },
  { id: "capacitor", label: "Capacitor", icon: "⊣⊢" }
];

export function Toolbar({
  projectName,
  tool,
  boardType,
  rows,
  cols,
  componentDraft,
  canDisconnectWire,
  canRemoveComponent,
  canUndo,
  canRedo,
  theme,
  onProjectNameChange,
  onToolChange,
  onBoardTypeChange,
  onResizeBoard,
  onComponentDraftChange,
  onDisconnectSelectedWire,
  onRemoveSelectedComponent,
  onUndo,
  onRedo,
  onSaveProject,
  onLoadProject,
  onToggleTheme
}: ToolbarProps) {
  const [rowsInput, setRowsInput] = useState(String(rows));
  const [colsInput, setColsInput] = useState(String(cols));

  useEffect(() => {
    setRowsInput(String(rows));
    setColsInput(String(cols));
  }, [rows, cols]);

  const handleLoadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onLoadProject(file);
    e.target.value = "";
  };

  const applyResize = () => {
    onResizeBoard(Number.parseInt(rowsInput, 10), Number.parseInt(colsInput, 10));
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoRow}>
        <span className={styles.logo}>⬛ Veroboard</span>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>

      <div className={styles.section}>
        <label className={styles.label} htmlFor="project-name">Project</label>
        <input
          id="project-name"
          className={styles.input}
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
        />
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Tool</span>
        <div className={styles.toolGrid}>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={t.id === tool ? `${styles.toolBtn} ${styles.toolBtnActive}` : styles.toolBtn}
              onClick={() => onToolChange(t.id)}
            >
              <span className={styles.toolIcon}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {boardType && (
        <div className={styles.section}>
          <span className={styles.label}>Board Type</span>
          <div className={styles.undoRow}>
            {(["stripboard", "perfboard"] as BoardType[]).map((t) => (
              <button
                key={t}
                type="button"
                className={boardType === t ? `${styles.undoBtn} ${styles.toolBtnActive}` : styles.undoBtn}
                onClick={() => onBoardTypeChange(t)}
              >
                {t === "stripboard" ? "Strip" : "Perf"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <span className={styles.label}>Board Size</span>
        <div className={styles.sizeRow}>
          <div className={styles.sizeField}>
            <label className={styles.smallLabel} htmlFor="rows-input">Rows</label>
            <input
              id="rows-input"
              className={`${styles.input} ${styles.numInput}`}
              type="number"
              min={1}
              value={rowsInput}
              onChange={(e) => setRowsInput(e.target.value)}
            />
          </div>
          <div className={styles.sizeField}>
            <label className={styles.smallLabel} htmlFor="cols-input">Cols</label>
            <input
              id="cols-input"
              className={`${styles.input} ${styles.numInput}`}
              type="number"
              min={1}
              value={colsInput}
              onChange={(e) => setColsInput(e.target.value)}
            />
          </div>
          <button type="button" className={styles.applyBtn} onClick={applyResize}>Apply</button>
        </div>
      </div>

      {tool !== "wire" && (
        <div className={styles.section}>
          <span className={styles.label}>Component</span>
          <label className={styles.smallLabel} htmlFor="comp-label">Label</label>
          <input
            id="comp-label"
            className={styles.input}
            placeholder="e.g. R1"
            value={componentDraft.label}
            onChange={(e) => onComponentDraftChange({ label: e.target.value })}
          />
          <label className={styles.smallLabel} htmlFor="comp-value">Value</label>
          <input
            id="comp-value"
            className={styles.input}
            placeholder="e.g. 10kΩ"
            value={componentDraft.value}
            onChange={(e) => onComponentDraftChange({ value: e.target.value })}
          />
          {tool === "resistor" && (
            <>
              <label className={styles.smallLabel} htmlFor="comp-tol">Tolerance</label>
              <input
                id="comp-tol"
                className={styles.input}
                placeholder="e.g. 5%"
                value={componentDraft.tolerance}
                onChange={(e) => onComponentDraftChange({ tolerance: e.target.value })}
              />
            </>
          )}
          {tool === "capacitor" && (
            <>
              <label className={styles.smallLabel} htmlFor="comp-volt">Voltage</label>
              <input
                id="comp-volt"
                className={styles.input}
                placeholder="e.g. 16V"
                value={componentDraft.voltageRating}
                onChange={(e) => onComponentDraftChange({ voltageRating: e.target.value })}
              />
            </>
          )}
        </div>
      )}

      <div className={styles.section}>
        <span className={styles.label}>History</span>
        <div className={styles.undoRow}>
          <button type="button" className={styles.undoBtn} onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            ↩ Undo
          </button>
          <button type="button" className={styles.undoBtn} onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
            ↪ Redo
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Selection</span>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onDisconnectSelectedWire}
          disabled={!canDisconnectWire}
        >
          Remove Wire
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onRemoveSelectedComponent}
          disabled={!canRemoveComponent}
        >
          Remove Component
        </button>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>File</span>
        <button type="button" className={styles.fileBtn} onClick={onSaveProject}>
          Save JSON
        </button>
        <label className={styles.fileBtn} htmlFor="load-input">
          Load JSON
        </label>
        <input id="load-input" type="file" accept="application/json" className={styles.fileInput} onChange={handleLoadFile} />
      </div>
    </aside>
  );
}
