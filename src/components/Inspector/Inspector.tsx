import { HoleRef, ProjectFile } from "../../model/types";
import styles from "./Inspector.module.css";

interface InspectorProps {
  project: ProjectFile;
  pendingHole: HoleRef | null;
  selectedWireId: string | null;
  selectedComponentId: string | null;
  statusMessage: string;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}

export function Inspector({
  project,
  pendingHole,
  selectedWireId,
  selectedComponentId,
  statusMessage
}: InspectorProps) {
  const selectedWire = selectedWireId
    ? project.wires.find((w) => w.id === selectedWireId)
    : null;

  const selectedComponent = selectedComponentId
    ? project.components.find((c) => c.id === selectedComponentId)
    : null;

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
      </div>

      <div className={styles.group}>
        <div className={styles.groupTitle}>Selection</div>
        <Row
          label="Pending hole"
          value={pendingHole ? `(${pendingHole.row + 1}, ${pendingHole.col + 1})` : "—"}
        />
        {selectedWire && (
          <>
            <Row label="Wire" value={selectedWire.id.slice(0, 18) + "…"} />
            <Row
              label="From"
              value={`(${selectedWire.from.row + 1}, ${selectedWire.from.col + 1})`}
            />
            <Row
              label="To"
              value={`(${selectedWire.to.row + 1}, ${selectedWire.to.col + 1})`}
            />
          </>
        )}
        {selectedComponent && (
          <>
            <Row label="Type" value={selectedComponent.type} />
            <Row label="Label" value={selectedComponent.label} />
            <Row label="Value" value={selectedComponent.value} />
            {selectedComponent.tolerance && (
              <Row label="Tolerance" value={selectedComponent.tolerance} />
            )}
            {selectedComponent.voltageRating && (
              <Row label="Voltage" value={selectedComponent.voltageRating} />
            )}
          </>
        )}
        {!selectedWire && !selectedComponent && !pendingHole && (
          <div className={styles.empty}>Nothing selected</div>
        )}
      </div>

      <div className={styles.group}>
        <div className={styles.groupTitle}>Project</div>
        <Row label="Name" value={project.name} />
        <Row label="Updated" value={project.updatedAt.replace("T", " ").replace("Z", " UTC")} />
      </div>
    </aside>
  );
}
