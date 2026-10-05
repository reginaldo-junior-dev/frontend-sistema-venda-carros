import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useParcelas } from '@/features/compra/hooks'
import { STATUS_PARCELA } from '@/lib/enums'
import { data, moeda } from '@/lib/format'
import { useAcaoParcela, useCriarParcelas } from '../hooks'

const TOM = { PENDENTE: 'atencao', PAGA: 'livre', CANCELADA: 'neutro' }

// Parcelas de um pagamento aprovado: cria (1 a 12, uma vez só) e dá baixa ou cancela cada uma
export function ParcelasDialog({ pagamento, aoFechar }) {
  return (
    <Dialog open={Boolean(pagamento)} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-h3">Parcelas</DialogTitle>
          <DialogDescription>
            Pagamento de {pagamento && moeda(pagamento.valor, { centavos: true })}. A primeira vence 30 dias após a aprovação.
          </DialogDescription>
        </DialogHeader>
        {pagamento && <Conteudo pagamento={pagamento} />}
      </DialogContent>
    </Dialog>
  )
}

function Conteudo({ pagamento }) {
  const parcelas = useParcelas(pagamento.id)
  const criar = useCriarParcelas()
  const acao = useAcaoParcela(pagamento.id)
  const [quantidade, setQuantidade] = useState('1')

  if (parcelas.isPending) return <div className="h-32 animate-pulse rounded-controle bg-superficie-funda" />
  if (parcelas.isError) return <p className="text-vendido">{parcelas.error.message}</p>

  if (parcelas.data.length === 0) {
    const n = Number(quantidade)
    // Mesma regra da API: divide para baixo e a diferença vai na última
    const base = Math.floor((Number(pagamento.valor) / n) * 100) / 100
    const ultima = Number(pagamento.valor) - base * (n - 1)
    return (
      <div className="flex flex-col gap-4">
        <p className="text-texto-suave">Este pagamento ainda não tem parcelas. Elas só podem ser criadas uma vez.</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Quantidade</span>
            <Select value={quantidade} onValueChange={setQuantidade}>
              <SelectTrigger className="w-32" aria-label="Quantidade de parcelas">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="tipo-dado pb-2 text-texto-suave">
            {n === 1 ? moeda(pagamento.valor, { centavos: true }) : `${n - 1}x ${moeda(base, { centavos: true })} + ${moeda(ultima, { centavos: true })}`}
          </p>
        </div>
        <Button
          className="self-start"
          disabled={criar.isPending}
          onClick={() =>
            criar.mutate(
              { pagamentoId: pagamento.id, quantidade: n },
              {
                onSuccess: () => toast.success(`${n} ${n === 1 ? 'parcela criada' : 'parcelas criadas'}.`),
                onError: (e) => toast.error(e.message),
              },
            )
          }
        >
          {criar.isPending ? 'Criando…' : `Criar ${n} ${n === 1 ? 'parcela' : 'parcelas'}`}
        </Button>
      </div>
    )
  }

  const lista = [...parcelas.data].sort((a, b) => a.numero - b.numero)
  return (
    <ul className="divide-y rounded-controle border">
      {lista.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 text-sm">
          <span className="tipo-dado w-10 font-semibold">
            {p.numero}/{lista.length}
          </span>
          <span className="tipo-dado text-texto-suave">vence {data(p.dataVencimento)}</span>
          <span className="tipo-dado font-semibold">{moeda(p.valor, { centavos: true })}</span>
          <Badge tom={TOM[p.status]}>{STATUS_PARCELA[p.status]}</Badge>
          {p.status === 'PENDENTE' && (
            <span className="ml-auto flex gap-1">
              <Button
                tamanho="sm"
                variante="secundaria"
                disabled={acao.isPending}
                onClick={() => acao.mutate({ id: p.id, acao: 'pagar' }, { onError: (e) => toast.error(e.message) })}
              >
                Dar baixa
              </Button>
              <Button
                tamanho="sm"
                variante="fantasma"
                className="text-vendido"
                disabled={acao.isPending}
                onClick={() => acao.mutate({ id: p.id, acao: 'cancelar' }, { onError: (e) => toast.error(e.message) })}
              >
                Cancelar
              </Button>
            </span>
          )}
          {p.dataPagamento && <span className="ml-auto text-texto-suave">paga em {data(p.dataPagamento)}</span>}
        </li>
      ))}
    </ul>
  )
}
