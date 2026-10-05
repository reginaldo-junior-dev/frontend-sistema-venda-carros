import { http } from '@/lib/http'

// 404 aqui não é erro: o usuário ainda não completou o cadastro de comprador
export async function buscarMeuCliente() {
  try {
    const { data } = await http.get('/cliente/me')
    return data
  } catch (erro) {
    if (erro.status === 404) return null
    throw erro
  }
}

export async function cadastrarCliente({ cpf, dataNascimento, telefone }) {
  const { data } = await http.post('/cliente', { cpf, dataNascimento, telefone })
  return data
}

export async function atualizarCliente({ cpf, dataNascimento, telefone }) {
  const { data } = await http.put('/cliente/me', { cpf, dataNascimento, telefone })
  return data
}
