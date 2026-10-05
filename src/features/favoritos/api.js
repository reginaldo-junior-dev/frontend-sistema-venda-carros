import { http, lerPagina } from '@/lib/http'

// A lista é paginada na API; 100 cobre com folga os favoritos de uma pessoa
export async function listarFavoritos() {
  try {
    const { data } = await http.get('/cliente/me/favoritos', { params: { size: 100 } })
    return lerPagina(data).itens
  } catch (erro) {
    // Sem cadastro de cliente ainda não existem favoritos
    if (erro.status === 404) return []
    throw erro
  }
}

export async function favoritar(carroId) {
  const { data } = await http.post(`/carro/${carroId}/favorito`)
  return data
}

export async function desfavoritar(carroId) {
  await http.delete(`/carro/${carroId}/favorito`)
}
