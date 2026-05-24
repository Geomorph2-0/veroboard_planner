import { Component } from "../../../model/types";
import styles from "../BoardCanvas.module.css";
import { holeCenter } from "../geometry";
import { LEDBody, SchematicLEDBody } from "../bodies/LEDBody";
import { ResistorBody } from "../bodies/ResistorBody";
import { CapacitorBody } from "../bodies/CapacitorBody";
import { DiodeBody } from "../bodies/DiodeBody";
import { InductorBody } from "../bodies/InductorBody";
import { CrystalBody } from "../bodies/CrystalBody";
import { ICBody } from "../bodies/ICBody";
import { ConnectorBody } from "../bodies/ConnectorBody";

interface ComponentLayerProps {
  components: Component[];
  ledSymbolStyle: "physical" | "schematic";
  selectedComponentId: string | null;
  onComponentSelect: (componentId: string) => void;
}

export function ComponentLayer({ components, ledSymbolStyle, selectedComponentId, onComponentSelect }: ComponentLayerProps) {
  return (
    <>
      {components.map((component) => {
        const from = holeCenter(component.holeA);
        const to = holeCenter(component.holeB);
        const selected = component.id === selectedComponentId;
        return (
          <g key={component.id} className={styles.componentHit}
            data-testid={`component-${component.id}`}
            onClick={(e) => { e.stopPropagation(); onComponentSelect(component.id); }}
          >
            {component.type === "resistor"
              ? <ResistorBody from={from} to={to} selected={selected} />
              : component.type === "capacitor"
              ? <CapacitorBody from={from} to={to} selected={selected} />
              : component.type === "diode"
              ? <DiodeBody from={from} to={to} selected={selected} />
              : component.type === "inductor"
              ? <InductorBody from={from} to={to} selected={selected} />
              : component.type === "crystal"
              ? <CrystalBody from={from} to={to} selected={selected} />
              : component.type === "ic"
              ? <ICBody from={from} to={to} selected={selected} />
              : component.type === "connector"
              ? <ConnectorBody from={from} to={to} selected={selected} />
              : component.type === "led"
              ? ledSymbolStyle === "schematic"
                ? <SchematicLEDBody from={from} to={to} selected={selected} value={component.value} />
                : <LEDBody from={from} to={to} selected={selected} value={component.value} />
              : <CapacitorBody from={from} to={to} selected={selected} />}
            <text x={(from.x + to.x) / 2} y={Math.min(from.y, to.y) - 10}
              className={styles.componentLabel} textAnchor="middle">
              {component.label}
            </text>
          </g>
        );
      })}
    </>
  );
}
