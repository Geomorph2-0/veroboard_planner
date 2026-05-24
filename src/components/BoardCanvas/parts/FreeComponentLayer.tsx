import { FreeComponent, TerminalRef } from "../../../model/types";
import { BatteryBody } from "../bodies/BatteryBody";
import { LiIonBatteryBody } from "../bodies/LiIonBatteryBody";

interface FreeComponentLayerProps {
  freeComponents: FreeComponent[];
  selectedFreeComponentId: string | null;
  pendingTerminalRef: TerminalRef | null;
  onFreeComponentSelect: (id: string) => void;
  onTerminalClick: (componentId: string, terminal: "pos" | "neg") => void;
  onBatteryMouseDown: (e: React.MouseEvent, fc: FreeComponent) => void;
}

export function FreeComponentLayer({
  freeComponents,
  selectedFreeComponentId,
  pendingTerminalRef,
  onFreeComponentSelect,
  onTerminalClick,
  onBatteryMouseDown,
}: FreeComponentLayerProps) {
  return (
    <>
      {freeComponents.map((fc) => {
        const selected = fc.id === selectedFreeComponentId;
        const ptRef = pendingTerminalRef?.componentId === fc.id ? pendingTerminalRef.terminal : null;
        const bodyProps = {
          key: fc.id,
          fc,
          selected,
          pendingTerminal: ptRef,
          onSelect: () => onFreeComponentSelect(fc.id),
          onTerminalClick: (terminal: "pos" | "neg") => onTerminalClick(fc.id, terminal),
          onMouseDown: (e: React.MouseEvent) => onBatteryMouseDown(e, fc),
        };
        return fc.subType === "18650"
          ? <LiIonBatteryBody {...bodyProps} />
          : <BatteryBody {...bodyProps} />;
      })}
    </>
  );
}
