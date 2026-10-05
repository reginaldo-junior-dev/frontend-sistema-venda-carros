import { motion, useReducedMotion } from 'motion/react'
import { FotoCarro } from '@/features/catalogo/FotoCarro'

/**
 * Foto do carro com o carimbo "Vendido" batendo por cima, como o selo de pátio.
 * Aparece uma vez, como resposta ao pagamento aprovado.
 */
export function SeloVendido({ imagem }) {
  const reduzir = useReducedMotion()
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-foto">
      <FotoCarro imagem={imagem} alt="" className="aspect-[16/10]" />
      <div className="absolute inset-0 bg-asfalto/25" aria-hidden="true" />
      <motion.div
        aria-hidden="true"
        initial={reduzir ? false : { scale: 2.2, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: -12 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.25 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="tipo-emblema block rounded-plaqueta border-[5px] border-[#e5484d] px-6 py-2 text-h1 tracking-wider text-[#e5484d] uppercase shadow-[0_0_0_3px_rgb(255_255_255/0.6)] [text-shadow:0_1px_0_rgb(255_255_255/0.5)] bg-white/80">
          Vendido
        </span>
      </motion.div>
    </div>
  )
}
