import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderizar } from '@/test/utils'
import { PainelCompra } from './PainelCompra'

// Sem rede: as listas do cliente vêm vazias (vi.hoisted porque vi.mock sobe para o topo do arquivo)
const { vazio } = vi.hoisted(() => ({ vazio: async () => [] }))
vi.mock('@/features/favoritos/api', async (original) => ({ ...(await original()), listarFavoritos: vazio }))
vi.mock('@/features/interesses/api', async (original) => ({ ...(await original()), listarMeusInteresses: vazio }))
vi.mock('@/features/compra/api', async (original) => ({
  ...(await original()),
  listarMinhasCompras: vazio,
  listarMeusPagamentos: vazio,
}))

const carro = { id: 'c1', nome: 'Corolla XEi', preco: 150000, quilometragem: 0, cambio: 'AUTOMATICO', status: 'DISPONIVEL' }
const d = { marca: 'Toyota', modelo: 'Corolla', anos: '2025' }

describe('PainelCompra', () => {
  it('cliente pode reservar, favoritar e falar com a equipe', () => {
    renderizar(<PainelCompra carro={carro} d={d} />, { perfil: 'USUARIO' })
    expect(screen.getByRole('button', { name: 'Reservar carro' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Tenho interesse' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar Toyota Corolla XEi nos favoritos/ })).toBeInTheDocument()
  })

  it('visitante também vê as ações (o login é pedido ao clicar)', () => {
    renderizar(<PainelCompra carro={carro} d={d} />)
    expect(screen.getByRole('button', { name: 'Reservar carro' })).toBeInTheDocument()
  })

  it('admin só gerencia: vê "Editar no painel" e nenhuma ação de compra', () => {
    renderizar(<PainelCompra carro={carro} d={d} />, { perfil: 'ADMINISTRADOR' })
    expect(screen.getByRole('link', { name: /Editar no painel/ })).toHaveAttribute('href', '/admin/carros/c1')
    expect(screen.queryByRole('button', { name: 'Reservar carro' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tenho interesse' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /favoritos/ })).not.toBeInTheDocument()
  })

  it('carro reservado por outra pessoa não pode ser reservado', () => {
    renderizar(<PainelCompra carro={{ ...carro, status: 'RESERVADO' }} d={d} />, { perfil: 'USUARIO' })
    expect(screen.getByRole('button', { name: 'Reservado por outra pessoa' })).toBeDisabled()
  })
})
