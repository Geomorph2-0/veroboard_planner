import { BoardType, HoleRef } from "../../../model/types";
import styles from "../BoardCanvas.module.css";
import { SPACING, PADDING, LEFT_PAD, PAD_RADIUS, HOLE_RADIUS, STRIP_WIDTH } from "../constants";
import { holeCenter } from "../geometry";

interface BoardSurfaceProps {
  rows: number;
  cols: number;
  boardType: BoardType;
  width: number;
  height: number;
  pendingHole: HoleRef | null;
  onHoleClick: (hole: HoleRef) => void;
}

export function BoardSurface({ rows, cols, boardType, width, height, pendingHole, onHoleClick }: BoardSurfaceProps) {
  return (
    <>
      {/* Board surface */}
      <rect x={0} y={0} width={width} height={height} rx={6} className={styles.boardSurface} />
      <rect x={0.75} y={0.75} width={width - 1.5} height={height - 1.5} rx={5.5} className={styles.boardEdge} />

      {/* Copper strips — stripboard only */}
      {boardType === "stripboard" && Array.from({ length: rows }, (_, row) => {
        const y = PADDING + row * SPACING;
        const x1 = LEFT_PAD - PAD_RADIUS - 2;
        const x2 = LEFT_PAD + (cols - 1) * SPACING + PAD_RADIUS + 2;
        return (
          <line key={`strip-${row}`} x1={x1} y1={y} x2={x2} y2={y}
            className={styles.copperStrip} strokeWidth={STRIP_WIDTH} />
        );
      })}

      {/* Row labels */}
      {Array.from({ length: rows }, (_, row) => (
        <text key={`rl-${row}`} x={LEFT_PAD - 12} y={PADDING + row * SPACING + 4} textAnchor="end" className={styles.axisLabel}>
          {row + 1}
        </text>
      ))}

      {/* Column labels */}
      {Array.from({ length: cols }, (_, col) => (
        <text key={`cl-${col}`} x={LEFT_PAD + col * SPACING} y={18} className={styles.axisLabel} textAnchor="middle">
          {col + 1}
        </text>
      ))}

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
    </>
  );
}
