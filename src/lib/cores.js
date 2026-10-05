import { normalizar } from './texto'

// A API guarda só o nome da cor; o tom aproximado vem daqui para a amostra nos filtros
const TONS = {
  branco: '#f3f4f1',
  'branco perola': '#efe9dc',
  preto: '#1b1d1f',
  prata: '#c3c7cb',
  cinza: '#7b8086',
  grafite: '#41464b',
  chumbo: '#4d5257',
  vermelho: '#b3261e',
  vinho: '#6b1b2b',
  azul: '#1f4fa3',
  'azul marinho': '#1c2d55',
  verde: '#2f6b3a',
  amarelo: '#e8c21a',
  laranja: '#e0701f',
  marrom: '#6b4a2f',
  bege: '#d8c7a5',
  dourado: '#c9a54c',
  bronze: '#8c6239',
  rosa: '#d98aa5',
  roxo: '#5b3a8c',
}

export function tomDaCor(nome) {
  return TONS[normalizar(nome)] ?? null
}
