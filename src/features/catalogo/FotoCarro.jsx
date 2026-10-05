import { useEffect, useState } from 'react'
import { CarFront } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUrlImagem } from './hooks'

/**
 * Foto de um carro a partir de um ImagemCarroResponse.
 * Mostra um fundo neutro enquanto a URL assinada e a imagem carregam.
 */
export function FotoCarro({ imagem, alt, className, prioridade = false, aoTerminar }) {
  const { data: url, isError } = useUrlImagem(imagem)
  const [carregada, setCarregada] = useState(false)
  const [falhou, setFalhou] = useState(false)
  const semFoto = !imagem || isError || falhou

  // Avisa quem espera a foto (o portão do hero) quando ela carregou ou não vai carregar
  useEffect(() => {
    if (carregada || semFoto) aoTerminar?.()
  }, [carregada, semFoto, aoTerminar])

  return (
    <div className={cn('relative overflow-hidden bg-superficie-funda', className)}>
      {semFoto ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-texto-suave">
          <CarFront className="size-10" strokeWidth={1.25} aria-hidden="true" />
          <span className="text-sm">Foto em breve</span>
        </div>
      ) : (
        url && (
          <img
            src={url}
            alt={alt}
            loading={prioridade ? 'eager' : 'lazy'}
            fetchPriority={prioridade ? 'high' : 'auto'}
            decoding="async"
            onLoad={() => setCarregada(true)}
            onError={() => setFalhou(true)}
            className={cn(
              'absolute inset-0 size-full object-cover transition-[opacity,scale] duration-500 ease-patio group-hover:scale-[1.04]',
              carregada ? 'opacity-100' : 'opacity-0',
            )}
          />
        )
      )}
    </div>
  )
}
