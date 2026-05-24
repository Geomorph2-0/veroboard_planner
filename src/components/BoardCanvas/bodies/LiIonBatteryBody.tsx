import {
  LIION_WIDTH,
  LIION_HEIGHT,
  LIION_CAP_H,
  LIION_BASE_H,
  LIION_TERM_W,
  LIION_TERM_H,
  liionPosTerminalPos,
  liionNegTerminalPos,
} from "../../../model/freeComponent";
import styles from "../BoardCanvas.module.css";
import type { BatteryBodyProps } from "./BatteryBody";

export function LiIonBatteryBody({ fc, selected, pendingTerminal, onSelect, onTerminalClick, onMouseDown }: BatteryBodyProps) {
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
