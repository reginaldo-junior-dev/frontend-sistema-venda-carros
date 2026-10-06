import { describe, expect, it } from 'vitest'
import { criarToken } from '@/test/utils'
import { decodificarToken } from './sessao'

describe('decodificarToken', () => {
  it('lê id, perfil e expiração', () => {
    const exp = Math.floor(Date.now() / 1000) + 60
    expect(decodificarToken(criarToken({ sub: 'abc', perfil: 'ADMINISTRADOR', exp }))).toEqual({
      id: 'abc',
      perfil: 'ADMINISTRADOR',
      expiraEm: exp * 1000,
    })
  })

  it('token expirado não vale', () => {
    expect(decodificarToken(criarToken({ exp: Math.floor(Date.now() / 1000) - 1 }))).toBeNull()
  })

  it('token malformado não derruba a tela', () => {
    expect(decodificarToken('lixo')).toBeNull()
    expect(decodificarToken('')).toBeNull()
  })
})
