import { cn } from '@/lib/utils'

const tamanhos = {
  sm: { caixa: 'h-8 min-w-24', faixa: 'h-2', texto: 'text-sm px-2', bandeira: 'hidden' },
  md: { caixa: 'h-11 min-w-32', faixa: 'h-3', texto: 'text-base px-3', bandeira: 'h-1.5 w-2.5' },
  lg: { caixa: 'h-16 min-w-48', faixa: 'h-4', texto: 'text-h3 px-4', bandeira: 'h-2 w-3' },
}

/**
 * Plaqueta no padrão da placa Mercosul: faixa azul com "BRASIL" e o texto em letras expandidas.
 * É o elemento de identidade do Pátio; usa as cores fixas da placa nos dois temas.
 */
export function Plaqueta({ children, tamanho = 'md', className, ...props }) {
  const t = tamanhos[tamanho]
  return (
    <span
      className={cn(
        'inline-flex max-w-full flex-col overflow-hidden rounded-plaqueta border-[1.5px] border-asfalto bg-placa text-asfalto shadow-[0_1px_0_rgb(30_36_40/0.25)]',
        t.caixa,
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className={cn('relative flex shrink-0 items-center justify-center bg-mercosul', t.faixa)}>
        {tamanho !== 'sm' && (
          <span className="text-[0.5rem] leading-none font-bold tracking-[0.2em] text-white" style={{ fontStretch: '125%' }}>
            BRASIL
          </span>
        )}
        <span className={cn('absolute top-1/2 right-1 -translate-y-1/2 bg-[#2a9d4b]', t.bandeira)}>
          <span className="absolute inset-[22%] rotate-45 bg-[#f3c623]" />
        </span>
      </span>
      <span className={cn('tipo-emblema flex flex-1 items-center justify-center truncate leading-none uppercase', t.texto)}>
        {children}
      </span>
    </span>
  )
}
