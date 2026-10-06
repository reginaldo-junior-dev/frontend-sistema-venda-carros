import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EstadoErro } from '@/components/shared/Estados'
import { FotoCarro } from '@/features/catalogo/FotoCarro'
import { descreverCarro } from '@/features/catalogo/descrever'
import { useCarrosPorId, useLookups } from '@/features/catalogo/hooks'
import { METODO_PAGAMENTO, STATUS_COMPRA, STATUS_PAGAMENTO, STATUS_PARCELA } from '@/lib/enums'
import { data, dataHora, moeda } from '@/lib/format'
import { useTitulo } from '@/lib/useTitulo'
import { cn } from '@/lib/utils'
import { ContagemReserva } from './ContagemReserva'
import { useMinhasCompras, usePagamentosPorCompra, useParcelas } from './hooks'
import { situacaoDaCompra } from './reserva'

const TOM_COMPRA = { PENDENTE: 'atencao', APROVADA: 'livre', CANCELADA: 'neutro' }
const TOM_PAGAMENTO = { PENDENTE: 'atencao', APROVADO: 'livre', RECUSADO: 'vendido', CANCELADO: 'neutro' }
const TOM_PARCELA = { PENDENTE: 'atencao', PAGA: 'livre', CANCELADA: 'neutro' }

export default function MinhasComprasPage() {
  useTitulo('Minhas compras')
  const compras = useMinhasCompras()
  const pagamentos = usePagamentosPorCompra()
  const lookups = useLookups()
  const lista = compras.data ?? []
  const carros = useCarrosPorId([...new Set(lista.map((c) => c.carroId))])

  return (
    <div className="py-10">
      <h1 className="tipo-emblema text-h2">Minhas compras</h1>
      <p className="mt-2 mb-10 text-texto-suave">Reservas, pagamentos e parcelas de cada carro.</p>

      {compras.isError ? (
        <EstadoErro erro={compras.error} aoTentarDeNovo={compras.refetch} />
      ) : compras.isPending ? (
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-foto bg-superficie-funda" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="grid overflow-hidden rounded-foto border bg-superficie md:grid-cols-[1.1fr_1fr]">
          <img src="/imagens/volante.webp" alt="" loading="lazy" className="h-56 w-full object-cover md:h-full md:min-h-72" />
          <div className="flex flex-col items-start justify-center gap-4 p-8 lg:p-10">
            <p className="tipo-emblema text-h3">Nenhuma compra ainda.</p>
            <p className="max-w-[40ch] text-texto-suave">
              Quando você reservar um carro, a reserva e o pagamento aparecem aqui.
            </p>
            <Button asChild>
              <Link to="/carros">Ver carros disponíveis</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ol className="flex flex-col gap-5">
          {lista.map((compra) => (
            <ItemCompra
              key={compra.id}
              compra={compra}
              carro={carros[compra.carroId]?.carro}
              porId={lookups.porId}
              pagamentos={pagamentos.porCompra[compra.id] ?? []}
            />
          ))}
        </ol>
      )}
    </div>
  )
}

function ItemCompra({ compra, carro, porId, pagamentos }) {
  const d = carro ? descreverCarro(carro, porId) : null
  const situacao = situacaoDaCompra(compra, pagamentos)

  return (
    <li className="overflow-hidden rounded-foto border bg-superficie">
      <div className="grid gap-5 p-4 sm:grid-cols-[12rem_1fr] sm:p-5">
        <FotoCarro imagem={d?.foto ?? null} alt="" className="aspect-[4/3] rounded-controle" />
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              {carro ? (
                <Link to={`/carros/${carro.id}`} className="text-lead font-semibold hover:underline">
                  {d.marca} {carro.nome}
                </Link>
              ) : (
                <p className="text-lead font-semibold">Carro</p>
              )}
              <p className="text-sm text-texto-suave">Reservado em {dataHora(compra.dataCompra)}</p>
            </div>
            <Badge tom={TOM_COMPRA[compra.status]}>{STATUS_COMPRA[compra.status]}</Badge>
          </div>
          <p className="tipo-dado text-h3 font-bold">{moeda(compra.valorTotal, { centavos: true })}</p>

          {situacao === 'aberta' && (
            <div className="flex flex-wrap items-center gap-4">
              <ContagemReserva compra={compra} compacta />
              <Button asChild tamanho="sm">
                <Link to={`/conta/compras/${compra.id}/pagamento`}>Pagar agora</Link>
              </Button>
            </div>
          )}
          {situacao === 'processando-cartao' && (
            <Button asChild tamanho="sm" variante="secundaria" className="self-start">
              <Link to={`/conta/compras/${compra.id}/pagamento`}>Acompanhar pagamento</Link>
            </Button>
          )}
          {situacao === 'aguardando-equipe' && (
            <p className="text-sm text-texto-suave">A equipe vai enviar os dados para pagamento e confirmar o recebimento.</p>
          )}
        </div>
      </div>

      {pagamentos.length > 0 && (
        <div className="border-t bg-fundo/50 px-4 py-3 sm:px-5">
          <p className="mb-2 text-sm font-semibold">Pagamentos</p>
          <ul className="flex flex-col divide-y">
            {pagamentos.map((p) => (
              <LinhaPagamento key={p.id} pagamento={p} />
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

function LinhaPagamento({ pagamento }) {
  const [aberto, setAberto] = useState(false)
  // As parcelas são criadas pela equipe; só busca quando a pessoa abre
  const parcelas = useParcelas(pagamento.id, aberto)

  return (
    <li className="py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-medium">{METODO_PAGAMENTO[pagamento.metodo]}</span>
        <Badge tom={TOM_PAGAMENTO[pagamento.status]}>{STATUS_PAGAMENTO[pagamento.status]}</Badge>
        <span className="tipo-dado text-texto-suave">{moeda(pagamento.valor, { centavos: true })}</span>
        {pagamento.dataPagamento && (
          <span className="text-sm text-texto-suave">Pago em {dataHora(pagamento.dataPagamento)}</span>
        )}
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-marca hover:underline"
        >
          Parcelas
          <ChevronDown className={cn('size-4 transition-transform', aberto && 'rotate-180')} aria-hidden="true" />
        </button>
      </div>

      {aberto && (
        <div className="mt-3">
          {parcelas.isPending ? (
            <div className="h-16 animate-pulse rounded-controle bg-superficie-funda" />
          ) : parcelas.isError ? (
            <p className="text-sm text-vendido">{parcelas.error.message}</p>
          ) : parcelas.data.length === 0 ? (
            <p className="text-sm text-texto-suave">Este pagamento é à vista, sem parcelas.</p>
          ) : (
            <table className="w-full text-sm">
              <caption className="sr-only">Parcelas do pagamento</caption>
              <thead>
                <tr className="text-left text-texto-suave">
                  <th className="py-1.5 font-medium">Parcela</th>
                  <th className="py-1.5 font-medium">Vencimento</th>
                  <th className="py-1.5 text-right font-medium">Valor</th>
                  <th className="py-1.5 text-right font-medium">Situação</th>
                </tr>
              </thead>
              <tbody className="tipo-dado">
                {[...parcelas.data]
                  .sort((a, b) => a.numero - b.numero)
                  .map((parcela) => (
                    <tr key={parcela.id} className="border-t">
                      <td className="py-2">
                        {parcela.numero}/{parcelas.data.length}
                      </td>
                      <td className="py-2">{data(parcela.dataVencimento)}</td>
                      <td className="py-2 text-right">{moeda(parcela.valor, { centavos: true })}</td>
                      <td className="py-2 text-right">
                        <Badge tom={TOM_PARCELA[parcela.status]}>{STATUS_PARCELA[parcela.status]}</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </li>
  )
}
