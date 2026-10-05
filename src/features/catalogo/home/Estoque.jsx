import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { CarroCard, CarroCardSkeleton } from '../CarroCard'

// Vitrine com os carros da API; sem carros (ou sem API), mostra um painel com foto em vez de um buraco
export function Estoque({ consulta, carros, porId }) {
  return (
    <section aria-labelledby="titulo-estoque" className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="titulo-estoque" className="tipo-emblema text-h2 sm:text-h1">
            Disponíveis agora
          </h2>
          <p className="mt-2 text-texto-suave">Os carros mais completos do pátio neste momento.</p>
        </div>
        {carros.length > 0 && (
          <Button asChild variante="secundaria">
            <Link to="/carros">Ver o estoque completo</Link>
          </Button>
        )}
      </div>

      {consulta.isPending ? (
        <Grade>
          {Array.from({ length: 4 }, (_, i) => (
            <CarroCardSkeleton key={i} />
          ))}
        </Grade>
      ) : consulta.isError ? (
        <PainelSemCarros
          titulo="Não conseguimos carregar o estoque agora."
          texto={consulta.error.message}
          acao={
            <Button variante="secundaria" onClick={() => consulta.refetch()}>
              Tentar de novo
            </Button>
          }
        />
      ) : carros.length === 0 ? (
        <PainelSemCarros
          titulo="O pátio está sendo preparado."
          texto="Os carros aparecem aqui assim que a revenda publicar o estoque. Crie sua conta para salvar favoritos quando eles chegarem."
          acao={
            <Button asChild>
              <Link to="/criar-conta">Criar conta</Link>
            </Button>
          }
        />
      ) : (
        <Grade>
          {carros.map((carro, i) => (
            <CarroCard key={carro.id} carro={carro} porId={porId} prioridade={i < 2} />
          ))}
        </Grade>
      )}
    </section>
  )
}

// No celular a vitrine rola de lado; a partir do tablet vira grade
function Grade({ children }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&>*]:w-[78vw] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-auto">
      {children}
    </div>
  )
}

function PainelSemCarros({ titulo, texto, acao }) {
  return (
    <div className="grid overflow-hidden rounded-foto border bg-superficie md:grid-cols-[1.1fr_1fr]">
      <img src="/imagens/portao.webp" alt="" loading="lazy" className="h-60 w-full object-cover md:h-full md:min-h-80" />
      <div className="flex flex-col items-start justify-center gap-4 p-8 lg:p-12">
        <p className="tipo-emblema text-h3">{titulo}</p>
        <p className="max-w-[46ch] text-texto-suave">{texto}</p>
        {acao}
      </div>
    </div>
  )
}
