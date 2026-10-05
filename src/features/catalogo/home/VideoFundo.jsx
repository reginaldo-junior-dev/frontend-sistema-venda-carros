import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Pause, Play } from 'lucide-react'

// Escolhida uma vez: celular baixa a versão 720p (1,1 MB) em vez da 1080p
function escolherFontes() {
  const celular = window.matchMedia('(max-width: 767px)').matches
  return celular
    ? [{ src: '/videos/hero-720.mp4', type: 'video/mp4' }]
    : [
        { src: '/videos/hero-1080.webm', type: 'video/webm' },
        { src: '/videos/hero-1080.mp4', type: 'video/mp4' },
      ]
}

// Economia de dados ligada no celular: fica só a capa, e o vídeo toca se a pessoa pedir
function economizaDados() {
  return Boolean(navigator.connection?.saveData)
}

/**
 * Vídeo de fundo do hero: sem som, em loop, com botão de pausar (movimento contínuo
 * de mais de 5 s precisa de controle, WCAG 2.2.2). Pausa sozinho fora da tela.
 */
export function VideoFundo({ aoFicarPronto, className }) {
  const ref = useRef(null)
  const reduzir = useReducedMotion()
  const [fontes] = useState(escolherFontes)
  // Quem pede menos movimento ou economia de dados começa com o vídeo parado
  const [pausadoPeloUsuario, setPausadoPeloUsuario] = useState(() => reduzir || economizaDados())
  const [tocando, setTocando] = useState(false)

  // Toca só quando está visível e a pessoa não pausou
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !pausadoPeloUsuario) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.15 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [pausadoPeloUsuario])

  function alternar() {
    const video = ref.current
    if (!video) return
    if (video.paused) {
      setPausadoPeloUsuario(false)
      video.play().catch(() => {})
    } else {
      setPausadoPeloUsuario(true)
      video.pause()
    }
  }

  return (
    <>
      <video
        ref={ref}
        className={className}
        poster="/imagens/hero-capa.webp"
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        disablePictureInPicture
        onLoadedData={aoFicarPronto}
        onError={aoFicarPronto}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
      >
        {fontes.map((f) => (
          <source key={f.src} src={f.src} type={f.type} />
        ))}
      </video>

      <button
        type="button"
        onClick={alternar}
        aria-label={tocando ? 'Pausar vídeo de fundo' : 'Reproduzir vídeo de fundo'}
        className="absolute right-4 bottom-28 z-20 flex size-11 items-center justify-center rounded-full border border-white/30 bg-asfalto/40 text-white backdrop-blur-sm transition-colors hover:bg-asfalto/70 sm:right-6 md:bottom-36 lg:right-8"
      >
        {tocando ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
      </button>
    </>
  )
}
