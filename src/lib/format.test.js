import { describe, expect, it } from 'vitest'
import { anos, cep, cpf, data, dataHora, km, moeda, telefone } from './format'

// Intl usa espaço não separável entre "R$" e o valor
const semNbsp = (texto) => texto.replace(/ /g, ' ')

describe('moeda', () => {
  it('formata em reais sem centavos por padrão', () => {
    expect(semNbsp(moeda(89990))).toBe('R$ 89.990')
  })
  it('aceita o BigDecimal da API como texto e mostra centavos quando pedido', () => {
    expect(semNbsp(moeda('1234.5', { centavos: true }))).toBe('R$ 1.234,50')
  })
  it('volta vazio sem valor', () => {
    expect(moeda(null)).toBe('')
  })
})

describe('km', () => {
  it('separa os milhares', () => expect(km(45000)).toBe('45.000 km'))
  it('mostra carro zero', () => expect(km(0)).toBe('0 km'))
})

describe('data e dataHora', () => {
  it('lê LocalDate sem trocar o dia pelo fuso', () => {
    expect(data('2024-03-01')).toBe('01/03/2024')
  })
  it('não quebra com data malformada', () => {
    expect(data('ontem')).toBe('')
    expect(dataHora('xx')).toBe('')
  })
})

describe('máscaras', () => {
  it('cpf', () => expect(cpf('12345678901')).toBe('123.456.789-01'))
  it('cpf parcial enquanto digita', () => expect(cpf('1234')).toBe('123.4'))
  it('celular com 9 dígitos', () => expect(telefone('11987654321')).toBe('(11) 98765-4321'))
  it('fixo com 8 dígitos', () => expect(telefone('1133334444')).toBe('(11) 3333-4444'))
  it('cep', () => expect(cep('01310100')).toBe('01310-100'))
})

describe('anos', () => {
  it('mostra os dois anos quando diferem', () => expect(anos(2024, 2025)).toBe('2024/2025'))
  it('mostra um só quando são iguais', () => expect(anos(2024, 2024)).toBe('2024'))
})
