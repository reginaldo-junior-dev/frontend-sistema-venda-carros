import { AxiosError } from 'axios'
import { afterEach, describe, expect, it } from 'vitest'
import { criarToken } from '@/test/utils'
import { http, lerPagina, limparParams } from './http'
import { lerToken, salvarToken } from './sessao'

const adapterOriginal = http.defaults.adapter
afterEach(() => {
  http.defaults.adapter = adapterOriginal
})

// Faz a próxima chamada falhar como a API falharia
function responder(status, data) {
  http.defaults.adapter = async (config) => {
    throw new AxiosError('falhou', 'ERR_BAD_RESPONSE', config, null, { status, data, config, headers: {} })
  }
}

describe('erros da API', () => {
  it('ErroValidacao vira erros por campo', async () => {
    responder(400, { status: 400, mensagens: { email: 'E-mail já cadastrado' } })
    await expect(http.post('/usuario')).rejects.toMatchObject({
      status: 400,
      message: 'Revise os campos destacados.',
      campos: { email: 'E-mail já cadastrado' },
    })
  })

  it('ErroResposta mantém a mensagem da API', async () => {
    responder(409, { status: 409, mensagem: 'Carro já reservado' })
    await expect(http.post('/compra')).rejects.toMatchObject({ status: 409, message: 'Carro já reservado' })
  })

  it('sem mensagem, usa um texto padrão pelo status', async () => {
    responder(503, null)
    await expect(http.get('/carro')).rejects.toMatchObject({ status: 503, message: expect.stringContaining('servidor') })
  })

  it('sem resposta, explica que não conectou', async () => {
    http.defaults.adapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config)
    }
    await expect(http.get('/carro')).rejects.toMatchObject({ status: 0, message: expect.stringContaining('conectar') })
  })

  it('401 encerra a sessão', async () => {
    salvarToken(criarToken())
    responder(401, null)
    await expect(http.get('/usuario/me')).rejects.toMatchObject({ status: 401 })
    expect(lerToken()).toBeNull()
  })
})

it('envia o token no cabeçalho', async () => {
  const token = criarToken()
  salvarToken(token)
  let cabecalho
  http.defaults.adapter = async (config) => {
    cabecalho = config.headers.Authorization
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config }
  }
  await http.get('/usuario/me')
  expect(cabecalho).toBe(`Bearer ${token}`)
})

it('lerPagina converte a página do Spring', () => {
  expect(lerPagina({ content: [1, 2], page: { number: 1, size: 2, totalElements: 9, totalPages: 5 } })).toEqual({
    itens: [1, 2],
    pagina: 1,
    tamanho: 2,
    total: 9,
    totalPaginas: 5,
  })
})

it('limparParams tira vazios mas mantém zero', () => {
  expect(limparParams({ a: '', b: null, c: undefined, d: 0, e: 'x' })).toEqual({ d: 0, e: 'x' })
})
