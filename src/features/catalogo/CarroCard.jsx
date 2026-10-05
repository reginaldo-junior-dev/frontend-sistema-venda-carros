import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Plaqueta } from '@/components/shared/Plaqueta'
import { Preco } from '@/components/shared/Preco'
import { BotaoFavorito } from '@/features/favoritos/BotaoFavorito'
import { CAMBIO, STATUS_CARRO, TOM_STATUS_CARRO } from '@/lib/enums'
import { km } from '@/lib/format'
import { FotoCarro } from './FotoCarro'
import { descreverCarro, nomeTransicaoFoto } from './descrever'

export function CarroCard({ carro, porId, prioridade = false }) {
  const d = descreverCarro(carro, porId)
  const indisponivel = carro.status !== 'DISPONIVEL'
  const nomeCompleto = `${d.marca} ${carro.nome}`.trim()

  return (
    <article className="group relative flex flex-col">
      {/* A plaqueta fica presa à borda de baixo da foto, como a placa no para-choque */}
      <div className="relative pb-5">
        <div className="overflow-hidden rounded-foto" style={{ viewTransitionName: nomeTransicaoFoto(carro.id) }}>
          <FotoCarro
            imagem={d.foto}
            alt={nomeCompleto}
            prioridade={prioridade}
            className={indisponivel ? 'aspect-[4/3] grayscale-[0.6]' : 'aspect-[4/3]'}
          />
        </div>
        {indisponivel && (
          <Badge tom={TOM_STATUS_CARRO[carro.status]} className="absolute top-3 left-3">
            {STATUS_CARRO[carro.status]}
          </Badge>
        )}
        {carro.status !== 'VENDIDO' && (
          <BotaoFavorito carroId={carro.id} nomeCarro={nomeCompleto} className="absolute top-3 right-3 z-10" />
        )}
        {d.modelo && (
          <Plaqueta tamanho="sm" className="absolute bottom-1 left-1/2 max-w-[80%] -translate-x-1/2">
            {d.modelo}
          </Plaqueta>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-2 px-1">
        <div>
          {d.marca && <p className="text-sm text-texto-suave">{d.marca}</p>}
          <h3 className="text-lead leading-snug font-semibold">
            <Link
              to={`/carros/${carro.id}`}
              viewTransition
              className="underline-offset-4 outline-none group-hover:underline after:absolute after:inset-0 after:rounded-foto focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-foco"
            >
              {carro.nome}
            </Link>
          </h3>
        </div>
        <Preco valor={carro.preco} tamanho="sm" />
        <ul className="tipo-dado flex text-base text-texto-suave [&>li+li]:ml-3 [&>li+li]:border-l [&>li+li]:pl-3">
          <li>{d.anos}</li>
          <li>{km(carro.quilometragem)}</li>
          {carro.cambio && <li>{CAMBIO[carro.cambio]}</li>}
        </ul>
      </div>
    </article>
  )
}

export function CarroCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col">
      <div className="aspect-[4/3] animate-pulse rounded-foto bg-superficie-funda" />
      <div className="mt-7 flex flex-col gap-2 px-1">
        <div className="h-4 w-16 animate-pulse rounded-plaqueta bg-superficie-funda" />
        <div className="h-6 w-3/4 animate-pulse rounded-plaqueta bg-superficie-funda" />
        <div className="h-6 w-28 animate-pulse rounded-plaqueta bg-superficie-funda" />
      </div>
    </div>
  )
}
