import styles from "../BoardCanvas.module.css";
import { MAX_BODY_LEN } from "../constants";
import type { TwoHoleBodyProps } from "./types";

export function CapacitorBody({ from, to, selected }: TwoHoleBodyProps) {
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
