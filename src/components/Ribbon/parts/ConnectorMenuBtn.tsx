import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { EditorTool } from "../../../editor/interactions";
import { ConnectorSubType } from "../../../model/types";
import styles from "../Ribbon.module.css";

const CONNECTOR_ITEMS: { subType: ConnectorSubType; icon: string; label: string }[] = [
  { subType: "male-single",   icon: "⊞", label: "Male · Single row"   },
  { subType: "female-single", icon: "⊟", label: "Female · Single row" },
  { subType: "male-double",   icon: "⊠", label: "Male · Double row"   },
  { subType: "female-double", icon: "⊡", label: "Female · Double row" },
];

interface ConnectorMenuBtnProps {
  tool: EditorTool;
  connectorSubType: ConnectorSubType;
  onToolChange: (tool: EditorTool) => void;
  onSubTypeChange: (sub: ConnectorSubType) => void;
}

export function ConnectorMenuBtn({ tool, connectorSubType, onToolChange, onSubTypeChange }: ConnectorMenuBtnProps) {
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

  const activeItem = CONNECTOR_ITEMS.find(c => c.subType === connectorSubType) ?? CONNECTOR_ITEMS[0];
  const isActive = tool === "connector";

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        data-testid="ribbon-menu-connector"
        className={`${styles.btn} ${isActive ? styles.btnActive : ""}`}
        onClick={handleClick}
        title="Choose connector type"
      >
        <span className={styles.btnIcon}>{activeItem.icon}</span>
        <span className={styles.btnLabel}>Connector</span>
      </button>
      {open && pos && ReactDOM.createPortal(
        <div
          ref={dropRef}
          className={styles.connectorMenu}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
        >
          {CONNECTOR_ITEMS.map(({ subType, icon, label }) => (
            <button
              key={subType}
              type="button"
              className={`${styles.connectorMenuItem} ${connectorSubType === subType && isActive ? styles.connectorMenuItemActive : ""}`}
              onClick={() => {
                onSubTypeChange(subType);
                onToolChange("connector");
                setOpen(false);
                setPos(null);
              }}
            >
              <span className={styles.connectorMenuIcon}>{icon}</span>
              <span className={styles.connectorMenuLabel}>{label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
