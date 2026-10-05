// Linguagem de movimento do Pátio: curta, com desaceleração longa, e só em resposta ao usuário
// (a exceção é a abertura da home: o portão sobe e o título entra, uma vez)

export const EASE = [0.22, 1, 0.36, 1]

export const DURACAO = {
  rapida: 0.18,
  media: 0.26,
  lenta: 0.32,
  portao: 1.15,
}

export const transicao = {
  padrao: { duration: DURACAO.media, ease: EASE },
  layout: { type: 'spring', stiffness: 380, damping: 36, mass: 0.9 },
}

// Painel de aço que sobe e revela o que está atrás, como um portão de garagem
export const portao = {
  fechado: { y: '0%' },
  aberto: { y: '-101%', transition: { duration: DURACAO.portao, ease: [0.7, 0, 0.3, 1], delay: 0.2 } },
}

// Abertura da home: começa quando o portão já passou da metade
export const ATRASO_ABERTURA = 0.85

export const linhaTitulo = {
  oculta: { y: '105%' },
  visivel: (i) => ({ y: '0%', transition: { duration: 0.7, ease: EASE, delay: ATRASO_ABERTURA + i * 0.09 } }),
}

export const surgir = {
  oculto: { opacity: 0, y: 16 },
  visivel: (atraso = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: ATRASO_ABERTURA + atraso } }),
}
