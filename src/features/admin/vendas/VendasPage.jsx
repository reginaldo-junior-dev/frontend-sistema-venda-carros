import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Segmentado } from '@/components/ui/segmentado'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EstadoErro } from '@/components/shared/Estados'
import { Paginacao } from '@/components/shared/Paginacao'
import { useCarrosPorId } from '@/features/catalogo/hooks'
import { METODO_PAGAMENTO, STATUS_COMPRA, STATUS_PAGAMENTO } from '@/lib/enums'
import { dataHora, moeda } from '@/lib/format'
import { useAcaoPagamento, useCancelarCompra, useClientesPorId, useComprasAdmin, usePagamentosAdmin } from '../hooks'
import { CabecalhoAdmin, LinhaVazia, LinhasCarregando, Tabela } from '../ui'
import { useConfirmacao } from '../useConfirmacao'
import { ParcelasDialog } from './ParcelasDialog'

const TOM_COMPRA = { PENDENTE: 'atencao', APROVADA: 'livre', CANCELADA: 'neutro' }
const TOM_PAGAMENTO = { PENDENTE: 'atencao', APROVADO: 'livre', RECUSADO: 'vendido', CANCELADO: 'neutro' }

export default function VendasPage() {
  return (
    <div>
      <CabecalhoAdmin titulo="Vendas" descricao="Reservas, pagamentos e parcelas." />
      <Tabs defaultValue="pagamentos">
        <TabsList className="mb-6">
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="compras">Compras</TabsTrigger>
        </TabsList>
        <TabsContent value="pagamentos">
          <Pagamentos />
        </TabsContent>
        <TabsContent value="compras">
          <Compras />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// A compra traz carroId e clienteId: resolve os nomes para a tabela
function useNomes(compras) {
  const carros = useCarrosPorId([...new Set(compras.map((c) => c.carroId))])
  const clientes = useClientesPorId([...new Set(compras.map((c) => c.clienteId))])
  return {
    carro: (id) => carros[id]?.carro?.nome ?? '…',
    cliente: (id) => clientes[id],
  }
}

function Pagamentos() {
  // A API não filtra pagamentos por status: carrega os mais recentes e filtra aqui
  const [filtro, setFiltro] = useState('aguardando')
  const pagamentos = usePagamentosAdmin({ size: 100 })
  const compras = useComprasAdmin({ size: 100, sort: 'dataCompra,desc' })
  const acao = useAcaoPagamento()
  const { confirmar, dialogo } = useConfirmacao()
  const [parcelasDe, setParcelasDe] = useState(null)

  const listaCompras = compras.data?.itens ?? []
  const compraPorId = Object.fromEntries(listaCompras.map((c) => [c.id, c]))
  const nomes = useNomes(listaCompras)
  const todos = pagamentos.data?.itens ?? []
  const aguardando = todos.filter((p) => p.status === 'PENDENTE' && !p.idExterno)
  const lista = filtro === 'aguardando' ? aguardando : todos

  function pedir(p, tipo) {
    const compra = compraPorId[p.compraId]
    const carro = compra ? nomes.carro(compra.carroId) : 'o carro'
    const textos = {
      aprovar: {
        titulo: `Confirmar o recebimento de ${moeda(p.valor)}?`,
        descricao: `A compra é aprovada, ${carro} passa a vendido e o cliente recebe a confirmação por e-mail.`,
        textoBotao: 'Confirmar recebimento',
      },
      recusar: {
        titulo: 'Recusar este pagamento?',
        descricao: 'Use quando o valor não entrou. A reserva continua até expirar ou ser cancelada.',
        textoBotao: 'Recusar pagamento',
        perigo: true,
      },
      cancelar: {
        titulo: 'Cancelar este pagamento?',
        descricao: 'Pagamentos com cartão em andamento também são cancelados na Stripe.',
        textoBotao: 'Cancelar pagamento',
        perigo: true,
      },
    }[tipo]
    confirmar({
      ...textos,
      aoConfirmar: async () => {
        await acao.mutateAsync({ id: p.id, acao: tipo })
        toast.success({ aprovar: 'Pagamento confirmado. Carro vendido.', recusar: 'Pagamento recusado.', cancelar: 'Pagamento cancelado.' }[tipo])
      },
    })
  }

  if (pagamentos.isError) return <EstadoErro erro={pagamentos.error} aoTentarDeNovo={pagamentos.refetch} />

  return (
    <div className="flex flex-col gap-4">
      <Segmentado
        rotulo="Filtrar pagamentos"
        className="self-start"
        valor={filtro}
        aoMudar={setFiltro}
        opcoes={[
          { valor: 'aguardando', rotulo: `Aguardando confirmação (${aguardando.length})` },
          { valor: 'todos', rotulo: 'Todos' },
        ]}
      />
      <Tabela>
        <thead>
          <tr>
            <th>Carro e cliente</th>
            <th>Forma</th>
            <th className="text-right">Valor</th>
            <th>Status</th>
            <th>Data</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pagamentos.isPending ? (
            <LinhasCarregando colunas={6} />
          ) : lista.length === 0 ? (
            <LinhaVazia colunas={6}>
              {filtro === 'aguardando' ? 'Nenhum Pix ou boleto esperando confirmação.' : 'Nenhum pagamento registrado.'}
            </LinhaVazia>
          ) : (
            lista.map((p) => {
              const compra = compraPorId[p.compraId]
              const cliente = compra && nomes.cliente(compra.clienteId)
              const manualPendente = p.status === 'PENDENTE' && !p.idExterno
              return (
                <tr key={p.id}>
                  <td>
                    <span className="block font-semibold">{compra ? nomes.carro(compra.carroId) : '…'}</span>
                    <span className="block text-texto-suave">{cliente?.nome}</span>
                    <span className="text-texto-suave">{cliente?.email}</span>
                  </td>
                  <td>{METODO_PAGAMENTO[p.metodo]}</td>
                  <td className="tipo-dado text-right font-semibold">{moeda(p.valor)}</td>
                  <td>
                    <Badge tom={TOM_PAGAMENTO[p.status]}>{STATUS_PAGAMENTO[p.status]}</Badge>
                  </td>
                  <td className="text-texto-suave">{dataHora(p.dataPagamento) || (compra && dataHora(compra.dataCompra))}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      {manualPendente && (
                        <>
                          <Button tamanho="sm" onClick={() => pedir(p, 'aprovar')}>
                            Confirmar
                          </Button>
                          <Button tamanho="sm" variante="secundaria" onClick={() => pedir(p, 'recusar')}>
                            Recusar
                          </Button>
                        </>
                      )}
                      {p.status === 'PENDENTE' && p.idExterno && (
                        <Button tamanho="sm" variante="fantasma" className="text-vendido" onClick={() => pedir(p, 'cancelar')}>
                          Cancelar
                        </Button>
                      )}
                      {/* Cartão é cobrado inteiro pela Stripe e não é parcelado aqui */}
                      {p.status === 'APROVADO' && !p.idExterno && (
                        <Button tamanho="sm" variante="secundaria" onClick={() => setParcelasDe(p)}>
                          Parcelas
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </Tabela>
      <p className="text-sm text-texto-suave">
        Pagamentos com cartão são confirmados pela Stripe e não podem ser aprovados à mão.
      </p>
      <ParcelasDialog pagamento={parcelasDe} aoFechar={() => setParcelasDe(null)} />
      {dialogo}
    </div>
  )
}

function Compras() {
  const [pagina, setPagina] = useState(0)
  const compras = useComprasAdmin({ page: pagina, size: 20, sort: 'dataCompra,desc' })
  const cancelar = useCancelarCompra()
  const { confirmar, dialogo } = useConfirmacao()
  const nomes = useNomes(compras.data?.itens ?? [])

  if (compras.isError) return <EstadoErro erro={compras.error} aoTentarDeNovo={compras.refetch} />

  return (
    <div className="flex flex-col gap-4">
      <Tabela className={compras.isPlaceholderData ? 'opacity-60' : undefined}>
        <thead>
          <tr>
            <th>Carro</th>
            <th>Cliente</th>
            <th className="text-right">Valor</th>
            <th>Status</th>
            <th>Reservado em</th>
            <th className="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {compras.isPending ? (
            <LinhasCarregando colunas={6} />
          ) : compras.data.itens.length === 0 ? (
            <LinhaVazia colunas={6}>Nenhuma compra ainda.</LinhaVazia>
          ) : (
            compras.data.itens.map((c) => {
              const cliente = nomes.cliente(c.clienteId)
              return (
                <tr key={c.id}>
                  <td>
                    <Link to={`/admin/carros/${c.carroId}`} className="font-semibold hover:underline">
                      {nomes.carro(c.carroId)}
                    </Link>
                  </td>
                  <td>
                    <span className="block">{cliente?.nome ?? '…'}</span>
                    <span className="text-texto-suave">{cliente?.email}</span>
                  </td>
                  <td className="tipo-dado text-right font-semibold">{moeda(c.valorTotal)}</td>
                  <td>
                    <Badge tom={TOM_COMPRA[c.status]}>{STATUS_COMPRA[c.status]}</Badge>
                  </td>
                  <td className="text-texto-suave">{dataHora(c.dataCompra)}</td>
                  <td className="text-right">
                    {c.status === 'PENDENTE' && (
                      <Button
                        tamanho="sm"
                        variante="fantasma"
                        className="text-vendido"
                        onClick={() =>
                          confirmar({
                            titulo: 'Cancelar esta reserva?',
                            descricao: 'O carro volta para a vitrine. Pagamentos pendentes desta compra também são cancelados.',
                            textoBotao: 'Cancelar reserva',
                            perigo: true,
                            aoConfirmar: async () => {
                              await cancelar.mutateAsync(c.id)
                              toast.success('Reserva cancelada. O carro voltou para a vitrine.')
                            },
                          })
                        }
                      >
                        Cancelar
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </Tabela>
      {compras.data && (
        <div className="flex justify-center">
          <Paginacao pagina={compras.data.pagina} totalPaginas={compras.data.totalPaginas} aoMudar={setPagina} />
        </div>
      )}
      {dialogo}
    </div>
  )
}
