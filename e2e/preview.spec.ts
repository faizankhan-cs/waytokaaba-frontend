import { expect, test } from "@playwright/test";

/**
 * Preview mode (NEXT_PUBLIC_PREVIEW_MODE=true, no backend). Run with:  E2E_PREVIEW=1 npm run test:e2e
 */
test.describe("preview mode", () => {
  test("shows the preview banner and sample data without a backend", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Preview version — sample listings for review.")).toBeVisible();
    await expect(page.locator("article").first()).toBeVisible();
    expect(await page.locator("article").count()).toBeGreaterThanOrEqual(6);
    await expect(page.getByText("We couldn't load this right now")).toHaveCount(0);
  });

  test("hotel inquiry opens WhatsApp with the details filled in", async ({ page }) => {
    await page.goto("/hotels/makkah/zamzam-pearl-hotel?checkIn=2027-02-01&checkOut=2027-02-06&guests=3");
    await page.getByLabel("Full name").fill("Preview Tester");
    await page.getByLabel("Email").fill("preview@example.com");
    await page.getByLabel("Phone / WhatsApp").fill("+92 300 1112233");
    await page.getByLabel("Preferred room").selectOption("Triple Room");
    await page.getByLabel(/Message/).fill("Please share availability for a triple room.");

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Send Inquiry" }).click();
    const popup = await popupPromise;
    // wa.me may redirect to api.whatsapp.com/send?phone=…&text=… (spaces encoded as "+"), so parse properly.
    const opened = new URL(popup.url());
    await popup.close();
    const text = opened.searchParams.get("text") ?? "";

    expect(opened.href).toContain("923445010005");
    expect(text).toContain("About: Zamzam Pearl Hotel");
    expect(text).toContain("Name: Preview Tester");
    expect(text).toContain("Check-in: 2027-02-01");
    expect(text).toContain("Guests: 3");
    expect(text).toContain("Preferred room: Triple Room");
    await expect(page.getByText("Almost done — send it on WhatsApp")).toBeVisible();
  });

  test("invalid email is caught before opening WhatsApp", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Full name").fill("Preview Tester");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Phone / WhatsApp").fill("+92 300 1112233");
    await page.getByLabel(/Message/).fill("I would like more information please.");
    await page.getByRole("button", { name: "Send Inquiry" }).click();
    const popup = page.getByRole("dialog", { name: "Please check these details" });
    await expect(popup.getByText("Please enter a valid email address.")).toBeVisible();
    await popup.getByRole("button", { name: "OK" }).click();
    await expect(page.getByLabel("Email")).toBeFocused();
  });

  test("admin area is not available", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);
  });
});
