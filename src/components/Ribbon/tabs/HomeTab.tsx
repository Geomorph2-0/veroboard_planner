import { RibbonBtn } from "../shared/RibbonButton";
import { Group } from "../shared/RibbonGroup";
import { Divider } from "../shared/RibbonDivider";

export function HomeTab({
  canUndo, canRedo, canDisconnectWire, canRemoveComponent,
  onUndo, onRedo, onDisconnectSelectedWire, onRemoveSelectedComponent,
}: {
  canUndo: boolean;
  canRedo: boolean;
  canDisconnectWire: boolean;
  canRemoveComponent: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDisconnectSelectedWire: () => void;
  onRemoveSelectedComponent: () => void;
}) {
  return (
    <>
      <Group label="History">
        <RibbonBtn icon="↩" label="Undo" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)" testId="ribbon-undo" />
        <RibbonBtn icon="↪" label="Redo" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" testId="ribbon-redo" />
      </Group>
      <Divider />
      <Group label="Selection">
        <RibbonBtn icon="✂" label="Del Wire" onClick={onDisconnectSelectedWire} disabled={!canDisconnectWire} testId="ribbon-del-wire" />
        <RibbonBtn icon="✕" label="Del Part" onClick={onRemoveSelectedComponent} disabled={!canRemoveComponent} testId="ribbon-del-part" />
      </Group>
    </>
  );
}
