import { API } from '../playwright.config.js'
import { expect, test, token } from './api-falsa.js'

// O Google em si não roda aqui: os testes começam no redirecionamento que a API faz
// para /oauth/callback, com o token (login aceito) ou sem ele (cancelado ou recusado)

test('o botão leva ao login Google da API', async ({ page }) => {
  await page.goto('/entrar')
  await expect(page.getByRole('link', { name: 'Continuar com Google' })).toHaveAttribute(
    'href',
    `${API}/oauth2/authorization/google`,
  )
})

test('cliente volta do Google logado e o token sai da URL', async ({ page }) => {
  const tokenCliente = token('USUARIO')
  await page.goto(`/oauth/callback#token=${tokenCliente}`)

  await expect(page).toHaveURL('/')
  await expect(page.getByText('Você entrou com sua conta Google.')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('patio.token'))).toBe(tokenCliente)
  // A página com o token foi substituída no histórico: o "voltar" não a reabre
  await page.goBack()
  expect(page.url()).not.toContain('oauth/callback')
})

test('admin volta do Google direto para o painel', async ({ page }) => {
  await page.goto(`/oauth/callback#token=${token('ADMINISTRADOR')}`)
  await expect(page).toHaveURL('/admin')
})

test('login cancelado no Google volta para a tela de login com o aviso', async ({ page }) => {
  await page.goto('/oauth/callback')

  await expect(page).toHaveURL('/entrar')
  await expect(page.getByText('Não foi possível entrar com o Google. Tente de novo ou use e-mail e senha.')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('patio.token'))).toBeNull()
})
