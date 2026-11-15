import { expect, test, type Page } from "@playwright/test";

/** Private transport page. Works in preview mode (bundled data) and against the local API's demo seed. */

async function whatsappMessage(page: Page, click: () => Promise<void>): Promise<string> {
  const popupPromise = page.waitForEvent("popup");
  await click();
  const popup = await popupPromise;
  const text = new URL(popup.url()).searchParams.get("text") ?? "";
  await popup.close();
  return text;
}

test.describe("private transport", () => {
  test("header link opens the transport page with vehicles and routes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("link", { name: "Private Transport", exact: true }).first().click();
    await expect(page).toHaveURL(/\/transport$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Comfortable Rides");

    for (const name of ["Sedan", "H1-Staria", "Hi-Ace", "GMC", "Coaster"]) {
      await expect(page.getByRole("radio", { name: new RegExp(`^${name},`) })).toHaveCount(1);
    }
    const table = page.getByRole("table");
    await expect(table.getByRole("rowheader")).toHaveCount(12);
    await expect(table.getByRole("rowheader", { name: /Jeddah → Makkah/ })).toBeVisible();
    await expect(page.getByLabel("Booking notes")).toContainText("24 hours");
  });

  test("picking a vehicle highlights its prices and books it on WhatsApp", async ({ page }) => {
    await page.goto("/transport");
    await page.locator("label", { hasText: "Hi-Ace" }).click();

    await expect(page.getByRole("radio", { name: /^Hi-Ace,/ })).toBeChecked();
    await expect(page.getByRole("button", { name: "Hi-Ace", pressed: true })).toBeVisible();
    await expect(page.getByText("Showing prices for")).toContainText("Hi-Ace");

    const row = page.getByRole("row", { name: /Jeddah → Makkah/ });
    await expect(row).toContainText("25,100");

    const text = await whatsappMessage(page, () =>
      row.getByRole("link", { name: "Book Hi-Ace for Jeddah → Makkah on WhatsApp" }).click(),
    );
    expect(text).toContain("Jeddah → Makkah by Hi-Ace");
  });

  test("clicking a column header selects that vehicle", async ({ page }) => {
    await page.goto("/transport");
    await page.getByRole("button", { name: "Coaster" }).click();
    await expect(page.getByRole("radio", { name: /^Coaster,/ })).toBeChecked();
    await expect(page.getByRole("button", { name: "Coaster", pressed: true })).toBeVisible();
  });
});
