import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import * as api from './api'

const CHAVE = ['me', 'interesses']

// Ids dos carros em que a pessoa já registrou interesse (para não pedir duas vezes)
export function useMeusInteresses() {
  const { ehCliente } = useAuth()
  const consulta = useQuery({ queryKey: CHAVE, queryFn: api.listarMeusInteresses, enabled: ehCliente })
  const carroIds = useMemo(() => new Set((consulta.data ?? []).map((i) => i.carroId)), [consulta.data])
  return { ...consulta, carroIds }
}

export function useRegistrarInteresse(carroId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dados) => api.registrarInteresse(carroId, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  })
}
