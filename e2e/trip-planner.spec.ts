import { expect, test, type Locator, type Page } from "@playwright/test";

/** Selects the option whose text contains `text` (option labels also carry prices). */
async function pick(select: Locator, text: string) {
  const value = await select.locator("option", { hasText: text }).getAttribute("value");
  await select.selectOption(value!);
}

// Runs in preview and full-stack mode. Prices come from the sample catalogue (Zamzam Pearl Hotel, Quad Room PKR 61,000/night)
// and the default visa & transport price (PKR 60,000 per person).

const stays = (page: Page) => page.locator("ol > li");

async function openGuests(page: Page) {
  await stays(page).first().getByRole("button", { name: /^\d+ guests?/ }).click();
  return page.getByRole("dialog", { name: "Guest selection" });
}

test.describe("round trip planner", () => {
  test("guests are chosen in the first stay only, infants can't outnumber adults", async ({ page }) => {
    await page.goto("/trip-planner");
    const picker = await openGuests(page);

    await expect(picker.getByRole("button", { name: "Remove adult" })).toBeDisabled();
    // 1 adult → only 1 infant allowed.
    await picker.getByRole("button", { name: "Add infant" }).click();
    await expect(picker.getByRole("button", { name: "Add infant" })).toBeDisabled();
    await picker.getByRole("button", { name: "Add adult" }).click();
    await expect(picker.getByRole("button", { name: "Add infant" })).toBeEnabled();
    await picker.getByRole("button", { name: "Add child" }).click();
    await picker.getByRole("button", { name: "Done" }).click();
    await expect(picker).toBeHidden();

    await expect(stays(page).first().getByRole("button", { name: /^4 guests/ })).toContainText("2 adults, 1 child, 1 infant");
    // Other stays show the same guests, read-only.
    await expect(stays(page).nth(1).getByTestId("guests-readonly")).toContainText("2 adults, 1 child, 1 infant");
    await expect(stays(page).nth(1).getByRole("button", { name: /guests?/ })).toHaveCount(0);

    // Fewer adults pulls infants down with them.
    await openGuests(page);
    await page.getByRole("button", { name: "Remove adult" }).click();
    await page.keyboard.press("Escape");
    await expect(stays(page).first().getByRole("button", { name: /^3 guests/ })).toContainText("1 adult, 1 child, 1 infant");
  });

  test("rooms follow the guests, and visa & transport adds a full breakdown", async ({ page }) => {
    await page.goto("/trip-planner");
    // Keep a single Makkah stay so the totals are easy to check.
    await page.getByRole("button", { name: "Remove stay 3" }).click();
    await page.getByRole("button", { name: "Remove stay 2" }).click();

    // 5 adults + 1 infant: 6 guests, 5 who need a bed.
    const picker = await openGuests(page);
    for (let i = 0; i < 4; i++) await picker.getByRole("button", { name: "Add adult" }).click();
    await picker.getByRole("button", { name: "Add infant" }).click();
    await picker.getByRole("button", { name: "Done" }).click();

    const stay = stays(page).first();
    await pick(stay.getByLabel("Hotel in Makkah"), "Zamzam Pearl Hotel");
    await pick(stay.getByLabel("Room type"), "Quad Room");
    // A quad sleeps 4, so 5 guests need 2 rooms; the customer may add more but not fewer.
    await expect(stay.getByLabel("Number of rooms")).toHaveValue("2");
    await expect(stay.getByText("Min. 2 for 5 guests")).toBeVisible();
    await stay.getByLabel("Check-in").fill("2027-03-01");
    await stay.getByLabel("Check-out").fill("2027-03-04");
    await expect(stay.getByText(/Stay total: .*366,000/)).toBeVisible();

    // The checkbox sits after the stays; nothing extra shows until it is ticked.
    await expect(page.getByTestId("grand-total")).toHaveCount(0);
    await page.getByLabel(/Add Visa & transport/).check();

    const extras = page.getByRole("region", { name: "Visa & transport" });
    const headings = extras.getByRole("heading", { level: 3 });
    await expect(headings).toHaveText(["1. Visa & transport", "2. Accommodation", "3. Grand total"]);
    await expect(extras).toContainText("× 6 guests");
    await expect(page.getByTestId("visa-transport-total")).toContainText("360,000");
    await expect(page.getByTestId("accommodation-total")).toContainText("366,000");
    await expect(page.getByTestId("grand-total")).toContainText("726,000");

    // The slip lists them in the same order.
    await page.getByRole("button", { name: "Generate slip" }).click();
    const slip = page.getByRole("region", { name: "Your trip slip" });
    await expect(slip).toContainText("5 adults, 1 infant");
    await expect(slip).toContainText(/1\. Visa & transport[\s\S]*2\. Accommodation[\s\S]*Grand total/);
    await expect(slip.getByText("Grand total")).toBeVisible();
    // The PDF is built ahead of the click, and must settle (not rebuild on every render).
    await expect(slip.getByRole("button", { name: "Share on WhatsApp" })).toBeEnabled({ timeout: 20_000 });
    await expect(slip.getByRole("button", { name: "Download PDF" })).toBeEnabled();

    // Too few rooms: a popup explains it (no inline error) and fixes it in one click.
    const rooms = stay.getByLabel("Number of rooms");
    await rooms.fill("1");
    await rooms.press("Tab");
    const popup = page.getByRole("dialog", { name: "Not enough rooms" });
    await expect(popup).toBeVisible();
    await expect(popup).toContainText("5 guests needing a bed won't fit in 1 Quad Room");
    await expect(popup.getByRole("list", { name: "Suggested: 2 rooms" }).getByRole("listitem")).toHaveCount(2);
    await expect(popup).toContainText("Infants and children without a bed share with an adult");
    await expect(popup.getByRole("button", { name: "Use 2 rooms" })).toBeFocused();
    await popup.getByRole("button", { name: "Use 2 rooms" }).click();
    await expect(popup).toBeHidden();
    await expect(rooms).toHaveValue("2");
    await expect(stay.getByRole("alert")).toHaveCount(0);

    // The same popup opens from "Update slip"; "Pick a bigger room" closes it and moves to the room type.
    await rooms.fill("1");
    await page.getByRole("button", { name: "Update slip" }).click();
    await expect(popup).toBeVisible();
    await popup.getByRole("button", { name: "Pick a bigger room" }).click();
    await expect(popup).toBeHidden();
    await expect(stay.getByLabel("Room type")).toBeFocused();
    await expect(stay.getByRole("alert")).toHaveCount(0);
  });

  test("children without a bed don't need room space and aren't charged for it", async ({ page }) => {
    await page.goto("/trip-planner");
    const stay = stays(page).first();
    const rooms = stay.getByLabel("Number of rooms");
    const tap = async (picker: Locator, name: string, times = 1) => {
      for (let i = 0; i < times; i++) await picker.getByRole("button", { name, exact: true }).click();
    };

    // The "Without a bed" row only appears once there are children.
    let picker = await openGuests(page);
    await expect(picker.getByText("Without a bed")).toHaveCount(0);

    // 3 adults + 2 children, both without a bed → 3 beds → one Triple Room.
    await tap(picker, "Add adult", 2);
    await tap(picker, "Add child", 2);
    await expect(picker.getByRole("button", { name: "Add child without a bed", exact: true })).toBeEnabled();
    await tap(picker, "Add child without a bed", 2);
    await expect(picker.getByRole("button", { name: "Add child without a bed", exact: true })).toBeDisabled();
    await tap(picker, "Done");
    await expect(stay.getByRole("button", { name: /^5 guests/ })).toContainText("3 adults, 2 children (no bed)");

    await pick(stay.getByLabel("Hotel in Makkah"), "Zamzam Pearl Hotel");
    await pick(stay.getByLabel("Room type"), "Triple Room");
    await expect(rooms).toHaveValue("1");
    await expect(stay.getByText("Min. 1 for 3 guests needing a bed")).toBeVisible();
    await rooms.press("Tab");
    await expect(page.getByRole("dialog", { name: "Not enough rooms" })).toHaveCount(0);

    // 4 adults + 1 child without a bed → 4 beds → 2 Double Rooms, or 1 Quad Room.
    picker = await openGuests(page);
    await tap(picker, "Add adult");
    await tap(picker, "Remove child");
    await expect(picker.getByRole("button", { name: "Remove child without a bed", exact: true })).toBeEnabled(); // follows children down to 1
    await tap(picker, "Done");
    await expect(stay.getByRole("button", { name: /^5 guests/ })).toContainText("4 adults, 1 child (no bed)");
    await pick(stay.getByLabel("Room type"), "Double Room");
    await expect(rooms).toHaveValue("2");
    await pick(stay.getByLabel("Room type"), "Quad Room");
    await expect(rooms).toHaveValue("1");

    // Visa & transport still counts every guest; the note explains the child's accommodation isn't charged.
    await stay.getByLabel("Check-in").fill("2027-03-01");
    await stay.getByLabel("Check-out").fill("2027-03-03");
    await page.getByLabel(/Add Visa & transport/).check();
    await expect(page.getByRole("region", { name: "Visa & transport" })).toContainText("× 5 guests");
    await expect(page.getByTestId("bed-note").first()).toHaveText("1 child without a bed shares a bed with an adult — no accommodation charge.");

    // Removing every child hides and resets the option.
    picker = await openGuests(page);
    await tap(picker, "Remove child");
    await expect(picker.getByText("Without a bed")).toHaveCount(0);
    await tap(picker, "Add child");
    await expect(picker.getByRole("button", { name: "Remove child without a bed", exact: true })).toBeDisabled();
  });
});
