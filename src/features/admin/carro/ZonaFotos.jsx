import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LIMITE_MB, TIPOS_IMAGEM } from './arquivos'

/** Área de arrastar e soltar (ou clicar para escolher) fotos. Entrega os arquivos escolhidos. */
export function ZonaFotos({ aoEscolher, desabilitada = false }) {
  const entrada = useRef(null)
  const [arrastando, setArrastando] = useState(false)

  return (
    <>
      <button
        type="button"
        disabled={desabilitada}
        onClick={() => entrada.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArrastando(false)
          if (!desabilitada) aoEscolher([...e.dataTransfer.files])
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-controle border-2 border-dashed px-6 py-10 text-center transition-colors disabled:opacity-60',
          arrastando ? 'border-marca bg-marca-suave' : 'border-borda hover:border-texto/40 hover:bg-superficie-funda/50',
        )}
      >
        <ImagePlus className={cn('size-8', arrastando ? 'text-marca' : 'text-texto-suave')} aria-hidden="true" />
        <span className="font-semibold">{arrastando ? 'Solte as fotos aqui' : 'Arraste as fotos ou clique para escolher'}</span>
        <span className="text-sm text-texto-suave">
          JPG, PNG ou WEBP de até {LIMITE_MB} MB. Dá para enviar várias de uma vez.
        </span>
      </button>
      <input
        ref={entrada}
        type="file"
        accept={TIPOS_IMAGEM.join(',')}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          aoEscolher([...e.target.files])
          e.target.value = ''
        }}
      />
    </>
  )
}
