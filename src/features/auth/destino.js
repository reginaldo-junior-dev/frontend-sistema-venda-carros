// Só aceita caminhos internos, para o ?voltar= não virar um redirecionamento para outro site
export function destinoSeguro(voltar) {
  return voltar && voltar.startsWith('/') && !voltar.startsWith('//') ? voltar : '/'
}

// Sem página para voltar, o admin vai direto ao painel; o cliente, para a home
export function destinoAposEntrar(voltar, perfil) {
  if (voltar) return destinoSeguro(voltar)
  return perfil === 'ADMINISTRADOR' ? '/admin' : '/'
}
