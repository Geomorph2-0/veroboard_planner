import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { EditorTool } from "../../../editor/interactions";
import { COMPONENT_ITEMS, COMPONENT_TOOLS } from "../constants";
import styles from "../Ribbon.module.css";

export function ComponentsMenuBtn({ tool, onToolChange }: { tool: EditorTool; onToolChange: (t: EditorTool) => void }) {
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

  const isActive = COMPONENT_TOOLS.has(tool);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-testid="ribbon-menu-components"
        className={`${styles.btn} ${isActive ? styles.btnActive : ""}`}
        onClick={handleClick}
        title="Choose component type"
      >
        <span className={styles.btnIcon}>⬡</span>
        <span className={styles.btnLabel}>Components</span>
      </button>
      {open && pos && ReactDOM.createPortal(
        <div
          ref={dropRef}
          className={styles.compMenu}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {COMPONENT_ITEMS.map(({ type, icon, label }) => (
            <button
              key={type}
              type="button"
              data-testid={`ribbon-tool-${type}`}
              className={`${styles.compMenuItem} ${tool === type ? styles.compMenuItemActive : ""}`}
              onClick={() => { onToolChange(type); setOpen(false); setPos(null); }}
            >
              <span className={styles.compMenuIcon}>{icon}</span>
              <span className={styles.compMenuLabel}>{label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
