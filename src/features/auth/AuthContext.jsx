import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aoMudarToken, decodificarToken, lerToken, limparToken, salvarToken } from '@/lib/sessao'
import * as api from './api'

import { AuthContext } from './contexto'


export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(() => {
    const salvo = lerToken()
    if (salvo && !decodificarToken(salvo)) {
      limparToken()
      return null
    }
    return salvo
  })

  // Mantém o estado em dia quando o interceptor encerra a sessão (401) ou outra aba sai
  useEffect(() => aoMudarToken(setToken), [])
  useEffect(() => {
    const aoMudarStorage = (e) => e.key === 'patio.token' && setToken(e.newValue)
    window.addEventListener('storage', aoMudarStorage)
    return () => window.removeEventListener('storage', aoMudarStorage)
  }, [])

  const sessao = token ? decodificarToken(token) : null
  // Diferencia "saiu pelo botão" de "a sessão expirou": no primeiro caso as rotas protegidas mandam para a home
  const [saiuPorConta, setSaiuPorConta] = useState(false)

  // Encerra a sessão no instante em que o JWT expira
  useEffect(() => {
    if (!sessao?.expiraEm) return
    // setTimeout aceita no máximo ~24 dias
    const id = setTimeout(limparToken, Math.min(sessao.expiraEm - Date.now(), 2 ** 31 - 1))
    return () => clearTimeout(id)
  }, [sessao?.expiraEm])

  const me = useQuery({
    queryKey: ['me', sessao?.id],
    queryFn: api.buscarMe,
    enabled: Boolean(sessao),
    staleTime: 5 * 60_000,
  })

  const entrar = useCallback(async (credenciais) => {
    const novo = await api.entrar(credenciais)
    setSaiuPorConta(false)
    salvarToken(novo)
    return decodificarToken(novo)
  }, [])

  const entrarComToken = useCallback((novo) => {
    const dados = decodificarToken(novo)
    if (dados) {
      setSaiuPorConta(false)
      salvarToken(novo)
    }
    return dados
  }, [])

  const sair = useCallback(() => {
    setSaiuPorConta(true)
    limparToken()
    // Dados pessoais não podem sobreviver à troca de usuário
    queryClient.removeQueries({ queryKey: ['me'] })
  }, [queryClient])

  const valor = useMemo(
    () => ({
      estaLogado: Boolean(sessao),
      ehAdmin: sessao?.perfil === 'ADMINISTRADOR',
      perfil: sessao?.perfil ?? null,
      usuario: me.data ?? null,
      carregandoUsuario: me.isPending && me.fetchStatus !== 'idle',
      saiuPorConta,
      entrar,
      entrarComToken,
      sair,
    }),
    [sessao, me.data, me.isPending, me.fetchStatus, saiuPorConta, entrar, entrarComToken, sair],
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}
