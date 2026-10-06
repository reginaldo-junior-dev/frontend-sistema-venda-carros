// Filtros do catálogo vivem na URL: dá para compartilhar o link e o "voltar" funciona.
// Os nomes dos parâmetros são os mesmos do CarroFiltro da API.

export const CAMPOS_FILTRO = [
  'nome',
  'marcaId',
  'modeloId',
  'categoriaId',
  'corId',
  'condicao',
  'combustivel',
  'cambio',
  'precoMin',
  'precoMax',
  'anoMin',
  'anoMax',
  'quilometragemMax',
]

export const ORDENACOES = [
  { valor: 'relevancia', rotulo: 'Mais relevantes', sort: null },
  { valor: 'menor-preco', rotulo: 'Menor preço', sort: 'preco,asc' },
  { valor: 'maior-preco', rotulo: 'Maior preço', sort: 'preco,desc' },
  { valor: 'mais-novos', rotulo: 'Mais novos', sort: 'anoModelo,desc' },
  { valor: 'menos-rodados', rotulo: 'Menos rodados', sort: 'quilometragem,asc' },
]

export const TAMANHO_PAGINA = 12

// URLSearchParams → objeto de filtros da tela
export function lerFiltros(params) {
  const filtros = {}
  for (const campo of CAMPOS_FILTRO) {
    const valor = params.get(campo)
    if (valor) filtros[campo] = valor
  }
  return {
    filtros,
    ordem: params.get('ordem') ?? 'relevancia',
    // Página inválida na URL ("abc", "-3") vira a primeira
    pagina: Math.max(0, (Number.parseInt(params.get('pagina'), 10) || 1) - 1),
    // Por padrão só aparecem os disponíveis; "todos" inclui reservados e vendidos
    incluirIndisponiveis: params.get('todos') === '1',
  }
}

// Objeto da tela → parâmetros da API
export function paraApi({ filtros, ordem, pagina, incluirIndisponiveis }) {
  const sort = ORDENACOES.find((o) => o.valor === ordem)?.sort
  return {
    ...filtros,
    ...(incluirIndisponiveis ? {} : { status: 'DISPONIVEL' }),
    ...(sort ? { sort } : {}),
    page: pagina,
    size: TAMANHO_PAGINA,
  }
}

/**
 * Aplica mudanças nos parâmetros. Qualquer filtro novo volta para a página 1;
 * valores vazios somem da URL. Escolher outra marca limpa o modelo, que depende dela.
 */
export function aplicar(params, mudancas) {
  const novo = new URLSearchParams(params)
  for (const [chave, valor] of Object.entries(mudancas)) {
    if (valor === '' || valor == null || valor === false) novo.delete(chave)
    else novo.set(chave, valor === true ? '1' : String(valor))
  }
  if ('marcaId' in mudancas && !('modeloId' in mudancas)) novo.delete('modeloId')
  if (!('pagina' in mudancas)) novo.delete('pagina')
  return novo
}

export function contarFiltros(filtros) {
  return Object.keys(filtros).filter((c) => c !== 'nome').length
}
