import { ChangeEvent, useRef, useState } from "react";
import { EditorTool } from "../../editor/interactions";
import { AWGSize } from "../../model/wireThickness";
import { BoardType } from "../../model/types";
import styles from "./Ribbon.module.css";
import { RibbonTab, RIBBON_TABS } from "./constants";
import { TitleBar } from "./parts/TitleBar";
import { FileMenuBtn } from "./parts/FileMenuBtn";
import { HomeTab } from "./tabs/HomeTab";
import { InsertTab } from "./tabs/InsertTab";
import { ViewTab } from "./tabs/ViewTab";

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
  wireThickness: AWGSize;
  onProjectNameChange: (name: string) => void;
  onToggleLedSymbolStyle: () => void;
  onWireColourChange: (colour: string) => void;
  onWireThicknessChange: (thickness: AWGSize) => void;
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
  canPrint: boolean;
}

export function Ribbon(props: RibbonProps) {
  const {
    projectName, tool, boardType, rows, cols,
    canDisconnectWire, canRemoveComponent, canUndo, canRedo,
    theme, ledSymbolStyle, wireColour, wireThickness,
    onProjectNameChange, onToggleLedSymbolStyle, onWireColourChange, onWireThicknessChange,
    onToolChange, onBoardTypeChange, onResizeBoard, onDisconnectSelectedWire, onRemoveSelectedComponent,
    onUndo, onRedo, onSaveProject, onLoadProject, onNewProject, onToggleTheme, canPrint,
  } = props;

  const [activeTab, setActiveTab] = useState<RibbonTab>("home");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onLoadProject(file);
    e.target.value = "";
  };

  return (
    <header className={styles.ribbon}>
      <TitleBar
        projectName={projectName}
        theme={theme}
        onProjectNameChange={onProjectNameChange}
        onToggleTheme={onToggleTheme}
      />

      {/* Tab bar */}
      <div className={styles.tabBar}>
        <FileMenuBtn
          onNew={onNewProject}
          onOpen={() => fileInputRef.current?.click()}
          onSave={onSaveProject}
          onPrint={() => window.print()}
          canPrint={canPrint}
        />
        {RIBBON_TABS.map((tab) => (
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
        data-testid="ribbon-file-input"
        type="file"
        accept="application/json"
        className={styles.hiddenInput}
        onChange={handleLoadFile}
      />

      {/* Ribbon panel */}
      <div className={styles.panel}>
        {activeTab === "home" && (
          <HomeTab
            canUndo={canUndo}
            canRedo={canRedo}
            canDisconnectWire={canDisconnectWire}
            canRemoveComponent={canRemoveComponent}
            onUndo={onUndo}
            onRedo={onRedo}
            onDisconnectSelectedWire={onDisconnectSelectedWire}
            onRemoveSelectedComponent={onRemoveSelectedComponent}
          />
        )}
        {activeTab === "insert" && (
          <InsertTab
            tool={tool}
            boardType={boardType}
            rows={rows}
            cols={cols}
            wireColour={wireColour}
            wireThickness={wireThickness}
            onToolChange={onToolChange}
            onBoardTypeChange={onBoardTypeChange}
            onResizeBoard={onResizeBoard}
            onWireColourChange={onWireColourChange}
            onWireThicknessChange={onWireThicknessChange}
          />
        )}
        {activeTab === "view" && (
          <ViewTab
            theme={theme}
            ledSymbolStyle={ledSymbolStyle}
            onToggleTheme={onToggleTheme}
            onToggleLedSymbolStyle={onToggleLedSymbolStyle}
          />
        )}
      </div>
    </header>
  );
}
