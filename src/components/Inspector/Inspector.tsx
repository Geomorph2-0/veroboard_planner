import { useEffect, useState } from "react";
import { Component, HoleRef, ProjectFile, isTerminalRef } from "../../model/types";
import { WIRE_PALETTE } from "../../model/wireColors";
import { AWG_SIZES, AWGSize } from "../../model/wireThickness";
import styles from "./Inspector.module.css";

interface InspectorProps {
  project: ProjectFile;
  pendingHole: HoleRef | null;
  selectedWireId: string | null;
  selectedComponentId: string | null;
  statusMessage: string;
  onUpdateComponent: (id: string, fields: Partial<Pick<Component, "label" | "value" | "tolerance" | "voltageRating">>) => void;
  onRecolourWire?: (wireId: string, color: string) => void;
  onReThickenWire?: (wireId: string, thickness: AWGSize) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}

function EditableRow({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { setDraft(value); }, [value]);

  if (editing) {
    return (
      <div className={styles.row}>
        <span className={styles.rowLabel}>{label}</span>
        <input
          className={styles.rowInput}
          value={draft}
          autoFocus
          onChange={e => setDraft(e.target.value)}
          onBlur={() => { onSave(draft.trim() || value); setEditing(false); }}
          onKeyDown={e => {
            if (e.key === "Enter") { onSave(draft.trim() || value); setEditing(false); }
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
        />
      </div>
    );
  }
  return (
    <div className={styles.row} onClick={() => setEditing(true)} title="Click to edit" style={{ cursor: "text" }}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={`${styles.rowValue} ${styles.rowEditable}`}>{value}</span>
    </div>
  );
}

function derivedComponentInfo(c: Component): string | null {
  if (c.type === "ic") {
    const pinsPerSide = Math.abs(c.holeA.row - c.holeB.row) + 1;
    return `DIP-${pinsPerSide * 2} · ${pinsPerSide} pins/side`;
  }
  if (c.type === "connector") {
    const isDouble = c.connectorSubType === "male-double" || c.connectorSubType === "female-double";
    const gender = c.connectorSubType?.startsWith("female") ? "female" : "male";
    if (isDouble) {
      const pinsPerRow = Math.abs(c.holeA.col - c.holeB.col) + 1;
      return `2×${pinsPerRow} · double-row · ${gender}`;
    }
    const pins = Math.abs(c.holeA.row - c.holeB.row) + Math.abs(c.holeA.col - c.holeB.col) + 1;
    const orientation = c.holeA.row === c.holeB.row ? "horizontal" : "vertical";
    return `${pins}-pin · ${orientation} · ${gender}`;
  }
  return null;
}

export function Inspector({
  project,
  pendingHole,
  selectedWireId,
  selectedComponentId,
  statusMessage,
  onUpdateComponent,
  onRecolourWire,
  onReThickenWire
}: InspectorProps) {
  const selectedWire = selectedWireId
    ? project.wires.find((w) => w.id === selectedWireId)
    : null;

  const selectedComponent = selectedComponentId
    ? project.components.find((c) => c.id === selectedComponentId)
    : null;

  const byType = project.components.reduce<Record<string, number>>((acc, c) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>Inspector</div>

      <div className={styles.statusBar}>{statusMessage}</div>

      <div className={styles.group}>
        <div className={styles.groupTitle}>Board</div>
        <Row label="Size" value={project.board ? `${project.board.rows} × ${project.board.cols}` : "—"} />
        <Row label="Type" value={project.board?.type ?? "—"} />
        <Row label="Wires" value={String(project.wires.length)} />
        <Row label="Components" value={String(project.components.length)} />
        {project.components.length > 0 && (
          <div className={styles.breakdown}>
            {Object.entries(byType).map(([type, count]) => (
              <span key={type} className={styles.breakdownItem}>{count}× {type}</span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.group}>
        <div className={styles.groupTitle}>Selection</div>
        <Row
          label="Pending hole"
          value={pendingHole ? `(${pendingHole.row + 1}, ${pendingHole.col + 1})` : "—"}
        />
        {selectedWire && (
          <>
            <Row label="Wire" value={selectedWire.id.slice(0, 14) + "…"} />
            <div className={styles.row}>
              <span className={styles.rowLabel}>Colour</span>
            </div>
            <div className={styles.paletteGrid}>
              {WIRE_PALETTE.map((c) => (
                <button
                  key={c}
                  className={`${styles.paletteDot} ${c === selectedWire.color ? styles.paletteDotActive : ""}`}
                  style={{ background: c }}
                  title={c}
                  onClick={() => onRecolourWire?.(selectedWire.id, c)}
                />
              ))}
            </div>
            <div className={styles.row}>
              <span className={styles.rowLabel}>Gauge (AWG)</span>
            </div>
            <div className={styles.awgGrid}>
              {AWG_SIZES.map((awg) => (
                <button
                  key={awg}
                  className={`${styles.awgDot} ${awg === selectedWire.thickness ? styles.awgDotActive : ""}`}
                  title={`AWG ${awg}`}
                  onClick={() => onReThickenWire?.(selectedWire.id, awg)}
                >
                  {awg}
                </button>
              ))}
            </div>
            <Row label="From" value={isTerminalRef(selectedWire.from) ? `${selectedWire.from.terminal === "pos" ? "+" : "−"} terminal` : `R${(selectedWire.from).row + 1} C${(selectedWire.from).col + 1}`} />
            <Row label="To" value={isTerminalRef(selectedWire.to) ? `${selectedWire.to.terminal === "pos" ? "+" : "−"} terminal` : `R${(selectedWire.to).row + 1} C${(selectedWire.to).col + 1}`} />
          </>
        )}
        {selectedComponent && (
          <>
            <Row label="Type" value={selectedComponent.type} />
            {derivedComponentInfo(selectedComponent) && (
              <Row label="Package" value={derivedComponentInfo(selectedComponent)!} />
            )}
            <EditableRow
              label="Label"
              value={selectedComponent.label}
              onSave={v => onUpdateComponent(selectedComponent.id, { label: v })}
            />
            <EditableRow
              label="Value"
              value={selectedComponent.value}
              onSave={v => onUpdateComponent(selectedComponent.id, { value: v })}
            />
            {selectedComponent.tolerance !== undefined && (
              <EditableRow
                label="Tolerance"
                value={selectedComponent.tolerance}
                onSave={v => onUpdateComponent(selectedComponent.id, { tolerance: v })}
              />
            )}
            {selectedComponent.voltageRating !== undefined && (
              <EditableRow
                label="Voltage"
                value={selectedComponent.voltageRating}
                onSave={v => onUpdateComponent(selectedComponent.id, { voltageRating: v })}
              />
            )}
            <Row label="Hole A" value={`R${selectedComponent.holeA.row + 1} C${selectedComponent.holeA.col + 1}`} />
            <Row label="Hole B" value={`R${selectedComponent.holeB.row + 1} C${selectedComponent.holeB.col + 1}`} />
          </>
        )}
        {!selectedWire && !selectedComponent && !pendingHole && (
          <div className={styles.empty}>Nothing selected</div>
        )}
      </div>

      <div className={styles.group}>
        <div className={styles.groupTitle}>Project</div>
        <Row label="Name" value={project.name} />
        <Row label="Updated" value={project.updatedAt.replace("T", " ").slice(0, 19) + " UTC"} />
      </div>
    </aside>
  );
}
