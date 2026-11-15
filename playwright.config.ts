import { defineConfig, devices } from "@playwright/test";

import { applyE2eEnv, E2E_ENV } from "./tests/e2e/env.ts";

applyE2eEnv();

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: E2E_ENV.APP_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Derselbe Server wie im Abbild. Ein laufender auf 3401 wird nie
    // übernommen: ein E2E-Lauf gilt nur gegen einen frischen (§3).
    command: "pnpm build && pnpm start:standalone",
    url: E2E_ENV.APP_URL,
    env: E2E_ENV,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
