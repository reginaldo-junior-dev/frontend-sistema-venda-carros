import axios from 'axios'
import { avisarSessaoPerdida } from './sessao'

// A API é chamada pelo próprio endereço do site (/api), que a Vercel, o Vite e o nginx repassam para ela.
// Assim o cookie da sessão é do próprio site, e o Axios manda o token CSRF (cookie XSRF-TOKEN →
// cabeçalho X-XSRF-TOKEN) sozinho, porque a chamada é para a mesma origem
export const http = axios.create({
  baseURL: '/api',
  // A API no plano gratuito do Render dorme sem uso e leva perto de 1 minuto para acordar
  timeout: 70_000,
})

http.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const normalizado = normalizarErro(erro)
    // Cookie da sessão vencido ou inválido: o site passa a mostrar a pessoa como deslogada
    if (normalizado.status === 401) avisarSessaoPerdida()
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
