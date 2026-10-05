import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EstadoErro } from '@/components/shared/Estados'
import { useLookups } from '@/features/catalogo/hooks'
import { tomDaCor } from '@/lib/cores'
import { useExcluirItemCadastro, useSalvarItemCadastro } from './hooks'
import { CabecalhoAdmin } from './ui'
import { useConfirmacao } from './useConfirmacao'

const ABAS = [
  { recurso: 'marca', titulo: 'Marcas', singular: 'marca', exemplo: 'Toyota' },
  { recurso: 'modelo', titulo: 'Modelos', singular: 'modelo', exemplo: 'Corolla' },
  { recurso: 'categoria', titulo: 'Categorias', singular: 'categoria', exemplo: 'SUV' },
  { recurso: 'cor', titulo: 'Cores', singular: 'cor', exemplo: 'Prata' },
]

export default function CadastrosPage() {
  const lookups = useLookups()
  const listas = { marca: lookups.marcas, modelo: lookups.modelos, categoria: lookups.categorias, cor: lookups.cores }

  return (
    <div>
      <CabecalhoAdmin titulo="Cadastros" descricao="Marcas, modelos, categorias e cores usados no estoque e nos filtros do site." />
      {lookups.erro ? (
        <EstadoErro erro={lookups.erro} aoTentarDeNovo={() => window.location.reload()} />
      ) : (
        <Tabs defaultValue="marca">
          <TabsList className="mb-6">
            {ABAS.map((a) => (
              <TabsTrigger key={a.recurso} value={a.recurso}>
                {a.titulo}
                <span className="tipo-dado ml-1.5 text-texto-suave">{listas[a.recurso].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {ABAS.map((a) => (
            <TabsContent key={a.recurso} value={a.recurso}>
              <ListaCadastro aba={a} itens={listas[a.recurso]} lookups={lookups} carregando={lookups.carregando} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}

function ListaCadastro({ aba, itens, lookups, carregando }) {
  const ehModelo = aba.recurso === 'modelo'
  const salvar = useSalvarItemCadastro(aba.recurso)
  const excluir = useExcluirItemCadastro(aba.recurso)
  const { confirmar, dialogo } = useConfirmacao()
  const [novo, setNovo] = useState('')
  const [marcaNovo, setMarcaNovo] = useState('')
  const [filtroMarca, setFiltroMarca] = useState('todas')
  const [editando, setEditando] = useState(null) // { id, nome, marcaId }
  const [erro, setErro] = useState(null)

  const visiveis = [...itens]
    .filter((i) => !ehModelo || filtroMarca === 'todas' || i.marcaId === filtroMarca)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  async function adicionar(e) {
    e.preventDefault()
    setErro(null)
    const nome = novo.trim()
    if (!nome) return setErro(`Digite o nome da ${aba.singular}.`)
    if (ehModelo && !marcaNovo) return setErro('Escolha a marca do modelo.')
    if (itens.some((i) => i.nome.toLowerCase() === nome.toLowerCase() && (!ehModelo || i.marcaId === marcaNovo))) {
      return setErro(`"${nome}" já está cadastrado.`)
    }
    try {
      await salvar.mutateAsync(ehModelo ? { nome, marcaId: marcaNovo } : { nome })
      setNovo('')
      toast.success(`${nome} adicionado.`)
    } catch (falha) {
      setErro(falha.message)
    }
  }

  async function salvarEdicao() {
    const nome = editando.nome.trim()
    if (!nome) return
    try {
      await salvar.mutateAsync(ehModelo ? { id: editando.id, nome, marcaId: editando.marcaId } : { id: editando.id, nome })
      setEditando(null)
      toast.success('Nome atualizado.')
    } catch (falha) {
      toast.error(falha.message)
    }
  }

  function pedirExclusao(item) {
    confirmar({
      titulo: `Excluir ${item.nome}?`,
      descricao: `Só é possível excluir se nenhum carro${ehModelo ? '' : aba.recurso === 'marca' ? ' ou modelo' : ''} estiver usando.`,
      textoBotao: 'Excluir',
      perigo: true,
      aoConfirmar: async () => {
        try {
          await excluir.mutateAsync(item.id)
          toast.success(`${item.nome} excluído.`)
        } catch (falha) {
          // Em uso por carros (ou modelos): a API responde conflito
          throw new Error(
            falha.status === 409
              ? `${item.nome} está em uso e não pode ser excluído. Troque ${aba.recurso === 'marca' ? 'os modelos e carros' : 'os carros'} que usam antes.`
              : falha.message,
          )
        }
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={adicionar} className="flex flex-wrap items-start gap-2 rounded-foto border bg-superficie p-4">
        {ehModelo && (
          <Select value={marcaNovo} onValueChange={setMarcaNovo}>
            <SelectTrigger className="w-full sm:w-48" aria-label="Marca do novo modelo">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              {lookups.marcas.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Input
          aria-label={`Nome da nova ${aba.singular}`}
          placeholder={`Nova ${aba.singular}, ex.: ${aba.exemplo}`}
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          className="w-full flex-1 sm:w-auto"
        />
        <Button type="submit" disabled={salvar.isPending}>
          <Plus /> Adicionar
        </Button>
        {erro && (
          <p role="alert" className="w-full text-sm text-vendido">
            {erro}
          </p>
        )}
      </form>

      {ehModelo && (
        <Select value={filtroMarca} onValueChange={setFiltroMarca}>
          <SelectTrigger className="w-56" aria-label="Filtrar modelos por marca">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as marcas</SelectItem>
            {lookups.marcas.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {carregando ? (
        <div className="h-40 animate-pulse rounded-foto bg-superficie-funda" />
      ) : visiveis.length === 0 ? (
        <p className="rounded-foto border border-dashed p-6 text-center text-texto-suave">Nada cadastrado ainda.</p>
      ) : (
        <ul className="divide-y rounded-foto border bg-superficie">
          {visiveis.map((item) => {
            const emEdicao = editando?.id === item.id
            const tom = aba.recurso === 'cor' ? tomDaCor(item.nome) : null
            return (
              <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                {aba.recurso === 'cor' && (
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 rounded-full border border-black/15"
                    style={{ background: tom ?? 'conic-gradient(#b3261e, #e8c21a, #2f6b3a, #1f4fa3, #b3261e)' }}
                  />
                )}
                {emEdicao ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      salvarEdicao()
                    }}
                  >
                    <Input
                      autoFocus
                      aria-label="Novo nome"
                      value={editando.nome}
                      onChange={(e) => setEditando({ ...editando, nome: e.target.value })}
                      onKeyDown={(e) => e.key === 'Escape' && setEditando(null)}
                      className="h-9"
                    />
                    <Button type="submit" tamanho="icone" className="size-9" aria-label="Salvar nome">
                      <Check />
                    </Button>
                    <Button type="button" variante="fantasma" tamanho="icone" className="size-9" aria-label="Cancelar" onClick={() => setEditando(null)}>
                      <X />
                    </Button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 font-medium">
                      {item.nome}
                      {ehModelo && <span className="ml-2 text-sm text-texto-suave">{lookups.porId.marca[item.marcaId]?.nome}</span>}
                    </span>
                    <Button
                      variante="fantasma"
                      tamanho="icone"
                      className="size-9"
                      aria-label={`Renomear ${item.nome}`}
                      onClick={() => setEditando({ id: item.id, nome: item.nome, marcaId: item.marcaId })}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variante="fantasma"
                      tamanho="icone"
                      className="size-9 text-vendido"
                      aria-label={`Excluir ${item.nome}`}
                      onClick={() => pedirExclusao(item)}
                    >
                      <Trash2 />
                    </Button>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {dialogo}
    </div>
  )
}
