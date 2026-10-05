import axios from 'axios'
import { lerToken, limparToken } from './sessao'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
})

http.interceptors.request.use((config) => {
  const token = lerToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const normalizado = normalizarErro(erro)
    // Token expirado ou inválido: encerra a sessão (as rotas protegidas levam ao login)
    if (normalizado.status === 401 && lerToken()) limparToken()
    return Promise.reject(normalizado)
  },
)

export class ErroApi extends Error {
  constructor({ status, mensagem, campos = {} }) {
    super(mensagem)
    this.name = 'ErroApi'
    this.status = status
    this.campos = campos
  }
}

// Converte ErroResposta { mensagem } e ErroValidacao { mensagens: { campo: msg } } num formato só
function normalizarErro(erro) {
  if (!erro.response) {
    const mensagem =
      erro.code === 'ECONNABORTED'
        ? 'O servidor demorou para responder. Tente de novo em instantes.'
        : 'Não foi possível conectar ao servidor. Verifique sua conexão e tente de novo.'
    return new ErroApi({ status: 0, mensagem })
  }

  const { status, data } = erro.response
  if (data?.mensagens) {
    return new ErroApi({ status, mensagem: 'Revise os campos destacados.', campos: data.mensagens })
  }
  return new ErroApi({ status, mensagem: data?.mensagem ?? mensagemPadrao(status) })
}

function mensagemPadrao(status) {
  if (status === 401) return 'Sua sessão terminou. Entre de novo para continuar.'
  if (status === 403) return 'Sua conta não tem acesso a esta área.'
  if (status === 404) return 'Não encontramos o que você procurava.'
  if (status >= 500) return 'O servidor encontrou um problema. Tente de novo em instantes.'
  return 'Algo não saiu como esperado. Tente de novo.'
}

// Spring Data via-dto: { content, page: { size, number, totalElements, totalPages } }
export function lerPagina(data) {
  return {
    itens: data?.content ?? [],
    pagina: data?.page?.number ?? 0,
    tamanho: data?.page?.size ?? 0,
    total: data?.page?.totalElements ?? 0,
    totalPaginas: data?.page?.totalPages ?? 0,
  }
}

// Remove filtros vazios antes de virar query string
export function limparParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
}
