import styles from "../BoardCanvas.module.css";
import { MAX_BODY_LEN } from "../constants";
import type { TwoHoleBodyProps } from "./types";

export function CrystalBody({ from, to, selected }: TwoHoleBodyProps) {
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
