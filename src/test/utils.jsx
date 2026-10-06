import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthContext } from '@/features/auth/contexto'
import { CadastroClienteContext } from '@/features/cliente/contexto'

export function criarQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
}

// Sessão falsa com o que os componentes testados leem de useAuth() (guards, PainelCompra, BotaoFavorito, hooks)
function sessao(perfil, carregandoSessao) {
  const logado = Boolean(perfil)
  return {
    estaLogado: logado,
    ehAdmin: perfil === 'ADMINISTRADOR',
    ehCliente: logado && perfil !== 'ADMINISTRADOR',
    carregandoSessao,
    saiuPorConta: false,
  }
}

/**
 * Renderiza dentro de um roteador em memória com sessão e cache próprios.
 * `rotas` permite montar guards; sem elas, `ui` vira a única rota em `caminho`.
 */
export function renderizar(ui, { perfil, carregandoSessao = false, caminho = '/', rotas, queryClient = criarQueryClient() } = {}) {
  const router = createMemoryRouter(rotas ?? [{ path: '*', element: ui }], { initialEntries: [caminho] })
  // Cadastro de comprador já feito: a ação pedida roda direto
  const cadastro = { exigirCliente: (acao) => acao() }
  const resultado = render(
    <QueryClientProvider client={queryClient}>
      <AuthContext value={sessao(perfil, carregandoSessao)}>
        <CadastroClienteContext value={cadastro}>
          <RouterProvider router={router} />
        </CadastroClienteContext>
      </AuthContext>
    </QueryClientProvider>,
  )
  return { ...resultado, router, queryClient }
}
