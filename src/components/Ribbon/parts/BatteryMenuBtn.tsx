import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { BATTERY_ITEMS } from "../constants";
import styles from "../Ribbon.module.css";

export function BatteryMenuBtn() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const inBtn = btnRef.current?.contains(e.target as Node);
      const inDrop = dropRef.current?.contains(e.target as Node);
      if (!inBtn && !inDrop) { setOpen(false); setPos(null); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleClick = () => {
    if (open) { setOpen(false); setPos(null); return; }
    const rect = btnRef.current!.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={styles.btn}
        onClick={handleClick}
        title="Choose battery type"
      >
        <span className={styles.btnIcon}>🔋</span>
        <span className={styles.btnLabel}>Battery</span>
      </button>
      {open && pos && ReactDOM.createPortal(
        <div
          ref={dropRef}
          className={styles.compMenu}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {BATTERY_ITEMS.map(({ icon, label, dragKey }) => (
            <div
              key={dragKey}
              draggable
              className={styles.compMenuItem}
              onDragStart={(e) => {
                e.dataTransfer.setData("tool", dragKey);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onDragEnd={() => { setOpen(false); setPos(null); }}
              title={`Drag to place ${label}`}
              style={{ cursor: "grab" }}
            >
              <span className={styles.compMenuIcon}>{icon}</span>
              <span className={styles.compMenuLabel}>{label}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
