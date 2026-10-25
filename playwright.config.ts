import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3104', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 1000 } } }],
  webServer: [{ command: 'node tests/e2e/fixtures/supabase.mjs', url: 'http://127.0.0.1:3101/healthz' }, { command: 'npm run start -- --hostname 127.0.0.1 --port 3104', url: 'http://127.0.0.1:3104/hello', env: { SUPABASE_URL: 'http://127.0.0.1:3101', SUPABASE_ANON_KEY: 'test-public-key' } }],
})
