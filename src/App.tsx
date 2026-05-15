import { useState, useEffect } from "react";
import { AddBoard } from "./components/AddBoard/AddBoard";
import { BoardCanvas } from "./components/BoardCanvas/BoardCanvas";
import { ComponentPopup } from "./components/ComponentPopup/ComponentPopup";
import { Inspector } from "./components/Inspector/Inspector";
import { Ribbon } from "./components/Ribbon/Ribbon";
import { holeRefEquals } from "./model/board";
import { ComponentType, HoleRef } from "./model/types";
import { usePlannerStore } from "./state/store";
import styles from "./App.module.css";

function formatHole(hole: HoleRef): string {
  return `row ${hole.row + 1}, col ${hole.col + 1}`;
}

export default function App() {
  const store = usePlannerStore();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [ledSymbolStyle, setLedSymbolStyle] = useState<"physical" | "schematic">("physical");
  const [pendingPlacement, setPendingPlacement] = useState<{ holeA: HoleRef; holeB: HoleRef; type: ComponentType } | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        const { selectedWireId, selectedComponentId, disconnectWire, removeComponent } = usePlannerStore.getState();
        if (selectedWireId) disconnectWire(selectedWireId);
        else if (selectedComponentId) removeComponent(selectedComponentId);
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
        onNewProject={store.newProject}
        onToggleTheme={toggleTheme}
        ledSymbolStyle={ledSymbolStyle}
        onToggleLedSymbolStyle={() => setLedSymbolStyle(s => s === "physical" ? "schematic" : "physical")}
        wireColour={store.wireColour}
        onWireColourChange={store.setWireColour}
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
              selectedWireId={store.selectedWireId}
              selectedComponentId={store.selectedComponentId}
              ledSymbolStyle={ledSymbolStyle}
              onHoleClick={handleHoleClick}
              onWireSelect={(id) => {
                store.setSelectedWireId(id);
                store.setSelectedComponentId(null);
                store.setStatusMessage("Wire selected. Press Delete to remove.");
              }}
              onComponentSelect={(id) => {
                store.setSelectedComponentId(id);
                store.setSelectedWireId(null);
                store.setStatusMessage("Component selected. Press Delete to remove.");
              }}
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
        />
        </div>
      </div>

      {pendingPlacement && (
        <ComponentPopup
          type={pendingPlacement.type}
          defaultLabel={`${pendingPlacement.type.toUpperCase()}-${store.project.components.length + 1}`}
          onConfirm={(fields) => {
            store.placeComponent(pendingPlacement.type, pendingPlacement.holeA, pendingPlacement.holeB, fields);
            setPendingPlacement(null);
          }}
          onCancel={() => setPendingPlacement(null)}
        />
      )}
    </div>
  );
}
