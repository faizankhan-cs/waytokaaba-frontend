import { expect, test } from "@playwright/test";

// Full-stack only (needs the API): the admin changes the visa & transport price and the Round Trip uses it.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@waytokaaba.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Dev-Admin-Pass-123";

test("admin sets the visa & transport price used by the round trip", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Customer inquiries" })).toBeVisible();

  await page.getByRole("link", { name: "Round trip settings" }).click();
  const price = page.getByLabel("Visa & transport price per person (PKR) *");
  const original = await price.inputValue();

  try {
    await price.fill("71500");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Settings saved.")).toBeVisible();

    await page.goto("/trip-planner");
    await expect(page.getByLabel(/Add Visa & transport/)).toBeVisible();
    await expect(page.getByText(/Add Visa & transport — .*71,500 per person/)).toBeVisible();
  } finally {
    await page.goto("/admin/settings");
    await page.getByLabel("Visa & transport price per person (PKR) *").fill(original);
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(page.getByText("Settings saved.")).toBeVisible();
  }
});
