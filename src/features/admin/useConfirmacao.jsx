import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/**
 * Confirmação de ação destrutiva ou definitiva. `aoConfirmar` devolve uma Promise;
 * o erro da API aparece dentro do diálogo, sem fechá-lo.
 */
export function useConfirmacao() {
  const [pedido, setPedido] = useState(null)
  const [erro, setErro] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const confirmar = (opcoes) => {
    setErro(null)
    setPedido(opcoes)
  }

  async function executar() {
    setOcupado(true)
    setErro(null)
    try {
      await pedido.aoConfirmar()
      setPedido(null)
    } catch (e) {
      setErro(e.message)
    } finally {
      setOcupado(false)
    }
  }

  const dialogo = (
    <Dialog open={Boolean(pedido)} onOpenChange={(v) => !v && !ocupado && setPedido(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-h3">{pedido?.titulo}</DialogTitle>
          {pedido?.descricao && <DialogDescription>{pedido.descricao}</DialogDescription>}
        </DialogHeader>
        {erro && (
          <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-3 py-2 text-sm text-vendido">
            {erro}
          </p>
        )}
        <DialogFooter>
          <Button variante="secundaria" onClick={() => setPedido(null)} disabled={ocupado}>
            Voltar
          </Button>
          <Button variante={pedido?.perigo ? 'perigo' : 'primaria'} onClick={executar} disabled={ocupado}>
            {ocupado ? 'Aguarde…' : pedido?.textoBotao}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { confirmar, dialogo }
}
