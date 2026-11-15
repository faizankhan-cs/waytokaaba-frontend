import { expect, test } from "@playwright/test";

// Errors are shown in popups (not inline). Runs in preview and full-stack mode.
test.describe("error popups", () => {
  test("round trip lists what is missing per stay and takes you to it", async ({ page }) => {
    await page.goto("/trip-planner");
    await page.getByRole("button", { name: "Generate slip" }).click();

    const popup = page.getByRole("dialog", { name: "Finish your stays first" });
    await expect(popup).toBeVisible();
    await expect(popup.getByRole("listitem")).toHaveCount(3);
    await expect(popup).toContainText("Stay 1 · Makkah");
    await expect(popup).toContainText("Choose a hotel.");
    await expect(page.locator("ol").getByRole("alert")).toHaveCount(0); // nothing inline under the stays

    await popup.getByRole("button", { name: "OK" }).click();
    await expect(popup).toBeHidden();
    const hotel = page.getByLabel("Hotel in Makkah").first();
    await expect(hotel).toBeFocused();
    await expect(hotel).toHaveAttribute("aria-invalid", "true");
  });

  test("home search: a past check-in date opens a popup", async ({ page }) => {
    await page.goto("/");
    const search = page.getByRole("form", { name: "Search hotels" });
    await search.getByLabel("Check-in").fill("2020-01-01");
    await search.getByRole("button", { name: "Search" }).click();

    const popup = page.getByRole("dialog", { name: "Please check your dates" });
    await expect(popup).toContainText("Check-in date can't be in the past.");
    await popup.getByRole("button", { name: "OK" }).click();
    await expect(search.getByLabel("Check-in")).toBeFocused();
    await expect(page).toHaveURL(/\/$/);
  });

  test("hotel filters: max price below min price opens a popup", async ({ page }) => {
    await page.goto("/hotels/makkah");
    await page.getByLabel(/^Min/).fill("50000");
    await page.getByLabel(/^Max/).fill("10000");
    await page.getByRole("button", { name: "Apply price" }).click();

    const popup = page.getByRole("dialog", { name: "Please check the price range" });
    await expect(popup).toContainText("can't be lower than the min price");
    await popup.getByRole("button", { name: "OK" }).click();
    await expect(page.getByLabel(/^Max/)).toBeFocused();
    await expect(page).not.toHaveURL(/maxPrice=10000/);
  });
});
