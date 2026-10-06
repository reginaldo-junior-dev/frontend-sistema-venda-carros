import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

// Quem clicou em "Sair" vai para a home; quem perdeu a sessão vai para o login e depois volta
export function RotaAutenticada() {
  const { estaLogado, carregandoSessao, saiuPorConta } = useAuth()
  const { pathname, search } = useLocation()
  // Ao abrir a página, a API ainda não disse se há sessão: decidir agora mandaria quem está logado para o login
  if (carregandoSessao) return null
  if (!estaLogado && saiuPorConta) return <Navigate to="/" replace />
  if (!estaLogado) {
    return <Navigate to={`/entrar?voltar=${encodeURIComponent(pathname + search)}`} replace />
  }
  return <Outlet />
}

export function RotaAdmin() {
  const { estaLogado, ehAdmin, carregandoSessao, saiuPorConta } = useAuth()
  const { pathname } = useLocation()
  if (carregandoSessao) return null
  if (!estaLogado && saiuPorConta) return <Navigate to="/" replace />
  if (!estaLogado) return <Navigate to={`/entrar?voltar=${encodeURIComponent(pathname)}`} replace />
  if (!ehAdmin) return <Navigate to="/sem-acesso" replace />
  return <Outlet />
}

// Favoritos, interesses, compras e pagamento são do cliente: o admin volta para o painel
export function RotaCliente() {
  const { ehAdmin } = useAuth()
  if (ehAdmin) return <Navigate to="/admin" replace />
  return <Outlet />
}
