import { anos } from '@/lib/format'

// Junta o CarroResponse com os lookups: { marca, modelo, cor, categoria, anos, foto }
export function descreverCarro(carro, porId) {
  const modelo = porId.modelo[carro.modeloId]
  const marca = modelo ? porId.marca[modelo.marcaId] : undefined
  return {
    marca: marca?.nome ?? '',
    modelo: modelo?.nome ?? '',
    cor: porId.cor[carro.corId]?.nome ?? '',
    categoria: porId.categoria[carro.categoriaId]?.nome ?? '',
    anos: anos(carro.anoFabricacao, carro.anoModelo),
    foto: fotoPrincipal(carro),
  }
}

export function fotoPrincipal(carro) {
  const imagens = carro.imagens ?? []
  return imagens.find((i) => i.principal) ?? [...imagens].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))[0] ?? null
}

// Mesmo nome no card e na foto principal do detalhe: o navegador anima uma até a outra
export const nomeTransicaoFoto = (id) => `foto-carro-${id}`

// Principal primeiro, depois pela ordem definida no cadastro
export function ordenarImagens(imagens = []) {
  return [...imagens].sort((a, b) => Number(b.principal) - Number(a.principal) || (a.ordem ?? 0) - (b.ordem ?? 0))
}
