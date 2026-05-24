import styles from "../BoardCanvas.module.css";
import { SPACING } from "../constants";
import type { TwoHoleBodyProps } from "./types";

export function ConnectorBody({ from, to, selected }: TwoHoleBodyProps) {
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
