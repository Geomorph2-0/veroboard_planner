import styles from "../BoardCanvas.module.css";
import { SPACING } from "../constants";
import type { ConnectorBodyProps } from "./types";

export function ConnectorMaleBody({ from, to, selected, subType }: ConnectorBodyProps) {
  const isDouble = subType === "male-double";
  const horizontal = Math.abs(from.y - to.y) < SPACING * 0.75;
  const x1 = Math.min(from.x, to.x);
  const x2 = Math.max(from.x, to.x);
  const y1 = Math.min(from.y, to.y);
  const y2 = Math.max(from.y, to.y);
  const glow = selected ? "drop-shadow(0 0 4px #fbbf24)" : undefined;

  if (isDouble) {
    const cols = Math.round(Math.abs(from.x - to.x) / SPACING) + 1;
    const topY = Math.min(from.y, to.y);
    const botY = Math.max(from.y, to.y);
    const leftX = Math.min(from.x, to.x);
    const h = 5;
    const pins: { x: number; y: number }[] = [];
    for (let i = 0; i < cols; i++) {
      pins.push({ x: leftX + i * SPACING, y: topY });
      pins.push({ x: leftX + i * SPACING, y: botY });
    }
    return (
      <g style={{ filter: glow }}>
        <rect
          x={leftX - h} y={topY - h}
          width={(cols - 1) * SPACING + h * 2} height={botY - topY + h * 2}
          rx={1.5} fill="#222" stroke={selected ? "#fbbf24" : "#555"}
          strokeWidth={selected ? 1.5 : 1} className={styles.componentHit}
        />
        {pins.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5}
              fill={selected ? "#fbbf24" : "#d4980f"} stroke="#111" strokeWidth={0.5} />
          </g>
        ))}
      </g>
    );
  }

  // Single row
  const pinCount = horizontal
    ? Math.round((x2 - x1) / SPACING) + 1
    : Math.round((y2 - y1) / SPACING) + 1;
  const h = 5;
  const pins = Array.from({ length: pinCount }, (_, i) =>
    horizontal
      ? { x: x1 + i * SPACING, y: (from.y + to.y) / 2 }
      : { x: (from.x + to.x) / 2, y: y1 + i * SPACING }
  );

  return (
    <g style={{ filter: glow }}>
      {horizontal
        ? <rect x={x1 - h} y={y1 - h} width={x2 - x1 + h * 2} height={h * 2}
            rx={1.5} fill="#222" stroke={selected ? "#fbbf24" : "#555"}
            strokeWidth={selected ? 1.5 : 1} className={styles.componentHit} />
        : <rect x={x1 - h} y={y1 - h} width={h * 2} height={y2 - y1 + h * 2}
            rx={1.5} fill="#222" stroke={selected ? "#fbbf24" : "#555"}
            strokeWidth={selected ? 1.5 : 1} className={styles.componentHit} />
      }
      {pins.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5}
            fill={selected ? "#fbbf24" : "#d4980f"} stroke="#111" strokeWidth={0.5} />
        </g>
      ))}
    </g>
  );
}
