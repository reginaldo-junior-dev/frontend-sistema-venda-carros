import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

export function RotaAutenticada() {
  const { estaLogado } = useAuth()
  const { pathname, search } = useLocation()
  if (!estaLogado) {
    return <Navigate to={`/entrar?voltar=${encodeURIComponent(pathname + search)}`} replace />
  }
  return <Outlet />
}

export function RotaAdmin() {
  const { estaLogado, ehAdmin } = useAuth()
  const { pathname } = useLocation()
  if (!estaLogado) return <Navigate to={`/entrar?voltar=${encodeURIComponent(pathname)}`} replace />
  if (!ehAdmin) return <Navigate to="/sem-acesso" replace />
  return <Outlet />
}
