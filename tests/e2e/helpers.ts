import { Page, expect } from "@playwright/test";

/**
 * Add a board via the picker and wait for the grid to render.
 * Defaults to perfboard: stripboard draws copper-strip <line>s across each row
 * that intercept hole clicks in the browser; perfboard has isolated pads and the
 * exact same placement logic, so it's the reliable choice for interaction tests.
 */
export async function addBoard(
  page: Page,
  type: "stripboard" | "perfboard" = "perfboard",
  rows = 10,
  cols = 10,
) {
  await page.getByTestId(`addboard-${type}`).click();
  await page.getByTestId("addboard-rows").fill(String(rows));
  await page.getByTestId("addboard-cols").fill(String(cols));
  await page.getByTestId("addboard-confirm").click();
  await expect(page.getByTestId("hole-0-0")).toBeVisible();
}

/**
 * Click a hole. The pad and hole circles share one `<g onClick>`; the pad
 * visually covers the inner hole circle, so a force click is needed — the event
 * still bubbles to the group handler regardless of which circle is on top.
 */
export async function clickHole(page: Page, testId: string) {
  await page.getByTestId(testId).click({ force: true });
}

/** Place a wire between two holes (default tool is "wire"). */
export async function placeWire(page: Page, a = "hole-0-0", b = "hole-0-3") {
  await clickHole(page, a);
  await clickHole(page, b);
  await expect(page.locator('[data-testid^="wire-"]').first()).toBeVisible();
}

export const anyWire = '[data-testid^="wire-"]';
export const anyComponent = '[data-testid^="component-"]';
