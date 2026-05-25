import {
  BATTERY_HEIGHT,
  BATTERY_WIDTH,
  BATTERY_POS_TERM_W,
  BATTERY_POS_TERM_H,
  BATTERY_NEG_TERM_W,
  BATTERY_NEG_TERM_H,
  batteryNegTerminalPos,
  batteryPosTerminalPos,
} from "../../../model/freeComponent";
import styles from "../BoardCanvas.module.css";
import type { BatteryBodyProps } from "./types";

export function BatteryBody({ fc, selected, pendingTerminal, onSelect, onTerminalClick, onMouseDown }: BatteryBodyProps) {
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
