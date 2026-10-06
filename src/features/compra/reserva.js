// Prazo da reserva sem pagamento; precisa bater com compra.expiracao.tempo da API
// Variável vazia ou inválida cai no padrão, em vez de virar 0 ou NaN
export const MINUTOS_RESERVA = Number(import.meta.env.VITE_RESERVA_MINUTOS) || 30

// dataCompra vem como LocalDateTime (sem fuso): lida no fuso do navegador, o mesmo da loja
export function expiraEm(compra) {
  return new Date(compra.dataCompra).getTime() + MINUTOS_RESERVA * 60_000
}

/**
 * Situação da compra para a tela de pagamento:
 * - aprovada / cancelada: encerrada
 * - aguardando-equipe: Pix ou boleto registrado, a reserva não expira enquanto a equipe confirma
 * - processando-cartao: cartão em análise na Stripe (ex.: depois do 3D Secure)
 * - aberta: ainda sem pagamento, correndo o prazo
 */
export function situacaoDaCompra(compra, pagamentos = []) {
  if (compra.status === 'APROVADA') return 'aprovada'
  if (compra.status === 'CANCELADA') return 'cancelada'
  const pendente = pagamentos.find((p) => p.status === 'PENDENTE')
  if (pendente && !pendente.idExterno) return 'aguardando-equipe'
  if (pendente) return 'processando-cartao'
  return 'aberta'
}
