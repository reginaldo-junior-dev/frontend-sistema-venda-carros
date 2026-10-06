import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { EstadoErro } from '@/components/shared/Estados'
import { Paginacao } from '@/components/shared/Paginacao'
import { numero } from '@/lib/format'
import { useAdiado } from '@/lib/useAdiado'
import { useTitulo } from '@/lib/useTitulo'
import { CarroCard, CarroCardSkeleton } from './CarroCard'
import { FiltrosAtivos } from './filtros/FiltrosAtivos'
import { PainelFiltros } from './filtros/PainelFiltros'
import { aplicar, contarFiltros, lerFiltros, ORDENACOES, paraApi } from './filtros'
import { useCarros, useLookups } from './hooks'

export default function CatalogoPage() {
  useTitulo('Carros à venda')
  const [params, setParams] = useSearchParams()
  const estado = useMemo(() => lerFiltros(params), [params])
  const consulta = useCarros(paraApi(estado))
  const lookups = useLookups()
  const [gavetaAberta, setGavetaAberta] = useState(false)
  const topoResultados = useRef(null)

  // Cada mudança vira um passo no histórico: o "voltar" desfaz o último filtro
  const mudar = (mudancas) => setParams(aplicar(params, mudancas))
  const limpar = () => setParams(new URLSearchParams(estado.incluirIndisponiveis ? { todos: '1' } : {}))

  const pagina = consulta.data
  const total = pagina?.total ?? 0
  const qtdFiltros = contarFiltros(estado.filtros)

  function irParaPagina(nova) {
    mudar({ pagina: nova + 1 })
    topoResultados.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-6 pt-10 pb-8 md:flex-row md:items-end md:justify-between md:pt-14">
        <div>
          <h1 className="tipo-emblema text-h1 sm:text-display">Carros à venda</h1>
          <p className="mt-2 text-lead text-texto-suave" aria-live="polite">
            {consulta.isPending
              ? 'Procurando no pátio…'
              : total === 1
                ? '1 carro encontrado'
                : `${numero(total)} carros encontrados`}
          </p>
        </div>
        <BuscaNome valor={estado.filtros.nome ?? ''} aoMudar={(nome) => mudar({ nome })} />
      </header>

      <div className="grid gap-10 lg:grid-cols-[17.5rem_1fr]">
        <aside aria-label="Filtros" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-3 pb-6 [scrollbar-width:thin]">
            <PainelFiltros
              filtros={estado.filtros}
              lookups={lookups}
              incluirIndisponiveis={estado.incluirIndisponiveis}
              aoMudar={mudar}
            />
          </div>
        </aside>

        <section aria-labelledby="titulo-resultados" className="min-w-0">
          {/* Mantém a ordem dos títulos (h1 → h2 → h3 dos cards) para quem navega por títulos */}
          <h2 id="titulo-resultados" className="sr-only">
            Resultados
          </h2>
          <div ref={topoResultados} className="scroll-mt-24" />
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Sheet open={gavetaAberta} onOpenChange={setGavetaAberta}>
              <SheetTrigger asChild>
                <Button variante="secundaria" tamanho="sm" className="lg:hidden">
                  <SlidersHorizontal />
                  Filtros
                  {qtdFiltros > 0 && (
                    <span className="tipo-dado ml-0.5 rounded-full bg-marca px-1.5 text-xs leading-5 text-marca-texto">
                      {qtdFiltros}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(24rem,92vw)] gap-0 p-0">
                <SheetHeader className="border-b px-5 py-4">
                  <SheetTitle className="text-lead">Filtros</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <PainelFiltros
                    filtros={estado.filtros}
                    lookups={lookups}
                    incluirIndisponiveis={estado.incluirIndisponiveis}
                    aoMudar={mudar}
                  />
                </div>
                <SheetFooter className="flex-row border-t px-5 py-4">
                  {qtdFiltros > 0 && (
                    <Button variante="fantasma" onClick={limpar}>
                      Limpar
                    </Button>
                  )}
                  <Button className="flex-1" onClick={() => setGavetaAberta(false)}>
                    {consulta.isFetching ? 'Atualizando…' : `Ver ${numero(total)} ${total === 1 ? 'carro' : 'carros'}`}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
              <FiltrosAtivos
                filtros={estado.filtros}
                porId={lookups.porId}
                aoRemover={(campo) => mudar({ [campo]: '' })}
                aoLimpar={limpar}
              />
            </div>

            <Select value={estado.ordem} onValueChange={(ordem) => mudar({ ordem: ordem === 'relevancia' ? '' : ordem })}>
              <SelectTrigger className="ml-auto w-auto min-w-44" aria-label="Ordenar por">
                <span className="text-texto-suave">Ordenar:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {ORDENACOES.map((o) => (
                  <SelectItem key={o.valor} value={o.valor}>
                    {o.rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {consulta.isError ? (
            <EstadoErro erro={consulta.error} aoTentarDeNovo={consulta.refetch} />
          ) : consulta.isPending ? (
            <Grade>
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <CarroCardSkeleton />
                </li>
              ))}
            </Grade>
          ) : pagina.itens.length === 0 ? (
            <SemResultados temFiltros={qtdFiltros > 0 || Boolean(estado.filtros.nome)} aoLimpar={limpar} />
          ) : (
            <>
              <Grade atualizando={consulta.isPlaceholderData}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {pagina.itens.map((carro, i) => (
                    <motion.li
                      key={carro.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <CarroCard carro={carro} porId={lookups.porId} prioridade={i < 3} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </Grade>
              <div className="mt-14 flex justify-center">
                <Paginacao pagina={pagina.pagina} totalPaginas={pagina.totalPaginas} aoMudar={irParaPagina} />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

function Grade({ children, atualizando = false }) {
  return (
    <ul
      aria-busy={atualizando}
      className={`grid gap-x-6 gap-y-12 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3 ${atualizando ? 'opacity-60' : ''}`}
    >
      {children}
    </ul>
  )
}

function BuscaNome({ valor, aoMudar }) {
  const [texto, setTexto] = useState(valor)
  const [valorAnterior, setValorAnterior] = useState(valor)
  const enviar = useAdiado(aoMudar, 450)

  // Acompanha mudanças vindas de fora (limpar filtros, voltar no navegador)
  if (valor !== valorAnterior) {
    setValorAnterior(valor)
    if (texto.trim() !== valor) setTexto(valor)
  }

  return (
    <div className="relative w-full md:w-80">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-texto-suave" aria-hidden="true" />
      <Input
        type="search"
        aria-label="Buscar pelo nome do carro"
        placeholder="Buscar, ex.: Corolla XEi"
        className="h-12 pr-10 pl-10"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          enviar(e.target.value.trim())
        }}
      />
      {texto && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => {
            setTexto('')
            aoMudar('')
          }}
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-texto-suave hover:bg-superficie-funda hover:text-texto"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

function SemResultados({ temFiltros, aoLimpar }) {
  return (
    <div className="grid overflow-hidden rounded-foto border bg-superficie md:grid-cols-[1fr_1.1fr]">
      <img src="/imagens/portao.webp" alt="" loading="lazy" className="h-56 w-full object-cover md:h-full" />
      <div className="flex flex-col items-start justify-center gap-4 p-8 lg:p-10">
        <p className="tipo-emblema text-h3">Nenhum carro com esses filtros.</p>
        <p className="max-w-[44ch] text-texto-suave">
          {temFiltros
            ? 'Tente tirar um ou dois filtros, ou ampliar a faixa de preço e de ano.'
            : 'O estoque está vazio no momento. Volte em breve para ver as novidades.'}
        </p>
        {temFiltros && <Button onClick={aoLimpar}>Limpar filtros</Button>}
      </div>
    </div>
  )
}
