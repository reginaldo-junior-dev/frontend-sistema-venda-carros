// Token JWT persistido. A API é stateless e só aceita o token no header Authorization.
const CHAVE = 'patio.token'
const ouvintes = new Set()

export function lerToken() {
  try {
    return localStorage.getItem(CHAVE)
  } catch {
    return null
  }
}

export function salvarToken(token) {
  try {
    localStorage.setItem(CHAVE, token)
  } catch {
    // modo privado sem storage: a sessão dura até recarregar a página
  }
  ouvintes.forEach((fn) => fn(token))
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // ignora
  }
  ouvintes.forEach((fn) => fn(null))
}

export function aoMudarToken(fn) {
  ouvintes.add(fn)
  return () => ouvintes.delete(fn)
}

// Lê o payload sem validar a assinatura: serve só para a interface (quem valida é a API)
export function decodificarToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    const payload = JSON.parse(json)
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null
    return { id: payload.sub, perfil: payload.perfil, expiraEm: payload.exp ? payload.exp * 1000 : null }
  } catch {
    return null
  }
}
