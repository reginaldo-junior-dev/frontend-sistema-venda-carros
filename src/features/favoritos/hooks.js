import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import * as api from './api'

const CHAVE = ['me', 'favoritos']

export function useFavoritos() {
  const { estaLogado } = useAuth()
  const consulta = useQuery({ queryKey: CHAVE, queryFn: api.listarFavoritos, enabled: estaLogado })
  const ids = useMemo(() => new Set((consulta.data ?? []).map((f) => f.carroId)), [consulta.data])
  return { ...consulta, ids }
}

// Atualização otimista: o coração muda na hora e volta se a API recusar
export function useAlternarFavorito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ carroId, favoritar }) => (favoritar ? api.favoritar(carroId) : api.desfavoritar(carroId)),
    onMutate: async ({ carroId, favoritar }) => {
      await queryClient.cancelQueries({ queryKey: CHAVE })
      const anterior = queryClient.getQueryData(CHAVE)
      queryClient.setQueryData(CHAVE, (lista = []) =>
        favoritar ? [...lista, { id: `temp-${carroId}`, carroId }] : lista.filter((f) => f.carroId !== carroId),
      )
      return { anterior }
    },
    onError: (erro, variaveis, contexto) => {
      // 409 ao favoritar ou 404 ao remover: a API já está no estado pedido
      if (erro.status === 409 || erro.status === 404) return
      queryClient.setQueryData(CHAVE, contexto?.anterior)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  })
}
