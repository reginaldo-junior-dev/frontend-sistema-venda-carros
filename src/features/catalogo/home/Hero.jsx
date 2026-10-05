import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Button } from '@/components/ui/button'
import { linhaTitulo, surgir } from '@/lib/motion'
import { Portao } from '../Portao'
import { VideoFundo } from './VideoFundo'

const LINHAS = ['Seu próximo carro', 'está no pátio.']

export function Hero({ totalDisponiveis }) {
  const ref = useRef(null)
  const reduzir = useReducedMotion()
  const [fotoPronta, setFotoPronta] = useState(false)
  const aoFicarPronto = useCallback(() => setFotoPronta(true), [])

  // O portão só sobe com o vídeo pronto (ou depois de 1,5 s, para não prender a página)
  useEffect(() => {
    const id = setTimeout(() => setFotoPronta(true), 1500)
    return () => clearTimeout(id)
  }, [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const escala = useTransform(scrollYProgress, [0, 1], [1.04, 1.18])
  const deslocamento = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const opacidadeTexto = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  const estado = fotoPronta ? 'visivel' : 'oculta'

  return (
    <section
      ref={ref}
      aria-labelledby="titulo-hero"
      className="relative isolate -mt-[70px] flex min-h-[640px] overflow-hidden bg-asfalto text-white h-[100svh] max-h-[1000px]"
    >
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduzir ? undefined : { scale: escala, y: deslocamento }}
      >
        <VideoFundo aoFicarPronto={aoFicarPronto} className="size-full object-cover object-[60%_center]" />
      </motion.div>

      {/* O vídeo é diurno e claro: escurece à esquerda e embaixo para o texto branco ler bem */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(23_28_31/0.88)_0%,rgb(23_28_31/0.62)_40%,rgb(23_28_31/0.1)_72%),linear-gradient(0deg,rgb(23_28_31/0.8)_0%,transparent_45%),linear-gradient(180deg,rgb(23_28_31/0.5)_0%,transparent_22%)]"
      />

      <motion.div
        style={reduzir ? undefined : { opacity: opacidadeTexto }}
        className="mx-auto flex w-full max-w-7xl flex-col justify-end px-4 pt-32 pb-36 sm:px-6 md:pb-44 lg:px-8"
      >
        <h1 id="titulo-hero" className="tipo-emblema text-[2.6rem] leading-[0.98] sm:text-display lg:text-[5.2rem]">
          {LINHAS.map((linha, i) => (
            <span key={linha} className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" variants={linhaTitulo} custom={i} initial="oculta" animate={estado}>
                {linha}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          variants={surgir}
          custom={0.25}
          initial="oculto"
          animate={fotoPronta ? 'visivel' : 'oculto'}
          className="mt-6 max-w-[44ch] text-lead text-white/80"
        >
          {totalDisponiveis
            ? `${totalDisponiveis} carros disponíveis agora, com fotos reais e ficha completa.`
            : 'Carros novos e seminovos, com fotos reais e ficha completa.'}{' '}
          Reserve online e o carro fica separado para você por 30 minutos.
        </motion.p>

        <motion.div
          variants={surgir}
          custom={0.38}
          initial="oculto"
          animate={fotoPronta ? 'visivel' : 'oculto'}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button asChild tamanho="lg" className="bg-white text-asfalto hover:bg-white/90">
            <Link to="/carros">Ver carros disponíveis</Link>
          </Button>
          <Button
            asChild
            tamanho="lg"
            variante="fantasma"
            className="border border-white/30 text-white hover:bg-white/10"
          >
            <a href="#como-funciona">Como funciona a compra</a>
          </Button>
        </motion.div>
      </motion.div>

      <Portao aberto={fotoPronta} />
    </section>
  )
}
