import { http } from '@/lib/http'

// Chave do cache com a conta logada (null para visitante)
export const CHAVE_SESSAO = ['sessao']

// A API grava o cookie da sessão e devolve a conta (o token nunca chega ao JavaScript)
export async function entrar({ email, senha }) {
  const { data } = await http.post('/auth/login', { email, senha })
  return data
}

// Só a API consegue apagar o cookie HttpOnly
export async function sair() {
  await http.post('/auth/logout')
}

export async function criarConta({ nomeCompleto, email, senha }) {
  const { data } = await http.post('/usuario', { nomeCompleto, email, senha })
  return data
}

// Quem está logado, pelo cookie da sessão; 401 quer dizer visitante
export async function buscarMe() {
  try {
    const { data } = await http.get('/usuario/me')
    return data
  } catch (erro) {
    if (erro.status === 401) return null
    throw erro
  }
}

// Trocar e-mail ou senha exige a senha atual; campos vazios não são enviados (nova senha vazia mantém a atual)
export async function atualizarMe({ nomeCompleto, email, senhaAtual, novaSenha }) {
  const { data } = await http.put('/usuario/me', {
    nomeCompleto,
    email,
    senhaAtual: senhaAtual || undefined,
    novaSenha: novaSenha || undefined,
  })
  return data
}

// Remove também o cadastro de cliente; a API recusa se houver compras
export async function excluirMe() {
  await http.delete('/usuario/me')
}

// Login do Google acontece no back-end (Spring OAuth2), que devolve para /oauth/callback
export const URL_LOGIN_GOOGLE = '/api/oauth2/authorization/google'
