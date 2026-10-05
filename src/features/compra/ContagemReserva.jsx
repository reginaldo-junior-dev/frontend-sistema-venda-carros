import { Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { expiraEm, MINUTOS_RESERVA } from './reserva'
import { useContagem } from './useContagem'

const doisDigitos = (n) => String(n).padStart(2, '0')

/**
 * Prazo da reserva: relógio grande e uma barra que esvazia.
 * Fica âmbar (sinal) e vira vermelho nos últimos 5 minutos.
 */
export function ContagemReserva({ compra, compacta = false }) {
  const restante = useContagem(expiraEm(compra))
  const minutos = Math.floor(restante / 60_000)
  const segundos = Math.floor((restante % 60_000) / 1000)
  const fracao = restante / (MINUTOS_RESERVA * 60_000)
  const urgente = restante < 5 * 60_000
  const acabou = restante === 0

  if (compacta) {
    return (
      <span className={cn('tipo-dado inline-flex items-center gap-1.5 font-semibold', urgente ? 'text-vendido' : 'text-texto')}>
        <Timer className="size-4" aria-hidden="true" />
        {acabou ? 'Prazo encerrado' : `${doisDigitos(minutos)}:${doisDigitos(segundos)} para pagar`}
      </span>
    )
  }

  return (
    <div className={cn('rounded-controle border p-4', urgente ? 'border-vendido/40 bg-vendido/6' : 'border-sinal/50 bg-sinal/10')}>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Timer className="size-4.5" aria-hidden="true" />
          {acabou ? 'O prazo da reserva acabou' : 'Carro reservado para você'}
        </p>
        {/* O relógio muda a cada segundo; o leitor de tela recebe só o minuto */}
        <span aria-hidden="true" className={cn('tipo-dado text-h3 leading-none font-bold', urgente && 'text-vendido')}>
          {doisDigitos(minutos)}:{doisDigitos(segundos)}
        </span>
        <span className="sr-only" aria-live="polite">
          {acabou ? 'O prazo da reserva acabou.' : `Faltam ${minutos + 1} minutos para pagar.`}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-asfalto/10" aria-hidden="true">
        <div
          className={cn('h-full origin-left rounded-full transition-[transform,background-color] duration-1000 ease-linear', urgente ? 'bg-vendido' : 'bg-sinal')}
          style={{ transform: `scaleX(${fracao})` }}
        />
      </div>
      <p className="mt-2 text-sm text-texto-suave">
        {acabou
          ? 'Sem pagamento, a reserva é cancelada e o carro volta para a vitrine.'
          : 'Escolha a forma de pagamento antes do prazo. Pix e boleto seguram a reserva até a equipe confirmar.'}
      </p>
    </div>
  )
}
