import { http, lerPagina } from '@/lib/http'

// Cria a compra PENDENTE e reserva o carro; sem pagamento, ela expira (padrão: 30 minutos)
export async function reservar(carroId) {
  const { data } = await http.post('/compra', { carroId })
  return data
}

// Sem cadastro de cliente não há compras (a API responde 404)
async function listarOuVazio(url, params) {
  try {
    const { data } = await http.get(url, { params })
    return lerPagina(data).itens
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

export const listarMinhasCompras = () => listarOuVazio('/cliente/me/compras', { size: 100, sort: 'dataCompra,desc' })

export const listarMeusPagamentos = () => listarOuVazio('/cliente/me/pagamentos', { size: 100 })

// Cartão: o número nunca passa pela API, só o paymentMethodId criado pelo Stripe.js
export async function pagarComCartao({ compraId, paymentMethodId }) {
  const { data } = await http.post('/pagamento/cartao', { compraId, paymentMethodId })
  return data
}

// Pix e boleto ficam PENDENTES até a equipe confirmar o recebimento
export async function registrarPagamento({ compraId, metodo }) {
  const { data } = await http.post('/pagamento', { compraId, metodo })
  return data
}

export async function listarParcelas(pagamentoId) {
  const { data } = await http.get(`/pagamento/${pagamentoId}/parcelas`)
  return data
}
