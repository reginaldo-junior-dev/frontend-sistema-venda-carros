import { useId } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { transicao } from '@/lib/motion'

/**
 * Escolha única entre poucas opções (radiogroup). O fundo da opção ativa desliza
 * até a nova escolha.
 */
export function Segmentado({ rotulo, opcoes, valor, aoMudar, className }) {
  const grupo = useId()

  function aoTeclar(e, indice) {
    const passo = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!passo) return
    e.preventDefault()
    const proxima = opcoes[(indice + passo + opcoes.length) % opcoes.length]
    aoMudar(proxima.valor)
    e.currentTarget.parentElement.querySelectorAll('[role=radio]')[(indice + passo + opcoes.length) % opcoes.length]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className={cn('flex rounded-controle border bg-superficie-funda p-1', className)}
    >
      {opcoes.map((opcao, i) => {
        const ativo = opcao.valor === valor
        return (
          <button
            key={opcao.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            tabIndex={ativo ? 0 : -1}
            onClick={() => aoMudar(opcao.valor)}
            onKeyDown={(e) => aoTeclar(e, i)}
            className={cn(
              'relative flex-1 rounded-[6px] px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
              ativo ? 'text-texto' : 'text-texto-suave hover:text-texto',
            )}
          >
            {ativo && (
              <motion.span
                layoutId={`segmentado-${grupo}`}
                transition={transicao.layout}
                className="absolute inset-0 rounded-[6px] bg-superficie shadow-[0_1px_2px_rgb(30_36_40/0.15)]"
              />
            )}
            <span className="relative">{opcao.rotulo}</span>
          </button>
        )
      })}
    </div>
  )
}
