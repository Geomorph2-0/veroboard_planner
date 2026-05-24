import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:5173"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    // reuseExistingServer is off so the dev server always boots WITH the auth-bypass
    // env below; a stray server started without it would otherwise gate out the tests.
    reuseExistingServer: false,
    env: { VITE_E2E_AUTH_BYPASS: "true" }
  }
});
