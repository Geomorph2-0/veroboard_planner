import { useEffect, useRef, useState, RefObject } from "react";

interface UseZoomPanArgs {
  wrapRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  width: number;
  height: number;
}

interface UseZoomPanResult {
  zoom: number;
  vbW: number;
  vbH: number;
  vbX: number;
  vbY: number;
  viewBox: string;
  changeZoom: (factor: number) => void;
  reset: () => void;
  clientToSvg: (clientX: number, clientY: number) => { x: number; y: number };
  handleWorkspaceMouseDown: (e: React.MouseEvent) => void;
  handlePanMove: (e: React.MouseEvent) => void;
  handlePanEnd: () => void;
}

function clampZoom(z: number): number {
  return Math.min(8, Math.max(0.15, parseFloat(z.toFixed(4))));
}

export function useZoomPan({ wrapRef, svgRef, width, height }: UseZoomPanArgs): UseZoomPanResult {
  const [zoom, setZoom] = useState(0.85);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const panRef = useRef<{ startX: number; startY: number; origPanX: number; origPanY: number } | null>(null);

  function changeZoom(factor: number) {
    setZoom((z) => clampZoom(z * factor));
  }

  function reset() {
    setZoom(0.85);
    setPanX(0);
    setPanY(0);
  }

  // Non-passive wheel listener — must be direct DOM to call preventDefault() reliably
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(z * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wrapRef]);

  // Keyboard zoom shortcuts — scoped to when the canvas wrap is in the DOM
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (!wrapRef.current) return;
      if (e.key === "=" || e.key === "+") { e.preventDefault(); changeZoom(1.25); }
      else if (e.key === "-") { e.preventDefault(); changeZoom(1 / 1.25); }
      else if (e.key === "0") { e.preventDefault(); reset(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapRef]);

  // ViewBox calculation — zoom by shrinking the visible region
  const vbW = width / zoom;
  const vbH = height / zoom;
  const vbX = (width - vbW) / 2 + panX;
  const vbY = (height - vbH) / 2 + panY;

  function clientToSvg(clientX: number, clientY: number): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width * vbW + vbX,
      y: (clientY - rect.top) / rect.height * vbH + vbY,
    };
  }

  function handleWorkspaceMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    panRef.current = { startX: e.clientX, startY: e.clientY, origPanX: panX, origPanY: panY };
  }

  function handlePanMove(e: React.MouseEvent) {
    if (!panRef.current) return;
    const dx = e.clientX - panRef.current.startX;
    const dy = e.clientY - panRef.current.startY;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setPanX(panRef.current.origPanX - dx * (vbW / rect.width));
    setPanY(panRef.current.origPanY - dy * (vbH / rect.height));
  }

  function handlePanEnd() {
    panRef.current = null;
  }

  return {
    zoom, vbW, vbH, vbX, vbY,
    viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
    changeZoom, reset, clientToSvg,
    handleWorkspaceMouseDown, handlePanMove, handlePanEnd,
  };
}
