import { ChangeEvent, useEffect, useRef, useState } from "react";
import { EditorTool } from "../../editor/interactions";
import { BoardType } from "../../model/types";
import styles from "./Ribbon.module.css";

type RibbonTab = "file" | "home" | "insert" | "view";

interface RibbonProps {
  projectName: string;
  tool: EditorTool;
  boardType: BoardType | null;
  rows: number;
  cols: number;
  canDisconnectWire: boolean;
  canRemoveComponent: boolean;
  canUndo: boolean;
  canRedo: boolean;
  theme: "dark" | "light";
  onProjectNameChange: (name: string) => void;
  onToolChange: (tool: EditorTool) => void;
  onBoardTypeChange: (type: BoardType) => void;
  onResizeBoard: (rows: number, cols: number) => void;
  onDisconnectSelectedWire: () => void;
  onRemoveSelectedComponent: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSaveProject: () => void;
  onLoadProject: (file: File) => void;
  onNewProject: () => void;
  onToggleTheme: () => void;
}

function Divider() {
  return <div className={styles.divider} />;
}

function RibbonBtn({
  icon, label, onClick, active, disabled, title
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${active ? styles.btnActive : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <span className={styles.btnIcon}>{icon}</span>
      <span className={styles.btnLabel}>{label}</span>
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.group}>
      <div className={styles.groupItems}>{children}</div>
      <div className={styles.groupLabel}>{label}</div>
    </div>
  );
}

export function Ribbon({
  projectName,
  tool,
  boardType,
  rows,
  cols,
  canDisconnectWire,
  canRemoveComponent,
  canUndo,
  canRedo,
  theme,
  onProjectNameChange,
  onToolChange,
  onBoardTypeChange,
  onResizeBoard,
  onDisconnectSelectedWire,
  onRemoveSelectedComponent,
  onUndo,
  onRedo,
  onSaveProject,
  onLoadProject,
  onNewProject,
  onToggleTheme
}: RibbonProps) {
  const [activeTab, setActiveTab] = useState<RibbonTab>("home");
  const [rowsInput, setRowsInput] = useState(String(rows));
  const [colsInput, setColsInput] = useState(String(cols));
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const tabs: { id: RibbonTab; label: string }[] = [
    { id: "file", label: "File" },
    { id: "home", label: "Home" },
    { id: "insert", label: "Insert" },
    { id: "view", label: "View" }
  ];

  return (
    <header className={styles.ribbon}>
      {/* Title bar */}
      <div className={styles.titleBar}>
        <span className={styles.logo}>⬛ Veroboard Planner</span>
        <input
          className={styles.projectName}
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          aria-label="Project name"
        />
        <button
          type="button"
          className={styles.themeToggle}
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <a
          href="https://tally.so/r/BzjEMY"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.feedbackBtn}
          title="Give feedback"
        >
          💬 Feedback
        </a>
      </div>

      {/* Ribbon panel */}
      <div className={styles.panel}>

        {activeTab === "file" && (
          <>
            <Group label="File">
              <RibbonBtn icon="🗋" label="New" onClick={onNewProject} title="New project" />
              <RibbonBtn icon="📂" label="Open" onClick={() => fileInputRef.current?.click()} title="Open JSON" />
              <RibbonBtn icon="💾" label="Save" onClick={onSaveProject} title="Save JSON" />
              <RibbonBtn icon="🖨" label="Print" onClick={() => window.print()} title="Print schematic" />
            </Group>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className={styles.hiddenInput}
              onChange={handleLoadFile}
            />
          </>
        )}

        {activeTab === "home" && (
          <>
            <Group label="History">
              <RibbonBtn icon="↩" label="Undo" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" />
              <RibbonBtn icon="↪" label="Redo" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" />
            </Group>
            <Divider />
            <Group label="Selection">
              <RibbonBtn icon="✂" label="Del Wire" onClick={onDisconnectSelectedWire} disabled={!canDisconnectWire} />
              <RibbonBtn icon="✕" label="Del Part" onClick={onRemoveSelectedComponent} disabled={!canRemoveComponent} />
            </Group>
          </>
        )}

        {activeTab === "insert" && (
          <>
            <Group label="Components">
              <RibbonBtn icon="⌇" label="Wire" onClick={() => onToolChange("wire")} active={tool === "wire"} />
              <RibbonBtn icon="▭" label="Resistor" onClick={() => onToolChange("resistor")} active={tool === "resistor"} />
              <RibbonBtn icon="⊣⊢" label="Capacitor" onClick={() => onToolChange("capacitor")} active={tool === "capacitor"} />
            </Group>
            <Divider />
            <Group label="Board">
              <RibbonBtn icon="≡" label="Stripboard" onClick={() => onBoardTypeChange("stripboard")} active={boardType === "stripboard"} disabled={!boardType} />
              <RibbonBtn icon="⊞" label="Perfboard" onClick={() => onBoardTypeChange("perfboard")} active={boardType === "perfboard"} disabled={!boardType} />
            </Group>
            <Divider />
            <Group label="Board Size">
              <div className={styles.sizeRow}>
                <label className={styles.sizeField}>
                  <span className={styles.sizeFieldLabel}>Rows</span>
                  <input className={styles.sizeInput} type="number" min={1} value={rowsInput} onChange={(e) => setRowsInput(e.target.value)} />
                </label>
                <span className={styles.sizeSep}>×</span>
                <label className={styles.sizeField}>
                  <span className={styles.sizeFieldLabel}>Cols</span>
                  <input className={styles.sizeInput} type="number" min={1} value={colsInput} onChange={(e) => setColsInput(e.target.value)} />
                </label>
                <button type="button" className={styles.applyBtn} onClick={() => onResizeBoard(parseInt(rowsInput, 10), parseInt(colsInput, 10))}>Apply</button>
              </div>
            </Group>
          </>
        )}

        {activeTab === "view" && (
          <Group label="Theme">
            <RibbonBtn icon="☾" label="Dark" onClick={() => theme !== "dark" && onToggleTheme()} active={theme === "dark"} />
            <RibbonBtn icon="☀" label="Light" onClick={() => theme !== "light" && onToggleTheme()} active={theme === "light"} />
          </Group>
        )}

      </div>
    </header>
  );
}
