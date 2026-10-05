import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/useAuth'
import * as api from './api'
import { CadastroClienteContext } from './contexto'
import { FormularioCliente } from './FormularioCliente'

export function CadastroClienteProvider({ children }) {
  const { estaLogado } = useAuth()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const queryClient = useQueryClient()
  const [pendente, setPendente] = useState(null)

  const exigirCliente = useCallback(
    async (acao, motivo) => {
      if (!estaLogado) {
        navigate(`/entrar?voltar=${encodeURIComponent(pathname + search)}`)
        return
      }
      const cliente = await queryClient.ensureQueryData({ queryKey: ['me', 'cliente'], queryFn: api.buscarMeuCliente })
      if (cliente) return acao()
      setPendente({ acao, motivo })
    },
    [estaLogado, navigate, pathname, search, queryClient],
  )

  const valor = useMemo(() => ({ exigirCliente }), [exigirCliente])

  function concluir() {
    const acao = pendente?.acao
    setPendente(null)
    acao?.()
  }

  return (
    <CadastroClienteContext value={valor}>
      {children}
      <Dialog open={Boolean(pendente)} onOpenChange={(aberto) => !aberto && setPendente(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="tipo-emblema text-h3">Complete seu cadastro</DialogTitle>
            <DialogDescription>
              {pendente?.motivo ?? 'Para continuar,'} precisamos de alguns dados de comprador. Você só faz isso uma vez.
            </DialogDescription>
          </DialogHeader>
          {pendente && (
            <FormularioCliente
              textoBotao="Salvar e continuar"
              aoConcluir={concluir}
              className="flex flex-col gap-4 [&>button]:self-stretch"
            />
          )}
        </DialogContent>
      </Dialog>
    </CadastroClienteContext>
  )
}
