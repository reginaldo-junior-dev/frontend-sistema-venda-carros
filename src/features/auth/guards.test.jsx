import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderizar } from '@/test/utils'
import { RotaAdmin, RotaAutenticada, RotaCliente } from './guards'

// Uma rota protegida de cada tipo, e páginas de destino que só dizem onde a pessoa caiu
const rotas = [
  { element: <RotaAutenticada />, children: [{ element: <RotaCliente />, children: [{ path: '/conta', element: <h1>Minha conta</h1> }] }] },
  { element: <RotaAdmin />, children: [{ path: '/admin', element: <h1>Painel</h1> }] },
  { path: '/entrar', element: <h1>Entrar</h1> },
  { path: '/sem-acesso', element: <h1>Sem acesso</h1> },
]

function abrir(caminho, perfil) {
  return renderizar(null, { rotas, caminho, perfil })
}

describe('área do cliente', () => {
  it('visitante vai para o login e volta depois', () => {
    const { router } = abrir('/conta', null)
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(router.state.location.search).toBe('?voltar=%2Fconta')
  })

  it('cliente entra', () => {
    abrir('/conta', 'USUARIO')
    expect(screen.getByRole('heading', { name: 'Minha conta' })).toBeInTheDocument()
  })

  it('admin é levado ao painel', () => {
    abrir('/conta', 'ADMINISTRADOR')
    expect(screen.getByRole('heading', { name: 'Painel' })).toBeInTheDocument()
  })
})

describe('painel', () => {
  it('visitante vai para o login', () => {
    abrir('/admin', null)
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('cliente vê "sem acesso"', () => {
    abrir('/admin', 'USUARIO')
    expect(screen.getByRole('heading', { name: 'Sem acesso' })).toBeInTheDocument()
  })

  it('admin entra', () => {
    abrir('/admin', 'ADMINISTRADOR')
    expect(screen.getByRole('heading', { name: 'Painel' })).toBeInTheDocument()
  })
})
