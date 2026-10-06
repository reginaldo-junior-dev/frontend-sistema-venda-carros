import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { EstadoErro } from '@/components/shared/Estados'
import { CarroCard, CarroCardSkeleton } from '@/features/catalogo/CarroCard'
import { useCarrosPorId, useLookups } from '@/features/catalogo/hooks'
import { useAlternarFavorito, useFavoritos } from '@/features/favoritos/hooks'
import { useTitulo } from '@/lib/useTitulo'

export default function FavoritosPage() {
  useTitulo('Favoritos')
  const favoritos = useFavoritos()
  const lookups = useLookups()
  // Mais recentes primeiro
  const lista = [...(favoritos.data ?? [])].sort((a, b) => String(b.dataFavorito ?? '').localeCompare(String(a.dataFavorito ?? '')))
  const carros = useCarrosPorId(lista.map((f) => f.carroId))

  return (
    <div className="py-10">
      <h1 className="tipo-emblema text-h2">Favoritos</h1>
      <p className="mt-2 mb-10 text-texto-suave">
        {lista.length > 0
          ? `${lista.length} ${lista.length === 1 ? 'carro salvo' : 'carros salvos'}. Toque no coração para tirar da lista.`
          : 'Os carros que você salvar aparecem aqui.'}
      </p>

      {favoritos.isError ? (
        <EstadoErro erro={favoritos.error} aoTentarDeNovo={favoritos.refetch} />
      ) : favoritos.isPending ? (
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <CarroCardSkeleton />
            </li>
          ))}
        </ul>
      ) : lista.length === 0 ? (
        <Vazio />
      ) : (
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {lista.map((f) => {
              const { carro, carregando, erro } = carros[f.carroId] ?? {}
              return (
                <motion.li
                  key={f.carroId}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  {carregando ? (
                    <CarroCardSkeleton />
                  ) : erro ? (
                    <CarroIndisponivel carroId={f.carroId} />
                  ) : (
                    <CarroCard carro={carro} porId={lookups.porId} />
                  )}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}

// O carro foi retirado do anúncio: dá para tirar o favorito órfão da lista
function CarroIndisponivel({ carroId }) {
  const alternar = useAlternarFavorito()
  return (
    <div className="flex aspect-[4/3] flex-col items-start justify-end gap-3 rounded-foto border border-dashed p-6">
      <p className="font-semibold">Este carro saiu do pátio.</p>
      <p className="text-sm text-texto-suave">Ele foi vendido ou o anúncio foi retirado.</p>
      <Button variante="secundaria" tamanho="sm" onClick={() => alternar.mutate({ carroId, favoritar: false })}>
        Tirar dos favoritos
      </Button>
    </div>
  )
}

function Vazio() {
  return (
    <div className="grid overflow-hidden rounded-foto border bg-superficie md:grid-cols-[1.1fr_1fr]">
      <img src="/imagens/suv.webp" alt="" loading="lazy" className="h-56 w-full object-cover md:h-full md:min-h-72" />
      <div className="flex flex-col items-start justify-center gap-4 p-8 lg:p-10">
        <p className="tipo-emblema text-h3">Nenhum favorito ainda.</p>
        <p className="max-w-[40ch] text-texto-suave">
          No catálogo, toque no coração de um carro para guardar e comparar depois.
        </p>
        <Button asChild>
          <Link to="/carros">Ver carros disponíveis</Link>
        </Button>
      </div>
    </div>
  )
}
