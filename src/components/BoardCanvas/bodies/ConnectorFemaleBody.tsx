import styles from "../BoardCanvas.module.css";
import { SPACING } from "../constants";
import type { ConnectorBodyProps } from "./types";

export function ConnectorFemaleBody({ from, to, selected, subType }: ConnectorBodyProps) {
  const isDouble = subType === "female-double";
  const horizontal = Math.abs(from.y - to.y) < SPACING * 0.75;
  const x1 = Math.min(from.x, to.x);
  const x2 = Math.max(from.x, to.x);
  const y1 = Math.min(from.y, to.y);
  const y2 = Math.max(from.y, to.y);
  const glow = selected ? "drop-shadow(0 0 4px #60b4ff)" : undefined;

  if (isDouble) {
    const cols = Math.round(Math.abs(from.x - to.x) / SPACING) + 1;
    const topY = Math.min(from.y, to.y);
    const botY = Math.max(from.y, to.y);
    const leftX = Math.min(from.x, to.x);
    const h = 5;
    const sockets: { x: number; y: number }[] = [];
    for (let i = 0; i < cols; i++) {
      sockets.push({ x: leftX + i * SPACING, y: topY });
      sockets.push({ x: leftX + i * SPACING, y: botY });
    }
    return (
      <g style={{ filter: glow }}>
        <rect
          x={leftX - h} y={topY - h}
          width={(cols - 1) * SPACING + h * 2} height={botY - topY + h * 2}
          rx={1.5} fill="#1c1c1c" stroke={selected ? "#60b4ff" : "#444"}
          strokeWidth={selected ? 1.5 : 1} className={styles.componentHit}
        />
        {sockets.map((p, i) => (
          <g key={i}>
            <rect x={p.x - 2.75} y={p.y - 2.75} width={5.5} height={5.5}
              fill={selected ? "#60b4ff" : "#5c5c5c"} stroke="#222" strokeWidth={0.5} />
            <rect x={p.x - 1.25} y={p.y - 1.25} width={2.5} height={2.5}
              fill="#0c0c0c" />
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
  const sockets = Array.from({ length: pinCount }, (_, i) =>
    horizontal
      ? { x: x1 + i * SPACING, y: (from.y + to.y) / 2 }
      : { x: (from.x + to.x) / 2, y: y1 + i * SPACING }
  );

  return (
    <g style={{ filter: glow }}>
      {horizontal
        ? <rect x={x1 - h} y={y1 - h} width={x2 - x1 + h * 2} height={h * 2}
            rx={1.5} fill="#1c1c1c" stroke={selected ? "#60b4ff" : "#444"}
            strokeWidth={selected ? 1.5 : 1} className={styles.componentHit} />
        : <rect x={x1 - h} y={y1 - h} width={h * 2} height={y2 - y1 + h * 2}
            rx={1.5} fill="#1c1c1c" stroke={selected ? "#60b4ff" : "#444"}
            strokeWidth={selected ? 1.5 : 1} className={styles.componentHit} />
      }
      {sockets.map((p, i) => (
        <g key={i}>
          <rect x={p.x - 3.5} y={p.y - 3.5} width={7} height={7}
            fill={selected ? "#60b4ff" : "#5c5c5c"} stroke="#222" strokeWidth={0.5} />
          <rect x={p.x - 1.5} y={p.y - 1.5} width={3} height={3}
            fill="#0c0c0c" />
        </g>
      ))}
    </g>
  );
}
