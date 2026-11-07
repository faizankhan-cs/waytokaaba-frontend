import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a running frontend (default http://localhost:3000) and API.
 * Uses the locally installed Microsoft Edge (or set PW_CHANNEL=chrome), so no browser download is needed.
 *   npm run test:e2e
 */
const channel = process.env.PW_CHANNEL ?? "msedge";

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
    { name: "desktop", use: { ...devices["Desktop Edge"], channel }, testIgnore: /mobile.spec.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"], channel }, testMatch: /mobile\.spec\.ts/ },
  ],
});
