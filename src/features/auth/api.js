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
