import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { FotoCarro } from '../FotoCarro'
import { ordenarImagens } from '../descrever'

const deslizar = {
  entra: (direcao) => ({ x: `${direcao * 30}%`, opacity: 0 }),
  centro: { x: 0, opacity: 1 },
  sai: (direcao) => ({ x: `${direcao * -30}%`, opacity: 0 }),
}

/**
 * Galeria do detalhe: troca com deslize na direção da navegação, arrastar no celular,
 * setas do teclado, miniaturas e tela cheia.
 */
export function Galeria({ imagens, nome, nomeTransicao }) {
  const fotos = ordenarImagens(imagens)
  const [[indice, direcao], setPosicao] = useState([0, 0])
  const [telaCheia, setTelaCheia] = useState(false)
  const total = fotos.length

  const ir = (passo) => setPosicao(([atual]) => [(atual + passo + total) % total, passo])
  const irPara = (novo) => setPosicao(([atual]) => [novo, novo > atual ? 1 : -1])

  function aoTeclar(e) {
    if (e.key === 'ArrowRight') ir(1)
    if (e.key === 'ArrowLeft') ir(-1)
  }

  if (total === 0) {
    return (
      <div className="overflow-hidden rounded-foto" style={{ viewTransitionName: nomeTransicao }}>
        <FotoCarro imagem={null} alt="" className="aspect-[16/10]" />
      </div>
    )
  }

  const palco = (grande) => (
    <div
      role="group"
      aria-roledescription="galeria"
      aria-label={`Fotos de ${nome}`}
      tabIndex={0}
      onKeyDown={aoTeclar}
      className={cn(
        'group/galeria relative overflow-hidden bg-superficie-funda outline-none focus-visible:ring-2 focus-visible:ring-foco',
        grande ? 'h-[min(80dvh,56rem)] w-full rounded-controle bg-asfalto' : 'aspect-[16/10] rounded-foto',
      )}
      // A foto principal compartilha o nome de transição com a do card
      style={!grande && indice === 0 ? { viewTransitionName: nomeTransicao } : undefined}
    >
      <AnimatePresence initial={false} custom={direcao} mode="popLayout">
        <motion.div
          key={fotos[indice].id}
          custom={direcao}
          variants={deslizar}
          initial="entra"
          animate="centro"
          exit="sai"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          drag={total > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 || info.velocity.x < -400) ir(1)
            else if (info.offset.x > 60 || info.velocity.x > 400) ir(-1)
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <FotoCarro
            imagem={fotos[indice]}
            alt={`${nome}, foto ${indice + 1} de ${total}`}
            prioridade={indice === 0}
            className={cn('size-full', grande && '[&_img]:object-contain')}
          />
        </motion.div>
      </AnimatePresence>

      {total > 1 && (
        <>
          <BotaoSeta lado="esquerda" aoClicar={() => ir(-1)} />
          <BotaoSeta lado="direita" aoClicar={() => ir(1)} />
        </>
      )}

      <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2">
        <span className="tipo-dado rounded-full bg-asfalto/70 px-2.5 py-1 text-sm text-white backdrop-blur-sm" aria-live="polite">
          {indice + 1} / {total}
        </span>
      </div>

      {!grande && (
        <button
          type="button"
          onClick={() => setTelaCheia(true)}
          aria-label="Ver fotos em tela cheia"
          className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-asfalto/60 text-white backdrop-blur-sm transition-colors hover:bg-asfalto/80"
        >
          <Expand className="size-4.5" />
        </button>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      {palco(false)}

      {total > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {fotos.map((foto, i) => (
            <li key={foto.id} className="shrink-0">
              <button
                type="button"
                onClick={() => irPara(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === indice}
                className={cn(
                  'block w-24 overflow-hidden rounded-controle ring-offset-2 ring-offset-fundo transition-[opacity,box-shadow] sm:w-28',
                  i === indice ? 'ring-2 ring-marca' : 'opacity-60 hover:opacity-100',
                )}
              >
                <FotoCarro imagem={foto} alt="" className="aspect-[4/3]" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={telaCheia} onOpenChange={setTelaCheia}>
        <DialogContent className="max-w-[min(96vw,90rem)] border-0 bg-asfalto p-2 sm:max-w-[min(96vw,90rem)] [&>button]:text-white">
          <DialogTitle className="sr-only">Fotos de {nome}</DialogTitle>
          {palco(true)}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BotaoSeta({ lado, aoClicar }) {
  const Icone = lado === 'esquerda' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-label={lado === 'esquerda' ? 'Foto anterior' : 'Próxima foto'}
      className={cn(
        'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-superficie/90 text-texto shadow-md transition-opacity duration-200 sm:flex',
        'opacity-0 group-hover/galeria:opacity-100 group-focus-visible/galeria:opacity-100 focus-visible:opacity-100',
        lado === 'esquerda' ? 'left-3' : 'right-3',
      )}
    >
      <Icone className="size-5" />
    </button>
  )
}
