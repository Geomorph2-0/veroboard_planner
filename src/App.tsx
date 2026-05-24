import { useState, useEffect } from "react";
import { AddBoard } from "./components/AddBoard/AddBoard";
import { BoardCanvas } from "./components/BoardCanvas/BoardCanvas";
import { ComponentPopup } from "./components/ComponentPopup/ComponentPopup";
import { Inspector } from "./components/Inspector/Inspector";
import { Ribbon } from "./components/Ribbon/Ribbon";
import { holeRefEquals } from "./model/board";
import { ComponentType, HoleRef, TerminalRef } from "./model/types";
import { usePlannerStore } from "./state/store";
import styles from "./App.module.css";

function formatHole(hole: HoleRef): string {
  return `row ${hole.row + 1}, col ${hole.col + 1}`;
}

function derivedLabel(type: ComponentType, holeA: HoleRef, holeB: HoleRef): string {
  if (type === "ic") {
    const pinsPerSide = Math.abs(holeA.row - holeB.row) + 1;
    return `DIP-${pinsPerSide * 2}`;
  }
  if (type === "connector") {
    const pins = Math.abs(holeA.row - holeB.row) + Math.abs(holeA.col - holeB.col) + 1;
    return `${pins}-pin`;
  }
  return "";
}

export default function App() {
  const store = usePlannerStore();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [ledSymbolStyle, setLedSymbolStyle] = useState<"physical" | "schematic">("physical");
  const [pendingPlacement, setPendingPlacement] = useState<{ holeA: HoleRef; holeB: HoleRef; type: ComponentType } | null>(null);
  const [pendingTerminalRef, setPendingTerminalRef] = useState<TerminalRef | null>(null);
  const [showNewConfirm, setShowNewConfirm] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedWireId, selectedComponentId, selectedFreeComponentId, disconnectWire, removeComponent, removeBattery } = usePlannerStore.getState();
        if (selectedWireId) disconnectWire(selectedWireId);
        else if (selectedComponentId) removeComponent(selectedComponentId);
        else if (selectedFreeComponentId) removeBattery(selectedFreeComponentId);
        return;
      }

      if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        usePlannerStore.getState().undo();
        return;
      }

      if (
        (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) ||
        (e.key === "y" && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        usePlannerStore.getState().redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleHoleClick = (hole: HoleRef) => {
    store.setSelectedWireId(null);
    store.setSelectedComponentId(null);
    store.setSelectedFreeComponentId(null);

    // If a battery terminal is pending, connect it to this hole
    if (pendingTerminalRef) {
      store.connectTerminal(pendingTerminalRef, hole);
      setPendingTerminalRef(null);
      store.setPendingHole(null);
      return;
    }

    if (!store.pendingHole) {
      store.setPendingHole(hole);
      store.setStatusMessage(`First hole: ${formatHole(hole)}. Click a second hole.`);
      return;
    }

    if (holeRefEquals(store.pendingHole, hole)) {
      store.setPendingHole(null);
      store.setStatusMessage("Selection cleared.");
      return;
    }

    if (store.tool === "wire") {
      store.connectHoles(store.pendingHole, hole);
      store.setPendingHole(null);
    } else {
      const holeA = store.pendingHole;
      store.setPendingHole(null);
      setPendingPlacement({ holeA, holeB: hole, type: store.tool as ComponentType });
      store.setStatusMessage("Fill in component details.");
    }
  };

  const handleTerminalClick = (componentId: string, terminal: "pos" | "neg") => {
    if (store.tool !== "wire") return;
    store.setSelectedWireId(null);
    store.setSelectedComponentId(null);
    if (pendingTerminalRef?.componentId === componentId && pendingTerminalRef?.terminal === terminal) {
      setPendingTerminalRef(null);
      store.setStatusMessage("Terminal deselected.");
      return;
    }
    setPendingTerminalRef({ kind: "terminal", componentId, terminal });
    store.setPendingHole(null);
    store.setStatusMessage(`${terminal === "pos" ? "Positive" : "Negative"} terminal selected. Click a board hole to connect.`);
  };

  return (
    <div className={styles.shell}>
      <div data-print-hide>
      <Ribbon
        projectName={store.project.name}
        tool={store.tool}
        boardType={store.project.board?.type ?? null}
        rows={store.project.board?.rows ?? 14}
        cols={store.project.board?.cols ?? 24}
        canDisconnectWire={Boolean(store.selectedWireId)}
        canRemoveComponent={Boolean(store.selectedComponentId)}
        canUndo={store.past.length > 0}
        canRedo={store.future.length > 0}
        theme={theme}
        onProjectNameChange={store.setProjectName}
        onToolChange={store.setTool}
        onBoardTypeChange={store.setBoardType}
        onResizeBoard={store.resizeProjectBoard}
        onDisconnectSelectedWire={() => {
          if (store.selectedWireId) store.disconnectWire(store.selectedWireId);
        }}
        onRemoveSelectedComponent={() => {
          if (store.selectedComponentId) store.removeComponent(store.selectedComponentId);
        }}
        onUndo={store.undo}
        onRedo={store.redo}
        onSaveProject={store.saveProject}
        onLoadProject={(file) => { void store.loadProject(file); }}
        onNewProject={() => {
          if (store.project.board !== null) {
            setShowNewConfirm(true);
          } else {
            store.newProject();
          }
        }}
        onToggleTheme={toggleTheme}
        canPrint={store.project.board !== null}
        ledSymbolStyle={ledSymbolStyle}
        onToggleLedSymbolStyle={() => setLedSymbolStyle(s => s === "physical" ? "schematic" : "physical")}
        wireColour={store.wireColour}
        wireThickness={store.wireThickness}
        onWireColourChange={store.setWireColour}
        onWireThicknessChange={store.setWireThickness}
      />
      </div>

      <div className={styles.body}>
        <main className={styles.canvas} data-print-canvas>
          {store.project.board === null ? (
            <AddBoard onAdd={store.addBoard} />
          ) : (
            <BoardCanvas
              project={store.project}
              pendingHole={store.pendingHole}
              pendingTerminalRef={pendingTerminalRef}
              selectedWireId={store.selectedWireId}
              selectedComponentId={store.selectedComponentId}
              selectedFreeComponentId={store.selectedFreeComponentId}
              ledSymbolStyle={ledSymbolStyle}
              onHoleClick={handleHoleClick}
              onWireSelect={(id) => {
                store.setSelectedWireId(id);
                store.setSelectedComponentId(null);
                store.setSelectedFreeComponentId(null);
                store.setStatusMessage("Wire selected. Press Delete to remove.");
              }}
              onComponentSelect={(id) => {
                store.setSelectedComponentId(id);
                store.setSelectedWireId(null);
                store.setSelectedFreeComponentId(null);
                store.setStatusMessage("Component selected. Press Delete to remove.");
              }}
              onFreeComponentSelect={(id) => {
                store.setSelectedFreeComponentId(id);
                store.setSelectedComponentId(null);
                store.setSelectedWireId(null);
                store.setStatusMessage("Battery selected. Press Delete to remove.");
              }}
              onBatteryDrop={(x, y, subType) => store.dropBattery(x, y, subType)}
              onTerminalClick={handleTerminalClick}
              onBatteryMove={(id, x, y) => store.moveBattery(id, x, y)}
            />
          )}
        </main>

        <div data-print-hide>
        <Inspector
          project={store.project}
          pendingHole={store.pendingHole}
          selectedWireId={store.selectedWireId}
          selectedComponentId={store.selectedComponentId}
          statusMessage={store.statusMessage}
          onUpdateComponent={store.updateComponent}
          onRecolourWire={store.recolourWire}
          onReThickenWire={store.reThickenWire}
        />
        </div>
      </div>

      {pendingPlacement && (
        <ComponentPopup
          type={pendingPlacement.type}
          defaultLabel={(() => {
            const hint = derivedLabel(pendingPlacement.type, pendingPlacement.holeA, pendingPlacement.holeB);
            return hint || `${pendingPlacement.type.toUpperCase()}-${store.project.components.length + 1}`;
          })()}
          onConfirm={(fields) => {
            store.placeComponent(pendingPlacement.type, pendingPlacement.holeA, pendingPlacement.holeB, fields);
            setPendingPlacement(null);
          }}
          onCancel={() => setPendingPlacement(null)}
        />
      )}

      {showNewConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowNewConfirm(false)}>
          <div className={styles.confirmCard} onClick={e => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Start a new project?</div>
            <div className={styles.confirmMsg}>
              Save the current project first, or discard unsaved changes.
            </div>
            <div className={styles.confirmActions}>
              <button className={styles.confirmSave} onClick={() => {
                store.saveProject();
                store.newProject();
                setShowNewConfirm(false);
              }}>Save &amp; New</button>
              <button className={styles.confirmDiscard} onClick={() => {
                store.newProject();
                setShowNewConfirm(false);
              }}>Discard</button>
              <button className={styles.confirmCancel} onClick={() => setShowNewConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
