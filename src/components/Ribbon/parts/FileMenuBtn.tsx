import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import styles from "../Ribbon.module.css";

export function FileMenuBtn({ onNew, onOpen, onSave, onPrint, canPrint }: {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onPrint: () => void;
  canPrint: boolean;
}) {
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

  const close = () => { setOpen(false); setPos(null); };

  const items = [
    { icon: "🗋", label: "New",   action: () => { onNew();   close(); }, disabled: false },
    { icon: "📂", label: "Open",  action: () => { onOpen();  close(); }, disabled: false },
    { icon: "💾", label: "Save",  action: () => { onSave();  close(); }, disabled: false },
    { icon: "🖨", label: "Print", action: () => { onPrint(); close(); }, disabled: !canPrint },
  ];

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-testid="ribbon-file-menu"
        className={`${styles.tab} ${open ? styles.tabActive : ""}`}
        onClick={handleClick}
      >
        File
      </button>
      {open && pos && ReactDOM.createPortal(
        <div
          ref={dropRef}
          className={styles.fileMenu}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {items.map(({ icon, label, action, disabled }) => (
            <button
              key={label}
              type="button"
              data-testid={`ribbon-file-${label.toLowerCase()}`}
              className={styles.fileMenuItem}
              onClick={disabled ? undefined : action}
              style={disabled ? { opacity: 0.38, cursor: "not-allowed" } : undefined}
            >
              <span className={styles.fileMenuIcon}>{icon}</span>
              {label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
