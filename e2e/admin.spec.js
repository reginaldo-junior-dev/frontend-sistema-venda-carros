import { expect, test } from './api-falsa.js'

test('admin entra pelo formulário e cai no painel', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill('admin@patio.com')
  await page.getByLabel('Senha', { exact: true }).fill('admin123')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL('/admin')
})

test.describe('com o admin logado', () => {
  test.beforeEach(async ({ entrarComo }) => {
    await entrarComo('ADMINISTRADOR')
  })

  test('no site, o detalhe do carro só leva ao painel', async ({ page }) => {
    await page.goto('/carros/car-corolla')
    await expect(page.getByRole('heading', { level: 1, name: 'Corolla XEi' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Editar no painel' })).toHaveAttribute('href', '/admin/carros/car-corolla')
    await expect(page.getByRole('button', { name: 'Reservar carro' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Tenho interesse' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /favoritos/ })).toHaveCount(0)
  })

  test('a área do cliente manda de volta ao painel', async ({ page }) => {
    for (const caminho of ['/conta', '/conta/favoritos', '/conta/compras']) {
      await page.goto(caminho)
      await expect(page).toHaveURL('/admin')
    }
  })
})

test('cliente não entra no painel', async ({ page, entrarComo }) => {
  await entrarComo('USUARIO')
  await page.goto('/admin')
  await expect(page).toHaveURL('/sem-acesso')
})
