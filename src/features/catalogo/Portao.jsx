import { motion, useReducedMotion } from 'motion/react'
import { portao } from '@/lib/motion'

/**
 * Portão de garagem de enrolar, em aço: cobre o conteúdo e sobe quando `aberto` vira true.
 * É a única animação do site que acontece sem ação do usuário.
 */
export function Portao({ aberto, className }) {
  const reduzir = useReducedMotion()
  if (reduzir) return null

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-30 flex flex-col justify-end ${className ?? ''}`}
      style={{
        backgroundColor: '#3a4247',
        backgroundImage: [
          // ripas: sombra embaixo, brilho em cima, como lâminas de aço curvas
          'repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.10) 0 2px, transparent 2px 30px, rgb(0 0 0 / 0.35) 30px 32px, transparent 32px 34px)',
          'linear-gradient(to right, rgb(0 0 0 / 0.25), transparent 18%, transparent 82%, rgb(0 0 0 / 0.25))',
          'linear-gradient(to bottom, #4a535a, #2c3337)',
        ].join(','),
      }}
      variants={portao}
      initial="fechado"
      animate={aberto ? 'aberto' : 'fechado'}
    >
      {/* Barra de baixo com os puxadores */}
      <div className="flex h-12 items-center justify-center gap-[30%] border-t-2 border-black/40 bg-[#262c30]">
        <div className="h-2 w-20 rounded-full bg-white/25" />
        <div className="h-2 w-20 rounded-full bg-white/25" />
      </div>
    </motion.div>
  )
}
