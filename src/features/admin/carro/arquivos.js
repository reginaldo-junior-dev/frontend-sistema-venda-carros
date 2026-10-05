export const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp']
export const LIMITE_MB = 10 // spring.servlet.multipart.max-file-size

// Motivo para recusar o arquivo antes de enviar, ou null se ele serve
export function problemaDoArquivo(arquivo) {
  if (!TIPOS_IMAGEM.includes(arquivo.type)) return 'Use JPG, PNG ou WEBP.'
  if (arquivo.size > LIMITE_MB * 1024 * 1024) return `Maior que ${LIMITE_MB} MB.`
  return null
}
