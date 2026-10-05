// Só aceita caminhos internos, para o ?voltar= não virar um redirecionamento para outro site
export function destinoSeguro(voltar) {
  return voltar && voltar.startsWith('/') && !voltar.startsWith('//') ? voltar : '/'
}
