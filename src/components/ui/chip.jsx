import { cn } from '@/lib/utils'

// Botão de alternância para filtros; aria-pressed diz se está ativo
export function Chip({ ativo, className, children, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors duration-150',
        ativo
          ? 'border-marca bg-marca text-marca-texto'
          : 'border-borda bg-superficie text-texto hover:border-texto/40',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
