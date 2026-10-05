import { Link, useParams } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EstadoErro } from '@/components/shared/Estados'
import { CarroCard } from './CarroCard'
import { descreverCarro, nomeTransicaoFoto } from './descrever'
import { FichaTecnica } from './detalhe/FichaTecnica'
import { Galeria } from './detalhe/Galeria'
import { PainelCompra } from './detalhe/PainelCompra'
import { useCarro, useCarros, useLookups } from './hooks'

export default function CarroDetalhePage() {
  const { id } = useParams()
  const consulta = useCarro(id)
  const lookups = useLookups()

  if (consulta.isPending) return <Esqueleto />
  if (consulta.isError) {
    return consulta.error.status === 404 ? (
      <CarroNaoEncontrado />
    ) : (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EstadoErro erro={consulta.error} aoTentarDeNovo={consulta.refetch} />
      </div>
    )
  }

  const carro = consulta.data
  const d = descreverCarro(carro, lookups.porId)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav aria-label="Você está em" className="py-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-texto-suave">
          <li>
            <Link to="/carros" className="hover:text-texto hover:underline">
              Carros
            </Link>
          </li>
          {d.marca && lookups.porId.modelo[carro.modeloId] && (
            <>
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <li>
                <Link
                  to={`/carros?marcaId=${lookups.porId.modelo[carro.modeloId]?.marcaId}`}
                  className="hover:text-texto hover:underline"
                >
                  {d.marca}
                </Link>
              </li>
            </>
          )}
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="font-medium text-texto">
            {carro.nome}
          </li>
        </ol>
      </nav>

      {/* No desktop o painel de compra acompanha a leitura da ficha técnica */}
      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
        <Galeria imagens={carro.imagens} nome={`${d.marca} ${carro.nome}`.trim()} nomeTransicao={nomeTransicaoFoto(carro.id)} />
        <div className="lg:row-span-2">
          <div className="lg:sticky lg:top-24">
            <PainelCompra carro={carro} d={d} />
          </div>
        </div>
        <div className="flex flex-col gap-16 pt-8">
          <FichaTecnica carro={carro} d={d} />
          {carro.descricao && (
            <section aria-labelledby="titulo-descricao">
              <h2 id="titulo-descricao" className="tipo-emblema mb-4 text-h3">
                Sobre este carro
              </h2>
              <p className="max-w-[68ch] text-lead leading-relaxed whitespace-pre-line text-texto/90">{carro.descricao}</p>
            </section>
          )}
        </div>
      </div>

      <Parecidos carro={carro} porId={lookups.porId} />
    </div>
  )
}

// Mesma categoria e disponíveis; o próprio carro fica de fora
function Parecidos({ carro, porId }) {
  const consulta = useCarros({ categoriaId: carro.categoriaId, status: 'DISPONIVEL', size: 5 })
  const outros = (consulta.data?.itens ?? []).filter((c) => c.id !== carro.id).slice(0, 4)
  if (outros.length === 0) return null

  const categoria = porId.categoria[carro.categoriaId]?.nome
  return (
    <section aria-labelledby="titulo-parecidos" className="mt-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="titulo-parecidos" className="tipo-emblema text-h3 sm:text-h2">
            Parecidos com este
          </h2>
          {categoria && <p className="mt-1 text-texto-suave">Outros carros da categoria {categoria} disponíveis agora.</p>}
        </div>
        <Button asChild variante="secundaria">
          <Link to={`/carros?categoriaId=${carro.categoriaId}`}>Ver todos</Link>
        </Button>
      </div>
      <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {outros.map((c) => (
          <li key={c.id}>
            <CarroCard carro={c} porId={porId} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function Esqueleto() {
  return (
    <div aria-busy="true" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 h-4 w-48 animate-pulse rounded-plaqueta bg-superficie-funda" />
      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
        <div className="aspect-[16/10] animate-pulse rounded-foto bg-superficie-funda" />
        <div className="h-96 animate-pulse rounded-foto bg-superficie-funda" />
      </div>
    </div>
  )
}

function CarroNaoEncontrado() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="tipo-emblema text-h1">Este carro não está mais no pátio.</h1>
      <p className="max-w-[50ch] text-lead text-texto-suave">
        Ele pode ter sido vendido ou retirado do anúncio. Veja os carros disponíveis agora.
      </p>
      <Button asChild>
        <Link to="/carros">Ver carros disponíveis</Link>
      </Button>
    </div>
  )
}
