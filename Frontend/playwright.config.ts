import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config — E2E Black-box Tests
 * Ejecuta contra el stack completo levantado con Docker Compose.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,       // secuencial: los tests comparten estado (usuario creado)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/e2e-html', open: 'never' }],
    ['junit', { outputFile: 'reports/e2e-junit.xml' }],
    ['list'],
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Levanta el dev server automáticamente antes de correr los tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
