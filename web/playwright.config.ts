import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'retain-on-failure',
    ...(process.env.E2E_BROWSER_CHANNEL === 'msedge'
      ? { channel: 'msedge' as const }
      : {}),
  },
});
