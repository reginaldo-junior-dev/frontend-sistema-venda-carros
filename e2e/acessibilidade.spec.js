import AxeBuilder from '@axe-core/playwright'
import { expect, test } from './api-falsa.js'

// Regras WCAG 2.1 A e AA; cada tela é verificada depois de carregar os dados
async function verificar(page, titulo) {
  await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible()
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const resumo = violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
  expect(resumo, `problemas de acessibilidade em ${page.url()}`).toEqual([])
}

const PUBLICAS = [
  ['/', /Seu próximo carro/],
  ['/carros', 'Carros à venda'],
  ['/carros/car-corolla', 'Corolla XEi'],
  ['/entrar', 'Entre na sua conta'],
  ['/criar-conta', /conta/],
]

for (const [caminho, titulo] of PUBLICAS) {
  test(`acessibilidade de ${caminho}`, async ({ page }) => {
    await page.goto(caminho)
    await verificar(page, titulo)
  })
}

// O tema escuro tem outras cores: o contraste precisa passar nele também
test.describe('tema escuro', () => {
  test.use({ colorScheme: 'dark' })
  for (const [caminho, titulo] of PUBLICAS) {
    test(`acessibilidade de ${caminho}`, async ({ page }) => {
      await page.goto(caminho)
      await expect(page.locator('html')).toHaveClass(/dark/)
      await verificar(page, titulo)
    })
  }
  test('acessibilidade do estoque no painel', async ({ page, entrarComo }) => {
    await entrarComo('ADMINISTRADOR')
    await page.goto('/admin/carros')
    await verificar(page, /.+/)
  })
})

test('acessibilidade da área do cliente', async ({ page, entrarComo }) => {
  await entrarComo('USUARIO')
  await page.goto('/conta')
  await verificar(page, /dados/i)
  await page.goto('/conta/compras')
  await verificar(page, /compras/i)
})

test('acessibilidade do painel', async ({ page, entrarComo }) => {
  await entrarComo('ADMINISTRADOR')
  await page.goto('/admin')
  await verificar(page, /.+/)
  await page.goto('/admin/carros')
  await verificar(page, /.+/)
})

test('dá para chegar ao carro e reservar só com o teclado', async ({ page, entrarComo, isMobile }) => {
  test.skip(isMobile, 'Teclado físico é cenário de desktop')
  await entrarComo('USUARIO')
  await page.goto('/carros')
  await expect(page.getByRole('link', { name: 'Corolla XEi' })).toBeVisible()

  // O primeiro Tab mostra o atalho que pula o cabeçalho
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused()

  // Tab até o card do carro, com foco sempre visível no elemento ativo
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    if (await page.getByRole('link', { name: 'Corolla XEi' }).evaluate((el) => el === document.activeElement)) break
  }
  await expect(page.getByRole('link', { name: 'Corolla XEi' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/carros/car-corolla')

  const reservar = page.getByRole('button', { name: 'Reservar carro' })
  await reservar.focus()
  await page.keyboard.press('Enter')
  const dialogo = page.getByRole('dialog', { name: 'Reservar este carro?' })
  await expect(dialogo).toBeVisible()
  // Esc fecha o diálogo e o foco volta para o botão que o abriu
  await page.keyboard.press('Escape')
  await expect(dialogo).toBeHidden()
  await expect(reservar).toBeFocused()
})
