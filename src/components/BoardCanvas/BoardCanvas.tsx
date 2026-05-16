import { ProjectFile, HoleRef, Component, Wire } from "../../model/types";
import styles from "./BoardCanvas.module.css";

const SPACING = 28;
const PADDING = 28;
const PAD_RADIUS = 6.5;
const HOLE_RADIUS = 4.2;
const STRIP_WIDTH = 2.5;
const MAX_BODY_LEN = SPACING - 10; // body stays within one hole-spacing

const WIRE_COLORS = [
  "#e05c5c", "#ff8080", "#c0392b",           // reds
  "#4a9eff", "#38bdf8", "#1d6fa5",           // blues
  "#4caf50", "#a3e635", "#2e7d32",           // greens
  "#ffb347", "#fb923c", "#e67e22",           // oranges
  "#c084fc", "#9b59b6", "#e91e8c",           // purples/pink
  "#ffee58", "#f9a825",                       // yellows
  "#ffffff", "#b0b0b0", "#555555",           // whites/greys
  "#e26d1a",                                  // default warm orange
];

function holeCenter(hole: HoleRef) {
  return {
    x: PADDING + hole.col * SPACING,
    y: PADDING + hole.row * SPACING
  };
}


function wireColor(wire: Wire, index: number): string {
  return wire.color ?? WIRE_COLORS[index % WIRE_COLORS.length];
}

function arcPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const lift = Math.max(18, dist * 0.45);
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2 - lift;
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

interface ResistorBodyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected: boolean;
}

function ResistorBody({ from, to, selected }: ResistorBodyProps) {
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
      <rect
        x={-bodyLen / 2}
        y={-5}
        width={bodyLen}
        height={10}
        rx={3}
        fillOpacity={0.85}
        className={selected ? `${styles.resistorBody} ${styles.selected}` : styles.resistorBody}
      />
      <line x1={-bodyLen / 3} y1={-5} x2={-bodyLen / 3} y2={5} className={styles.colorBand} style={{ stroke: "#c0392b" }} />
      <line x1={-bodyLen / 9} y1={-5} x2={-bodyLen / 9} y2={5} className={styles.colorBand} style={{ stroke: "#e67e22" }} />
      <line x1={bodyLen / 9} y1={-5} x2={bodyLen / 9} y2={5} className={styles.colorBand} style={{ stroke: "#8e44ad" }} />
      <line x1={bodyLen / 3} y1={-5} x2={bodyLen / 3} y2={5} className={styles.colorBand} style={{ stroke: "#c8a000" }} />
    </g>
  );
}

const LED_COLOURS: Record<string, string> = {
  red: "#ff4040", green: "#40e040", blue: "#4488ff",
  yellow: "#ffee40", white: "#f0f0ff", orange: "#ff8c00",
  ir: "#cc88ff", uv: "#9966ff"
};

function ledColour(value: string): string {
  const key = value.toLowerCase().split(/[\s,]/)[0];
  return LED_COLOURS[key] ?? "#ffcc44";
}

interface LEDBodyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected: boolean;
  value: string;
}

function SchematicLEDBody({ from, to, selected, value }: LEDBodyProps) {
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
      <polygon
        points={`${-bodyLen / 2},${-h} ${-bodyLen / 2},${h} ${bodyLen / 2},0`}
        fill={fill} stroke={selected ? fill : "#00000066"}
        strokeWidth={selected ? 1.5 : 1} fillOpacity={0.85} className={styles.componentHit}
      />
      <line x1={bodyLen / 2} y1={-h} x2={bodyLen / 2} y2={h}
        stroke={selected ? fill : "#555"} strokeWidth={selected ? 2 : 1.5} />
      <line x1={bodyLen / 2 + 2} y1={-h + 1} x2={bodyLen / 2 + 5} y2={-h - 3}
        stroke={fill} strokeWidth={1} opacity={0.8} />
      <line x1={bodyLen / 2 + 3} y1={-1} x2={bodyLen / 2 + 7} y2={-4}
        stroke={fill} strokeWidth={1} opacity={0.8} />
    </g>
  );
}

function LEDBody({ from, to, selected, value }: LEDBodyProps) {
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
        {/* clip removes rightmost 2.5px to form cathode flat spot */}
        <clipPath id={clipId}>
          <rect x={-r} y={-r} width={2 * r - 2.5} height={2 * r} />
        </clipPath>
      </defs>
      {/* leads */}
      <line x1={-len / 2} y1={0} x2={-r} y2={0} className={styles.componentLead} />
      <line x1={r} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      {/* dome body — clipped to expose cathode flat */}
      <circle
        cx={0} cy={0} r={r}
        fill={fill}
        stroke={selected ? fill : "#00000055"}
        strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85}
        clipPath={`url(#${clipId})`}
        className={styles.componentHit}
      />
      {/* cathode flat bar */}
      <line
        x1={r - 2.5} y1={-(r - 1)} x2={r - 2.5} y2={r - 1}
        stroke={selected ? fill : "#444"} strokeWidth={selected ? 2 : 1.5}
      />
      {/* dome highlight — glassy sheen */}
      <ellipse
        cx={-r * 0.28} cy={-r * 0.32}
        rx={r * 0.32} ry={r * 0.2}
        fill="white" opacity={0.35}
        clipPath={`url(#${clipId})`}
      />
    </g>
  );
}

interface CapacitorBodyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected: boolean;
}

function CapacitorBody({ from, to, selected }: CapacitorBodyProps) {
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
      <rect
        x={-bodyLen / 2}
        y={-6}
        width={bodyLen}
        height={12}
        rx={6}
        fillOpacity={0.85}
        className={selected ? `${styles.capacitorBody} ${styles.selected}` : styles.capacitorBody}
      />
      <line x1={bodyLen / 2 - 4} y1={-6} x2={bodyLen / 2 - 4} y2={6} className={styles.capacitorStripe} />
      <text x={-bodyLen / 2 + 3} y={2} fontSize={5} fill="#a0c4ff" fontFamily="monospace" pointerEvents="none">+</text>
    </g>
  );
}

interface TwoHoleBodyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected: boolean;
}

function DiodeBody({ from, to, selected }: TwoHoleBodyProps) {
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
      <rect
        x={-bodyLen / 2} y={-4} width={bodyLen} height={8} rx={2}
        fill="#2a2a2a" stroke={selected ? "#60a5fa" : "#555"} strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85} className={styles.componentHit}
      />
      {/* cathode band */}
      <line x1={bodyLen / 2 - 3} y1={-4} x2={bodyLen / 2 - 3} y2={4}
        stroke={selected ? "#60a5fa" : "#aaaaaa"} strokeWidth={2} />
    </g>
  );
}

function InductorBody({ from, to, selected }: TwoHoleBodyProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const bodyLen = Math.min(Math.max(len - 10, 12), MAX_BODY_LEN);
  const glow = selected ? "drop-shadow(0 0 4px #fbbf24)" : undefined;
  // 3 humps above the body
  const humpR = bodyLen / 6;
  const h1 = -bodyLen / 3 + humpR;
  const h2 = 0;
  const h3 = bodyLen / 3 - humpR;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${angle})`} style={{ filter: glow }}>
      <line x1={-len / 2} y1={0} x2={-bodyLen / 2} y2={0} className={styles.componentLead} />
      <line x1={bodyLen / 2} y1={0} x2={len / 2} y2={0} className={styles.componentLead} />
      <rect
        x={-bodyLen / 2} y={-5} width={bodyLen} height={10} rx={3}
        fill="#7a3010" stroke={selected ? "#fbbf24" : "#5a2008"} strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85} className={styles.componentHit}
      />
      {/* coil humps */}
      {[h1, h2, h3].map((hx, i) => (
        <path key={i}
          d={`M ${hx - humpR} 0 A ${humpR} ${humpR} 0 0 1 ${hx + humpR} 0`}
          fill="none" stroke={selected ? "#fbbf24" : "#c07840"} strokeWidth={1.2}
        />
      ))}
    </g>
  );
}

function CrystalBody({ from, to, selected }: TwoHoleBodyProps) {
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
      <rect
        x={-bodyLen / 2} y={-5} width={bodyLen} height={10} rx={2}
        fill="#c0c0c0" stroke={selected ? "#e2e8f0" : "#888"} strokeWidth={selected ? 1.5 : 1}
        fillOpacity={0.85} className={styles.componentHit}
      />
      {/* centre seam line */}
      <line x1={-bodyLen / 2 + 2} y1={0} x2={bodyLen / 2 - 2} y2={0}
        stroke={selected ? "#e2e8f0" : "#999"} strokeWidth={0.8} opacity={0.7} />
    </g>
  );
}

function ICBody({ from, to, selected }: TwoHoleBodyProps) {
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
        <line key={`lp-${i}`} x1={left - 6} y1={py} x2={left} y2={py}
          stroke={strokeCol} strokeWidth={1.5} />
      ))}
      {pinYs.map((py, i) => (
        <line key={`rp-${i}`} x1={right} y1={py} x2={right + 6} y2={py}
          stroke={strokeCol} strokeWidth={1.5} />
      ))}
      <rect
        x={left + bodyPad} y={top - bodyPad}
        width={right - left - bodyPad * 2} height={bottom - top + bodyPad * 2}
        rx={2} fill="#1a1a1a" stroke={strokeCol} strokeWidth={selected ? 1.5 : 1}
        className={styles.componentHit}
      />
      <path
        d={`M ${left + bodyPad + 1} ${top - bodyPad} a 4 4 0 0 1 8 0`}
        fill="#111" stroke={strokeCol} strokeWidth={0.8}
      />
      {pinYs.map((py, i) => (
        <rect key={`ls-${i}`}
          x={left + bodyPad - 3} y={py - 1.5} width={3} height={3}
          fill={selected ? "#a78bfa" : "#555"} />
      ))}
      {pinYs.map((py, i) => (
        <rect key={`rs-${i}`}
          x={right - bodyPad} y={py - 1.5} width={3} height={3}
          fill={selected ? "#a78bfa" : "#555"} />
      ))}
    </g>
  );
}

function ConnectorBody({ from, to, selected }: TwoHoleBodyProps) {
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

interface BoardCanvasProps {
  project: ProjectFile;
  pendingHole: HoleRef | null;
  selectedWireId: string | null;
  selectedComponentId: string | null;
  ledSymbolStyle: "physical" | "schematic";
  onHoleClick: (hole: HoleRef) => void;
  onWireSelect: (wireId: string) => void;
  onComponentSelect: (componentId: string) => void;
}

export function BoardCanvas({
  project,
  pendingHole,
  selectedWireId,
  selectedComponentId,
  ledSymbolStyle,
  onHoleClick,
  onWireSelect,
  onComponentSelect
}: BoardCanvasProps) {
  if (!project.board) return null;

  const { rows, cols, type: boardType } = project.board;
  const width = PADDING * 2 + (cols - 1) * SPACING;
  const height = PADDING * 2 + (rows - 1) * SPACING;

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Veroboard canvas"
      >
        {/* Board surface */}
        <rect x={0} y={0} width={width} height={height} rx={6} className={styles.boardSurface} />
        <rect x={0.75} y={0.75} width={width - 1.5} height={height - 1.5} rx={5.5} className={styles.boardEdge} />

        {/* Copper strips — stripboard only */}
        {boardType === "stripboard" && Array.from({ length: rows }, (_, row) => {
          const y = PADDING + row * SPACING;
          const x1 = PADDING - PAD_RADIUS - 2;
          const x2 = PADDING + (cols - 1) * SPACING + PAD_RADIUS + 2;
          return (
            <line
              key={`strip-${row}`}
              x1={x1} y1={y} x2={x2} y2={y}
              className={styles.copperStrip}
              strokeWidth={STRIP_WIDTH}
            />
          );
        })}

        {/* Row labels */}
        {Array.from({ length: rows }, (_, row) => (
          <text key={`rl-${row}`} x={14} y={PADDING + row * SPACING + 4} className={styles.axisLabel}>
            {row + 1}
          </text>
        ))}

        {/* Column labels */}
        {Array.from({ length: cols }, (_, col) => (
          <text key={`cl-${col}`} x={PADDING + col * SPACING} y={18} className={styles.axisLabel} textAnchor="middle">
            {col + 1}
          </text>
        ))}

        {/* Wires (arcs above board) */}
        {project.wires.map((wire, i) => {
          const from = holeCenter(wire.from);
          const to = holeCenter(wire.to);
          const color = wireColor(wire, i);
          const selected = wire.id === selectedWireId;
          return (
            <g key={wire.id}>
              <path d={arcPath(from, to)} fill="none" stroke={color} strokeWidth={selected ? 4 : 2.5}
                strokeLinecap="round" opacity={selected ? 1 : 0.85}
                className={selected ? styles.wireSelected : styles.wire} />
              <path d={arcPath(from, to)} fill="none" stroke="transparent" strokeWidth={12}
                className={styles.wireHit}
                data-testid={`wire-${wire.id}`}
                onClick={(e) => { e.stopPropagation(); onWireSelect(wire.id); }} />
            </g>
          );
        })}

        {/* Copper pads + holes */}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const hole: HoleRef = { row, col };
            const { x, y } = holeCenter(hole);
            const isPending = pendingHole?.row === row && pendingHole?.col === col;
            return (
              <g key={`${row}-${col}`} onClick={() => onHoleClick(hole)} className={styles.holeGroup}>
                <circle cx={x} cy={y} r={PAD_RADIUS}
                  className={
                    isPending
                      ? `${boardType === "perfboard" ? styles.padPerfboard : styles.pad} ${styles.padPending}`
                      : boardType === "perfboard" ? styles.padPerfboard : styles.pad
                  } />
                <circle cx={x} cy={y} r={HOLE_RADIUS}
                  className={styles.hole}
                  data-testid={`hole-${row}-${col}`} />
              </g>
            );
          })
        )}

        {/* Components (above holes) */}
        {project.components.map((component: Component) => {
          const from = holeCenter(component.holeA);
          const to = holeCenter(component.holeB);
          const selected = component.id === selectedComponentId;
          return (
            <g
              key={component.id}
              className={styles.componentHit}
              data-testid={`component-${component.id}`}
              onClick={(e) => { e.stopPropagation(); onComponentSelect(component.id); }}
            >
              {component.type === "resistor"
                ? <ResistorBody from={from} to={to} selected={selected} />
                : component.type === "capacitor"
                ? <CapacitorBody from={from} to={to} selected={selected} />
                : component.type === "diode"
                ? <DiodeBody from={from} to={to} selected={selected} />
                : component.type === "inductor"
                ? <InductorBody from={from} to={to} selected={selected} />
                : component.type === "crystal"
                ? <CrystalBody from={from} to={to} selected={selected} />
                : component.type === "ic"
                ? <ICBody from={from} to={to} selected={selected} />
                : component.type === "connector"
                ? <ConnectorBody from={from} to={to} selected={selected} />
                : component.type === "led"
                ? ledSymbolStyle === "schematic"
                  ? <SchematicLEDBody from={from} to={to} selected={selected} value={component.value} />
                  : <LEDBody from={from} to={to} selected={selected} value={component.value} />
                : <CapacitorBody from={from} to={to} selected={selected} />}
              <text
                x={(from.x + to.x) / 2}
                y={Math.min(from.y, to.y) - 10}
                className={styles.componentLabel}
                textAnchor="middle"
              >
                {component.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
