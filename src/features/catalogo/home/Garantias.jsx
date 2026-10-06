import { CreditCard, Mail, QrCode, Timer } from 'lucide-react'
import { MINUTOS_RESERVA } from '@/features/compra/reserva'

// Só o que o sistema realmente faz: nada de promessa que a API não cumpre
const ITENS = [
  { icone: Timer, titulo: `Reserva de ${MINUTOS_RESERVA} minutos`, texto: 'O carro sai da vitrine enquanto você paga' },
  { icone: QrCode, titulo: 'Pix ou boleto', texto: 'Pagamento à vista com confirmação da equipe' },
  { icone: CreditCard, titulo: 'Cartão em parcelas', texto: 'Com a verificação de segurança do seu banco' },
  { icone: Mail, titulo: 'Tudo por e-mail', texto: 'Aviso de compra aprovada e de reserva expirada' },
]

export function Garantias() {
  return (
    <ul className="grid gap-x-8 gap-y-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
      {ITENS.map(({ icone: Icone, titulo, texto }) => (
        <li key={titulo} className="flex gap-3">
          <Icone className="mt-0.5 size-6 shrink-0 text-marca" strokeWidth={1.75} aria-hidden="true" />
          <div>
            <p className="font-semibold">{titulo}</p>
            <p className="text-sm text-texto-suave">{texto}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
