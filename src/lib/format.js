const moedaFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const moedaCentavosFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numeroFmt = new Intl.NumberFormat('pt-BR')
const dataFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const dataHoraFmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

// A API manda BigDecimal como número ou string
export function moeda(valor, { centavos = false } = {}) {
  if (valor == null) return ''
  return (centavos ? moedaCentavosFmt : moedaFmt).format(Number(valor))
}

export function km(valor) {
  if (valor == null) return ''
  return valor === 0 ? '0 km' : `${numeroFmt.format(valor)} km`
}

export function numero(valor) {
  return valor == null ? '' : numeroFmt.format(valor)
}

// LocalDate ("2024-03-01") é lida como data local, sem deslocar o dia pelo fuso
export function data(valor) {
  if (!valor) return ''
  const d = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor)
  return dataFmt.format(d)
}

export function dataHora(valor) {
  return valor ? dataHoraFmt.format(new Date(valor)) : ''
}

export function soDigitos(valor = '') {
  return String(valor).replace(/\D/g, '')
}

export function cpf(valor = '') {
  return soDigitos(valor)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function telefone(valor = '') {
  const d = soDigitos(valor).slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

// "2024/2025" quando os anos diferem, "2024" quando são iguais
export function anos(fabricacao, modelo) {
  if (!fabricacao) return modelo ? String(modelo) : ''
  return fabricacao === modelo || !modelo ? String(fabricacao) : `${fabricacao}/${modelo}`
}
