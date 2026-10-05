import { Link } from 'react-router'
import { LayoutGroup, motion } from 'motion/react'
import { ArrowRightLeft, Mail, MessageCircle, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EstadoErro } from '@/components/shared/Estados'
import { useCarrosPorId } from '@/features/catalogo/hooks'
import { STATUS_INTERESSE } from '@/lib/enums'
import { dataHora, soDigitos, telefone } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useInteressesAdmin, useMudarStatusInteresse } from './hooks'
import { CabecalhoAdmin } from './ui'

// O funil na ordem do atendimento; a cor da borda do topo marca cada etapa
const COLUNAS = [
  { status: 'NOVO', cor: 'border-t-marca', vazio: 'Nenhum interesse novo.' },
  { status: 'EM_CONTATO', cor: 'border-t-sinal', vazio: 'Ninguém em atendimento.' },
  { status: 'CONVERTIDO', cor: 'border-t-livre', vazio: 'Nenhuma conversão ainda.' },
  { status: 'CANCELADO', cor: 'border-t-borda', vazio: 'Nada cancelado.' },
]

export default function InteressesPage() {
  const consulta = useInteressesAdmin()
  const mudar = useMudarStatusInteresse()
  const lista = consulta.data?.itens ?? []
  const carros = useCarrosPorId([...new Set(lista.map((i) => i.carroId))])

  function mover(interesse, status) {
    mudar.mutate(
      { id: interesse.id, status },
      {
        onSuccess: () => toast.success(`${interesse.nome} movido para ${STATUS_INTERESSE[status]}.`),
        onError: (e) => toast.error(e.message),
      },
    )
  }

  return (
    <div>
      <CabecalhoAdmin
        titulo="Interesses"
        descricao="Pedidos de contato dos clientes. Mova cada um conforme o atendimento avança."
      />
      {consulta.isError ? (
        <EstadoErro erro={consulta.error} aoTentarDeNovo={consulta.refetch} />
      ) : (
        <LayoutGroup>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COLUNAS.map((coluna) => {
              const itens = lista.filter((i) => i.status === coluna.status)
              return (
                <section
                  key={coluna.status}
                  aria-labelledby={`coluna-${coluna.status}`}
                  className={cn('flex min-h-48 flex-col gap-3 rounded-foto border border-t-4 bg-superficie-funda/50 p-3', coluna.cor)}
                >
                  <h2 id={`coluna-${coluna.status}`} className="flex items-center justify-between px-1 font-semibold">
                    {STATUS_INTERESSE[coluna.status]}
                    <span className="tipo-dado rounded-full bg-superficie px-2 text-sm text-texto-suave">{itens.length}</span>
                  </h2>
                  {consulta.isPending ? (
                    <div className="h-28 animate-pulse rounded-controle bg-superficie" />
                  ) : itens.length === 0 ? (
                    <p className="px-1 py-4 text-center text-sm text-texto-suave">{coluna.vazio}</p>
                  ) : (
                    itens.map((interesse) => (
                      <Cartao
                        key={interesse.id}
                        interesse={interesse}
                        carro={carros[interesse.carroId]?.carro}
                        aoMover={(status) => mover(interesse, status)}
                      />
                    ))
                  )}
                </section>
              )
            })}
          </div>
        </LayoutGroup>
      )}
    </div>
  )
}

function Cartao({ interesse, carro, aoMover }) {
  const fone = soDigitos(interesse.telefone)
  return (
    <motion.article
      layout
      layoutId={`interesse-${interesse.id}`}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="flex flex-col gap-2.5 rounded-controle border bg-superficie p-3.5 shadow-[0_1px_2px_rgb(30_36_40/0.06)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{interesse.nome}</p>
          <p className="text-xs text-texto-suave">{dataHora(interesse.dataInteresse)}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variante="fantasma" tamanho="icone" className="size-8" aria-label={`Mover ${interesse.nome}`}>
              <ArrowRightLeft className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mover para</DropdownMenuLabel>
            {COLUNAS.filter((c) => c.status !== interesse.status).map((c) => (
              <DropdownMenuItem key={c.status} onSelect={() => aoMover(c.status)}>
                {STATUS_INTERESSE[c.status]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {carro && (
        <Link to={`/carros/${carro.id}`} target="_blank" className="truncate text-sm font-medium text-marca hover:underline">
          {carro.nome}
        </Link>
      )}
      <p className="line-clamp-3 text-sm text-texto-suave">{interesse.mensagem}</p>

      <div className="flex flex-wrap gap-1 border-t pt-2.5">
        <Contato href={`tel:+55${fone}`} icone={Phone} rotulo={`Ligar para ${telefone(fone)}`} texto={telefone(fone)} />
        <Contato href={`https://wa.me/55${fone}`} icone={MessageCircle} rotulo="Abrir conversa no WhatsApp" externo />
        <Contato href={`mailto:${interesse.email}`} icone={Mail} rotulo={`Enviar e-mail para ${interesse.email}`} />
      </div>
    </motion.article>
  )
}

function Contato({ href, icone: Icone, rotulo, texto, externo }) {
  return (
    <a
      href={href}
      aria-label={rotulo}
      title={rotulo}
      {...(externo ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="inline-flex h-8 items-center gap-1.5 rounded-controle px-2 text-sm text-texto-suave transition-colors hover:bg-superficie-funda hover:text-texto"
    >
      <Icone className="size-4" aria-hidden="true" />
      {texto && <span className="tipo-dado">{texto}</span>}
    </a>
  )
}
