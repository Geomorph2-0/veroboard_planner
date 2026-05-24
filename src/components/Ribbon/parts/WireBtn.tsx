import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { WIRE_PALETTE } from "../../../model/wireColors";
import { AWG_SIZES, AWGSize } from "../../../model/wireThickness";
import styles from "../Ribbon.module.css";

export function WireBtn({ active, wireColour, wireThickness, onSelect, onColourChange, onThicknessChange }: {
  active: boolean;
  wireColour: string | null;
  wireThickness: AWGSize;
  onSelect: () => void;
  onColourChange: (c: string) => void;
  onThicknessChange: (t: AWGSize) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const inWrap = wrapRef.current?.contains(e.target as Node);
      const inDrop = dropRef.current?.contains(e.target as Node);
      if (!inWrap && !inDrop) { setOpen(false); setPos(null); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) { setOpen(false); setPos(null); return; }
    const rect = arrowRef.current!.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };

  const dotColour = wireColour ?? "#e26d1a";

  return (
    <div ref={wrapRef} className={styles.wireBtn}>
      <div className={styles.wireBtnTop}>
        <button
          type="button"
          className={`${styles.wireBtnMain} ${active ? styles.btnActive : ""}`}
          onClick={onSelect}
        >
          <span className={styles.btnIcon}>⌇</span>
          <span className={styles.btnLabel}>Wire</span>
        </button>
        <button
          ref={arrowRef}
          type="button"
          className={`${styles.wireBtnArrow} ${active ? styles.btnActive : ""}`}
          onClick={handleArrowClick}
          title="Wire colour"
        >
          <span className={styles.wireDot} style={{ background: dotColour }} />
          <span style={{ fontSize: 8 }}>▾</span>
        </button>
      </div>
      <div className={styles.awgRow}>
        {AWG_SIZES.map((awg) => (
          <button
            key={awg}
            type="button"
            className={`${styles.awgBtn} ${awg === wireThickness ? styles.awgBtnActive : ""}`}
            onClick={(e) => { e.stopPropagation(); onThicknessChange(awg); }}
            title={`AWG ${awg}`}
          >
            {awg}
          </button>
        ))}
      </div>
      {open && pos && ReactDOM.createPortal(
        <div
          ref={dropRef}
          className={styles.wireDropdown}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {WIRE_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.wireSwatch} ${c === dotColour ? styles.wireSwatchActive : ""}`}
              style={{ background: c }}
              title={c}
              onClick={() => { onColourChange(c); setOpen(false); setPos(null); }}
            />
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
