import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a running frontend (default http://localhost:3000).
 * Uses the locally installed Microsoft Edge (or set PW_CHANNEL=chrome), so no browser download is needed.
 *
 *   npm run test:e2e                  normal mode: site + API running
 *   E2E_PREVIEW=1 npm run test:e2e    preview mode: site built with NEXT_PUBLIC_PREVIEW_MODE=true, no API
 */
const channel = process.env.PW_CHANNEL ?? "msedge";
const preview = process.env.E2E_PREVIEW === "1";

// Inquiry/admin tests need the backend; preview tests only make sense in preview mode.
const desktopIgnore = preview ? [/mobile\.spec\.ts/, /inquiry-and-admin\.spec\.ts/] : [/mobile\.spec\.ts/, /preview\.spec\.ts/];

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    channel,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Edge"], channel }, testIgnore: desktopIgnore },
    { name: "mobile", use: { ...devices["Pixel 7"], channel }, testMatch: /mobile\.spec\.ts/ },
  ],
});
