import { describe, expect, it } from 'vitest'
import { aplicar, contarFiltros, lerFiltros, paraApi, TAMANHO_PAGINA } from './filtros'

const params = (texto) => new URLSearchParams(texto)

describe('lerFiltros', () => {
  it('lê só os filtros conhecidos e converte a página para base zero', () => {
    const r = lerFiltros(params('marcaId=3&precoMax=90000&pagina=2&utm=x'))
    expect(r.filtros).toEqual({ marcaId: '3', precoMax: '90000' })
    expect(r.pagina).toBe(1)
    expect(r.ordem).toBe('relevancia')
    expect(r.incluirIndisponiveis).toBe(false)
  })

  it.each(['abc', '-3', '0', ''])('trata a página inválida "%s" como a primeira', (pagina) => {
    expect(lerFiltros(params(`pagina=${pagina}`)).pagina).toBe(0)
  })
})

describe('paraApi', () => {
  it('mostra só os disponíveis por padrão e traduz a ordenação', () => {
    expect(paraApi({ filtros: { marcaId: '3' }, ordem: 'menor-preco', pagina: 0, incluirIndisponiveis: false })).toEqual({
      marcaId: '3',
      status: 'DISPONIVEL',
      sort: 'preco,asc',
      page: 0,
      size: TAMANHO_PAGINA,
    })
  })

  it('inclui reservados e vendidos quando pedido', () => {
    expect(paraApi({ filtros: {}, ordem: 'relevancia', pagina: 0, incluirIndisponiveis: true })).not.toHaveProperty('status')
  })
})

describe('aplicar', () => {
  it('volta para a página 1 ao mudar um filtro', () => {
    expect(aplicar(params('pagina=3&corId=1'), { corId: '2' }).toString()).toBe('corId=2')
  })

  it('mantém a página quando a mudança é a própria página', () => {
    expect(aplicar(params('corId=1'), { pagina: 2 }).get('pagina')).toBe('2')
  })

  it('limpa o modelo ao trocar de marca', () => {
    expect(aplicar(params('marcaId=1&modeloId=9'), { marcaId: '2' }).has('modeloId')).toBe(false)
  })

  it('remove valores vazios e grava true como 1', () => {
    expect(aplicar(params('corId=1'), { corId: '', todos: true }).toString()).toBe('todos=1')
  })
})

it('contarFiltros não conta a busca por nome', () => {
  expect(contarFiltros({ nome: 'civic', marcaId: '1', corId: '2' })).toBe(2)
})
