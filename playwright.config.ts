import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 5173)

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  reporter: [['list']],
  // Headless Chromium renders the 3D scene in software (SwiftShader): slow and CPU-bound.
  // Generous per-test timeout, 2 workers max, and one retry only to absorb machine load,
  // never to hide a deterministic failure (a test that needs its retry shows as "flaky").
  timeout: 60_000,
  workers: 2,
  retries: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
})
