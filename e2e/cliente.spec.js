import { expect, test } from './api-falsa.js'

test.beforeEach(async ({ entrarComo }) => {
  await entrarComo('USUARIO')
})

test('reserva um carro e paga com Pix', async ({ page, api }) => {
  await page.goto('/carros/car-corolla')
  await page.getByRole('button', { name: 'Reservar carro' }).click()

  const confirmar = page.getByRole('dialog', { name: 'Reservar este carro?' })
  await confirmar.getByRole('button', { name: 'Reservar e ir para o pagamento' }).click()

  await expect(page).toHaveURL('/conta/compras/compra-1/pagamento')
  await expect(page.getByRole('heading', { name: 'Como você quer pagar?' })).toBeVisible()
  await expect(page).toHaveTitle('Pagamento · Pátio')
  await expect(page.getByText('Carro reservado para você')).toBeVisible()

  await page.getByText('Pix', { exact: true }).click()
  await page.getByRole('button', { name: 'Pagar com Pix' }).click()

  await expect(page.getByRole('heading', { name: 'Aguardando a confirmação do pagamento.' })).toBeVisible()
  expect(api.pagamentos[0]).toMatchObject({ compraId: 'compra-1', metodo: 'PIX' })
  expect(api.carros.find((c) => c.id === 'car-corolla').status).toBe('RESERVADO')
})

test('quem já reservou vê "Continuar pagamento" no carro', async ({ page }) => {
  await page.goto('/carros/car-civic')
  await page.getByRole('button', { name: 'Reservar carro' }).click()
  await page.getByRole('button', { name: 'Reservar e ir para o pagamento' }).click()
  await expect(page).toHaveURL(/pagamento$/)

  await page.goto('/carros/car-civic')
  await expect(page.getByRole('link', { name: 'Continuar pagamento' })).toBeVisible()
})

test('outra pessoa reservou antes: avisa e não leva ao pagamento', async ({ page, api }) => {
  await page.goto('/carros/car-corolla')
  const reservar = page.getByRole('button', { name: 'Reservar carro' })
  await expect(reservar).toBeEnabled()
  // Entre abrir a página e clicar, alguém reservou
  api.carros.find((c) => c.id === 'car-corolla').status = 'RESERVADO'
  await reservar.click()
  await page.getByRole('button', { name: 'Reservar e ir para o pagamento' }).click()

  await expect(page.getByText('Outra pessoa acabou de reservar este carro.')).toBeVisible()
  await expect(page).toHaveURL('/carros/car-corolla')
})

test('trocar a senha exige a senha atual certa', async ({ page, api }) => {
  await page.goto('/conta')
  const novaSenha = page.getByLabel('Nova senha')
  const senhaAtual = page.getByLabel('Senha atual')
  const salvar = page.getByRole('button', { name: 'Salvar dados de acesso' })

  // Sem a senha atual: o próprio formulário avisa, sem chamar a API
  await novaSenha.fill('novaSenha123')
  await salvar.click()
  await expect(page.getByText('Digite sua senha atual para trocar o e-mail ou a senha')).toBeVisible()

  // Senha atual errada: a API recusa e o erro aparece no campo
  await senhaAtual.fill('errada')
  await salvar.click()
  await expect(page.getByText('Senha atual incorreta')).toBeVisible()
  expect(api.contas['ana@exemplo.com'].senha).toBe('senha123')

  await senhaAtual.fill('senha123')
  await salvar.click()
  await expect(page.getByText('Dados de acesso e senha salvos.')).toBeVisible()
  expect(api.contas['ana@exemplo.com'].senha).toBe('novaSenha123')
})

test('sair pede à API para apagar o cookie e volta para a home', async ({ page, api, isMobile }) => {
  test.skip(isMobile, 'No celular o menu da conta fica na gaveta; o caminho até a API é o mesmo')
  await page.goto('/carros')
  await page.getByRole('button', { name: 'Ana' }).click()
  await page.getByRole('menuitem', { name: 'Sair' }).click()

  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
  expect(api.perfilLogado).toBeNull()
})
