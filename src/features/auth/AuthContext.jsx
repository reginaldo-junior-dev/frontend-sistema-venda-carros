import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aoPerderSessao } from '@/lib/sessao'
import * as api from './api'
import { AuthContext } from './contexto'

/**
 * Sessão do site. O token fica num cookie HttpOnly que o JavaScript não lê:
 * quem diz se há alguém logado (e quem é) é a API, em GET /usuario/me.
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient()

  const sessao = useQuery({
    queryKey: api.CHAVE_SESSAO,
    queryFn: api.buscarMe,
    staleTime: 5 * 60_000,
  })
  const usuario = sessao.data ?? null

  // Diferencia "saiu pelo botão" de "a sessão expirou": no primeiro caso as rotas protegidas mandam para a home
  const [saiuPorConta, setSaiuPorConta] = useState(false)

  // Dados pessoais (['me', ...]) não podem passar de uma sessão para outra: limpa antes de trocar a conta
  const trocarSessao = useCallback(
    (novoUsuario) => {
      queryClient.removeQueries({ queryKey: ['me'] })
      queryClient.setQueryData(api.CHAVE_SESSAO, novoUsuario)
    },
    [queryClient],
  )

  // A API respondeu 401: o cookie venceu ou foi apagado
  useEffect(
    () =>
      aoPerderSessao(() => {
        if (queryClient.getQueryData(api.CHAVE_SESSAO)) trocarSessao(null)
      }),
    [queryClient, trocarSessao],
  )

  const entrar = useCallback(
    async (credenciais) => {
      const conta = await api.entrar(credenciais)
      setSaiuPorConta(false)
      trocarSessao(conta)
      return conta
    },
    [trocarSessao],
  )

  // Depois do login Google: a API já gravou o cookie, falta saber de quem é a conta
  const recarregarSessao = useCallback(async () => {
    const conta = await queryClient.fetchQuery({ queryKey: api.CHAVE_SESSAO, queryFn: api.buscarMe, staleTime: 0 })
    if (conta) {
      setSaiuPorConta(false)
      trocarSessao(conta)
    }
    return conta
  }, [queryClient, trocarSessao])

  // Mesmo se a API não responder, a pessoa sai na tela; o cookie vence sozinho em até 1 hora
  const sair = useCallback(async () => {
    setSaiuPorConta(true)
    try {
      await api.sair()
    } finally {
      trocarSessao(null)
    }
  }, [trocarSessao])

  const valor = useMemo(
    () => ({
      estaLogado: Boolean(usuario),
      ehAdmin: usuario?.perfil === 'ADMINISTRADOR',
      // Cliente é quem compra, favorita e fala com a equipe; o admin só opera o painel
      ehCliente: Boolean(usuario) && usuario.perfil !== 'ADMINISTRADOR',
      perfil: usuario?.perfil ?? null,
      usuario,
      // Enquanto a API não responde, ninguém sabe se há sessão: as rotas protegidas esperam
      carregandoSessao: sessao.isPending,
      saiuPorConta,
      entrar,
      recarregarSessao,
      sair,
    }),
    [usuario, sessao.isPending, saiuPorConta, entrar, recarregarSessao, sair],
  )

  return <AuthContext value={valor}>{children}</AuthContext>
}
