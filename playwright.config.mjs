import { defineConfig, devices } from '@playwright/test'

// Never connect to an existing profile, deployed game, or reused preview server.
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.pw.mjs',
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4187',
    acceptDownloads: true,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    } : {},
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4187 --strictPort',
    url: 'http://127.0.0.1:4187',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
