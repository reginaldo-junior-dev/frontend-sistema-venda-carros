import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Na Vercel (VERCEL=1), o build não pode sair apontando para a API local do .env:
  // falha o deploy em vez de publicar um site que não acha a API
  if (command === 'build' && process.env.VERCEL) {
    const url = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL ?? ''
    if (!url.startsWith('https://')) {
      throw new Error(
        `VITE_API_URL inválida para produção ("${url}"). Defina a URL https da API em Settings > Environment Variables na Vercel.`,
      )
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // Testes unitários e de componente (os de ponta a ponta ficam em e2e/, com o Playwright)
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
      include: ['src/**/*.test.{js,jsx}'],
    },
  }
})
