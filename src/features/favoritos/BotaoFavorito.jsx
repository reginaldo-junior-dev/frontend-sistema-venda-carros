import { useState } from 'react'
import { Heart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/useAuth'
import { useExigirCliente } from '@/features/cliente/useExigirCliente'
import { cn } from '@/lib/utils'
import { useAlternarFavorito, useFavoritos } from './hooks'

/**
 * Coração de favorito. Responde na hora (atualização otimista) e dá um "pulso"
 * ao marcar; quem não é cliente passa pelo cadastro antes. O admin não vê o coração.
 */
export function BotaoFavorito({ carroId, nomeCarro, variante = 'flutuante', className }) {
  const { ehAdmin } = useAuth()
  const { ids } = useFavoritos()
  const alternar = useAlternarFavorito()
  const { exigirCliente } = useExigirCliente()
  const marcado = ids.has(carroId)
  // Só anima quando a pessoa marca agora, não ao carregar um favorito antigo
  const [acabouDeMarcar, setAcabouDeMarcar] = useState(false)

  function aoClicar(e) {
    // O card inteiro é um link; o coração não pode navegar
    e.preventDefault()
    e.stopPropagation()
    if (marcado) {
      setAcabouDeMarcar(false)
      alternar.mutate({ carroId, favoritar: false })
      return
    }
    exigirCliente(
      () => {
        setAcabouDeMarcar(true)
        alternar.mutate(
          { carroId, favoritar: true },
          {
            onError: (erro) => {
              if (erro.status !== 409) toast.error(erro.message)
            },
          },
        )
      },
      'Para salvar favoritos,',
    )
  }

  if (ehAdmin) return null

  const flutuante = variante === 'flutuante'

  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-pressed={marcado}
      aria-label={marcado ? `Remover ${nomeCarro} dos favoritos` : `Salvar ${nomeCarro} nos favoritos`}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-150',
        flutuante
          ? 'size-10 bg-asfalto/45 text-white backdrop-blur-sm hover:bg-asfalto/70'
          : 'size-11 border bg-superficie text-texto hover:border-texto/40',
        className,
      )}
    >
      <motion.span
        key={marcado ? 'marcado' : 'vazio'}
        initial={acabouDeMarcar && marcado ? { scale: 0.6 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 14 }}
        className="flex"
      >
        <Heart
          className={cn('size-5', marcado && 'fill-[#e5484d] text-[#e5484d]')}
          strokeWidth={marcado ? 2 : 1.75}
          aria-hidden="true"
        />
      </motion.span>
      {/* Anel que se expande uma vez ao marcar */}
      <AnimatePresence>
        {acabouDeMarcar && marcado && (
          <motion.span
            key="anel"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#e5484d]"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </button>
  )
}
