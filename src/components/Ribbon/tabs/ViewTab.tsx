import { RibbonBtn } from "../shared/RibbonButton";
import { Group } from "../shared/RibbonGroup";

export function ViewTab({ theme, ledSymbolStyle, onToggleTheme, onToggleLedSymbolStyle }: {
  theme: "dark" | "light";
  ledSymbolStyle: "physical" | "schematic";
  onToggleTheme: () => void;
  onToggleLedSymbolStyle: () => void;
}) {
  return (
    <>
      <Group label="Theme">
        <RibbonBtn icon="☾" label="Dark" onClick={() => theme !== "dark" && onToggleTheme()} active={theme === "dark"} />
        <RibbonBtn icon="☀" label="Light" onClick={() => theme !== "light" && onToggleTheme()} active={theme === "light"} />
      </Group>
      <Group label="LED Symbol">
        <RibbonBtn icon="◉" label="Physical" onClick={() => ledSymbolStyle !== "physical" && onToggleLedSymbolStyle()} active={ledSymbolStyle === "physical"} />
        <RibbonBtn icon="◁|" label="Schematic" onClick={() => ledSymbolStyle !== "schematic" && onToggleLedSymbolStyle()} active={ledSymbolStyle === "schematic"} />
      </Group>
    </>
  );
}
