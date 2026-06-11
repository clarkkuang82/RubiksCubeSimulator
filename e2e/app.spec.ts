import { expect, test, type Page } from "@playwright/test";

const stat = (page: Page, id: string) => page.getByTestId(id);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body[data-ready='true']")).toBeAttached();
});

test("E1: loads solved with a rendered player", async ({ page }) => {
  await expect(stat(page, "changed-total")).toHaveText("0");
  await expect(stat(page, "move-count")).toHaveText("0");
  // The player uses a closed shadow root, so check that the custom
  // element upgraded and renders at a real size instead.
  const upgraded = await page
    .locator("twisty-player")
    .evaluate((el) => el.constructor !== HTMLElement);
  expect(upgraded).toBe(true);
  const box = await page.locator("twisty-player").boundingBox();
  expect(box!.width).toBeGreaterThan(100);
  expect(box!.height).toBeGreaterThan(100);
});

test("E2: a single R changes 8 pieces", async ({ page }) => {
  await page.click('[data-move="R"]');
  await expect(stat(page, "changed-total")).toHaveText("8");
  await expect(stat(page, "corners-moved")).toHaveText("4");
  await expect(stat(page, "edges-moved")).toHaveText("4");
  await expect(stat(page, "corners-twisted")).toHaveText("0");
  await expect(stat(page, "edges-flipped")).toHaveText("0");
  await expect(stat(page, "move-count")).toHaveText("1");
});

test("E3: R followed by R' cancels out", async ({ page }) => {
  await page.click('[data-move="R"]');
  await page.click(`[data-move="R'"]`);
  await expect(stat(page, "changed-total")).toHaveText("0");
  await expect(stat(page, "move-count")).toHaveText("2");
});

test("E4: slice move M counts 16 via center normalization", async ({ page }) => {
  await page.getByTestId("alg-input").fill("M");
  await page.getByTestId("alg-apply").click();
  await expect(stat(page, "changed-total")).toHaveText("16");
  await expect(stat(page, "corners-moved")).toHaveText("8");
  await expect(stat(page, "edges-moved")).toHaveText("8");
});

test("E5: invalid algorithm shows an error and changes nothing", async ({ page }) => {
  await page.click('[data-move="R"]');
  await page.getByTestId("alg-input").fill("xyz!!");
  await page.getByTestId("alg-apply").click();
  await expect(stat(page, "alg-error")).toBeVisible();
  await expect(stat(page, "changed-total")).toHaveText("8");
  await expect(stat(page, "move-count")).toHaveText("1");
});

test("E6: highlight toggle applies and clears the stickering mask", async ({ page }) => {
  await page.click('[data-move="R"]');
  await page.getByTestId("highlight-toggle").check();

  const mask = await page
    .locator("twisty-player")
    .getAttribute("data-stickering-mask");
  expect(mask).not.toBeNull();
  const corners = mask!
    .split(",")
    .find((segment) => segment.startsWith("CORNERS:"))!
    .split(":")[1]!;
  expect(corners).toHaveLength(8);
  expect(corners.split("").filter((c) => c === "-")).toHaveLength(4);
  expect(corners.split("").filter((c) => c === "D")).toHaveLength(4);

  await page.getByTestId("highlight-toggle").uncheck();
  await expect(page.locator("twisty-player")).toHaveAttribute(
    "data-stickering-mask",
    "",
  );
});

test("E7: scramble produces a non-trivial state with zero user moves", async ({ page }) => {
  await page.getByTestId("scramble").click();
  await expect(stat(page, "move-count")).toHaveText("0");
  const total = Number(await stat(page, "changed-total").textContent());
  expect(total).toBeGreaterThan(0);
});

test("E8: reset returns everything to zero", async ({ page }) => {
  await page.getByTestId("scramble").click();
  await page.click('[data-move="U"]');
  await page.getByTestId("highlight-toggle").check();
  await page.getByTestId("reset").click();
  await expect(stat(page, "changed-total")).toHaveText("0");
  await expect(stat(page, "move-count")).toHaveText("0");
  // Highlight stays on, but on a solved cube nothing is highlighted.
  await expect(page.locator("twisty-player")).toHaveAttribute(
    "data-stickering-mask",
    "EDGES:DDDDDDDDDDDD,CORNERS:DDDDDDDD,CENTERS:------",
  );
});

test("E9: undo removes only the last move", async ({ page }) => {
  await page.click('[data-move="R"]');
  await page.click('[data-move="U"]');
  await page.getByTestId("undo").click();
  await expect(stat(page, "changed-total")).toHaveText("8");
  await expect(stat(page, "move-count")).toHaveText("1");
});
