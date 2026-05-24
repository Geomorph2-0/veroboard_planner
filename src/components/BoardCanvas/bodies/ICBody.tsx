import styles from "../BoardCanvas.module.css";
import { SPACING } from "../constants";
import type { TwoHoleBodyProps } from "./types";

export function ICBody({ from, to, selected }: TwoHoleBodyProps) {
  const left   = Math.min(from.x, to.x);
  const right  = Math.max(from.x, to.x);
  const top    = Math.min(from.y, to.y);
  const bottom = Math.max(from.y, to.y);
  const pinsPerSide = Math.round((bottom - top) / SPACING) + 1;
  const pinYs = Array.from({ length: pinsPerSide }, (_, i) =>
    top + i * ((bottom - top) / Math.max(pinsPerSide - 1, 1))
  );
  const bodyPad = 4;
  const glow = selected ? "drop-shadow(0 0 5px #a78bfa)" : undefined;
  const strokeCol = selected ? "#a78bfa" : "#444";

  return (
    <g style={{ filter: glow }}>
      {pinYs.map((py, i) => (
        <line key={`lp-${i}`} x1={left - 6} y1={py} x2={left} y2={py} stroke={strokeCol} strokeWidth={1.5} />
      ))}
      {pinYs.map((py, i) => (
        <line key={`rp-${i}`} x1={right} y1={py} x2={right + 6} y2={py} stroke={strokeCol} strokeWidth={1.5} />
      ))}
      <rect x={left + bodyPad} y={top - bodyPad} width={right - left - bodyPad * 2} height={bottom - top + bodyPad * 2}
        rx={2} fill="#1a1a1a" stroke={strokeCol} strokeWidth={selected ? 1.5 : 1} className={styles.componentHit} />
      <path d={`M ${left + bodyPad + 1} ${top - bodyPad} a 4 4 0 0 1 8 0`}
        fill="#111" stroke={strokeCol} strokeWidth={0.8} />
      {pinYs.map((py, i) => (
        <rect key={`ls-${i}`} x={left + bodyPad - 3} y={py - 1.5} width={3} height={3}
          fill={selected ? "#a78bfa" : "#555"} />
      ))}
      {pinYs.map((py, i) => (
        <rect key={`rs-${i}`} x={right - bodyPad} y={py - 1.5} width={3} height={3}
          fill={selected ? "#a78bfa" : "#555"} />
      ))}
    </g>
  );
}
