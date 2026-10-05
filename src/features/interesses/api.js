import { http, lerPagina } from '@/lib/http'

export async function registrarInteresse(carroId, { nome, email, telefone, mensagem }) {
  const { data } = await http.post(`/carro/${carroId}/interesse`, { nome, email, telefone, mensagem })
  return data
}

export async function listarMeusInteresses() {
  try {
    const { data } = await http.get('/cliente/me/interesses', { params: { size: 100 } })
    return lerPagina(data).itens
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}
