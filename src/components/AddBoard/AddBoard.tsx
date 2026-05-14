import { useState } from "react";
import { BoardType } from "../../model/types";
import styles from "./AddBoard.module.css";

interface AddBoardProps {
  onAdd: (type: BoardType, rows: number, cols: number) => void;
}

function StripboardPreview() {
  const rows = 4, cols = 6, sp = 18, pad = 14;
  const w = pad * 2 + (cols - 1) * sp;
  const h = pad * 2 + (rows - 1) * sp;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={styles.preview}>
      <rect x={0} y={0} width={w} height={h} rx={3} fill="#b8621a" />
      {Array.from({ length: rows }, (_, r) => (
        <line key={r} x1={pad - 5} y1={pad + r * sp} x2={pad + (cols - 1) * sp + 5} y2={pad + r * sp}
          stroke="#c8882a" strokeWidth={2} opacity={0.5} />
      ))}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <g key={`${r}-${c}`}>
            <circle cx={pad + c * sp} cy={pad + r * sp} r={4} fill="none" stroke="#c8882a" strokeWidth={1.5} />
            <circle cx={pad + c * sp} cy={pad + r * sp} r={2.4} fill="#1c0e04" />
          </g>
        ))
      )}
    </svg>
  );
}

function PerfboardPreview() {
  const rows = 4, cols = 6, sp = 18, pad = 14;
  const w = pad * 2 + (cols - 1) * sp;
  const h = pad * 2 + (rows - 1) * sp;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={styles.preview}>
      <rect x={0} y={0} width={w} height={h} rx={3} fill="#b8621a" />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <g key={`${r}-${c}`}>
            <circle cx={pad + c * sp} cy={pad + r * sp} r={4} fill="#c8882a" />
            <circle cx={pad + c * sp} cy={pad + r * sp} r={2.4} fill="#1c0e04" />
          </g>
        ))
      )}
    </svg>
  );
}

export function AddBoard({ onAdd }: AddBoardProps) {
  const [selected, setSelected] = useState<BoardType | null>(null);
  const [rows, setRows] = useState("14");
  const [cols, setCols] = useState("24");

  const handleAdd = () => {
    if (!selected) return;
    const r = Math.max(1, Math.min(200, parseInt(rows, 10) || 14));
    const c = Math.max(1, Math.min(200, parseInt(cols, 10) || 24));
    onAdd(selected, r, c);
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Add a Board</h2>
      <p className={styles.sub}>Choose the type of veroboard for your project.</p>

      <div className={styles.cards}>
        <button
          type="button"
          className={selected === "stripboard" ? `${styles.card} ${styles.cardActive}` : styles.card}
          onClick={() => setSelected("stripboard")}
        >
          <StripboardPreview />
          <div className={styles.cardTitle}>Stripboard</div>
          <div className={styles.cardDesc}>Copper strips connect all holes in each row</div>
        </button>

        <button
          type="button"
          className={selected === "perfboard" ? `${styles.card} ${styles.cardActive}` : styles.card}
          onClick={() => setSelected("perfboard")}
        >
          <PerfboardPreview />
          <div className={styles.cardTitle}>Perfboard</div>
          <div className={styles.cardDesc}>Each hole is individually isolated</div>
        </button>
      </div>

      <div className={styles.sizeRow}>
        <label className={styles.sizeLabel}>
          Rows
          <input
            className={styles.sizeInput}
            type="number"
            min={1}
            max={200}
            value={rows}
            onChange={(e) => setRows(e.target.value)}
          />
        </label>
        <span className={styles.sizeSep}>×</span>
        <label className={styles.sizeLabel}>
          Cols
          <input
            className={styles.sizeInput}
            type="number"
            min={1}
            max={200}
            value={cols}
            onChange={(e) => setCols(e.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        className={styles.addBtn}
        disabled={!selected}
        onClick={handleAdd}
      >
        Add Board
      </button>
    </div>
  );
}
