import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { CAMBIO, COMBUSTIVEL, CONDICAO } from '@/lib/enums'
import { moeda, numero } from '@/lib/format'

// Texto curto de cada filtro aplicado, para as etiquetas acima da grade
function descrever(campo, valor, porId) {
  switch (campo) {
    case 'marcaId':
      return porId.marca[valor]?.nome
    case 'modeloId':
      return porId.modelo[valor]?.nome
    case 'categoriaId':
      return porId.categoria[valor]?.nome
    case 'corId':
      return porId.cor[valor]?.nome
    case 'condicao':
      return valor === 'NOVO' ? 'Zero km' : CONDICAO[valor]
    case 'combustivel':
      return COMBUSTIVEL[valor]
    case 'cambio':
      return CAMBIO[valor]
    case 'precoMin':
      return `A partir de ${moeda(valor)}`
    case 'precoMax':
      return `Até ${moeda(valor)}`
    case 'anoMin':
      return `De ${valor}`
    case 'anoMax':
      return `Até ${valor}`
    case 'quilometragemMax':
      return `Até ${numero(Number(valor))} km`
    case 'nome':
      return `"${valor}"`
    default:
      return valor
  }
}

export function FiltrosAtivos({ filtros, porId, aoRemover, aoLimpar }) {
  const ativos = Object.entries(filtros)
    .map(([campo, valor]) => ({ campo, rotulo: descrever(campo, valor, porId) }))
    .filter((f) => f.rotulo)

  if (ativos.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false} mode="popLayout">
        {ativos.map((f) => (
          <motion.button
            key={f.campo}
            layout
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            onClick={() => aoRemover(f.campo)}
            aria-label={`Remover filtro ${f.rotulo}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-marca-suave pr-2 pl-3 text-sm font-medium text-marca hover:bg-marca-suave/70"
          >
            {f.rotulo}
            <X className="size-3.5" aria-hidden="true" />
          </motion.button>
        ))}
      </AnimatePresence>
      <button
        type="button"
        onClick={aoLimpar}
        className="ml-1 text-sm font-semibold text-texto-suave underline-offset-4 hover:text-texto hover:underline"
      >
        Limpar filtros
      </button>
    </div>
  )
}
