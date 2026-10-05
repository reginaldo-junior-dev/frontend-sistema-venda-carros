import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import * as api from './api'

const LOOKUPS = ['marca', 'modelo', 'cor', 'categoria']

export function useCarros(filtros) {
  return useQuery({
    queryKey: ['carros', filtros],
    queryFn: () => api.listarCarros(filtros),
    placeholderData: keepPreviousData,
  })
}

export function useCarro(id) {
  return useQuery({
    queryKey: ['carro', id],
    queryFn: () => api.buscarCarro(id),
    enabled: Boolean(id),
  })
}

/**
 * Marcas, modelos, cores e categorias em cache, como listas e como mapas id → item.
 * O CarroResponse traz só os ids dos relacionamentos; os nomes vêm daqui.
 */
export function useLookups() {
  return useQueries({
    queries: LOOKUPS.map((recurso) => ({
      queryKey: ['lookups', recurso],
      queryFn: () => api.listarLookup(recurso),
      staleTime: 30 * 60_000,
    })),
    combine: (resultados) => {
      const [marcas, modelos, cores, categorias] = resultados.map((r) => r.data ?? [])
      return {
        marcas,
        modelos,
        cores,
        categorias,
        porId: {
          marca: indexar(marcas),
          modelo: indexar(modelos),
          cor: indexar(cores),
          categoria: indexar(categorias),
        },
        carregando: resultados.some((r) => r.isPending),
        erro: resultados.find((r) => r.error)?.error ?? null,
      }
    },
  })
}

function indexar(lista) {
  return Object.fromEntries(lista.map((item) => [item.id, item]))
}

// Renovada antes de a assinatura de 15 minutos expirar
export function useUrlImagem(imagem) {
  return useQuery({
    queryKey: ['imagem-url', imagem?.id],
    queryFn: () => (imagem.url ? imagem.url : api.buscarUrlImagem(imagem.id)),
    enabled: Boolean(imagem?.id),
    staleTime: 10 * 60_000,
    gcTime: 12 * 60_000,
  })
}
