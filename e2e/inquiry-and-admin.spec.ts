import { expect, test, type Page } from "@playwright/test";
import { deleteHotelsNamed, restorePackageDescription } from "./api-cleanup";

// Always remove test records, even when a test fails part-way.
test.afterAll(async () => {
  await deleteHotelsNamed("E2E Hotel");
  await restorePackageDescription("short-7-day-umrah");
});

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@waytokaaba.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "Dev-Admin-Pass-123";

async function login(page: Page) {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Customer inquiries" })).toBeVisible();
}

test.describe("inquiries", () => {
  test("validation errors are shown for an incomplete inquiry", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send Inquiry" }).click();
    // Errors are listed in a popup; OK takes you to the first field to fix.
    const popup = page.getByRole("dialog", { name: "Please check these details" });
    await expect(popup.getByText("Please check the highlighted fields.")).toBeVisible();
    await expect(popup.getByText("Please enter your full name.")).toBeVisible();
    await expect(popup.getByText("Full name", { exact: true })).toBeVisible();
    await popup.getByRole("button", { name: "OK" }).click();
    await expect(popup).toBeHidden();
    await expect(page.getByLabel("Full name")).toBeFocused();
    await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  });

  test("server-side validation errors are mapped to fields", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Phone / WhatsApp").fill("+92 300 1234567");
    await page.getByLabel(/Message/).fill("I would like more information please.");
    await page.getByRole("button", { name: "Send Inquiry" }).click();
    await expect(page.getByRole("dialog").getByText("'Email' is not a valid email address.")).toBeVisible();
  });

  test("a hotel inquiry is saved and appears in the admin inquiries list", async ({ page }) => {
    const unique = `E2E Guest ${Date.now()}`;
    await page.goto("/hotels/madinah/quba-light-hotel?guests=4");
    await page.getByLabel("Full name").fill(unique);
    await page.getByLabel("Email").fill("e2e.guest@example.com");
    await page.getByLabel("Phone / WhatsApp").fill("+92 300 7654321");
    await page.getByLabel("Check-in").fill("2027-03-01");
    await page.getByLabel("Check-out").fill("2027-03-05");
    await page.getByLabel("Preferred room").selectOption("Quad Room");
    await page.getByLabel(/Message/).fill("Please share availability for a quad room for my family.");
    await page.getByRole("button", { name: "Send Inquiry" }).click();
    await expect(page.getByText("Thank you — inquiry received")).toBeVisible();

    await login(page);
    const card = page.locator("li", { hasText: unique });
    await expect(card).toBeVisible();
    await expect(card).toContainText("Quba Light Hotel (Madinah)");
    await expect(card).toContainText("Preferred room: Quad Room");

    await card.getByLabel("Status").selectOption("Contacted");
    await card.getByRole("button", { name: "Update" }).click();
    await expect(card.getByText("Contacted", { exact: true }).first()).toBeVisible();
  });
});

test.describe("admin", () => {
  test("admin pages require login", async ({ page }) => {
    await page.goto("/admin/hotels");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fhotels/);
  });

  test("wrong password shows an error", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("dialog", { name: "Couldn't sign you in" }).getByText("Invalid email or password.")).toBeVisible();
  });

  test("admin can create a hotel, add a room, see it on the site, and delete it", async ({ page }) => {
    const name = `E2E Hotel ${Date.now()}`;
    await login(page);

    await page.getByRole("link", { name: "Hotels & rooms" }).click();
    await page.getByRole("link", { name: "Add hotel" }).click();
    await page.getByLabel("Hotel name *").fill(name);
    await page.getByLabel("City *").selectOption("Madinah");
    await page.getByLabel("Address *").fill("Test Street, Madinah");
    await page.getByLabel("From price per night *").fill("21000");
    await page.getByLabel("Main photo *").setInputFiles("e2e/fixtures/photo.jpg");
    await expect(page.getByAltText("Selected photo")).toBeVisible({ timeout: 30_000 });
    // Gallery: add two photos at once, then remove the first; one remains.
    await page.getByLabel("Gallery photos", { exact: true }).setInputFiles(["e2e/fixtures/photo.jpg", "e2e/fixtures/photo-2.jpg"]);
    await expect(page.getByAltText(/^Gallery photo \d+$/)).toHaveCount(2, { timeout: 30_000 });
    await page.getByRole("button", { name: "Remove photo 1" }).click();
    await expect(page.getByAltText(/^Gallery photo \d+$/)).toHaveCount(1);
    await page.getByLabel("Short description *").fill("A test hotel created by the end-to-end tests.");
    await page.getByLabel("Full description *").fill("A test hotel created by the end-to-end tests. It will be deleted.");
    await page.getByLabel("Facilities").fill("Free Wi-Fi\nBreakfast");
    await page.getByRole("button", { name: "Create hotel" }).click();

    await expect(page.getByText("Hotel created. Now add its room types below.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);

    const addRoom = page.locator("form", { has: page.getByRole("button", { name: "Add room" }) });
    await addRoom.getByLabel("Room name *").fill("Family Quint");
    await addRoom.getByLabel("Max guests *").fill("5");
    await addRoom.getByLabel("Price per night *").fill("38000");
    await addRoom.getByRole("button", { name: "Add room" }).click();
    await expect(page.getByText("Room added.")).toBeVisible();
    await expect(page.getByText("Family Quint", { exact: true })).toBeVisible();

    // Visible on the public site
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await page.goto(`/hotels/madinah/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    await expect(page.getByRole("heading", { name: "Family Quint" })).toBeVisible();

    // Delete
    await page.goto("/admin/hotels");
    await page.getByRole("link", { name, exact: true }).click();
    await page.getByRole("button", { name: "Delete hotel" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText("Hotel deleted.")).toBeVisible();
    await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
  });

  test("deleting a hotel used by a package confirms first, then shows a warning popup", async ({ page }) => {
    await login(page);
    await page.goto("/admin/hotels");
    const row = page.locator("tr", { hasText: "Al Noor Haram View Hotel" });
    const dialog = page.getByRole("dialog");

    // Cancel does nothing.
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(dialog.getByText(/This cannot be undone/)).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();

    // Confirming shows a second, friendly popup explaining why it is blocked.
    await row.getByRole("button", { name: "Delete" }).click();
    await dialog.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(dialog.getByRole("heading", { name: "Can't do that yet" })).toBeVisible();
    await expect(dialog.getByText(/part of a package/)).toBeVisible();
    await dialog.getByRole("button", { name: "OK" }).click();
    await expect(dialog).toBeHidden();
    await expect(row).toBeVisible();
  });

  test("admin can edit a package and the change appears publicly", async ({ page }) => {
    await login(page);
    await page.goto("/admin/packages");
    await page.getByRole("link", { name: "Short 7-Day Umrah", exact: true }).click();
    const shortDesc = page.getByLabel("Short description *");
    const original = await shortDesc.inputValue();
    const updated = `${original.replace(/ \(updated \d+\)$/, "")} (updated ${Date.now()})`;
    await shortDesc.fill(updated);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Package saved.")).toBeVisible();

    await page.goto("/packages/short-7-day-umrah");
    await expect(page.getByText(updated)).toBeVisible();

    // restore
    await page.goto("/admin/packages");
    await page.getByRole("link", { name: "Short 7-Day Umrah", exact: true }).click();
    await page.getByLabel("Short description *").fill(original);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Package saved.")).toBeVisible();
  });

  test("sign out clears the session", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
