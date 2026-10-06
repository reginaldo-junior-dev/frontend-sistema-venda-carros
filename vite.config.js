import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Na Vercel, quem repassa /api para a API é o vercel.json, que precisa ter o endereço real do Render
const ENDERECO_DE_EXEMPLO = 'SUA-API.onrender.com'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Falha o deploy em vez de publicar um site que não acha a API
  if (command === 'build' && process.env.VERCEL && readFileSync('vercel.json', 'utf8').includes(ENDERECO_DE_EXEMPLO)) {
    throw new Error(`Troque "${ENDERECO_DE_EXEMPLO}" no vercel.json pelo endereço da API no Render.`)
  }

  // O site chama a API pelo próprio endereço (/api), para o cookie da sessão ser do próprio site.
  // No npm run dev e no npm run preview, o Vite repassa /api para API_URL (sem o prefixo /api)
  const api = loadEnv(mode, process.cwd(), '').API_URL || 'http://localhost:8080'
  const proxy = { '/api': { target: api, rewrite: (caminho) => caminho.replace(/^\/api/, '') } }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { proxy },
    preview: { proxy },
    // Testes unitários e de componente (os de ponta a ponta ficam em e2e/, com o Playwright)
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      include: ['src/**/*.test.{js,jsx}'],
    },
  }
})
