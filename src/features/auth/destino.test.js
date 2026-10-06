import { describe, expect, it } from 'vitest'
import { destinoAposEntrar, destinoSeguro } from './destino'

describe('destinoSeguro', () => {
  it('aceita caminho interno', () => expect(destinoSeguro('/carros/1?x=2')).toBe('/carros/1?x=2'))

  it.each(['https://golpe.com', '//golpe.com', 'carros', '', null])('recusa "%s" e manda para a home', (voltar) => {
    expect(destinoSeguro(voltar)).toBe('/')
  })
})

describe('destinoAposEntrar', () => {
  it('volta para a página de onde a pessoa veio', () => {
    expect(destinoAposEntrar('/carros/1', 'ADMINISTRADOR')).toBe('/carros/1')
  })

  it('sem página de origem, admin vai ao painel e cliente à home', () => {
    expect(destinoAposEntrar(null, 'ADMINISTRADOR')).toBe('/admin')
    expect(destinoAposEntrar(null, 'USUARIO')).toBe('/')
  })
})
