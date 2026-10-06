import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import * as api from './api'

export function useMeuCliente() {
  const { ehCliente } = useAuth()
  return useQuery({
    queryKey: ['me', 'cliente'],
    queryFn: api.buscarMeuCliente,
    enabled: ehCliente,
    staleTime: 5 * 60_000,
  })
}

export function useCadastrarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.cadastrarCliente,
    onSuccess: (cliente) => {
      queryClient.setQueryData(['me', 'cliente'], cliente)
      // Com o cliente criado, favoritos e interesses passam a existir
      queryClient.invalidateQueries({ queryKey: ['me', 'favoritos'] })
    },
  })
}

export function useAtualizarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.atualizarCliente,
    onSuccess: (cliente) => queryClient.setQueryData(['me', 'cliente'], cliente),
  })
}
