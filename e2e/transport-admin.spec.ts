import { expect, test } from "@playwright/test";
import { deleteTransportNamed } from "./api-cleanup";

// Needs the API (excluded in preview mode). Always remove test records, even when a test fails part-way.
test.afterAll(async () => {
  await deleteTransportNamed("E2E");
});

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@waytokaaba.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Dev-Admin-Pass-123";

test("admin can add a vehicle and a route with prices, see them on the site, edit and delete them", async ({ page }) => {
  test.setTimeout(240_000);
  const stamp = Date.now();
  const vehicle = `E2E Van ${stamp}`;
  const from = `E2E From ${stamp}`;

  await page.goto("/admin");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Customer inquiries" })).toBeVisible();

  // Vehicle
  await page.goto("/admin/transport");
  await page.getByRole("link", { name: "Add vehicle" }).click();
  await page.getByLabel("Vehicle name *").fill(vehicle);
  await page.getByLabel("Seats *").fill("8");
  await page.getByLabel("Bags *").fill("6");
  await page.getByLabel("Vehicle photo *").setInputFiles("e2e/fixtures/photo.jpg");
  await expect(page.getByAltText("Selected photo")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Create vehicle" }).click();
  await expect(page.getByText("Vehicle created.")).toBeVisible();

  // Route with a price for the new vehicle and the Sedan
  await page.goto("/admin/transport");
  await page.getByRole("link", { name: "Add route" }).click();
  await page.getByLabel("From *").fill(from);
  await page.getByLabel("To", { exact: true }).fill("E2E Destination");
  await page.getByLabel(`${vehicle} price`).fill("12345");
  await page.getByLabel("Sedan price").fill("9900");
  await page.getByRole("button", { name: "Create route" }).click();
  await expect(page.getByText("Route created.")).toBeVisible();

  // Edit the price
  await page.getByLabel(`${vehicle} price`).fill("13000");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Route saved.")).toBeVisible();

  // Public page shows the vehicle and the new price
  await page.goto("/transport");
  await page.locator("label", { hasText: vehicle }).click();
  await expect(page.getByRole("row", { name: new RegExp(from) })).toContainText("13,000");

  // Delete the route, then the vehicle
  await page.goto("/admin/transport");
  await page.locator("tr", { hasText: from }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("Route deleted.")).toBeVisible();

  await page.locator("tr", { hasText: vehicle }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("Vehicle deleted.")).toBeVisible();
  await expect(page.locator("tr", { hasText: vehicle })).toHaveCount(0);
});
