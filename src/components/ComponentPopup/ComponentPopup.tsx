import { useState } from "react";
import { ComponentType } from "../../model/types";
import styles from "./ComponentPopup.module.css";

interface ComponentPopupProps {
  type: ComponentType;
  defaultLabel: string;
  onConfirm: (fields: { label: string; value: string; tolerance?: string; voltageRating?: string }) => void;
  onCancel: () => void;
}

export function ComponentPopup({ type, defaultLabel, onConfirm, onCancel }: ComponentPopupProps) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [tolerance, setTolerance] = useState("");
  const [voltageRating, setVoltageRating] = useState("");

  const handleConfirm = () => {
    onConfirm({
      label: label.trim() || defaultLabel,
      value: value.trim() || "unset",
      tolerance: tolerance.trim() || undefined,
      voltageRating: voltageRating.trim() || undefined
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className={styles.header}>
          <span className={styles.title}>{type === "resistor" ? "Resistor" : "Capacitor"}</span>
          <button className={styles.closeBtn} onClick={onCancel} title="Cancel">✕</button>
        </div>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Label</span>
            <input
              className={styles.input}
              placeholder={defaultLabel}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Value</span>
            <input
              className={styles.input}
              placeholder={type === "resistor" ? "e.g. 10kΩ" : "e.g. 100µF"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          {type === "resistor" && (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Tolerance</span>
              <input
                className={styles.input}
                placeholder="e.g. 5%"
                value={tolerance}
                onChange={(e) => setTolerance(e.target.value)}
              />
            </label>
          )}
          {type === "capacitor" && (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Voltage</span>
              <input
                className={styles.input}
                placeholder="e.g. 16V"
                value={voltageRating}
                onChange={(e) => setVoltageRating(e.target.value)}
              />
            </label>
          )}
        </div>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.confirmBtn} onClick={handleConfirm}>Place</button>
        </div>
      </div>
    </div>
  );
}
