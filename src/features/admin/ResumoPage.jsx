import { useState } from 'react'
import { Link } from 'react-router'
import { useQueries } from '@tanstack/react-query'
import { ArrowUpRight, Clock, MessagesSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EstadoErro } from '@/components/shared/Estados'
import { moeda, numero } from '@/lib/format'
import { cn } from '@/lib/utils'
import { contarCarros } from './api'
import { useComprasAdmin, useInteressesAdmin, usePagamentosAdmin } from './hooks'
import { CabecalhoAdmin } from './ui'

const STATUS_ESTOQUE = [
  { status: 'DISPONIVEL', rotulo: 'Disponíveis', link: '/admin/carros' },
  { status: 'RESERVADO', rotulo: 'Reservados', link: '/admin/vendas' },
  { status: 'VENDIDO', rotulo: 'Vendidos', link: '/admin/carros' },
]

const MESES = 6
const mesFmt = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
const mesLongoFmt = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
// Capitaliza no JS: o text-transform do CSS não se comportou igual em todos os meses
const inicial = (t) => t.charAt(0).toUpperCase() + t.slice(1)

export default function ResumoPage() {
  const estoque = useQueries({
    queries: STATUS_ESTOQUE.map(({ status }) => ({
      queryKey: ['admin', 'resumo', 'carros', status],
      queryFn: () => contarCarros(status),
    })),
  })
  const compras = useComprasAdmin({ size: 100, sort: 'dataCompra,desc' })
  const pagamentos = usePagamentosAdmin({ size: 100 })
  const interesses = useInteressesAdmin()

  const aprovadas = (compras.data?.itens ?? []).filter((c) => c.status === 'APROVADA')
  const faturamento = aprovadas.reduce((soma, c) => soma + Number(c.valorTotal), 0)
  const aguardando = (pagamentos.data?.itens ?? []).filter((p) => p.status === 'PENDENTE' && !p.idExterno)
  const interessesNovos = (interesses.data?.itens ?? []).filter((i) => i.status === 'NOVO')

  return (
    <div>
      <CabecalhoAdmin titulo="Resumo" descricao="Como está o pátio e o que precisa de você hoje." />

      {compras.isError ? (
        <EstadoErro erro={compras.error} aoTentarDeNovo={compras.refetch} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
            {/* O número que o painel destaca: um só por tela */}
            <section className="flex flex-col justify-between gap-6 rounded-foto border bg-superficie p-6">
              <div>
                <h2 className="text-texto-suave">Faturamento em vendas aprovadas</h2>
                <p className="mt-2 text-[3.25rem] leading-none font-semibold tracking-tight">
                  {compras.isPending ? <span className="inline-block h-12 w-56 animate-pulse rounded-controle bg-superficie-funda" /> : moeda(faturamento)}
                </p>
                <p className="mt-2 text-sm text-texto-suave">
                  {aprovadas.length} {aprovadas.length === 1 ? 'carro vendido' : 'carros vendidos'} nas últimas 100 compras
                </p>
              </div>
              <ul className="grid grid-cols-3 gap-3 border-t pt-5">
                {STATUS_ESTOQUE.map((s, i) => (
                  <li key={s.status}>
                    <Link to={s.link} className="group block">
                      <span className="block text-sm text-texto-suave group-hover:text-texto">{s.rotulo}</span>
                      <span className="text-h3 font-semibold">
                        {estoque[i].isPending ? '…' : estoque[i].isError ? '—' : numero(estoque[i].data)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="titulo-atencao" className="flex flex-col gap-3 rounded-foto border bg-superficie p-6">
              <h2 id="titulo-atencao" className="font-semibold">
                Precisa da sua atenção
              </h2>
              <Pendencia
                icone={Clock}
                quantidade={aguardando.length}
                carregando={pagamentos.isPending}
                texto={(n) => (n === 1 ? 'Pix ou boleto esperando confirmação' : 'Pix e boletos esperando confirmação')}
                vazio="Nenhum pagamento esperando confirmação"
                link="/admin/vendas"
                acao="Confirmar pagamentos"
              />
              <Pendencia
                icone={MessagesSquare}
                quantidade={interessesNovos.length}
                carregando={interesses.isPending}
                texto={(n) => (n === 1 ? 'interesse novo sem resposta' : 'interesses novos sem resposta')}
                vazio="Nenhum interesse novo"
                link="/admin/interesses"
                acao="Atender interesses"
              />
            </section>
          </div>

          <section aria-labelledby="titulo-grafico" className="rounded-foto border bg-superficie p-6">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="titulo-grafico" className="font-semibold">
                  Carros vendidos por mês
                </h2>
                <p className="text-sm text-texto-suave">Últimos {MESES} meses, pela data da reserva</p>
              </div>
              <Button asChild variante="link">
                <Link to="/admin/vendas">Ver vendas</Link>
              </Button>
            </div>
            {compras.isPending ? (
              <div className="h-56 animate-pulse rounded-controle bg-superficie-funda" />
            ) : (
              <GraficoMensal dados={porMes(aprovadas)} />
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function Pendencia({ icone: Icone, quantidade, carregando, texto, vazio, link, acao }) {
  const tem = quantidade > 0
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-3 rounded-controle border p-4',
        tem ? 'border-sinal/50 bg-sinal/10' : 'border-borda',
      )}
    >
      <Icone className={cn('size-5 shrink-0', tem ? 'text-sinal-texto' : 'text-texto-suave')} aria-hidden="true" />
      <p className="min-w-[12rem] flex-1 text-sm">
        {carregando ? (
          'Carregando…'
        ) : tem ? (
          <>
            <strong className="text-lead">{quantidade}</strong> {texto(quantidade)}
          </>
        ) : (
          <span className="text-texto-suave">{vazio}</span>
        )}
      </p>
      {tem && (
        <Button asChild tamanho="sm" variante="secundaria">
          <Link to={link}>
            {acao} <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      )}
    </div>
  )
}

// Agrupa as compras aprovadas nos últimos MESES meses (inclui meses sem venda, com zero)
function porMes(compras) {
  const hoje = new Date()
  const meses = Array.from({ length: MESES }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (MESES - 1 - i), 1)
    return { chave: `${d.getFullYear()}-${d.getMonth()}`, data: d, vendas: 0, valor: 0 }
  })
  const indice = Object.fromEntries(meses.map((m, i) => [m.chave, i]))
  for (const c of compras) {
    const d = new Date(c.dataCompra)
    const i = indice[`${d.getFullYear()}-${d.getMonth()}`]
    if (i !== undefined) {
      meses[i].vendas++
      meses[i].valor += Number(c.valorTotal)
    }
  }
  return meses
}

// Ticks "redondos" para o eixo: 0, 1, 2… ou 0, 2, 4…
function ticks(maximo) {
  if (maximo <= 4) return Array.from({ length: Math.max(maximo, 1) + 1 }, (_, i) => i)
  const passo = Math.ceil(maximo / 4)
  return Array.from({ length: 5 }, (_, i) => i * passo)
}

/**
 * Colunas mensais em HTML puro: uma série, cor única (--grafico), colunas de no máximo 24px
 * com o topo arredondado, grade fina, rótulo só no mês de maior venda, tooltip ao passar
 * o mouse ou focar pelo teclado e uma tabela equivalente para leitores de tela.
 */
function GraficoMensal({ dados }) {
  const [ativo, setAtivo] = useState(null)
  const escala = ticks(Math.max(...dados.map((d) => d.vendas)))
  const topo = escala.at(-1) || 1
  const maior = dados.reduce((m, d, i) => (d.vendas > (dados[m]?.vendas ?? -1) ? i : m), 0)
  const semVendas = dados.every((d) => d.vendas === 0)

  return (
    <figure>
      <div className="relative flex h-56 gap-3 pl-8" aria-hidden="true">
        {/* Grade e eixo Y */}
        <div className="pointer-events-none absolute inset-0 bottom-6 left-0">
          {escala.map((t) => (
            <div key={t} className="absolute right-0 left-8 border-t border-borda" style={{ bottom: `${(t / topo) * 100}%` }}>
              <span className="tipo-dado absolute -top-2.5 -left-8 w-6 text-right text-xs text-texto-suave">{t}</span>
            </div>
          ))}
        </div>

        {dados.map((d, i) => (
          <div
            key={d.chave}
            className="relative flex flex-1 flex-col items-center justify-end pb-6"
            onMouseEnter={() => setAtivo(i)}
            onMouseLeave={() => setAtivo(null)}
          >
            {/* Área de hover maior que a coluna */}
            <div className={cn('absolute inset-x-0 top-0 bottom-6 rounded-controle transition-colors', ativo === i && 'bg-superficie-funda/60')} />
            <div
              className="relative w-full max-w-6 rounded-t-[4px] bg-grafico transition-[height] duration-500 ease-patio"
              style={{ height: `${(d.vendas / topo) * 100}%` }}
            >
              {i === maior && d.vendas > 0 && ativo === null && (
                <span className="tipo-dado absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-sm font-semibold">{d.vendas}</span>
              )}
            </div>
            <span className={cn('absolute bottom-0 text-xs', ativo === i ? 'text-texto' : 'text-texto-suave')}>
              {inicial(mesFmt.format(d.data).replace('.', ''))}
            </span>
            {ativo === i && (
              <div className="absolute bottom-full z-10 mb-2 w-max rounded-controle border bg-superficie px-3 py-2 text-sm shadow-[0_8px_24px_-12px_rgb(30_36_40/0.4)]">
                <p className="font-semibold">{inicial(mesLongoFmt.format(d.data))}</p>
                <p className="tipo-dado text-texto-suave">
                  {d.vendas} {d.vendas === 1 ? 'venda' : 'vendas'}, {moeda(d.valor)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      {semVendas && <p className="mt-2 text-center text-sm text-texto-suave">Nenhuma venda aprovada nos últimos {MESES} meses.</p>}

      {/* Mesmos dados em tabela, para quem usa leitor de tela */}
      <table className="sr-only">
        <caption>Carros vendidos por mês</caption>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Vendas</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.chave}>
              <td>{mesLongoFmt.format(d.data)}</td>
              <td>{d.vendas}</td>
              <td>{moeda(d.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
