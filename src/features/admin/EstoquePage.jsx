import { useState } from 'react'
import { Link } from 'react-router'
import { ExternalLink, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Segmentado } from '@/components/ui/segmentado'
import { EstadoErro } from '@/components/shared/Estados'
import { Paginacao } from '@/components/shared/Paginacao'
import { FotoCarro } from '@/features/catalogo/FotoCarro'
import { descreverCarro, fotoPrincipal } from '@/features/catalogo/descrever'
import { useCarros, useLookups } from '@/features/catalogo/hooks'
import { STATUS_CARRO, TOM_STATUS_CARRO } from '@/lib/enums'
import { km, moeda, numero } from '@/lib/format'
import { useAdiado } from '@/lib/useAdiado'
import { useExcluirCarro } from './hooks'
import { CabecalhoAdmin, LinhaVazia, LinhasCarregando, Tabela } from './ui'
import { useConfirmacao } from './useConfirmacao'

const STATUS = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'DISPONIVEL', rotulo: 'Disponíveis' },
  { valor: 'RESERVADO', rotulo: 'Reservados' },
  { valor: 'VENDIDO', rotulo: 'Vendidos' },
]

export default function EstoquePage() {
  const [status, setStatus] = useState('')
  const [busca, setBusca] = useState('')
  const [nome, setNome] = useState('')
  const [pagina, setPagina] = useState(0)
  const adiarBusca = useAdiado((v) => {
    setNome(v)
    setPagina(0)
  })
  const consulta = useCarros({ nome, status, page: pagina, size: 15, sort: 'nome,asc' })
  const lookups = useLookups()
  const excluir = useExcluirCarro()
  const { confirmar, dialogo } = useConfirmacao()
  const dados = consulta.data

  function pedirExclusao(carro) {
    confirmar({
      titulo: `Excluir ${carro.nome}?`,
      descricao:
        'Remove o carro, as fotos, os favoritos e os interesses ligados a ele. Carros com compras registradas não podem ser excluídos.',
      textoBotao: 'Excluir carro',
      perigo: true,
      aoConfirmar: async () => {
        await excluir.mutateAsync(carro.id)
        toast.success('Carro excluído.')
      },
    })
  }

  return (
    <div>
      <CabecalhoAdmin
        titulo="Estoque"
        descricao={dados ? `${numero(dados.total)} ${dados.total === 1 ? 'carro' : 'carros'}` : 'Carros cadastrados na revenda'}
      >
        <Button asChild>
          <Link to="/admin/carros/novo">
            <Plus /> Novo carro
          </Link>
        </Button>
      </CabecalhoAdmin>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-suave" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Buscar carro pelo nome"
            placeholder="Buscar pelo nome"
            className="pl-9"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              adiarBusca(e.target.value.trim())
            }}
          />
        </div>
        <Segmentado
          rotulo="Status"
          opcoes={STATUS}
          valor={status}
          aoMudar={(v) => {
            setStatus(v)
            setPagina(0)
          }}
        />
      </div>

      {consulta.isError ? (
        <EstadoErro erro={consulta.error} aoTentarDeNovo={consulta.refetch} />
      ) : (
        <Tabela className={consulta.isPlaceholderData ? 'opacity-60' : undefined}>
          <thead>
            <tr>
              <th>Carro</th>
              <th>Ano</th>
              <th>Km</th>
              <th className="text-right">Preço</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {consulta.isPending ? (
              <LinhasCarregando colunas={6} />
            ) : dados.itens.length === 0 ? (
              <LinhaVazia colunas={6}>
                {nome || status ? 'Nenhum carro com esses filtros.' : 'Nenhum carro cadastrado. Comece pelo botão "Novo carro".'}
              </LinhaVazia>
            ) : (
              dados.itens.map((carro) => {
                const d = descreverCarro(carro, lookups.porId)
                return (
                  <tr key={carro.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <FotoCarro imagem={fotoPrincipal(carro)} alt="" className="h-12 w-16 shrink-0 rounded-plaqueta [&_span]:hidden [&_svg]:size-5" />
                        <div className="min-w-0">
                          <Link to={`/admin/carros/${carro.id}`} className="block truncate font-semibold hover:underline">
                            {carro.nome}
                          </Link>
                          <span className="text-texto-suave">
                            {[d.marca, d.modelo].filter(Boolean).join(' ')}
                            {carro.imagens.length === 0 && <span className="ml-2 text-texto">sem fotos</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="tipo-dado">{d.anos}</td>
                    <td className="tipo-dado">{km(carro.quilometragem)}</td>
                    <td className="tipo-dado text-right font-semibold">{moeda(carro.preco)}</td>
                    <td>
                      <Badge tom={TOM_STATUS_CARRO[carro.status]}>{STATUS_CARRO[carro.status]}</Badge>
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button asChild variante="fantasma" tamanho="icone" className="size-9" aria-label={`Editar ${carro.nome}`}>
                          <Link to={`/admin/carros/${carro.id}`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <Button asChild variante="fantasma" tamanho="icone" className="size-9" aria-label={`Ver ${carro.nome} no site`}>
                          <Link to={`/carros/${carro.id}`} target="_blank">
                            <ExternalLink />
                          </Link>
                        </Button>
                        <Button
                          variante="fantasma"
                          tamanho="icone"
                          className="size-9 text-vendido"
                          aria-label={`Excluir ${carro.nome}`}
                          onClick={() => pedirExclusao(carro)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Tabela>
      )}

      {dados && (
        <div className="mt-6 flex justify-center">
          <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} aoMudar={setPagina} />
        </div>
      )}
      {dialogo}
    </div>
  )
}
