// A sessão fica num cookie HttpOnly que só a API lê e grava: o front nunca vê o token.
// O que o front precisa saber é quando a API responde 401 (cookie vencido ou inválido) para mostrar a pessoa como deslogada.
const ouvintes = new Set()

export function aoPerderSessao(fn) {
  ouvintes.add(fn)
  return () => ouvintes.delete(fn)
}

export function avisarSessaoPerdida() {
  ouvintes.forEach((fn) => fn())
}
