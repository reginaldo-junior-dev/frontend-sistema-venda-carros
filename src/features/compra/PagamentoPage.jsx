import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, Clock, CreditCard, FileText, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { EstadoErro } from '@/components/shared/Estados'
import { Plaqueta } from '@/components/shared/Plaqueta'
import { Preco } from '@/components/shared/Preco'
import { useAuth } from '@/features/auth/useAuth'
import { FotoCarro } from '@/features/catalogo/FotoCarro'
import { descreverCarro } from '@/features/catalogo/descrever'
import { useCarro, useLookups } from '@/features/catalogo/hooks'
import { METODO_PAGAMENTO } from '@/lib/enums'
import { km, moeda } from '@/lib/format'
import { useTitulo } from '@/lib/useTitulo'
import { cn } from '@/lib/utils'
import { ContagemReserva } from './ContagemReserva'
import { PagamentoCartao } from './PagamentoCartao'
import { SeloVendido } from './SeloVendido'
import { useMinhasCompras, usePagamentosPorCompra, useRegistrarPagamento } from './hooks'
import { situacaoDaCompra } from './reserva'

const METODOS = [
  {
    valor: 'CARTAO_CREDITO',
    icone: CreditCard,
    titulo: 'Cartão de crédito',
    texto: 'Aprovação na hora. Seu banco pode pedir uma confirmação.',
  },
  {
    valor: 'PIX',
    icone: QrCode,
    titulo: 'Pix',
    texto: 'A equipe envia a chave Pix e confirma o recebimento.',
  },
  {
    valor: 'BOLETO',
    icone: FileText,
    titulo: 'Boleto',
    texto: 'A equipe envia o boleto. A compensação leva até 3 dias úteis.',
  },
]

export default function PagamentoPage() {
  useTitulo('Pagamento')
  const { id } = useParams()
  // Enquanto espera a equipe ou a Stripe, a página se atualiza sozinha
  const [acompanhar, setAcompanhar] = useState(false)
  const intervalo = acompanhar ? 10_000 : false
  const compras = useMinhasCompras({ refetchInterval: intervalo })
  const pagamentos = usePagamentosPorCompra({ refetchInterval: intervalo })
  const compra = compras.data?.find((c) => c.id === id)
  const carro = useCarro(compra?.carroId)
  const lookups = useLookups()

  if (compras.isPending || pagamentos.isPending || (compra && carro.isPending)) {
    return (
      <Moldura>
        <Esqueleto />
      </Moldura>
    )
  }
  if (compras.isError) {
    return (
      <Moldura>
        <div className="py-10">
          <EstadoErro erro={compras.error} aoTentarDeNovo={compras.refetch} />
        </div>
      </Moldura>
    )
  }
  if (!compra) {
    return (
      <Moldura>
        <div className="flex flex-col items-start gap-4 py-10">
          <h1 className="tipo-emblema text-h2">Compra não encontrada.</h1>
          <p className="text-texto-suave">Ela pode ter sido feita em outra conta.</p>
          <Button asChild>
            <Link to="/conta/compras">Ver minhas compras</Link>
          </Button>
        </div>
      </Moldura>
    )
  }

  const listaPagamentos = pagamentos.porCompra[compra.id] ?? []
  const situacao = situacaoDaCompra(compra, listaPagamentos)
  const precisaAcompanhar = situacao === 'aguardando-equipe' || situacao === 'processando-cartao'
  if (precisaAcompanhar !== acompanhar) setAcompanhar(precisaAcompanhar)

  const d = carro.data ? descreverCarro(carro.data, lookups.porId) : null

  return (
    <Moldura>
      <div className="grid gap-8 py-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        <div className="min-w-0">
          <VoltarAoTopo chave={situacao} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={situacao}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {situacao === 'aprovada' && <Sucesso carro={carro.data} d={d} />}
              {situacao === 'cancelada' && <Cancelada carroId={compra.carroId} />}
              {situacao === 'aguardando-equipe' && <AguardandoEquipe pagamento={listaPagamentos.find((p) => p.status === 'PENDENTE')} />}
              {(situacao === 'aberta' || situacao === 'processando-cartao') && (
                <EscolherPagamento compra={compra} processando={situacao === 'processando-cartao'} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside aria-label="Resumo da compra" className="lg:sticky lg:top-24 lg:self-start">
          <Resumo compra={compra} carro={carro.data} d={d} mostrarPrazo={situacao === 'aberta'} />
        </aside>
      </div>
    </Moldura>
  )
}

// A troca de situação muda a altura da página: o resultado precisa aparecer no topo
function VoltarAoTopo({ chave }) {
  const anterior = useRef(chave)
  useEffect(() => {
    if (anterior.current === chave) return
    anterior.current = chave
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [chave])
  return null
}

function Moldura({ children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav aria-label="Você está em" className="pt-8">
        <ol className="flex items-center gap-1.5 text-sm text-texto-suave">
          <li>
            <Link to="/conta/compras" className="hover:text-texto hover:underline">
              Minhas compras
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="font-medium text-texto">
            Pagamento
          </li>
        </ol>
      </nav>
      {children}
    </div>
  )
}

function EscolherPagamento({ compra, processando }) {
  const [metodo, setMetodo] = useState('CARTAO_CREDITO')
  const registrar = useRegistrarPagamento()

  function registrarManual() {
    registrar.mutate(
      { compraId: compra.id, metodo },
      {
        onSuccess: () => toast.success(`Pagamento por ${METODO_PAGAMENTO[metodo]} registrado.`),
        onError: (erro) => toast.error(erro.message),
      },
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="tipo-emblema text-h2">Como você quer pagar?</h1>
        {processando && (
          <p role="status" className="mt-4 rounded-controle border border-sinal/50 bg-sinal/10 px-4 py-3 text-sm">
            Um pagamento com cartão desta compra ainda está em análise. Se você fechou a confirmação do banco, pode tentar de
            novo abaixo.
          </p>
        )}
      </div>

      <fieldset>
        <legend className="sr-only">Forma de pagamento</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {METODOS.map(({ valor, icone: Icone, titulo, texto }) => {
            const ativo = metodo === valor
            return (
              <label
                key={valor}
                className={cn(
                  'relative flex cursor-pointer flex-col gap-2 rounded-foto border-2 bg-superficie p-4 transition-colors',
                  ativo ? 'border-marca' : 'border-borda hover:border-texto/30',
                )}
              >
                <input
                  type="radio"
                  name="metodo"
                  value={valor}
                  checked={ativo}
                  onChange={() => setMetodo(valor)}
                  className="sr-only"
                />
                <Icone className={cn('size-6', ativo ? 'text-marca' : 'text-texto-suave')} aria-hidden="true" />
                <span className="font-semibold">{titulo}</span>
                <span className="text-sm text-texto-suave">{texto}</span>
                {ativo && (
                  <motion.span
                    layoutId="metodo-ativo"
                    className="absolute top-3 right-3 size-3 rounded-full bg-marca"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </label>
            )
          })}
        </div>
      </fieldset>

      {metodo === 'CARTAO_CREDITO' ? (
        <PagamentoCartao
          compra={compra}
          aoConcluir={(status) =>
            status === 'PENDENTE' &&
            toast.info('O banco confirmou. Falta a aprovação final da Stripe; esta página se atualiza sozinha.')
          }
        />
      ) : (
        <div className="flex flex-col gap-4 rounded-foto border bg-superficie p-6">
          <h2 className="text-lead font-semibold">Como funciona o pagamento por {METODO_PAGAMENTO[metodo]}</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-texto-suave">
            <li>Você confirma abaixo e a reserva fica garantida enquanto a equipe confirma o pagamento.</li>
            <li>
              A equipe envia {metodo === 'PIX' ? 'a chave Pix' : 'o boleto'} para o seu e-mail ou telefone, no valor de{' '}
              {moeda(compra.valorTotal, { centavos: true })}.
            </li>
            <li>Assim que o valor entrar, a compra é aprovada e você recebe a confirmação por e-mail.</li>
          </ol>
          <Button tamanho="lg" className="self-start" disabled={registrar.isPending} onClick={registrarManual}>
            {registrar.isPending ? 'Registrando…' : `Pagar com ${METODO_PAGAMENTO[metodo]}`}
          </Button>
        </div>
      )}
    </div>
  )
}

function Resumo({ compra, carro, d, mostrarPrazo }) {
  return (
    <div className="flex flex-col gap-5 rounded-foto border bg-superficie p-5">
      {carro && (
        <div className="relative pb-5">
          <FotoCarro imagem={d.foto} alt="" className="aspect-[16/10] rounded-controle" />
          {d.modelo && (
            <Plaqueta tamanho="sm" className="absolute bottom-1 left-1/2 -translate-x-1/2">
              {d.modelo}
            </Plaqueta>
          )}
        </div>
      )}
      <div>
        {d?.marca && <p className="text-sm text-texto-suave">{d.marca}</p>}
        <p className="text-lead font-semibold">{carro?.nome ?? 'Carro'}</p>
        {carro && (
          <p className="tipo-dado text-texto-suave">
            {d.anos} / {km(carro.quilometragem)}
          </p>
        )}
      </div>
      {mostrarPrazo && <ContagemReserva compra={compra} />}
      <dl className="flex flex-col gap-2 border-t pt-4">
        <div className="flex justify-between text-texto-suave">
          <dt>Valor do carro</dt>
          <dd className="tipo-dado">{moeda(compra.valorTotal, { centavos: true })}</dd>
        </div>
        <div className="flex items-end justify-between">
          <dt className="font-semibold">Total</dt>
          <dd>
            <Preco valor={compra.valorTotal} tamanho="md" />
          </dd>
        </div>
      </dl>
    </div>
  )
}

function Sucesso({ carro, d }) {
  const { usuario } = useAuth()
  return (
    <div className="flex flex-col items-start gap-6">
      {carro && <SeloVendido imagem={d.foto} />}
      <h1 className="tipo-emblema text-h1">O carro é seu.</h1>
      <p className="max-w-[48ch] text-lead text-texto-suave">
        Pagamento aprovado. Enviamos a confirmação para {usuario?.email ?? 'o seu e-mail'}. A equipe entra em contato para
        combinar a entrega do {d?.marca} {carro?.nome}.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/conta/compras">Ver minhas compras</Link>
        </Button>
        <Button asChild variante="secundaria">
          <Link to="/carros">Voltar ao catálogo</Link>
        </Button>
      </div>
    </div>
  )
}

function AguardandoEquipe({ pagamento }) {
  const metodo = METODO_PAGAMENTO[pagamento?.metodo] ?? 'Pix ou boleto'
  return (
    <div className="flex flex-col items-start gap-5">
      <span className="flex size-14 items-center justify-center rounded-full bg-sinal/15 text-texto">
        <Clock className="size-7" aria-hidden="true" />
      </span>
      <h1 className="tipo-emblema text-h2">Aguardando a confirmação do pagamento.</h1>
      <p className="max-w-[50ch] text-lead text-texto-suave">
        Você escolheu {metodo}. A equipe vai enviar os dados para pagamento e, assim que o valor entrar, aprova a compra. O carro
        continua reservado para você até lá.
      </p>
      <p className="text-sm text-texto-suave">Esta página se atualiza sozinha quando a equipe confirmar.</p>
      <Button asChild variante="secundaria">
        <Link to="/conta/compras">Ver minhas compras</Link>
      </Button>
    </div>
  )
}

function Cancelada({ carroId }) {
  return (
    <div className="flex flex-col items-start gap-5">
      <h1 className="tipo-emblema text-h2">Esta reserva foi encerrada.</h1>
      <p className="max-w-[50ch] text-lead text-texto-suave">
        O prazo para pagar acabou ou a compra foi cancelada. Se o carro ainda estiver disponível, você pode reservá-lo de novo.
      </p>
      <Button asChild>
        <Link to={`/carros/${carroId}`}>Ver o carro</Link>
      </Button>
    </div>
  )
}

function Esqueleto() {
  return (
    <div aria-busy="true" className="grid gap-8 py-16 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
      <div className="flex flex-col gap-4">
        <div className="h-10 w-2/3 animate-pulse rounded-controle bg-superficie-funda" />
        <div className="h-40 animate-pulse rounded-foto bg-superficie-funda" />
      </div>
      <div className="h-96 animate-pulse rounded-foto bg-superficie-funda" />
    </div>
  )
}
