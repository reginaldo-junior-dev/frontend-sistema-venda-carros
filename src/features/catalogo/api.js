import { http, lerPagina, limparParams } from '@/lib/http'

export async function listarCarros(filtros = {}) {
  const { data } = await http.get('/carro', { params: limparParams(filtros) })
  return lerPagina(data)
}

export async function buscarCarro(id) {
  const { data } = await http.get(`/carro/${id}`)
  return data
}

// Listas pequenas e públicas usadas para resolver nomes e montar filtros
export async function listarLookup(recurso) {
  const { data } = await http.get(`/${recurso}`)
  return data
}

// A URL do S3 é assinada e vale 15 minutos; o CarroResponse não a inclui
export async function buscarUrlImagem(imagemId) {
  const { data } = await http.get(`/carro/imagens/${imagemId}/url`, { responseType: 'text' })
  return data
}
