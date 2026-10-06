import { http } from '@/lib/http'

export async function entrar({ email, senha }) {
  const { data } = await http.post('/auth/login', { email, senha })
  return data.token
}

export async function criarConta({ nomeCompleto, email, senha }) {
  const { data } = await http.post('/usuario', { nomeCompleto, email, senha })
  return data
}

export async function buscarMe() {
  const { data } = await http.get('/usuario/me')
  return data
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
export const URL_LOGIN_GOOGLE = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`
