import { QueryClientProvider } from '@tanstack/react-query'
import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { limparToken, salvarToken } from '@/lib/sessao'
import { criarQueryClient, criarToken } from '@/test/utils'
import { AuthProvider } from './AuthContext'

vi.mock('./api', () => ({ buscarMe: async () => ({ nomeCompleto: 'Ana' }) }))

function montar(tokenInicial) {
  if (tokenInicial) salvarToken(tokenInicial)
  const queryClient = criarQueryClient()
  queryClient.setQueryData(['me', 'compras'], [{ id: 'compra-da-ana' }])
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <p>app</p>
      </AuthProvider>
    </QueryClientProvider>,
  )
  return queryClient
}

describe('troca de sessão', () => {
  it('sessão expirada (401) apaga os dados da pessoa', () => {
    const queryClient = montar(criarToken({ sub: 'ana' }))
    act(() => limparToken())
    expect(queryClient.getQueryData(['me', 'compras'])).toBeUndefined()
  })

  it('outra pessoa entrando não vê o cache da anterior', () => {
    const queryClient = montar(criarToken({ sub: 'ana' }))
    act(() => salvarToken(criarToken({ sub: 'bruno' })))
    expect(queryClient.getQueryData(['me', 'compras'])).toBeUndefined()
  })

  it('token renovado da mesma pessoa mantém o cache', () => {
    const queryClient = montar(criarToken({ sub: 'ana' }))
    act(() => salvarToken(criarToken({ sub: 'ana', exp: Math.floor(Date.now() / 1000) + 7200 })))
    expect(queryClient.getQueryData(['me', 'compras'])).toEqual([{ id: 'compra-da-ana' }])
  })
})
