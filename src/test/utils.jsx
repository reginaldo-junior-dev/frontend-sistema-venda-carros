import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthContext } from '@/features/auth/contexto'
import { CadastroClienteContext } from '@/features/cliente/contexto'

// Token JWT de mentira (só o payload importa para o front, que não confere a assinatura)
export function criarToken({ sub = 'u1', perfil = 'USUARIO', exp = Math.floor(Date.now() / 1000) + 3600 } = {}) {
  const payload = btoa(JSON.stringify({ sub, perfil, exp })).replace(/=+$/, '')
  return `cabecalho.${payload}.assinatura`
}

export function criarQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
}

// Sessão falsa para componentes que leem useAuth()
export function sessao(perfil) {
  const logado = Boolean(perfil)
  return {
    estaLogado: logado,
    ehAdmin: perfil === 'ADMINISTRADOR',
    ehCliente: logado && perfil !== 'ADMINISTRADOR',
    perfil: perfil ?? null,
    usuario: logado ? { nomeCompleto: 'Ana Souza', email: 'ana@exemplo.com' } : null,
    carregandoUsuario: false,
    saiuPorConta: false,
    entrar: async () => {},
    entrarComToken: () => null,
    sair: () => {},
  }
}

/**
 * Renderiza dentro de um roteador em memória com sessão e cache próprios.
 * `rotas` permite montar guards; sem elas, `ui` vira a única rota em `caminho`.
 */
export function renderizar(ui, { perfil, caminho = '/', rotas, queryClient = criarQueryClient(), exigirCliente } = {}) {
  const router = createMemoryRouter(rotas ?? [{ path: '*', element: ui }], { initialEntries: [caminho] })
  const cadastro = { exigirCliente: exigirCliente ?? ((acao) => acao()) }
  const resultado = render(
    <QueryClientProvider client={queryClient}>
      <AuthContext value={sessao(perfil)}>
        <CadastroClienteContext value={cadastro}>
          <RouterProvider router={router} />
        </CadastroClienteContext>
      </AuthContext>
    </QueryClientProvider>,
  )
  return { ...resultado, router, queryClient }
}
