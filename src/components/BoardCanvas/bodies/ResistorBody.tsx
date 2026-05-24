import styles from "../BoardCanvas.module.css";
import { MAX_BODY_LEN } from "../constants";
import type { TwoHoleBodyProps } from "./types";

export function ResistorBody({ from, to, selected }: TwoHoleBodyProps) {
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
