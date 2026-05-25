import styles from "../BoardCanvas.module.css";
import { MAX_BODY_LEN } from "../constants";
import type { TwoHoleBodyProps } from "./types";

const LED_COLOURS: Record<string, string> = {
  red: "#ff4040", green: "#40e040", blue: "#4488ff",
  yellow: "#ffee40", white: "#f0f0ff", orange: "#ff8c00",
  ir: "#cc88ff", uv: "#9966ff"
};

function ledColour(value: string): string {
  const key = value.toLowerCase().split(/[\s,]/)[0];
  return LED_COLOURS[key] ?? "#ffcc44";
}

interface LEDBodyProps extends TwoHoleBodyProps {
  value: string;
}

export function SchematicLEDBody({ from, to, selected, value }: LEDBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const bodyLen = Math.min(Math.max(len - 10, 12), MAX_BODY_LEN);
  const h = 6;
  const fill = ledColour(value);
  const glow = selected ? `drop-shadow(0 0 5px ${fill})` : undefined;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ filter: glow }}>
      <line x1={-len / 2} y1={0} x2={-bodyLen / 2} y2={0} className={styles.componentLead} />
      <line x1={bodyLen / 2} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <polygon points={`${-bodyLen / 2},${-h} ${-bodyLen / 2},${h} ${bodyLen / 2},0`}
        fill={fill} stroke={selected ? fill : "#00000066"}
        strokeWidth={selected ? 1.5 : 1} fillOpacity={0.85} className={styles.componentHit} />
      <line x1={bodyLen / 2} y1={-h} x2={bodyLen / 2} y2={h}
        stroke={selected ? fill : "#555"} strokeWidth={selected ? 2 : 1.5} />
      <line x1={bodyLen / 2 + 2} y1={-h + 1} x2={bodyLen / 2 + 5} y2={-h - 3}
        stroke={fill} strokeWidth={1} opacity={0.8} />
      <line x1={bodyLen / 2 + 3} y1={-1} x2={bodyLen / 2 + 7} y2={-4}
        stroke={fill} strokeWidth={1} opacity={0.8} />
    </g>
  );
}

export function LEDBody({ from, to, selected, value }: LEDBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const fill = ledColour(value);
  const r = Math.min(Math.max((len - 10) / 2, 6), 9);
  const glow = selected ? `drop-shadow(0 0 6px ${fill})` : undefined;
  const clipId = `led-clip-${from.x}-${from.y}-${to.x}-${to.y}`;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ filter: glow }}>
      <defs>
        <clipPath id={clipId}>
          <rect x={-r} y={-r} width={2 * r - 2.5} height={2 * r} />
        </clipPath>
      </defs>
      <line x1={-len / 2} y1={0} x2={-r} y2={0} className={styles.componentLead} />
      <line x1={r} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <circle cx={0} cy={0} r={r} fill={fill}
        stroke={selected ? fill : "#00000055"} strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85} clipPath={`url(#${clipId})`} className={styles.componentHit} />
      <line x1={r - 2.5} y1={-(r - 1)} x2={r - 2.5} y2={r - 1}
        stroke={selected ? fill : "#444"} strokeWidth={selected ? 2 : 1.5} />
      <ellipse cx={-r * 0.28} cy={-r * 0.32} rx={r * 0.32} ry={r * 0.2}
        fill="white" opacity={0.35} clipPath={`url(#${clipId})`} />
    </g>
  );
}
