import { test, expect } from "@playwright/test";
import { addBoard, placeWire, anyWire } from "./helpers";

test("save to JSON, reload, re-open — the wire survives the round-trip", async ({ page }) => {
  await page.goto("/");
  await addBoard(page);
  await placeWire(page);

  // Save triggers a JSON file download.
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    (async () => {
      await page.getByTestId("ribbon-file-menu").click();
      await page.getByTestId("ribbon-file-save").click();
    })(),
  ]);
  const savedPath = await download.path();
  expect(savedPath).toBeTruthy();

  // Reload — persistence is file-based, so the board resets to the picker.
  await page.goto("/");
  await expect(page.getByTestId("addboard-stripboard")).toBeVisible();

  // Upload the saved file directly via the hidden file input (bypasses the OS dialog).
  await page.getByTestId("ribbon-file-input").setInputFiles(savedPath!);

  // Board and wire are restored.
  await expect(page.getByTestId("hole-0-0")).toBeVisible();
  await expect(page.locator(anyWire).first()).toBeVisible();
});
