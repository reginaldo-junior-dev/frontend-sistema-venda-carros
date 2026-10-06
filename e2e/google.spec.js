import { expect, test } from './api-falsa.js'

// O Google em si não roda aqui: os testes começam quando a API manda a pessoa para /oauth/callback,
// com o cookie da sessão gravado (login aceito) ou sem ele (cancelado ou recusado)

test('o botão leva ao login Google da API, pelo endereço do próprio site', async ({ page }) => {
  await page.goto('/entrar')
  await expect(page.getByRole('link', { name: 'Continuar com Google' })).toHaveAttribute(
    'href',
    '/api/oauth2/authorization/google',
  )
})

test('cliente volta do Google logado, sem token nenhum no navegador', async ({ page, api }) => {
  api.perfilLogado = 'USUARIO'
  await page.goto('/oauth/callback')

  // O aviso some sozinho em 4 s: confere antes da URL, que espera a home carregar
  await expect(page.getByText('Você entrou com sua conta Google.')).toBeVisible()
  await expect(page).toHaveURL('/')
  // A sessão é só do cookie HttpOnly: nada de token no armazenamento do site
  expect(await page.evaluate(() => Object.keys(localStorage).filter((chave) => /token|sessao/i.test(chave)))).toEqual([])
})

test('admin volta do Google direto para o painel', async ({ page, api }) => {
  api.perfilLogado = 'ADMINISTRADOR'
  await page.goto('/oauth/callback')
  await expect(page).toHaveURL('/admin')
})

test('login cancelado no Google volta para a tela de login com o aviso', async ({ page }) => {
  await page.goto('/oauth/callback')

  await expect(page).toHaveURL('/entrar')
  await expect(page.getByText('Não foi possível entrar com o Google. Tente de novo ou use e-mail e senha.')).toBeVisible()
})
