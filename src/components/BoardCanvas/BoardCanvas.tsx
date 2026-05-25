import { useRef } from "react";
import { ProjectFile, HoleRef, TerminalRef } from "../../model/types";
import styles from "./BoardCanvas.module.css";
import { SPACING, PADDING, LEFT_PAD } from "./constants";
import { ZoomControls } from "./parts/ZoomControls";
import { BoardSurface } from "./parts/BoardSurface";
import { WireLayer } from "./parts/WireLayer";
import { ComponentLayer } from "./parts/ComponentLayer";
import { FreeComponentLayer } from "./parts/FreeComponentLayer";
import { useZoomPan } from "./hooks/useZoomPan";
import { useBatteryDrag } from "./hooks/useBatteryDrag";

interface BoardCanvasProps {
  project: ProjectFile;
  pendingHole: HoleRef | null;
  pendingTerminalRef: TerminalRef | null;
  selectedWireId: string | null;
  selectedComponentId: string | null;
  selectedFreeComponentId: string | null;
  ledSymbolStyle: "physical" | "schematic";
  onHoleClick: (hole: HoleRef) => void;
  onWireSelect: (wireId: string) => void;
  onComponentSelect: (componentId: string) => void;
  onFreeComponentSelect: (id: string) => void;
  onBatteryDrop: (x: number, y: number, subType?: "9v" | "18650") => void;
  onTerminalClick: (componentId: string, terminal: "pos" | "neg") => void;
  onBatteryMove: (id: string, x: number, y: number) => void;
}

export function BoardCanvas({
  project,
  pendingHole,
  pendingTerminalRef,
  selectedWireId,
  selectedComponentId,
  selectedFreeComponentId,
  ledSymbolStyle,
  onHoleClick,
  onWireSelect,
  onComponentSelect,
  onFreeComponentSelect,
  onBatteryDrop,
  onTerminalClick,
  onBatteryMove
}: BoardCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Width/height derived from board; fallback to 1 when board is null so hook order stays stable.
  const board = project.board;
  const rows = board?.rows ?? 1;
  const cols = board?.cols ?? 1;
  const boardType = board?.type ?? "stripboard";
  const width = LEFT_PAD + PADDING + (cols - 1) * SPACING;
  const height = PADDING * 2 + (rows - 1) * SPACING;

  const {
    zoom, vbW, vbH, viewBox,
    changeZoom, reset: resetZoom, clientToSvg,
    handleWorkspaceMouseDown, handlePanMove, handlePanEnd, hasPanned,
  } = useZoomPan({ wrapRef, svgRef, width, height });

  const {
    dragPos, handleBatteryMouseDown, handleDragMove, handleDragEnd,
  } = useBatteryDrag({ svgRef, vbW, vbH, onBatteryMove });

  // Early return AFTER all hook calls (Rules of Hooks)
  if (!board) return null;

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const tool = e.dataTransfer.getData("tool");
    if (tool !== "battery-9v" && tool !== "battery-18650") return;
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    onBatteryDrop(x, y, tool === "battery-18650" ? "18650" : "9v");
  }

  function handleSvgMouseMove(e: React.MouseEvent) {
    // Drag takes priority; fall through to pan when no drag is active.
    if (!handleDragMove(e)) handlePanMove(e);
  }

  function handleSvgMouseUp() {
    handleDragEnd();
    handlePanEnd();
  }

  // Merge live drag position into free components for rendering
  const displayedFreeComponents = project.freeComponents.map((fc) =>
    dragPos && dragPos.id === fc.id ? { ...fc, x: dragPos.x, y: dragPos.y } : fc
  );

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ZoomControls
        zoom={zoom}
        onZoomIn={() => changeZoom(1.25)}
        onZoomOut={() => changeZoom(1 / 1.25)}
        onReset={resetZoom}
      />

      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={viewBox}
        role="img"
        aria-label="Veroboard canvas"
        onMouseDown={handleWorkspaceMouseDown}
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
      >
        {/* Off-board workspace — large rect to cover all pan positions */}
        <rect x={-5000} y={-5000} width={10000} height={10000} className={styles.workspace} style={{ cursor: "grab" }} />

        <BoardSurface
          rows={rows} cols={cols} boardType={boardType}
          width={width} height={height}
          pendingHole={pendingHole}
          onHoleClick={(hole) => { if (!hasPanned()) onHoleClick(hole); }}
        />

        <WireLayer
          wires={project.wires} freeComponents={project.freeComponents}
          selectedWireId={selectedWireId} onWireSelect={onWireSelect}
        />

        <ComponentLayer
          components={project.components} ledSymbolStyle={ledSymbolStyle}
          selectedComponentId={selectedComponentId} onComponentSelect={onComponentSelect}
        />

        <FreeComponentLayer
          freeComponents={displayedFreeComponents}
          selectedFreeComponentId={selectedFreeComponentId}
          pendingTerminalRef={pendingTerminalRef}
          onFreeComponentSelect={onFreeComponentSelect}
          onTerminalClick={onTerminalClick}
          onBatteryMouseDown={handleBatteryMouseDown}
        />
      </svg>
    </div>
  );
}
