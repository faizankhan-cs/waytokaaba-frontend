import { expect, test } from "@playwright/test";
import { deleteVisasNamed } from "./api-cleanup";

// Needs the API (excluded in preview mode). Always remove test records, even when a test fails part-way.
test.afterAll(async () => {
  await deleteVisasNamed("E2E Visa");
});

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@waytokaaba.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Dev-Admin-Pass-123";

test("admin can create a visa, see it on the site, edit it, and delete it", async ({ page }) => {
  const country = `E2E Visa ${Date.now()}`;

  await page.goto("/admin");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Customer inquiries" })).toBeVisible();

  // Create
  await page.goto("/admin/visas");
  await page.getByRole("link", { name: "Add visa" }).click();
  await page.getByLabel("Country *").fill(country);
  await page.getByLabel("Country code *").fill("TR");
  await page.getByLabel("Processing time *").fill("3–5 Working Days");
  await page.getByLabel("Visa validity *").fill("60 days to enter");
  await page.getByLabel("Allowed stay *").fill("30 days");
  await page.getByLabel("Landmark photo *").setInputFiles("e2e/fixtures/photo.jpg");
  await expect(page.getByAltText("Selected photo")).toBeVisible({ timeout: 30_000 });
  await page.getByLabel("Short summary *").fill("A test visa created by the end-to-end tests.");
  await page.getByLabel("Option 1 name").fill("Standard");
  await page.getByLabel("Option 1 price").fill("45000");
  await page.getByLabel("Required documents").fill("Passport copy\nPhoto");
  await page.getByRole("button", { name: "Create visa" }).click();
  await expect(page.getByText("Visa created.")).toBeVisible();

  // Visible on the public site, through the admin list's "View on site" link
  await page.goto("/admin/visas");
  const href = await page.locator("tr", { hasText: country }).getByRole("link", { name: /View on site/ }).getAttribute("href");
  await page.goto(href!);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(country);
  await expect(page.getByText("Passport copy")).toBeVisible();

  // Edit
  await page.goto("/admin/visas");
  await page.getByRole("link", { name: country, exact: true }).click();
  await page.getByLabel("Processing time *").fill("7 Working Days");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Visa saved.")).toBeVisible();

  // Delete, through the confirm popup
  await page.goto("/admin/visas");
  const row = page.locator("tr", { hasText: country });
  await expect(row).toContainText("7 Working Days");
  await row.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("Visa deleted.")).toBeVisible();
  await expect(page.getByRole("link", { name: country, exact: true })).toHaveCount(0);
});
