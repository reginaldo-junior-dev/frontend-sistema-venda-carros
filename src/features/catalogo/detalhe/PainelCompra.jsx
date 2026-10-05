import { useState } from 'react'
import { Check, Share2, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plaqueta } from '@/components/shared/Plaqueta'
import { Preco } from '@/components/shared/Preco'
import { useExigirCliente } from '@/features/cliente/useExigirCliente'
import { BotaoFavorito } from '@/features/favoritos/BotaoFavorito'
import { InteresseDialog } from '@/features/interesses/InteresseDialog'
import { useMeusInteresses } from '@/features/interesses/hooks'
import { CAMBIO, STATUS_CARRO, TOM_STATUS_CARRO } from '@/lib/enums'
import { km } from '@/lib/format'

/** Coluna de decisão do detalhe: o que é, quanto custa e o que fazer agora. */
export function PainelCompra({ carro, d }) {
  const { exigirCliente } = useExigirCliente()
  const { carroIds } = useMeusInteresses()
  const [interesseAberto, setInteresseAberto] = useState(false)
  const nomeCompleto = `${d.marca} ${carro.nome}`.trim()
  const disponivel = carro.status === 'DISPONIVEL'
  const jaDemonstrouInteresse = carroIds.has(carro.id)

  function reservar() {
    // A reserva (POST /compra) e o pagamento chegam na fase 4
    exigirCliente(() => toast.info('A reserva online será liberada em breve.'), 'Para reservar,')
  }

  async function compartilhar() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: nomeCompleto, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copiado.')
      }
    } catch {
      // A pessoa fechou o compartilhamento: nada a fazer
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-foto border bg-superficie p-6 lg:p-7">
      <div className="flex items-start justify-between gap-4">
        {d.modelo && <Plaqueta tamanho="lg">{d.modelo}</Plaqueta>}
        <div className="flex gap-2">
          <Button variante="secundaria" tamanho="icone" onClick={compartilhar} aria-label="Compartilhar este carro">
            <Share2 />
          </Button>
          {carro.status !== 'VENDIDO' && <BotaoFavorito carroId={carro.id} nomeCarro={nomeCompleto} variante="contorno" />}
        </div>
      </div>

      <div>
        {d.marca && <p className="text-texto-suave">{d.marca}</p>}
        <h1 className="mt-1 text-h3 leading-tight font-bold sm:text-h2">{carro.nome}</h1>
        <p className="tipo-dado mt-2 text-lead text-texto-suave">
          {[d.anos, km(carro.quilometragem), CAMBIO[carro.cambio]].filter(Boolean).join('  /  ')}
        </p>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 border-y py-5">
        <Preco valor={carro.preco} tamanho="lg" />
        {!disponivel && <Badge tom={TOM_STATUS_CARRO[carro.status]}>{STATUS_CARRO[carro.status]}</Badge>}
      </div>

      <div className="flex flex-col gap-3">
        <Button tamanho="lg" onClick={reservar} disabled={!disponivel}>
          {disponivel ? 'Reservar carro' : carro.status === 'RESERVADO' ? 'Reservado por outra pessoa' : 'Carro vendido'}
        </Button>
        {carro.status !== 'VENDIDO' &&
          (jaDemonstrouInteresse ? (
            <p className="flex h-13 items-center justify-center gap-2 rounded-controle bg-livre/10 font-semibold text-livre">
              <Check className="size-5" aria-hidden="true" /> Interesse enviado. A equipe vai te procurar.
            </p>
          ) : (
            <Button
              tamanho="lg"
              variante="secundaria"
              onClick={() => exigirCliente(() => setInteresseAberto(true), 'Para falar com a equipe,')}
            >
              Tenho interesse
            </Button>
          ))}
      </div>

      {disponivel && (
        <p className="flex gap-3 text-sm text-texto-suave">
          <Timer className="mt-0.5 size-5 shrink-0 text-marca" aria-hidden="true" />
          Ao reservar, o carro sai da vitrine e fica separado para você por 30 minutos enquanto você paga com Pix, boleto ou
          cartão.
        </p>
      )}

      <InteresseDialog
        aberto={interesseAberto}
        aoMudarAberto={setInteresseAberto}
        carroId={carro.id}
        nomeCarro={nomeCompleto}
      />
    </div>
  )
}
