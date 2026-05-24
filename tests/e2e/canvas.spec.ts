import { test, expect } from "@playwright/test";
import { addBoard, placeWire, clickHole, anyWire, anyComponent } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("add board renders the hole grid", async ({ page }) => {
  // Board picker is shown until a board is added.
  await expect(page.getByTestId("addboard-stripboard")).toBeVisible();
  await addBoard(page);
  await expect(page.getByTestId("hole-2-2")).toBeVisible();
});

test("place a wire, select it, and delete it", async ({ page }) => {
  await addBoard(page);
  await placeWire(page);

  // Select the wire. The hit path is a thin curved stroke, so drive the
  // handler directly rather than relying on pixel-accurate hit-testing.
  await page.locator(anyWire).first().dispatchEvent("click");

  // Del Wire lives on the (default) Home tab and enables once a wire is selected.
  const delWire = page.getByTestId("ribbon-del-wire");
  await expect(delWire).toBeEnabled();
  await delWire.click();

  await expect(page.locator(anyWire)).toHaveCount(0);
});

test("place a resistor, then undo and redo", async ({ page }) => {
  await addBoard(page);

  // Components menu lives on the Insert tab.
  await page.getByRole("button", { name: "Insert" }).click();
  await page.getByTestId("ribbon-menu-components").click();
  await page.getByTestId("ribbon-tool-resistor").click();

  // Two holes → ComponentPopup → Place.
  await clickHole(page, "hole-0-0");
  await clickHole(page, "hole-2-2");
  await page.getByTestId("component-popup-place").click();
  await expect(page.locator(anyComponent)).toHaveCount(1);

  // Undo / Redo live on the Home tab.
  await page.getByRole("button", { name: "Home" }).click();
  await page.getByTestId("ribbon-undo").click();
  await expect(page.locator(anyComponent)).toHaveCount(0);
  await page.getByTestId("ribbon-redo").click();
  await expect(page.locator(anyComponent)).toHaveCount(1);
});
