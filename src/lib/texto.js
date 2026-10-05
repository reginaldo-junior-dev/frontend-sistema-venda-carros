// "Sedã" → "seda": compara nomes sem acento nem maiúsculas
export function normalizar(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
