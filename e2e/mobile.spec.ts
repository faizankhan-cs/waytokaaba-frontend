import { expect, test } from "@playwright/test";

test.describe("mobile layout", () => {
  test("hamburger menu opens, navigates and closes", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await menu.getByRole("link", { name: "Makkah Hotels" }).click();
    await expect(page).toHaveURL(/\/hotels\/makkah/);
    await expect(menu).toBeHidden();
  });

  test("filters are collapsible on small screens", async ({ page }) => {
    await page.goto("/hotels/madinah");
    const panel = page.locator("#filter-panel");
    await expect(panel).toBeHidden();
    await page.getByRole("button", { name: "Show filters" }).click();
    await expect(panel).toBeVisible();
    await panel.getByLabel(/4 stars/).check();
    await expect(page).toHaveURL(/stars=4/);
  });

  test("pages do not scroll horizontally", async ({ page }) => {
    test.setTimeout(180_000);
    for (const path of ["/", "/hotels/makkah", "/packages", "/hotels/makkah/al-noor-haram-view-hotel", "/packages/economy-15-day-umrah", "/contact"]) {
      await page.goto(path);
      await page.waitForLoadState("load");
      await page.locator("footer").waitFor();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(1);
    }
  });
});
