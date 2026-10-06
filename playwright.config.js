import { defineConfig, devices } from '@playwright/test'

// O site chama a API em /api, e o navegador do teste responde essas chamadas com a API falsa de e2e/api-falsa.js:
// os testes não dependem do back-end, do banco nem da Stripe.
const PORTA = 5199

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Mais folga que os 5 s padrão: a verificação de acessibilidade é pesada e a máquina pode estar ocupada
  expect: { timeout: 10_000 },
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
    // Variável do processo tem prioridade sobre o .env: sem chave da Stripe, como num clone novo
    env: { VITE_STRIPE_PUBLISHABLE_KEY: '' },
  },
})
