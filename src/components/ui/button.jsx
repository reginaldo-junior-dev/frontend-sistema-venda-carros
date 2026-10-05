import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'

const variantes = {
  primaria: 'bg-marca text-marca-texto hover:bg-marca/90 active:bg-marca/80',
  secundaria: 'bg-superficie text-texto border border-borda hover:border-texto/40 hover:bg-superficie-funda',
  fantasma: 'text-texto hover:bg-superficie-funda',
  perigo: 'bg-vendido text-white hover:bg-vendido/90 dark:text-asfalto',
  link: 'text-marca underline-offset-4 hover:underline px-0 h-auto',
}

const tamanhos = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-base gap-2',
  lg: 'h-13 px-7 text-lead gap-2.5',
  icone: 'size-11',
}

export function Button({ className, variante = 'primaria', tamanho = 'md', asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-controle font-semibold whitespace-nowrap',
        'transition-[background-color,border-color,transform] duration-150 ease-patio active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[1.15em] [&_svg]:shrink-0',
        variantes[variante],
        variante !== 'link' && tamanhos[tamanho],
        className,
      )}
      {...props}
    />
  )
}
