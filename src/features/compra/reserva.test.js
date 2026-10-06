import { describe, expect, it } from 'vitest'
import { expiraEm, MINUTOS_RESERVA, situacaoDaCompra } from './reserva'

describe('situacaoDaCompra', () => {
  const aberta = { status: 'PENDENTE' }

  it('compra aprovada ou cancelada está encerrada', () => {
    expect(situacaoDaCompra({ status: 'APROVADA' })).toBe('aprovada')
    expect(situacaoDaCompra({ status: 'CANCELADA' })).toBe('cancelada')
  })

  it('sem pagamento pendente, a reserva está aberta', () => {
    expect(situacaoDaCompra(aberta, [])).toBe('aberta')
    expect(situacaoDaCompra(aberta, [{ status: 'RECUSADO', idExterno: 'pi_1' }])).toBe('aberta')
  })

  it('Pix ou boleto pendente aguarda a equipe', () => {
    expect(situacaoDaCompra(aberta, [{ status: 'PENDENTE', idExterno: null }])).toBe('aguardando-equipe')
  })

  it('cartão pendente na Stripe está em processamento', () => {
    expect(situacaoDaCompra(aberta, [{ status: 'PENDENTE', idExterno: 'pi_123' }])).toBe('processando-cartao')
  })
})

it('a reserva expira MINUTOS_RESERVA depois da compra', () => {
  const inicio = new Date('2026-10-06T10:00:00').getTime()
  expect(expiraEm({ dataCompra: '2026-10-06T10:00:00' }) - inicio).toBe(MINUTOS_RESERVA * 60_000)
})
