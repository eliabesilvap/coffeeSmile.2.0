import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'node tests/e2e-server.js',
    port: 3000,
    timeout: 120_000,
  },
});
