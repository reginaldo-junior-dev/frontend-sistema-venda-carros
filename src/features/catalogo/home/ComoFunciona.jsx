import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { cn } from '@/lib/utils'

// É uma sequência de verdade, por isso numerada
const PASSOS = [
  {
    titulo: 'Escolha o carro',
    texto: 'Filtre por marca, tipo, preço e ano. Cada carro tem fotos reais e ficha técnica completa.',
  },
  {
    titulo: 'Reserve online',
    texto: 'Ao reservar, o carro sai da vitrine e fica separado para você por 30 minutos.',
  },
  {
    titulo: 'Pague do seu jeito',
    texto: 'Pix, boleto ou cartão de crédito em parcelas. O cartão passa pela verificação de segurança do seu banco.',
  },
  {
    titulo: 'Receba a confirmação',
    texto: 'Com o pagamento aprovado, você recebe a confirmação por e-mail e a equipe combina a entrega.',
  },
]

/**
 * Seção escura com a faixa amarela da estrada: ela se pinta conforme a rolagem
 * e acende cada passo quando chega nele.
 */
export function ComoFunciona() {
  const ref = useRef(null)
  const reduzir = useReducedMotion()
  const [ativo, setAtivo] = useState(reduzir ? PASSOS.length - 1 : -1)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] })
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (reduzir) return
    setAtivo(Math.min(PASSOS.length - 1, Math.floor(v * PASSOS.length + 0.15) - (v === 0 ? 1 : 0)))
  })

  return (
    <section id="como-funciona" aria-labelledby="titulo-como" className="mt-28 scroll-mt-20 bg-asfalto text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-8 lg:py-32">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="titulo-como" className="tipo-emblema text-h2 sm:text-h1">
            Do anúncio à chave na mão
          </h2>
          <p className="mt-4 max-w-[42ch] text-lead text-white/70">
            A compra acontece toda online, com o carro garantido enquanto você paga.
          </p>
          <img
            src="/imagens/estrada.webp"
            alt=""
            loading="lazy"
            className="mt-10 hidden aspect-[4/3] w-full rounded-foto object-cover lg:block"
          />
        </div>

        <ol ref={ref} className="relative flex flex-col gap-16 pl-14 sm:pl-20">
          {/* Faixa central da estrada: tracejada ao fundo, amarela por cima conforme a rolagem */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[1.15rem] w-1 sm:left-[1.65rem]"
            style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.18) 0 18px, transparent 18px 32px)' }}
          />
          <motion.span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[1.15rem] w-1 origin-top sm:left-[1.65rem]"
            style={{
              scaleY: reduzir ? 1 : progresso,
              backgroundImage: 'repeating-linear-gradient(to bottom, #e8a317 0 18px, transparent 18px 32px)',
            }}
          />

          {PASSOS.map((passo, i) => {
            const aceso = i <= ativo
            return (
              <li key={passo.titulo} className="relative">
                <span
                  className={cn(
                    'tipo-dado absolute top-0 -left-14 flex size-10 items-center justify-center rounded-full border-2 text-lead font-bold transition-colors duration-300 sm:-left-20 sm:size-14 sm:text-h3',
                    aceso ? 'border-sinal bg-sinal text-asfalto' : 'border-white/25 bg-asfalto text-white/60',
                  )}
                >
                  {i + 1}
                </span>
                <h3 className={cn('text-h3 font-semibold transition-colors duration-300', aceso ? 'text-white' : 'text-white/55')}>
                  {passo.titulo}
                </h3>
                <p className="mt-2 max-w-[44ch] text-white/70">{passo.texto}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
