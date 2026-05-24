import { useEffect, useRef, useState } from "react";
import { ProjectFile, HoleRef, Component, Wire, FreeComponent, TerminalRef, WireEndpoint, isTerminalRef } from "../../model/types";
import { BATTERY_HEIGHT, BATTERY_WIDTH, BATTERY_POS_TERM_W, BATTERY_POS_TERM_H, BATTERY_NEG_TERM_W, BATTERY_NEG_TERM_H, batteryNegTerminalPos, batteryPosTerminalPos, LIION_WIDTH, LIION_HEIGHT, LIION_CAP_H, LIION_BASE_H, LIION_TERM_W, LIION_TERM_H, liionPosTerminalPos, liionNegTerminalPos } from "../../model/freeComponent";
import { WIRE_PALETTE } from "../../model/wireColors";
import { AWGSize, awgToPx } from "../../model/wireThickness";
import styles from "./BoardCanvas.module.css";

const SPACING = 28;
const PADDING = 28;
const LEFT_PAD = 56; // extra left margin for row number labels
const PAD_RADIUS = 6.5;
const HOLE_RADIUS = 4.2;
const STRIP_WIDTH = 2.5;
const MAX_BODY_LEN = SPACING - 10;

function holeCenter(hole: HoleRef) {
  return {
    x: LEFT_PAD + hole.col * SPACING,
    y: PADDING + hole.row * SPACING
  };
}

function wireEndpointPos(endpoint: WireEndpoint, freeComponents: FreeComponent[]): { x: number; y: number } {
  if (isTerminalRef(endpoint)) {
    const fc = freeComponents.find((c) => c.id === endpoint.componentId);
    if (!fc) return { x: 0, y: 0 };
    if (fc.subType === "18650") {
      return endpoint.terminal === "pos" ? liionPosTerminalPos(fc) : liionNegTerminalPos(fc);
    }
    return endpoint.terminal === "pos" ? batteryPosTerminalPos(fc) : batteryNegTerminalPos(fc);
  }
  return holeCenter(endpoint);
}

function wireColor(wire: Wire, index: number): string {
  return wire.color ?? WIRE_PALETTE[index % WIRE_PALETTE.length];
}

function arcPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lift = Math.max(18, dist * 0.45);
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - lift;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

interface ResistorBodyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected: boolean;
}

function ResistorBody({ from, to, selected }: ResistorBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const bodyLen = Math.min(Math.max(len - 10, 12), MAX_BODY_LEN);

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
      <line x1={-len / 2} y1={0} x2={-bodyLen / 2} y2={0} className={styles.componentLead} />
      <line x1={bodyLen / 2} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <rect x={-bodyLen / 2} y={-5} width={bodyLen} height={10} rx={3}
        fillOpacity={0.85} className={selected ? `${styles.resistorBody} ${styles.selected}` : styles.resistorBody} />
      <line x1={-bodyLen / 3} y1={-5} x2={-bodyLen / 3} y2={5} className={styles.colorBand} style={{ stroke: "#c0392b" }} />
      <line x1={-bodyLen / 9} y1={-5} x2={-bodyLen / 9} y2={5} className={styles.colorBand} style={{ stroke: "#e67e22" }} />
      <line x1={bodyLen / 9} y1={-5} x2={bodyLen / 9} y2={5} className={styles.colorBand} style={{ stroke: "#8e44ad" }} />
      <line x1={bodyLen / 3} y1={-5} x2={bodyLen / 3} y2={5} className={styles.colorBand} style={{ stroke: "#c8a000" }} />
    </g>
  );
}

const LED_COLOURS: Record<string, string> = {
  red: "#ff4040", green: "#40e040", blue: "#4488ff",
  yellow: "#ffee40", white: "#f0f0ff", orange: "#ff8c00",
  ir: "#cc88ff", uv: "#9966ff"
};

function ledColour(value: string): string {
  const key = value.toLowerCase().split(/[\s,]/)[0];
  return LED_COLOURS[key] ?? "#ffcc44";
}

interface LEDBodyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected: boolean;
  value: string;
}

function SchematicLEDBody({ from, to, selected, value }: LEDBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const bodyLen = Math.min(Math.max(len - 10, 12), MAX_BODY_LEN);
  const h = 6;
  const fill = ledColour(value);
  const glow = selected ? `drop-shadow(0 0 5px ${fill})` : undefined;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ filter: glow }}>
      <line x1={-len / 2} y1={0} x2={-bodyLen / 2} y2={0} className={styles.componentLead} />
      <line x1={bodyLen / 2} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <polygon points={`${-bodyLen / 2},${-h} ${-bodyLen / 2},${h} ${bodyLen / 2},0`}
        fill={fill} stroke={selected ? fill : "#00000066"}
        strokeWidth={selected ? 1.5 : 1} fillOpacity={0.85} className={styles.componentHit} />
      <line x1={bodyLen / 2} y1={-h} x2={bodyLen / 2} y2={h}
        stroke={selected ? fill : "#555"} strokeWidth={selected ? 2 : 1.5} />
      <line x1={bodyLen / 2 + 2} y1={-h + 1} x2={bodyLen / 2 + 5} y2={-h - 3}
        stroke={fill} strokeWidth={1} opacity={0.8} />
      <line x1={bodyLen / 2 + 3} y1={-1} x2={bodyLen / 2 + 7} y2={-4}
        stroke={fill} strokeWidth={1} opacity={0.8} />
    </g>
  );
}

function LEDBody({ from, to, selected, value }: LEDBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const fill = ledColour(value);
  const r = Math.min(Math.max((len - 10) / 2, 6), 9);
  const glow = selected ? `drop-shadow(0 0 6px ${fill})` : undefined;
  const clipId = `led-clip-${from.x}-${from.y}-${to.x}-${to.y}`;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ filter: glow }}>
      <defs>
        <clipPath id={clipId}>
          <rect x={-r} y={-r} width={2 * r - 2.5} height={2 * r} />
        </clipPath>
      </defs>
      <line x1={-len / 2} y1={0} x2={-r} y2={0} className={styles.componentLead} />
      <line x1={r} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <circle cx={0} cy={0} r={r} fill={fill}
        stroke={selected ? fill : "#00000055"} strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85} clipPath={`url(#${clipId})`} className={styles.componentHit} />
      <line x1={r - 2.5} y1={-(r - 1)} x2={r - 2.5} y2={r - 1}
        stroke={selected ? fill : "#444"} strokeWidth={selected ? 2 : 1.5} />
      <ellipse cx={-r * 0.28} cy={-r * 0.32} rx={r * 0.32} ry={r * 0.2}
        fill="white" opacity={0.35} clipPath={`url(#${clipId})`} />
    </g>
  );
}

interface TwoHoleBodyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected: boolean;
}

function CapacitorBody({ from, to, selected }: TwoHoleBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const bodyLen = Math.min(Math.max(len - 10, 12), MAX_BODY_LEN);

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`}>
      <line x1={-len / 2} y1={0} x2={-bodyLen / 2} y2={0} className={styles.componentLead} />
      <line x1={bodyLen / 2} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <rect x={-bodyLen / 2} y={-6} width={bodyLen} height={12} rx={6}
        fillOpacity={0.85} className={selected ? `${styles.capacitorBody} ${styles.selected}` : styles.capacitorBody} />
      <line x1={bodyLen / 2 - 4} y1={-6} x2={bodyLen / 2 - 4} y2={6} className={styles.capacitorStripe} />
      <text x={-bodyLen / 2 + 3} y={2} fontSize={5} fill="#a0c4ff" fontFamily="monospace" pointerEvents="none">+</text>
    </g>
  );
}

function DiodeBody({ from, to, selected }: TwoHoleBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const bodyLen = Math.min(Math.max(len - 10, 12), MAX_BODY_LEN);
  const glow = selected ? "drop-shadow(0 0 4px #60a5fa)" : undefined;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ filter: glow }}>
      <line x1={-len / 2} y1={0} x2={-bodyLen / 2} y2={0} className={styles.componentLead} />
      <line x1={bodyLen / 2} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <rect x={-bodyLen / 2} y={-4} width={bodyLen} height={8} rx={2}
        fill="#2a2a2a" stroke={selected ? "#60a5fa" : "#555"} strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85} className={styles.componentHit} />
      <line x1={bodyLen / 2 - 3} y1={-4} x2={bodyLen / 2 - 3} y2={4}
        stroke={selected ? "#60a5fa" : "#aaaaaa"} strokeWidth={2} />
    </g>
  );
}

function InductorBody({ from, to, selected }: TwoHoleBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const bodyLen = Math.min(Math.max(len - 10, 12), MAX_BODY_LEN);
  const glow = selected ? "drop-shadow(0 0 4px #fbbf24)" : undefined;
  const humpR = bodyLen / 6;
  const h1 = -bodyLen / 3 + humpR;
  const h2 = 0;
  const h3 = bodyLen / 3 - humpR;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ filter: glow }}>
      <line x1={-len / 2} y1={0} x2={-bodyLen / 2} y2={0} className={styles.componentLead} />
      <line x1={bodyLen / 2} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <rect x={-bodyLen / 2} y={-5} width={bodyLen} height={10} rx={3}
        fill="#7a3010" stroke={selected ? "#fbbf24" : "#5a2008"} strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85} className={styles.componentHit} />
      {[h1, h2, h3].map((hx, i) => (
        <path key={i} d={`M ${hx - humpR} 0 A ${humpR} ${humpR} 0 0 1 ${hx + humpR} 0`}
          fill="none" stroke={selected ? "#fbbf24" : "#c07840"} strokeWidth={1.2} />
      ))}
    </g>
  );
}

function CrystalBody({ from, to, selected }: TwoHoleBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const bodyLen = Math.min(Math.max(len - 10, 12), MAX_BODY_LEN);
  const glow = selected ? "drop-shadow(0 0 4px #e2e8f0)" : undefined;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ filter: glow }}>
      <line x1={-len / 2} y1={0} x2={-bodyLen / 2} y2={0} className={styles.componentLead} />
      <line x1={bodyLen / 2} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <rect x={-bodyLen / 2} y={-5} width={bodyLen} height={10} rx={2}
        fill="#c0c0c0" stroke={selected ? "#e2e8f0" : "#888"} strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85} className={styles.componentHit} />
      <line x1={-bodyLen / 2 + 2} y1={0} x2={bodyLen / 2 - 2} y2={0}
        stroke={selected ? "#e2e8f0" : "#999"} strokeWidth={0.8} opacity={0.7} />
    </g>
  );
}

function ICBody({ from, to, selected }: TwoHoleBodyProps) {
  const left   = Math.min(from.x, to.x);
  const right  = Math.max(from.x, to.x);
  const top    = Math.min(from.y, to.y);
  const bottom = Math.max(from.y, to.y);
  const pinsPerSide = Math.round((bottom - top) / SPACING) + 1;
  const pinYs = Array.from({ length: pinsPerSide }, (_, i) =>
    top + i * ((bottom - top) / Math.max(pinsPerSide - 1, 1))
  );
  const bodyPad = 4;
  const glow = selected ? "drop-shadow(0 0 5px #a78bfa)" : undefined;
  const strokeCol = selected ? "#a78bfa" : "#444";

  return (
    <g style={{ filter: glow }}>
      {pinYs.map((py, i) => (
        <line key={`lp-${i}`} x1={left - 6} y1={py} x2={left} y2={py} stroke={strokeCol} strokeWidth={1.5} />
      ))}
      {pinYs.map((py, i) => (
        <line key={`rp-${i}`} x1={right} y1={py} x2={right + 6} y2={py} stroke={strokeCol} strokeWidth={1.5} />
      ))}
      <rect x={left + bodyPad} y={top - bodyPad} width={right - left - bodyPad * 2} height={bottom - top + bodyPad * 2}
        rx={2} fill="#1a1a1a" stroke={strokeCol} strokeWidth={selected ? 1.5 : 1} className={styles.componentHit} />
      <path d={`M ${left + bodyPad + 1} ${top - bodyPad} a 4 4 0 0 1 8 0`}
        fill="#111" stroke={strokeCol} strokeWidth={0.8} />
      {pinYs.map((py, i) => (
        <rect key={`ls-${i}`} x={left + bodyPad - 3} y={py - 1.5} width={3} height={3}
          fill={selected ? "#a78bfa" : "#555"} />
      ))}
      {pinYs.map((py, i) => (
        <rect key={`rs-${i}`} x={right - bodyPad} y={py - 1.5} width={3} height={3}
          fill={selected ? "#a78bfa" : "#555"} />
      ))}
    </g>
  );
}

function ConnectorBody({ from, to, selected }: TwoHoleBodyProps) {
  const horizontal = Math.abs(from.y - to.y) < SPACING / 2;
  const x1 = Math.min(from.x, to.x);
  const x2 = Math.max(from.x, to.x);
  const y1 = Math.min(from.y, to.y);
  const y2 = Math.max(from.y, to.y);
  const pinCount = horizontal
    ? Math.round((x2 - x1) / SPACING) + 1
    : Math.round((y2 - y1) / SPACING) + 1;
  const h = 5;
  const glow = selected ? "drop-shadow(0 0 4px #fbbf24)" : undefined;
  const pins = Array.from({ length: pinCount }, (_, i) =>
    horizontal
      ? { x: x1 + i * SPACING, y: (from.y + to.y) / 2 }
      : { x: (from.x + to.x) / 2, y: y1 + i * SPACING }
  );

  return (
    <g style={{ filter: glow }}>
      {horizontal
        ? <rect x={x1 - h} y={y1 - h} width={x2 - x1 + h * 2} height={h * 2}
            rx={1.5} fill="#333" stroke={selected ? "#fbbf24" : "#555"}
            strokeWidth={selected ? 1.5 : 1} className={styles.componentHit} />
        : <rect x={x1 - h} y={y1 - h} width={h * 2} height={y2 - y1 + h * 2}
            rx={1.5} fill="#333" stroke={selected ? "#fbbf24" : "#555"}
            strokeWidth={selected ? 1.5 : 1} className={styles.componentHit} />
      }
      {pins.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.8}
          fill={selected ? "#fbbf24" : "#b8860b"} stroke="#111" strokeWidth={0.5} />
      ))}
    </g>
  );
}

interface BatteryBodyProps {
  fc: FreeComponent;
  selected: boolean;
  pendingTerminal: "pos" | "neg" | null;
  onSelect: () => void;
  onTerminalClick: (terminal: "pos" | "neg") => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

function BatteryBody({ fc, selected, pendingTerminal, onSelect, onTerminalClick, onMouseDown }: BatteryBodyProps) {
  const W = BATTERY_WIDTH;
  const H = BATTERY_HEIGHT;
  const bx = fc.x - W / 2;
  const by = fc.y - H / 2;
  const splitH = H * 0.55;
  const posPos = batteryPosTerminalPos(fc);
  const negPos = batteryNegTerminalPos(fc);

  return (
    <g>
      {/* Body — white lower section base */}
      <rect x={bx} y={by} width={W} height={H} rx={4}
        fill="#f0f0f0" stroke={selected ? "#60b4ff" : "#555"}
        strokeWidth={selected ? 2 : 1}
        onMouseDown={onMouseDown}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        style={{ cursor: "move" }}
        className={styles.componentHit}
      />
      {/* Blue upper section */}
      <rect x={bx} y={by} width={W} height={splitH} rx={4}
        fill="#1a5fb4"
        onMouseDown={onMouseDown}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        style={{ cursor: "move" }}
      />
      {/* Fix blue bottom corners overlapping white */}
      <rect x={bx} y={by + splitH - 4} width={W} height={4} fill="#1a5fb4" />
      {/* Divider */}
      <line x1={bx} y1={by + splitH} x2={bx + W} y2={by + splitH}
        stroke="#aaaaaa" strokeWidth={0.8} pointerEvents="none" />
      {/* "HW" logo */}
      <text x={fc.x} y={by + splitH * 0.28} textAnchor="middle" dominantBaseline="middle"
        fontSize={8} fontWeight="bold" fill="white" pointerEvents="none" fontFamily="sans-serif">
        HW
      </text>
      {/* "Hi-Watt" subtitle */}
      <text x={fc.x} y={by + splitH * 0.52} textAnchor="middle" dominantBaseline="middle"
        fontSize={4} fill="#c8e0ff" pointerEvents="none" fontFamily="sans-serif">
        Hi-Watt
      </text>
      {/* Voltage label */}
      <text x={fc.x} y={by + splitH + (H * 0.45) * 0.45} textAnchor="middle" dominantBaseline="middle"
        fontSize={8} fontWeight="bold" fill="#1a1a1a" pointerEvents="none" fontFamily="sans-serif">
        {fc.value}
      </text>
      {/* "GENERAL PURPOSE" tiny text */}
      <text x={fc.x} y={by + splitH + (H * 0.45) * 0.78} textAnchor="middle" dominantBaseline="middle"
        fontSize={3} fill="#555" pointerEvents="none" fontFamily="sans-serif" letterSpacing={0.3}>
        GENERAL PURPOSE
      </text>

      {/* Positive terminal — narrow rectangle protruding above body */}
      <rect
        x={posPos.x - BATTERY_POS_TERM_W / 2}
        y={posPos.y - BATTERY_POS_TERM_H / 2}
        width={BATTERY_POS_TERM_W}
        height={BATTERY_POS_TERM_H}
        rx={1.5}
        fill="#d0d0d0" stroke={pendingTerminal === "pos" ? "#44ff88" : "#888"}
        strokeWidth={pendingTerminal === "pos" ? 2 : 0.8}
        onClick={(e) => { e.stopPropagation(); onTerminalClick("pos"); }}
        style={{ cursor: "crosshair" }}
        className={styles.componentHit}
      />
      <text x={posPos.x} y={posPos.y} textAnchor="middle" dominantBaseline="middle"
        fontSize={5} fontWeight="bold" fill="#333" pointerEvents="none">+</text>

      {/* Negative terminal — wider rectangle protruding above body */}
      <rect
        x={negPos.x - BATTERY_NEG_TERM_W / 2}
        y={negPos.y - BATTERY_NEG_TERM_H / 2}
        width={BATTERY_NEG_TERM_W}
        height={BATTERY_NEG_TERM_H}
        rx={1.5}
        fill="#d0d0d0" stroke={pendingTerminal === "neg" ? "#44ff88" : "#888"}
        strokeWidth={pendingTerminal === "neg" ? 2 : 0.8}
        onClick={(e) => { e.stopPropagation(); onTerminalClick("neg"); }}
        style={{ cursor: "crosshair" }}
        className={styles.componentHit}
      />
      <text x={negPos.x} y={negPos.y} textAnchor="middle" dominantBaseline="middle"
        fontSize={5} fontWeight="bold" fill="#555" pointerEvents="none">−</text>

      {/* Component label */}
      <text x={fc.x} y={by - 8} textAnchor="middle" className={styles.componentLabel}>
        {fc.label}
      </text>

      {/* Selection outline */}
      {selected && (
        <rect x={bx - 3} y={by - BATTERY_POS_TERM_H - 10} width={W + 6} height={H + BATTERY_POS_TERM_H + 13} rx={6}
          fill="none" stroke="#60b4ff" strokeWidth={1.5} opacity={0.5} strokeDasharray="3 2"
          pointerEvents="none" />
      )}
    </g>
  );
}

function LiIonBatteryBody({ fc, selected, pendingTerminal, onSelect, onTerminalClick, onMouseDown }: BatteryBodyProps) {
  const W = LIION_WIDTH;
  const H = LIION_HEIGHT;
  const bx = fc.x - W / 2;
  const by = fc.y - H / 2;
  const posPos = liionPosTerminalPos(fc);
  const negPos = liionNegTerminalPos(fc);

  return (
    <g>
      {/* Main body — rectangle with slight rounding */}
      <rect x={bx} y={by} width={W} height={H} rx={4}
        fill="#1e7bd4" stroke={selected ? "#60b4ff" : "#1565b0"}
        strokeWidth={selected ? 2 : 1}
        onMouseDown={onMouseDown}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        style={{ cursor: "move" }}
        className={styles.componentHit}
      />
      {/* Top cap — lighter blue */}
      <rect x={bx} y={by} width={W} height={LIION_CAP_H} rx={4}
        fill="#3a9ae8"
        onMouseDown={onMouseDown}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        style={{ cursor: "move" }}
        pointerEvents="none"
      />
      {/* Bottom base — darker blue */}
      <rect x={bx} y={by + H - LIION_BASE_H} width={W} height={LIION_BASE_H} rx={4}
        fill="#1565b0" pointerEvents="none" />
      {/* Model label */}
      <text x={fc.x} y={by + H * 0.35} textAnchor="middle" dominantBaseline="middle"
        fontSize={7} fontWeight="bold" fill="white" pointerEvents="none" fontFamily="sans-serif">
        18650
      </text>
      {/* Voltage label */}
      <text x={fc.x} y={by + H * 0.52} textAnchor="middle" dominantBaseline="middle"
        fontSize={7} fontWeight="bold" fill="white" pointerEvents="none" fontFamily="sans-serif">
        {fc.value}
      </text>
      {/* Li-Ion label */}
      <text x={fc.x} y={by + H * 0.68} textAnchor="middle" dominantBaseline="middle"
        fontSize={5} fill="#a8d4f8" pointerEvents="none" fontFamily="sans-serif">
        Li-Ion
      </text>

      {/* Positive terminal — rect above top cap */}
      <rect
        x={posPos.x - LIION_TERM_W / 2}
        y={posPos.y - LIION_TERM_H / 2}
        width={LIION_TERM_W}
        height={LIION_TERM_H}
        rx={2}
        fill="#d0d0d0" stroke={pendingTerminal === "pos" ? "#44ff88" : "#888"}
        strokeWidth={pendingTerminal === "pos" ? 2 : 0.8}
        onClick={(e) => { e.stopPropagation(); onTerminalClick("pos"); }}
        style={{ cursor: "crosshair" }}
        className={styles.componentHit}
      />
      <text x={posPos.x} y={posPos.y} textAnchor="middle" dominantBaseline="middle"
        fontSize={5} fontWeight="bold" fill="#333" pointerEvents="none">+</text>

      {/* Negative terminal — rect below base */}
      <rect
        x={negPos.x - LIION_TERM_W / 2}
        y={negPos.y - LIION_TERM_H / 2}
        width={LIION_TERM_W}
        height={LIION_TERM_H}
        rx={2}
        fill="#d0d0d0" stroke={pendingTerminal === "neg" ? "#44ff88" : "#888"}
        strokeWidth={pendingTerminal === "neg" ? 2 : 0.8}
        onClick={(e) => { e.stopPropagation(); onTerminalClick("neg"); }}
        style={{ cursor: "crosshair" }}
        className={styles.componentHit}
      />
      <text x={negPos.x} y={negPos.y} textAnchor="middle" dominantBaseline="middle"
        fontSize={5} fontWeight="bold" fill="#555" pointerEvents="none">−</text>

      {/* Component label */}
      <text x={fc.x} y={by - 8} textAnchor="middle" className={styles.componentLabel}>
        {fc.label}
      </text>

      {/* Selection outline */}
      {selected && (
        <rect x={bx - 3} y={by - LIION_TERM_H - 8} width={W + 6} height={H + LIION_TERM_H * 2 + 12} rx={6}
          fill="none" stroke="#60b4ff" strokeWidth={1.5} opacity={0.5} strokeDasharray="3 2"
          pointerEvents="none" />
      )}
    </g>
  );
}

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
  if (!project.board) return null;

  const { rows, cols, type: boardType } = project.board;
  const width = LEFT_PAD + PADDING + (cols - 1) * SPACING;
  const height = PADDING * 2 + (rows - 1) * SPACING;

  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; origPanX: number; origPanY: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ id: string; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(0.85);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // ViewBox calculation — zoom by shrinking the visible region
  const vbW = width / zoom;
  const vbH = height / zoom;
  const vbX = (width - vbW) / 2 + panX;
  const vbY = (height - vbH) / 2 + panY;

  function clampZoom(z: number) {
    return Math.min(8, Math.max(0.15, parseFloat(z.toFixed(4))));
  }

  function changeZoom(factor: number) {
    setZoom((z) => clampZoom(z * factor));
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
  }, []);

  // Keyboard zoom shortcuts — scoped to when the canvas wrap is in the DOM
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (!wrapRef.current) return;
      if (e.key === "=" || e.key === "+") { e.preventDefault(); changeZoom(1.25); }
      else if (e.key === "-") { e.preventDefault(); changeZoom(1 / 1.25); }
      else if (e.key === "0") { e.preventDefault(); setZoom(0.85); setPanX(0); setPanY(0); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function clientToSvg(clientX: number, clientY: number): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: clientX, y: clientY };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width * vbW + vbX,
      y: (clientY - rect.top) / rect.height * vbH + vbY,
    };
  }

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

  function handleBatteryMouseDown(e: React.MouseEvent, fc: FreeComponent) {
    e.stopPropagation();
    dragRef.current = {
      id: fc.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: fc.x,
      origY: fc.y
    };
    setDragPos({ id: fc.id, x: fc.x, y: fc.y });
  }

  function handleWorkspaceMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    panRef.current = { startX: e.clientX, startY: e.clientY, origPanX: panX, origPanY: panY };
  }

  function handleSvgMouseMove(e: React.MouseEvent) {
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      setDragPos({
        id: dragRef.current.id,
        x: dragRef.current.origX + dx * (vbW / rect.width),
        y: dragRef.current.origY + dy * (vbH / rect.height),
      });
    } else if (panRef.current) {
      const dx = e.clientX - panRef.current.startX;
      const dy = e.clientY - panRef.current.startY;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      setPanX(panRef.current.origPanX - dx * (vbW / rect.width));
      setPanY(panRef.current.origPanY - dy * (vbH / rect.height));
    }
  }

  function handleSvgMouseUp() {
    if (dragRef.current && dragPos) {
      onBatteryMove(dragRef.current.id, dragPos.x, dragPos.y);
    }
    dragRef.current = null;
    panRef.current = null;
    setDragPos(null);
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
      {/* Zoom controls */}
      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={() => changeZoom(1.25)} title="Zoom in (Ctrl+scroll)">+</button>
        <span className={styles.zoomLabel}>{Math.round(zoom * 100)}%</span>
        <button className={styles.zoomBtn} onClick={() => changeZoom(1 / 1.25)} title="Zoom out (Ctrl+scroll)">−</button>
        <button className={styles.zoomBtn} onClick={() => { setZoom(0.85); setPanX(0); setPanY(0); }} title="Reset zoom">⊡</button>
      </div>

      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        role="img"
        aria-label="Veroboard canvas"
        onMouseMove={handleSvgMouseMove}
        onMouseUp={handleSvgMouseUp}
        onMouseLeave={handleSvgMouseUp}
      >
        {/* Off-board workspace — large rect to cover all pan positions */}
        <rect x={-5000} y={-5000} width={10000} height={10000} className={styles.workspace}
          onMouseDown={handleWorkspaceMouseDown} style={{ cursor: "grab" }} />

        {/* Board surface */}
        <rect x={0} y={0} width={width} height={height} rx={6} className={styles.boardSurface} />
        <rect x={0.75} y={0.75} width={width - 1.5} height={height - 1.5} rx={5.5} className={styles.boardEdge} />

        {/* Copper strips — stripboard only */}
        {boardType === "stripboard" && Array.from({ length: rows }, (_, row) => {
          const y = PADDING + row * SPACING;
          const x1 = LEFT_PAD - PAD_RADIUS - 2;
          const x2 = LEFT_PAD + (cols - 1) * SPACING + PAD_RADIUS + 2;
          return (
            <line key={`strip-${row}`} x1={x1} y1={y} x2={x2} y2={y}
              className={styles.copperStrip} strokeWidth={STRIP_WIDTH} />
          );
        })}

        {/* Row labels */}
        {Array.from({ length: rows }, (_, row) => (
          <text key={`rl-${row}`} x={LEFT_PAD - 12} y={PADDING + row * SPACING + 4} textAnchor="end" className={styles.axisLabel}>
            {row + 1}
          </text>
        ))}

        {/* Column labels */}
        {Array.from({ length: cols }, (_, col) => (
          <text key={`cl-${col}`} x={LEFT_PAD + col * SPACING} y={18} className={styles.axisLabel} textAnchor="middle">
            {col + 1}
          </text>
        ))}

        {/* Copper pads + holes */}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const hole: HoleRef = { row, col };
            const { x, y } = holeCenter(hole);
            const isPending = pendingHole?.row === row && pendingHole?.col === col;
            return (
              <g key={`${row}-${col}`} onClick={() => onHoleClick(hole)} className={styles.holeGroup}>
                <circle cx={x} cy={y} r={PAD_RADIUS}
                  className={
                    isPending
                      ? `${boardType === "perfboard" ? styles.padPerfboard : styles.pad} ${styles.padPending}`
                      : boardType === "perfboard" ? styles.padPerfboard : styles.pad
                  } />
                <circle cx={x} cy={y} r={HOLE_RADIUS}
                  className={styles.hole}
                  data-testid={`hole-${row}-${col}`} />
              </g>
            );
          })
        )}

        {/* Wires */}
        {project.wires.map((wire, i) => {
          const from = wireEndpointPos(wire.from, project.freeComponents);
          const to = wireEndpointPos(wire.to, project.freeComponents);
          const color = wireColor(wire, i);
          const selected = wire.id === selectedWireId;
          const baseW = awgToPx(wire.thickness as AWGSize | undefined);
          return (
            <g key={wire.id}>
              <path d={arcPath(from, to)} fill="none" stroke={color} strokeWidth={selected ? baseW + 1.5 : baseW}
                strokeLinecap="round" opacity={selected ? 1 : 0.85}
                className={selected ? styles.wireSelected : styles.wire} />
              <path d={arcPath(from, to)} fill="none" stroke="transparent" strokeWidth={12}
                className={styles.wireHit}
                data-testid={`wire-${wire.id}`}
                onClick={(e) => { e.stopPropagation(); onWireSelect(wire.id); }} />
            </g>
          );
        })}

        {/* Grid components */}
        {project.components.map((component: Component) => {
          const from = holeCenter(component.holeA);
          const to = holeCenter(component.holeB);
          const selected = component.id === selectedComponentId;
          return (
            <g key={component.id} className={styles.componentHit}
              data-testid={`component-${component.id}`}
              onClick={(e) => { e.stopPropagation(); onComponentSelect(component.id); }}
            >
              {component.type === "resistor"
                ? <ResistorBody from={from} to={to} selected={selected} />
                : component.type === "capacitor"
                ? <CapacitorBody from={from} to={to} selected={selected} />
                : component.type === "diode"
                ? <DiodeBody from={from} to={to} selected={selected} />
                : component.type === "inductor"
                ? <InductorBody from={from} to={to} selected={selected} />
                : component.type === "crystal"
                ? <CrystalBody from={from} to={to} selected={selected} />
                : component.type === "ic"
                ? <ICBody from={from} to={to} selected={selected} />
                : component.type === "connector"
                ? <ConnectorBody from={from} to={to} selected={selected} />
                : component.type === "led"
                ? ledSymbolStyle === "schematic"
                  ? <SchematicLEDBody from={from} to={to} selected={selected} value={component.value} />
                  : <LEDBody from={from} to={to} selected={selected} value={component.value} />
                : <CapacitorBody from={from} to={to} selected={selected} />}
              <text x={(from.x + to.x) / 2} y={Math.min(from.y, to.y) - 10}
                className={styles.componentLabel} textAnchor="middle">
                {component.label}
              </text>
            </g>
          );
        })}

        {/* Free components (batteries) */}
        {displayedFreeComponents.map((fc) => {
          const selected = fc.id === selectedFreeComponentId;
          const ptRef = pendingTerminalRef?.componentId === fc.id ? pendingTerminalRef.terminal : null;
          const bodyProps = {
            key: fc.id,
            fc,
            selected,
            pendingTerminal: ptRef,
            onSelect: () => onFreeComponentSelect(fc.id),
            onTerminalClick: (terminal: "pos" | "neg") => onTerminalClick(fc.id, terminal),
            onMouseDown: (e: React.MouseEvent) => handleBatteryMouseDown(e, fc),
          };
          return fc.subType === "18650"
            ? <LiIonBatteryBody {...bodyProps} />
            : <BatteryBody {...bodyProps} />;
        })}
      </svg>
    </div>
  );
}
