import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import * as api from './api'

const CHAVE_COMPRAS = ['me', 'compras']
const CHAVE_PAGAMENTOS = ['me', 'pagamentos']

export function useMinhasCompras(opcoes = {}) {
  const { estaLogado } = useAuth()
  return useQuery({ queryKey: CHAVE_COMPRAS, queryFn: api.listarMinhasCompras, enabled: estaLogado, ...opcoes })
}

export function useMeusPagamentos(opcoes = {}) {
  const { estaLogado } = useAuth()
  return useQuery({ queryKey: CHAVE_PAGAMENTOS, queryFn: api.listarMeusPagamentos, enabled: estaLogado, ...opcoes })
}

// Pagamentos agrupados por compra, mais recentes primeiro
export function usePagamentosPorCompra(opcoes) {
  const consulta = useMeusPagamentos(opcoes)
  const porCompra = useMemo(() => {
    const mapa = {}
    for (const p of consulta.data ?? []) (mapa[p.compraId] ??= []).push(p)
    for (const lista of Object.values(mapa))
      lista.sort((a, b) => String(b.dataPagamento ?? '').localeCompare(String(a.dataPagamento ?? '')))
    return mapa
  }, [consulta.data])
  return { ...consulta, porCompra }
}

export function useParcelas(pagamentoId, habilitado = true) {
  return useQuery({
    queryKey: ['parcelas', pagamentoId],
    queryFn: () => api.listarParcelas(pagamentoId),
    enabled: Boolean(pagamentoId) && habilitado,
  })
}

// Compra, pagamento e status do carro mudam juntos: atualiza tudo
function useInvalidarCompra() {
  const queryClient = useQueryClient()
  return (carroId) => {
    queryClient.invalidateQueries({ queryKey: CHAVE_COMPRAS })
    queryClient.invalidateQueries({ queryKey: CHAVE_PAGAMENTOS })
    queryClient.invalidateQueries({ queryKey: ['carros'] })
    if (carroId) queryClient.invalidateQueries({ queryKey: ['carro', carroId] })
  }
}

export function useReservar() {
  const invalidar = useInvalidarCompra()
  return useMutation({ mutationFn: api.reservar, onSettled: (compra, _erro, carroId) => invalidar(carroId) })
}

export function usePagarComCartao() {
  const invalidar = useInvalidarCompra()
  return useMutation({ mutationFn: api.pagarComCartao, onSettled: () => invalidar() })
}

export function useRegistrarPagamento() {
  const invalidar = useInvalidarCompra()
  return useMutation({ mutationFn: api.registrarPagamento, onSettled: () => invalidar() })
}
