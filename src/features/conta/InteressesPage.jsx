import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EstadoErro } from '@/components/shared/Estados'
import { FotoCarro } from '@/features/catalogo/FotoCarro'
import { descreverCarro } from '@/features/catalogo/descrever'
import { useCarrosPorId, useLookups } from '@/features/catalogo/hooks'
import { useMeusInteresses } from '@/features/interesses/hooks'
import { STATUS_INTERESSE } from '@/lib/enums'
import { dataHora } from '@/lib/format'

// O que cada status significa para quem enviou o interesse
const SITUACAO = {
  NOVO: { tom: 'marca', texto: 'Recebido. A equipe vai entrar em contato.' },
  EM_CONTATO: { tom: 'atencao', texto: 'A equipe já está falando com você.' },
  CONVERTIDO: { tom: 'livre', texto: 'Virou uma compra.' },
  CANCELADO: { tom: 'neutro', texto: 'Atendimento encerrado.' },
}

export default function InteressesPage() {
  const interesses = useMeusInteresses()
  const lookups = useLookups()
  const lista = [...(interesses.data ?? [])].sort((a, b) =>
    String(b.dataInteresse ?? '').localeCompare(String(a.dataInteresse ?? '')),
  )
  const carros = useCarrosPorId(lista.map((i) => i.carroId))

  return (
    <div className="py-10">
      <h1 className="tipo-emblema text-h2">Interesses</h1>
      <p className="mt-2 mb-10 text-texto-suave">Os carros sobre os quais você pediu contato da equipe.</p>

      {interesses.isError ? (
        <EstadoErro erro={interesses.error} aoTentarDeNovo={interesses.refetch} />
      ) : interesses.isPending ? (
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-foto bg-superficie-funda" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-foto border border-dashed p-8">
          <p className="tipo-emblema text-h3">Nenhum interesse enviado.</p>
          <p className="max-w-[46ch] text-texto-suave">
            Na página de um carro, use "Tenho interesse" para a equipe entrar em contato com você.
          </p>
          <Button asChild>
            <Link to="/carros">Ver carros disponíveis</Link>
          </Button>
        </div>
      ) : (
        <ol className="flex flex-col gap-4">
          {lista.map((interesse) => {
            const { carro } = carros[interesse.carroId] ?? {}
            const d = carro ? descreverCarro(carro, lookups.porId) : null
            const situacao = SITUACAO[interesse.status] ?? SITUACAO.NOVO
            return (
              <li
                key={interesse.id}
                className="grid gap-5 rounded-foto border bg-superficie p-4 sm:grid-cols-[11rem_1fr] sm:p-5"
              >
                <FotoCarro imagem={d?.foto ?? null} alt="" className="aspect-[4/3] rounded-controle" />
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      {carro ? (
                        <Link to={`/carros/${carro.id}`} className="text-lead font-semibold hover:underline">
                          {d.marca} {carro.nome}
                        </Link>
                      ) : (
                        <p className="text-lead font-semibold">Carro retirado do anúncio</p>
                      )}
                      <p className="text-sm text-texto-suave">Enviado em {dataHora(interesse.dataInteresse)}</p>
                    </div>
                    <Badge tom={situacao.tom}>{STATUS_INTERESSE[interesse.status]}</Badge>
                  </div>
                  <p className="text-sm font-medium">{situacao.texto}</p>
                  <blockquote className="border-l-2 pl-3 text-texto-suave">{interesse.mensagem}</blockquote>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
