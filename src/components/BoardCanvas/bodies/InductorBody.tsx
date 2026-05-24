import styles from "../BoardCanvas.module.css";
import { MAX_BODY_LEN } from "../constants";
import type { TwoHoleBodyProps } from "./types";

export function InductorBody({ from, to, selected }: TwoHoleBodyProps) {
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
