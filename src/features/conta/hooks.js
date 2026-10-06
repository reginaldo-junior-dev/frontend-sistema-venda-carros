import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/features/auth/api'
import * as clienteApi from '@/features/cliente/api'
import { useAuth } from '@/features/auth/useAuth'
import * as enderecosApi from './enderecosApi'

export function useAtualizarMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.atualizarMe,
    // Mesma chave usada pelo AuthProvider para o usuário logado
    onSuccess: (usuario) => queryClient.setQueryData(['me', usuario.id], usuario),
  })
}

// Quem chama encerra a sessão depois de sair da área logada (senão a rota protegida redireciona antes)
export function useExcluirMe() {
  return useMutation({ mutationFn: authApi.excluirMe })
}

export function useAtualizarCliente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: clienteApi.atualizarCliente,
    onSuccess: (cliente) => queryClient.setQueryData(['me', 'cliente'], cliente),
  })
}

const CHAVE_ENDERECOS = ['me', 'enderecos']

export function useEnderecos() {
  const { ehCliente } = useAuth()
  return useQuery({ queryKey: CHAVE_ENDERECOS, queryFn: enderecosApi.listarEnderecos, enabled: ehCliente })
}

// O back-end ajusta o "principal" dos outros endereços; a lista é recarregada inteira
export function useSalvarEndereco() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: enderecosApi.salvarEndereco,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_ENDERECOS }),
  })
}

export function useExcluirEndereco() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: enderecosApi.excluirEndereco,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_ENDERECOS }),
  })
}
