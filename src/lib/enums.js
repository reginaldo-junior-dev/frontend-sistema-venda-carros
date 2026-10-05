// Rótulos em português dos enums da API

export const CONDICAO = { NOVO: 'Novo', USADO: 'Usado' }

export const COMBUSTIVEL = {
  GASOLINA: 'Gasolina',
  ETANOL: 'Etanol',
  DIESEL: 'Diesel',
  GNV: 'GNV',
  HIBRIDO: 'Híbrido',
  FLEX: 'Flex',
}

export const CAMBIO = { MANUAL: 'Manual', AUTOMATICO: 'Automático' }

export const STATUS_CARRO = { DISPONIVEL: 'Disponível', RESERVADO: 'Reservado', VENDIDO: 'Vendido' }

export const STATUS_COMPRA = { PENDENTE: 'Aguardando pagamento', APROVADA: 'Aprovada', CANCELADA: 'Cancelada' }

export const STATUS_PAGAMENTO = { PENDENTE: 'Pendente', APROVADO: 'Aprovado', RECUSADO: 'Recusado', CANCELADO: 'Cancelado' }

export const STATUS_PARCELA = { PENDENTE: 'Pendente', PAGA: 'Paga', CANCELADA: 'Cancelada' }

export const STATUS_INTERESSE = {
  NOVO: 'Novo',
  EM_CONTATO: 'Em contato',
  CONVERTIDO: 'Convertido',
  CANCELADO: 'Cancelado',
}

export const METODO_PAGAMENTO = { PIX: 'Pix', CARTAO_CREDITO: 'Cartão de crédito', BOLETO: 'Boleto' }

export const PERFIL = { ADMINISTRADOR: 'Administrador', USUARIO: 'Cliente' }

// Tom do <Badge> para cada status do carro
export const TOM_STATUS_CARRO = { DISPONIVEL: 'livre', RESERVADO: 'atencao', VENDIDO: 'vendido' }

export function opcoes(mapa) {
  return Object.entries(mapa).map(([valor, rotulo]) => ({ valor, rotulo }))
}
