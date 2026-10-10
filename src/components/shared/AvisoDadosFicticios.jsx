import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// O site é um portfólio com contas de administrador de teste: quem tiver esse acesso vê os dados cadastrados
export function AvisoDadosFicticios({ children, className }) {
  return (
    <p className={cn('flex gap-2.5 rounded-controle border bg-superficie-funda px-3 py-2.5 text-sm text-texto-suave', className)}>
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}
