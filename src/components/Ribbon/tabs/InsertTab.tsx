import { useEffect, useState } from "react";
import { EditorTool } from "../../../editor/interactions";
import { BoardType } from "../../../model/types";
import { AWGSize } from "../../../model/wireThickness";
import { RibbonBtn } from "../shared/RibbonButton";
import { Group } from "../shared/RibbonGroup";
import { Divider } from "../shared/RibbonDivider";
import { WireBtn } from "../parts/WireBtn";
import { ComponentsMenuBtn } from "../parts/ComponentsMenuBtn";
import { BatteryMenuBtn } from "../parts/BatteryMenuBtn";
import styles from "../Ribbon.module.css";

export function InsertTab({
  tool, boardType, rows, cols, wireColour, wireThickness,
  onToolChange, onBoardTypeChange, onResizeBoard, onWireColourChange, onWireThicknessChange,
}: {
  tool: EditorTool;
  boardType: BoardType | null;
  rows: number;
  cols: number;
  wireColour: string | null;
  wireThickness: AWGSize;
  onToolChange: (tool: EditorTool) => void;
  onBoardTypeChange: (type: BoardType) => void;
  onResizeBoard: (rows: number, cols: number) => void;
  onWireColourChange: (colour: string) => void;
  onWireThicknessChange: (thickness: AWGSize) => void;
}) {
  const [rowsInput, setRowsInput] = useState(String(rows));
  const [colsInput, setColsInput] = useState(String(cols));

  useEffect(() => {
    setRowsInput(String(rows));
    setColsInput(String(cols));
  }, [rows, cols]);

  return (
    <>
      <Group label="Wire">
        <WireBtn active={tool === "wire"} wireColour={wireColour} wireThickness={wireThickness} onSelect={() => onToolChange("wire")} onColourChange={onWireColourChange} onThicknessChange={onWireThicknessChange} />
      </Group>
      <Divider />
      <Group label="Components">
        <ComponentsMenuBtn tool={tool} onToolChange={onToolChange} />
      </Group>
      <Divider />
      <Group label="Power">
        <BatteryMenuBtn />
      </Group>
      <Divider />
      <Group label="Board">
        <RibbonBtn icon="≡" label="Stripboard" onClick={() => onBoardTypeChange("stripboard")} active={boardType === "stripboard"} disabled={!boardType} />
        <RibbonBtn icon="⊞" label="Perfboard" onClick={() => onBoardTypeChange("perfboard")} active={boardType === "perfboard"} disabled={!boardType} />
      </Group>
      <Divider />
      <Group label="Board Size">
        <div className={styles.sizeRow}>
          <label className={styles.sizeField}>
            <span className={styles.sizeFieldLabel}>Rows</span>
            <input className={styles.sizeInput} type="number" min={1} value={rowsInput} onChange={(e) => setRowsInput(e.target.value)} />
          </label>
          <span className={styles.sizeSep}>×</span>
          <label className={styles.sizeField}>
            <span className={styles.sizeFieldLabel}>Cols</span>
            <input className={styles.sizeInput} type="number" min={1} value={colsInput} onChange={(e) => setColsInput(e.target.value)} />
          </label>
          <button type="button" className={styles.applyBtn} onClick={() => onResizeBoard(parseInt(rowsInput, 10), parseInt(colsInput, 10))}>Apply</button>
        </div>
      </Group>
    </>
  );
}
