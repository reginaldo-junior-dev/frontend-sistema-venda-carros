import { expect, test } from './api-falsa.js'

test('busca um carro no catálogo e abre o detalhe', async ({ page }) => {
  await page.goto('/carros')
  await expect(page.getByRole('heading', { name: 'Carros à venda' })).toBeVisible()
  await expect(page).toHaveTitle('Carros à venda · Pátio')
  await expect(page.getByRole('link', { name: 'Corolla XEi' })).toBeVisible()

  await page.getByRole('searchbox', { name: 'Buscar pelo nome do carro' }).fill('civic')
  await expect(page).toHaveURL(/nome=civic/)
  await expect(page.getByRole('link', { name: 'Corolla XEi' })).toBeHidden()

  await page.getByRole('link', { name: 'Civic Touring' }).click()
  await expect(page).toHaveURL('/carros/car-civic')
  await expect(page.getByRole('heading', { level: 1, name: 'Civic Touring' })).toBeVisible()
  // A aba mostra marca e versão do carro aberto
  await expect(page).toHaveTitle('Honda Civic Touring · Pátio')
})

test('endereço que não existe mostra a página 404 com título próprio', async ({ page }) => {
  await page.goto('/pagina-que-nao-existe')
  await expect(page.getByRole('heading', { name: 'Esta página não está no pátio.' })).toBeVisible()
  await expect(page).toHaveTitle('Página não encontrada · Pátio')

  // Voltar para a home devolve o nome do site
  await page.getByRole('link', { name: /página inicial/ }).first().click()
  await expect(page).toHaveTitle('Pátio · Carros novos e usados')
})

test('filtra por marca e o filtro fica na URL', async ({ page, isMobile }) => {
  test.skip(isMobile, 'No celular os filtros ficam numa gaveta; a busca já cobre o fluxo')
  await page.goto('/carros')
  await page.getByRole('combobox', { name: 'Marca' }).click()
  await page.getByRole('option', { name: 'Toyota' }).click()

  await expect(page).toHaveURL(/marcaId=m-toyota/)
  await expect(page.getByRole('link', { name: 'Corolla XEi' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Civic Touring' })).toBeHidden()

  // O link com filtro funciona sozinho (dá para compartilhar)
  await page.reload()
  await expect(page.getByRole('link', { name: 'Civic Touring' })).toBeHidden()
})

test('visitante que tenta reservar vai para o login e volta ao carro', async ({ page, api }) => {
  await page.goto('/carros/car-corolla')
  await page.getByRole('button', { name: 'Reservar carro' }).click()
  await expect(page).toHaveURL(/\/entrar\?voltar=%2Fcarros%2Fcar-corolla/)

  await page.getByLabel('E-mail').fill('ana@exemplo.com')
  await page.getByLabel('Senha', { exact: true }).fill('senha123')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page).toHaveURL('/carros/car-corolla')
  expect(api.perfilLogado).toBe('USUARIO')
})

test('senha errada mostra o aviso sem dizer qual campo errou', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill('ana@exemplo.com')
  await page.getByLabel('Senha', { exact: true }).fill('errada')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos. Confira e tente de novo.')
})
