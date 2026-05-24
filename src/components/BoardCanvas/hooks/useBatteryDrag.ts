import { useRef, useState, RefObject } from "react";
import { FreeComponent } from "../../../model/types";

interface UseBatteryDragArgs {
  svgRef: RefObject<SVGSVGElement | null>;
  vbW: number;
  vbH: number;
  onBatteryMove: (id: string, x: number, y: number) => void;
}

interface UseBatteryDragResult {
  dragPos: { id: string; x: number; y: number } | null;
  isDragging: boolean;
  handleBatteryMouseDown: (e: React.MouseEvent, fc: FreeComponent) => void;
  /** Drag-move branch. Returns true if a drag was active (so the caller can skip pan). */
  handleDragMove: (e: React.MouseEvent) => boolean;
  /** Commits the drag via onBatteryMove if one was in progress. */
  handleDragEnd: () => void;
}

export function useBatteryDrag({ svgRef, vbW, vbH, onBatteryMove }: UseBatteryDragArgs): UseBatteryDragResult {
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);

  function handleBatteryMouseDown(e: React.MouseEvent, fc: FreeComponent) {
    e.stopPropagation();
    dragRef.current = { id: fc.id, startX: e.clientX, startY: e.clientY, origX: fc.x, origY: fc.y };
    setDragPos({ id: fc.id, x: fc.x, y: fc.y });
  }

  function handleDragMove(e: React.MouseEvent): boolean {
    if (!dragRef.current) return false;
    const svg = svgRef.current;
    if (!svg) return true;
    const rect = svg.getBoundingClientRect();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setDragPos({
      id: dragRef.current.id,
      x: dragRef.current.origX + dx * (vbW / rect.width),
      y: dragRef.current.origY + dy * (vbH / rect.height),
    });
    return true;
  }

  function handleDragEnd() {
    if (dragRef.current && dragPos) {
      onBatteryMove(dragRef.current.id, dragPos.x, dragPos.y);
    }
    dragRef.current = null;
    setDragPos(null);
  }

  return {
    dragPos,
    isDragging: dragRef.current !== null,
    handleBatteryMouseDown,
    handleDragMove,
    handleDragEnd,
  };
}
