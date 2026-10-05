import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'

// Tudo do painel fica sob ['admin', ...]; estoque e cadastros também atualizam a vitrine
function useInvalidar() {
  const queryClient = useQueryClient()
  return (...chaves) => chaves.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
}

// ---------- Estoque ----------

export function useSalvarCarro() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: api.salvarCarro,
    onSuccess: (carro) => invalidar(['carros'], ['carro', carro.id], ['admin', 'resumo']),
  })
}

export function useExcluirCarro() {
  const invalidar = useInvalidar()
  return useMutation({ mutationFn: api.excluirCarro, onSuccess: () => invalidar(['carros'], ['admin', 'resumo']) })
}

export function useExcluirImagem(carroId) {
  const invalidar = useInvalidar()
  return useMutation({ mutationFn: api.excluirImagem, onSuccess: () => invalidar(['carro', carroId], ['carros']) })
}

// ---------- Cadastros ----------

export function useSalvarItemCadastro(recurso) {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (item) => api.salvarItemCadastro(recurso, item),
    onSuccess: () => invalidar(['lookups', recurso]),
  })
}

export function useExcluirItemCadastro(recurso) {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (id) => api.excluirItemCadastro(recurso, id),
    onSuccess: () => invalidar(['lookups', recurso]),
  })
}

// ---------- Vendas ----------

export function useComprasAdmin(params) {
  return useQuery({
    queryKey: ['admin', 'compras', params],
    queryFn: () => api.listarCompras(params),
    placeholderData: keepPreviousData,
  })
}

export function usePagamentosAdmin(params, opcoes = {}) {
  return useQuery({
    queryKey: ['admin', 'pagamentos', params],
    queryFn: () => api.listarPagamentos(params),
    placeholderData: keepPreviousData,
    ...opcoes,
  })
}

// Aprovar um pagamento aprova a compra e vende o carro: atualiza tudo que depende disso
function useInvalidarVendas() {
  const invalidar = useInvalidar()
  return () => invalidar(['admin'], ['carros'], ['carro'])
}

export function useCancelarCompra() {
  const invalidar = useInvalidarVendas()
  return useMutation({ mutationFn: api.cancelarCompra, onSuccess: invalidar })
}

export function useAcaoPagamento() {
  const invalidar = useInvalidarVendas()
  return useMutation({ mutationFn: ({ id, acao }) => api.acaoPagamento(id, acao), onSuccess: invalidar })
}

export function useCriarParcelas() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ pagamentoId, quantidade }) => api.criarParcelas(pagamentoId, quantidade),
    onSuccess: (_, { pagamentoId }) => invalidar(['parcelas', pagamentoId]),
  })
}

export function useAcaoParcela(pagamentoId) {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, acao }) => api.acaoParcela(id, acao),
    onSuccess: () => invalidar(['parcelas', pagamentoId]),
  })
}

// ---------- Interesses ----------

export function useInteressesAdmin() {
  return useQuery({
    queryKey: ['admin', 'interesses'],
    queryFn: () => api.listarInteresses({ size: 100, sort: 'dataInteresse,desc' }),
  })
}

// Otimista: o card muda de coluna na hora e volta se a API recusar
export function useMudarStatusInteresse() {
  const queryClient = useQueryClient()
  const chave = ['admin', 'interesses']
  return useMutation({
    mutationFn: ({ id, status }) => api.mudarStatusInteresse(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: chave })
      const anterior = queryClient.getQueryData(chave)
      queryClient.setQueryData(chave, (pagina) =>
        pagina && { ...pagina, itens: pagina.itens.map((i) => (i.id === id ? { ...i, status } : i)) },
      )
      return { anterior }
    },
    onError: (_e, _v, contexto) => queryClient.setQueryData(chave, contexto?.anterior),
    onSettled: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}

// ---------- Usuários e clientes ----------

export function useUsuariosAdmin(params) {
  return useQuery({
    queryKey: ['admin', 'usuarios', params],
    queryFn: () => api.listarUsuarios(params),
    placeholderData: keepPreviousData,
  })
}

export function useExcluirUsuario() {
  const invalidar = useInvalidar()
  return useMutation({ mutationFn: api.excluirUsuario, onSuccess: () => invalidar(['admin', 'usuarios']) })
}

// Todos os clientes, para achar o cliente de um usuário (a API liga cliente → usuário)
export function useClientesAdmin() {
  return useQuery({
    queryKey: ['admin', 'clientes'],
    queryFn: () => api.listarClientes({ size: 100 }),
  })
}

export function useEnderecosDoCliente(clienteId) {
  return useQuery({
    queryKey: ['admin', 'enderecos', clienteId],
    queryFn: () => api.listarEnderecosDoCliente(clienteId),
    enabled: Boolean(clienteId),
  })
}

/**
 * Nome e e-mail de cada cliente. A compra traz só o clienteId: busca o cliente e o usuário dele.
 * Devolve um mapa clienteId → { nome, email, telefone }.
 */
export function useClientesPorId(ids) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['admin', 'cliente', id],
      queryFn: async () => {
        const cliente = await api.buscarCliente(id)
        const usuario = await api.buscarUsuario(cliente.usuarioId)
        return { ...cliente, nome: usuario.nomeCompleto, email: usuario.email }
      },
      staleTime: 5 * 60_000,
      retry: false,
    })),
    combine: (resultados) => Object.fromEntries(ids.map((id, i) => [id, resultados[i].data])),
  })
}
