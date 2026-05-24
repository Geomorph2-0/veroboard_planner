import styles from "../BoardCanvas.module.css";
import { MAX_BODY_LEN } from "../constants";
import type { TwoHoleBodyProps } from "./types";

export function DiodeBody({ from, to, selected }: TwoHoleBodyProps) {
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
