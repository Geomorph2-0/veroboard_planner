import { FreeComponent, Wire } from "../../../model/types";
import { AWGSize, awgToPx } from "../../../model/wireThickness";
import styles from "../BoardCanvas.module.css";
import { wireEndpointPos, wireColor, arcPath } from "../geometry";

interface WireLayerProps {
  wires: Wire[];
  freeComponents: FreeComponent[];
  selectedWireId: string | null;
  onWireSelect: (wireId: string) => void;
}

export function WireLayer({ wires, freeComponents, selectedWireId, onWireSelect }: WireLayerProps) {
  return (
    <>
      {wires.map((wire, i) => {
        const from = wireEndpointPos(wire.from, freeComponents);
        const to = wireEndpointPos(wire.to, freeComponents);
        const color = wireColor(wire, i);
        const selected = wire.id === selectedWireId;
        const baseW = awgToPx(wire.thickness as AWGSize | undefined);
        return (
          <g key={wire.id}>
            <path d={arcPath(from, to)} fill="none" stroke={color} strokeWidth={selected ? baseW + 1.5 : baseW}
              strokeLinecap="round" opacity={selected ? 1 : 0.85}
              className={selected ? styles.wireSelected : styles.wire} />
            <path d={arcPath(from, to)} fill="none" stroke="transparent" strokeWidth={12}
              className={styles.wireHit}
              data-testid={`wire-${wire.id}`}
              onClick={(e) => { e.stopPropagation(); onWireSelect(wire.id); }} />
          </g>
        );
      })}
    </>
  );
}
