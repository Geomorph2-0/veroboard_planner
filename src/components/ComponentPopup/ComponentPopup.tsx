import { useState } from "react";
import { ComponentType } from "../../model/types";
import styles from "./ComponentPopup.module.css";

const TYPE_TITLES: Record<ComponentType, string> = {
  resistor: "Resistor",
  capacitor: "Capacitor",
  led: "LED",
  diode: "Diode",
  inductor: "Inductor",
  crystal: "Crystal",
  ic: "IC / Chip",
  connector: "Connector",
};

const DEFAULT_VALUES: Partial<Record<ComponentType, string>> = {
  diode: "1N4148",
  inductor: "100µH",
  crystal: "16MHz",
  ic: "NE555",
  connector: "2-pin",
};

const VALUE_PLACEHOLDERS: Partial<Record<ComponentType, string>> = {
  resistor: "e.g. 10kΩ",
  capacitor: "e.g. 100µF",
  diode: "e.g. 1N4148",
  inductor: "e.g. 100µH",
  crystal: "e.g. 16MHz",
  ic: "e.g. NE555",
  connector: "e.g. 2-pin",
};

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
      value: value.trim() || DEFAULT_VALUES[type] || (type === "led" ? "red" : "unset"),
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
          <span className={styles.title}>{TYPE_TITLES[type]}</span>
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
          {type === "led" ? (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Colour</span>
              <select
                className={styles.input}
                value={value || "red"}
                onChange={(e) => setValue(e.target.value)}
              >
                <option value="red">Red</option>
                <option value="orange">Orange</option>
                <option value="yellow">Yellow</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="white">White</option>
                <option value="ir">IR (Infrared)</option>
                <option value="uv">UV (Ultraviolet)</option>
              </select>
            </label>
          ) : (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Value</span>
              <input
                className={styles.input}
                placeholder={VALUE_PLACEHOLDERS[type] ?? "e.g. value"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </label>
          )}
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
          <button data-testid="component-popup-place" className={styles.confirmBtn} onClick={handleConfirm}>Place</button>
        </div>
      </div>
    </div>
  );
}
