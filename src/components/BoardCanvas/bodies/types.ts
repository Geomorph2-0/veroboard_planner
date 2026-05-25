import { ConnectorSubType, FreeComponent } from "../../../model/types";

export interface TwoHoleBodyProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  selected: boolean;
}

export interface ConnectorBodyProps extends TwoHoleBodyProps {
  subType: ConnectorSubType;
}

export interface BatteryBodyProps {
  fc: FreeComponent;
  selected: boolean;
  pendingTerminal: "pos" | "neg" | null;
  onSelect: () => void;
  onTerminalClick: (terminal: "pos" | "neg") => void;
  onMouseDown: (e: React.MouseEvent) => void;
}
