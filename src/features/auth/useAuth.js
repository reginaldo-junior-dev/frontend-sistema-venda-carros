import { use } from 'react'
import { AuthContext } from './contexto'

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro do <AuthProvider>')
  return ctx
}
