import { cn } from '@/lib/utils'

const fmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

// "R$" pequeno e o valor em numerais condensados, para o preço ler como etiqueta de pátio
export function Preco({ valor, className, tamanho = 'md' }) {
  if (valor == null) return null
  return (
    <span className={cn('inline-flex items-baseline gap-1 text-texto', className)}>
      <span className="text-sm font-semibold text-texto-suave">R$</span>
      <span
        className={cn(
          'tipo-dado leading-none font-bold',
          tamanho === 'sm' && 'text-lead',
          tamanho === 'md' && 'text-h3',
          tamanho === 'lg' && 'text-h1',
        )}
      >
        {fmt.format(Number(valor))}
      </span>
    </span>
  )
}
