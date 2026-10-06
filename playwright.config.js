import { defineConfig, devices } from '@playwright/test'

// O front sobe apontando para um endereço que não existe: todas as chamadas são respondidas
// pela API falsa de e2e/api-falsa.js, então os testes não dependem do back-end, do banco nem da Stripe.
const PORTA = 5199
export const API = 'http://api.e2e'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORTA}`,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  // Testa o build de produção (o mesmo que vai para a Vercel), numa pasta separada do dist/
  webServer: {
    command: `npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port ${PORTA} --strictPort`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Variável do processo tem prioridade sobre o .env.production
    env: { VITE_API_URL: API, VITE_STRIPE_PUBLISHABLE_KEY: '' },
  },
})
