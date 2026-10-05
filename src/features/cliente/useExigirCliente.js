import { use } from 'react'
import { CadastroClienteContext } from './contexto'

/**
 * Devolve exigirCliente(acao, motivo): roda a ação se a pessoa já é cliente;
 * senão leva ao login ou abre o cadastro de comprador e roda a ação ao concluir.
 */
export function useExigirCliente() {
  const ctx = use(CadastroClienteContext)
  if (!ctx) throw new Error('useExigirCliente precisa estar dentro do <CadastroClienteProvider>')
  return ctx
}
