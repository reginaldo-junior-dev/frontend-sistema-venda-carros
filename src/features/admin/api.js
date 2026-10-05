import { http, lerPagina, limparParams } from '@/lib/http'

// ---------- Estoque ----------

export async function salvarCarro({ id, ...carro }) {
  const { data } = id ? await http.put(`/carro/${id}`, carro) : await http.post('/carro', carro)
  return data
}

export async function excluirCarro(id) {
  await http.delete(`/carro/${id}`)
}

// O campo do multipart se chama "arquivo" no ImagemController
export async function enviarImagem(carroId, arquivo, aoProgredir) {
  const corpo = new FormData()
  corpo.append('arquivo', arquivo)
  const { data } = await http.post(`/carro/${carroId}/imagens`, corpo, {
    timeout: 120_000,
    onUploadProgress: (e) => e.total && aoProgredir?.(Math.round((e.loaded / e.total) * 100)),
  })
  return data
}

export async function excluirImagem(imagemId) {
  await http.delete(`/carro/imagens/${imagemId}`)
}

// ---------- Cadastros (marca, modelo, cor, categoria) ----------

export async function salvarItemCadastro(recurso, { id, ...dados }) {
  const { data } = id ? await http.put(`/${recurso}/${id}`, dados) : await http.post(`/${recurso}`, dados)
  return data
}

export async function excluirItemCadastro(recurso, id) {
  await http.delete(`/${recurso}/${id}`)
}

// ---------- Vendas ----------

export async function listarCompras(params) {
  const { data } = await http.get('/compra', { params: limparParams(params) })
  return lerPagina(data)
}

export async function cancelarCompra(id) {
  const { data } = await http.put(`/compra/${id}/cancelar`)
  return data
}

export async function listarPagamentos(params) {
  const { data } = await http.get('/pagamento', { params: limparParams(params) })
  return lerPagina(data)
}

// acao: aprovar | recusar | cancelar
export async function acaoPagamento(id, acao) {
  const { data } = await http.put(`/pagamento/${id}/${acao}`)
  return data
}

export async function criarParcelas(pagamentoId, quantidade) {
  const { data } = await http.post(`/pagamento/${pagamentoId}/parcelas`, { quantidade })
  return data
}

// acao: pagar | cancelar
export async function acaoParcela(id, acao) {
  const { data } = await http.put(`/parcela/${id}/${acao}`)
  return data
}

// ---------- Interesses ----------

export async function listarInteresses(params) {
  const { data } = await http.get('/interesse', { params: limparParams(params) })
  return lerPagina(data)
}

export async function mudarStatusInteresse(id, status) {
  const { data } = await http.put(`/interesse/${id}/status`, { status })
  return data
}

// ---------- Usuários e clientes ----------

export async function listarUsuarios(params) {
  const { data } = await http.get('/usuario', { params: limparParams(params) })
  return lerPagina(data)
}

export async function excluirUsuario(id) {
  await http.delete(`/usuario/${id}`)
}

export async function listarClientes(params) {
  const { data } = await http.get('/cliente', { params: limparParams(params) })
  return lerPagina(data)
}

export async function buscarCliente(id) {
  const { data } = await http.get(`/cliente/${id}`)
  return data
}

export async function buscarUsuario(id) {
  const { data } = await http.get(`/usuario/${id}`)
  return data
}

export async function listarEnderecosDoCliente(clienteId) {
  const { data } = await http.get(`/cliente/${clienteId}/enderecos`)
  return data
}

// Total de carros num status sem baixar a lista (size=1 e lê totalElements)
export async function contarCarros(status) {
  const { data } = await http.get('/carro', { params: limparParams({ status, size: 1 }) })
  return lerPagina(data).total
}
