import { expect, test } from "@playwright/test";

test.describe("public site", () => {
  test("homepage shows hero search, featured packages and hotels for both cities", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Your Sacred Journey Begins With");
    await expect(page.getByRole("heading", { name: "Featured Umrah Packages" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Popular Hotels in Makkah" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Popular Hotels in Madinah" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Why Choose Way To Kaaba?" })).toBeVisible();
    // Data loaded from the API
    await expect(page.locator("article").first()).toBeVisible();
    expect(await page.locator("article").count()).toBeGreaterThanOrEqual(6);
  });

  test("hero search navigates to the city results with dates and guests", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Madinah", { exact: true }).first().click();
    await page.getByLabel("Check-in").fill("2027-01-10");
    await page.getByLabel("Check-out").fill("2027-01-15");
    await page.getByRole("button", { name: "More guests" }).click(); // 3 guests
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(/\/hotels\/madinah\?guests=3&checkIn=2027-01-10&checkOut=2027-01-15/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hotels in Madinah");
    await expect(page.getByText(/hotels? found in Madinah/)).toBeVisible();
    await expect(page.getByText("availability is confirmed by our team")).toBeVisible();
  });

  test("hotel filters and sorting update results", async ({ page }) => {
    await page.goto("/hotels/makkah");
    await expect(page.getByText("6 hotels found in Makkah")).toBeVisible();

    await page.getByLabel(/5 stars/).check();
    await expect(page).toHaveURL(/stars=5/);
    await expect(page.getByText("2 hotels found in Makkah")).toBeVisible();

    await page.getByLabel("Sort by").selectOption("price_asc");
    await expect(page).toHaveURL(/sort=price_asc/);
    const names = await page.locator("article h3").allTextContents();
    expect(names).toEqual(["Safa Grand Residence", "Al Noor Haram View Hotel"]);

    await page.getByRole("link", { name: "Clear all filters" }).click();
    await expect(page.getByText("6 hotels found in Makkah")).toBeVisible();

    await page.getByLabel("Max (PKR)").fill("20000");
    await page.getByRole("button", { name: "Apply price" }).click();
    await expect(page).toHaveURL(/maxPrice=20000/);
    await expect(page.getByText("2 hotels found in Makkah")).toBeVisible();

    await page.getByLabel("Search by hotel name").fill("aziziyah");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByText("1 hotel found in Makkah")).toBeVisible();
  });

  test("guest capacity filter only shows hotels with large enough rooms", async ({ page }) => {
    await page.goto("/hotels/madinah");
    await page.getByLabel("Guests per room").selectOption("5");
    await expect(page).toHaveURL(/guests=5/);
    await expect(page.getByText(/hotels? found in Madinah/)).toBeVisible();
    const capacities = await page.locator("article").getByText(/Rooms for up to \d+ guests/).allTextContents();
    expect(capacities.length).toBeGreaterThan(0);
    for (const c of capacities) expect(Number(c.match(/\d+/)![0])).toBeGreaterThanOrEqual(5);
  });

  test("hotel detail page shows gallery, rooms, facilities and inquiry form", async ({ page }) => {
    await page.goto("/hotels/makkah/zamzam-pearl-hotel?checkIn=2027-02-01&checkOut=2027-02-06&guests=3");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Zamzam Pearl Hotel");
    await expect(page.getByRole("heading", { name: "Room types & pricing" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Facilities" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Request this hotel" })).toBeVisible();
    await expect(page.getByLabel("Check-in")).toHaveValue("2027-02-01");
    await expect(page.getByLabel("Guests")).toHaveValue("3");
    await page.getByRole("button", { name: /Show image 2/ }).click();
  });

  test("packages page filters by type and duration, and opens details", async ({ page }) => {
    await page.goto("/packages");
    await expect(page.getByText("7 packages available")).toBeVisible();

    await page.getByLabel("Luxury").check();
    await expect(page.getByText("1 package available")).toBeVisible();
    await page.getByLabel("Luxury").uncheck();

    await page.getByRole("button", { name: "8 – 14 days" }).click();
    await expect(page).toHaveURL(/minDays=8&maxDays=14|maxDays=14&minDays=8/);
    await expect(page.getByText("4 packages available")).toBeVisible();

    await page.getByLabel("Sort by").selectOption("price_desc");
    const first = page.locator("article h3").first();
    await expect(first).toHaveText("Luxury 12-Day Haram View Umrah");
    await first.getByRole("link").click();

    await expect(page).toHaveURL(/\/packages\/luxury-12-day-haram-view-umrah/);
    await expect(page.getByRole("heading", { name: "Included hotels" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What's included" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Al Noor Haram View Hotel" })).toBeVisible();
  });

  test("unknown hotel and city show the not-found page", async ({ page }) => {
    await page.goto("/hotels/jeddah");
    await expect(page.getByText("We couldn't find that page")).toBeVisible();
    await page.goto("/packages/does-not-exist");
    await expect(page.getByText("We couldn't find that page")).toBeVisible();
  });
});
