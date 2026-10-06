import { use, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { avisarSessaoPerdida } from '@/lib/sessao'
import { criarQueryClient } from '@/test/utils'
import * as api from './api'
import { AuthProvider } from './AuthContext'
import { AuthContext } from './contexto'

vi.mock('./api', async (original) => ({
  ...(await original()),
  buscarMe: vi.fn(),
  entrar: vi.fn(),
  sair: vi.fn(),
}))

const ana = { id: 'ana', nomeCompleto: 'Ana Souza', email: 'ana@exemplo.com', perfil: 'USUARIO' }
const bruno = { id: 'bruno', nomeCompleto: 'Bruno Lima', email: 'bruno@exemplo.com', perfil: 'ADMINISTRADOR' }

// Expõe o contexto para o teste chamar entrar/sair e ler quem está logado
let auth
function Espiao() {
  const valor = use(AuthContext)
  useEffect(() => {
    auth = valor
  })
  return <p>{valor.carregandoSessao ? 'carregando' : (valor.usuario?.nomeCompleto ?? 'visitante')}</p>
}

function montar() {
  const queryClient = criarQueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Espiao />
      </AuthProvider>
    </QueryClientProvider>,
  )
  return queryClient
}

beforeEach(() => vi.clearAllMocks())

describe('sessão pelo cookie (a API diz quem está logado)', () => {
  it('sem sessão, a pessoa é visitante', async () => {
    api.buscarMe.mockResolvedValue(null)
    montar()
    await screen.findByText('visitante')
    expect(auth.estaLogado).toBe(false)
  })

  it('com sessão, carrega a conta e o perfil', async () => {
    api.buscarMe.mockResolvedValue(bruno)
    montar()
    await screen.findByText('Bruno Lima')
    expect(auth.ehAdmin).toBe(true)
    expect(auth.ehCliente).toBe(false)
  })

  it('entrar troca a conta e apaga os dados pessoais da anterior', async () => {
    api.buscarMe.mockResolvedValue(ana)
    const queryClient = montar()
    await screen.findByText('Ana Souza')
    queryClient.setQueryData(['me', 'compras'], [{ id: 'compra-da-ana' }])

    api.entrar.mockResolvedValue(bruno)
    await act(() => auth.entrar({ email: bruno.email, senha: 'senha123' }))

    expect(screen.getByText('Bruno Lima')).toBeInTheDocument()
    expect(queryClient.getQueryData(['me', 'compras'])).toBeUndefined()
  })

  it('401 da API (cookie vencido) desloga e apaga os dados pessoais', async () => {
    api.buscarMe.mockResolvedValue(ana)
    const queryClient = montar()
    await screen.findByText('Ana Souza')
    queryClient.setQueryData(['me', 'compras'], [{ id: 'compra-da-ana' }])

    act(() => avisarSessaoPerdida())

    await screen.findByText('visitante')
    expect(queryClient.getQueryData(['me', 'compras'])).toBeUndefined()
  })

  it('sair pede à API para apagar o cookie e desloga mesmo se ela falhar', async () => {
    api.buscarMe.mockResolvedValue(ana)
    montar()
    await screen.findByText('Ana Souza')

    api.sair.mockRejectedValue(new Error('sem rede'))
    await act(() => auth.sair().catch(() => {}))

    expect(api.sair).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.getByText('visitante')).toBeInTheDocument())
    expect(auth.saiuPorConta).toBe(true)
  })
})
