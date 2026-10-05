import { cn } from '@/lib/utils'

const tons = {
  neutro: 'bg-superficie-funda text-texto',
  livre: 'bg-livre/12 text-livre',
  atencao: 'bg-sinal text-sinal-texto',
  vendido: 'bg-vendido/12 text-vendido',
  marca: 'bg-marca-suave text-marca',
}

export function Badge({ className, tom = 'neutro', ...props }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center gap-1 rounded-plaqueta px-2 py-0.5 text-sm font-semibold whitespace-nowrap',
        tons[tom],
        className,
      )}
      {...props}
    />
  )
}
