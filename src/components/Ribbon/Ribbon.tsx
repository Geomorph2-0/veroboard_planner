import { ChangeEvent, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const WIRE_PALETTE = [
  "#e05c5c", "#ff8080", "#c0392b",
  "#4a9eff", "#38bdf8", "#1d6fa5",
  "#4caf50", "#a3e635", "#2e7d32",
  "#ffb347", "#fb923c", "#e67e22",
  "#c084fc", "#9b59b6", "#e91e8c",
  "#ffee58", "#f9a825",
  "#ffffff", "#b0b0b0", "#555555",
  "#e26d1a",
];
import { EditorTool } from "../../editor/interactions";
import { BoardType } from "../../model/types";
import styles from "./Ribbon.module.css";

type RibbonTab = "home" | "insert" | "view";

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
  ledSymbolStyle: "physical" | "schematic";
  wireColour: string | null;
  onProjectNameChange: (name: string) => void;
  onToggleLedSymbolStyle: () => void;
  onWireColourChange: (colour: string) => void;
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

function WireBtn({ active, wireColour, onSelect, onColourChange }: {
  active: boolean;
  wireColour: string | null;
  onSelect: () => void;
  onColourChange: (c: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const inWrap = wrapRef.current?.contains(e.target as Node);
      const inDrop = dropRef.current?.contains(e.target as Node);
      if (!inWrap && !inDrop) { setOpen(false); setPos(null); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) { setOpen(false); setPos(null); return; }
    const rect = arrowRef.current!.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };

  const dotColour = wireColour ?? "#e26d1a";

  return (
    <div ref={wrapRef} className={styles.wireBtn}>
      <button
        type="button"
        className={`${styles.wireBtnMain} ${active ? styles.btnActive : ""}`}
        onClick={onSelect}
      >
        <span className={styles.btnIcon}>⌇</span>
        <span className={styles.btnLabel}>Wire</span>
      </button>
      <button
        ref={arrowRef}
        type="button"
        className={`${styles.wireBtnArrow} ${active ? styles.btnActive : ""}`}
        onClick={handleArrowClick}
        title="Wire colour"
      >
        <span className={styles.wireDot} style={{ background: dotColour }} />
        <span style={{ fontSize: 8 }}>▾</span>
      </button>
      {open && pos && ReactDOM.createPortal(
        <div
          ref={dropRef}
          className={styles.wireDropdown}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {WIRE_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.wireSwatch} ${c === dotColour ? styles.wireSwatchActive : ""}`}
              style={{ background: c }}
              title={c}
              onClick={() => { onColourChange(c); setOpen(false); setPos(null); }}
            />
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

function FileMenuBtn({ onNew, onOpen, onSave, onPrint }: {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onPrint: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const inBtn = btnRef.current?.contains(e.target as Node);
      const inDrop = dropRef.current?.contains(e.target as Node);
      if (!inBtn && !inDrop) { setOpen(false); setPos(null); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleClick = () => {
    if (open) { setOpen(false); setPos(null); return; }
    const rect = btnRef.current!.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };

  const close = () => { setOpen(false); setPos(null); };

  const items = [
    { icon: "🗋", label: "New",   action: () => { onNew();   close(); } },
    { icon: "📂", label: "Open",  action: () => { onOpen();  close(); } },
    { icon: "💾", label: "Save",  action: () => { onSave();  close(); } },
    { icon: "🖨", label: "Print", action: () => { onPrint(); close(); } },
  ];

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`${styles.tab} ${open ? styles.tabActive : ""}`}
        onClick={handleClick}
      >
        File
      </button>
      {open && pos && ReactDOM.createPortal(
        <div
          ref={dropRef}
          className={styles.fileMenu}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {items.map(({ icon, label, action }) => (
            <button key={label} type="button" className={styles.fileMenuItem} onClick={action}>
              <span className={styles.fileMenuIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
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
  onToggleTheme,
  ledSymbolStyle,
  onToggleLedSymbolStyle,
  wireColour,
  onWireColourChange
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
        <FileMenuBtn
          onNew={onNewProject}
          onOpen={() => fileInputRef.current?.click()}
          onSave={onSaveProject}
          onPrint={() => window.print()}
        />
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

      {/* Hidden file input — always mounted */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className={styles.hiddenInput}
        onChange={handleLoadFile}
      />

      {/* Ribbon panel */}
      <div className={styles.panel}>

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
              <WireBtn active={tool === "wire"} wireColour={wireColour} onSelect={() => onToolChange("wire")} onColourChange={onWireColourChange} />
              <RibbonBtn icon="▭" label="Resistor" onClick={() => onToolChange("resistor")} active={tool === "resistor"} />
              <RibbonBtn icon="⊣⊢" label="Capacitor" onClick={() => onToolChange("capacitor")} active={tool === "capacitor"} />
              <RibbonBtn icon="◐" label="LED" onClick={() => onToolChange("led")} active={tool === "led"} />
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
        {activeTab === "view" && (
          <Group label="LED Symbol">
            <RibbonBtn icon="◉" label="Physical" onClick={() => ledSymbolStyle !== "physical" && onToggleLedSymbolStyle()} active={ledSymbolStyle === "physical"} />
            <RibbonBtn icon="◁|" label="Schematic" onClick={() => ledSymbolStyle !== "schematic" && onToggleLedSymbolStyle()} active={ledSymbolStyle === "schematic"} />
          </Group>
        )}

      </div>
    </header>
  );
}
