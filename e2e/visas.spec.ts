import { expect, test, type Page } from "@playwright/test";

/** Visa section. Works in preview mode (bundled data) and against the local API's demo seed. */

/** Clicks a link that opens WhatsApp and returns the pre-filled message. */
async function whatsappMessage(page: Page, click: () => Promise<void>): Promise<{ href: string; text: string }> {
  const popupPromise = page.waitForEvent("popup");
  await click();
  const popup = await popupPromise;
  const opened = new URL(popup.url());
  await popup.close();
  return { href: opened.href, text: opened.searchParams.get("text") ?? "" };
}

test.describe("visas", () => {
  test("home page has a visa slider that links to the full list", async ({ page }) => {
    await page.goto("/");
    const slider = page.getByRole("region", { name: "Visa destinations" });
    await expect(slider).toBeVisible();
    await expect(slider.locator("article").first()).toBeVisible();
    expect(await slider.locator("article").count()).toBeGreaterThanOrEqual(4);

    await page.getByRole("link", { name: "View All Visas" }).click();
    await expect(page).toHaveURL(/\/visas$/);
    await expect(page.getByRole("heading", { level: 1, name: "Visas for Popular Destinations" })).toBeVisible();
  });

  test("visas page lists every country with price, timeline and both buttons", async ({ page }) => {
    await page.goto("/visas");
    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(6);

    const uae = cards.filter({ hasText: "United Arab Emirates" });
    await expect(uae.getByText("E-Visa", { exact: true })).toBeVisible();
    await expect(uae.getByText(/28,000/)).toBeVisible();
    await expect(uae.getByText("3–5 Working Days")).toBeVisible();
    await expect(uae.getByRole("link", { name: "View Requirements" })).toBeVisible();
    await expect(uae.getByRole("link", { name: /Inquire on WhatsApp/ })).toHaveCount(0);
    await expect(cards.filter({ hasText: "Thailand" }).getByText("Sticker Visa", { exact: true })).toBeVisible();
    await expect(cards.filter({ hasText: "Saudi Arabia" }).getByText("Umrah Visa", { exact: true })).toBeVisible();
  });

  test("detail page shows summary strip, tiers, inclusions, documents, steps and disclaimer", async ({ page }) => {
    await page.goto("/visas/uae-visa");
    await expect(page.getByRole("heading", { level: 1, name: /United Arab Emirates Visa/ })).toBeVisible();

    for (const label of ["Visa validity", "Allowed stay", "Entry type", "Processing time"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: "Visa options and pricing" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book via WhatsApp" })).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "What the price includes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Required documents" })).toBeVisible();
    await expect(page.getByText("Scanned passport valid for 6+ months")).toBeVisible();
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    await expect(page.getByText("Send documents on WhatsApp")).toBeVisible();
    await expect(page.getByText("Confirm and pay")).toBeVisible();
    await expect(page.getByText("Receive your visa")).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Important notice" })).toContainText("embassy or immigration authority");
    await expect(page.getByText("Visit or call our office")).toBeVisible();
    await expect(page.getByText("Allay Plaza", { exact: false }).first()).toBeVisible();
  });

  test("tier button pre-fills the tier and country", async ({ page }) => {
    await page.goto("/visas/uae-visa");
    const { text } = await whatsappMessage(page, () => page.getByRole("link", { name: "Book via WhatsApp" }).first().click());

    expect(text).toContain("30-Day Tourist Visa");
    expect(text).toContain("United Arab Emirates");
  });

  test("View Requirements jumps to the documents list", async ({ page }) => {
    await page.goto("/visas");
    await page.locator("article").filter({ hasText: "Malaysia" }).getByRole("link", { name: "View Requirements" }).click();
    await expect(page).toHaveURL(/\/visas\/malaysia-visa#requirements/);
    await expect(page.getByRole("heading", { name: "Required documents" })).toBeInViewport();
  });

  test("unknown visa shows a not-found page", async ({ page }) => {
    await page.goto("/visas/no-such-visa");
    await expect(page.getByText("We couldn't find that page")).toBeVisible();
  });
});
