import { useMemo, useState } from 'react'
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { useQueryClient } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { moeda } from '@/lib/format'
import { obterStripe, stripeConfigurada, stripeModoTeste } from '@/lib/stripe'
import { useTema } from '@/lib/tema'
import { listarMeusPagamentos } from './api'
import { usePagarComCartao } from './hooks'

const FONTE = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500&display=swap'

export function PagamentoCartao({ compra, aoConcluir }) {
  if (!stripeConfigurada) {
    return (
      <p role="alert" className="rounded-controle border border-sinal/50 bg-sinal/10 px-4 py-3 text-sm">
        O pagamento com cartão ainda não está configurado nesta loja. Escolha Pix ou boleto, ou tente mais tarde.
      </p>
    )
  }
  return (
    <Elements stripe={obterStripe()} options={{ fonts: [{ cssSrc: FONTE }], locale: 'pt-BR' }}>
      <Formulario compra={compra} aoConcluir={aoConcluir} />
    </Elements>
  )
}

// O resultado do 3D Secure chega pelo webhook da Stripe: consulta a API até o pagamento sair de PENDENTE
async function aguardarResultado(pagamentoId, tentativas = 12) {
  for (let i = 0; i < tentativas; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const pagamento = (await listarMeusPagamentos()).find((p) => p.id === pagamentoId)
    if (pagamento && pagamento.status !== 'PENDENTE') return pagamento.status
  }
  return 'PENDENTE'
}

function Formulario({ compra, aoConcluir }) {
  const stripe = useStripe()
  const elements = useElements()
  const pagar = usePagarComCartao()
  const queryClient = useQueryClient()
  const { escuro } = useTema()
  const [etapa, setEtapa] = useState(null) // null | 'enviando' | 'banco' | 'confirmando'
  const [erro, setErro] = useState(null)
  const [completo, setCompleto] = useState(false)

  // O campo do cartão vive num iframe da Stripe: as cores vêm do tema atual
  const estilo = useMemo(
    () => ({
      style: {
        base: {
          fontFamily: 'Archivo, system-ui, sans-serif',
          fontSize: '16px',
          color: escuro ? '#e6e9e8' : '#1e2428',
          iconColor: escuro ? '#9aa5aa' : '#5a6469',
          '::placeholder': { color: escuro ? '#9aa5aa' : '#5a6469' },
        },
        invalid: { color: escuro ? '#f08a80' : '#b3261e', iconColor: escuro ? '#f08a80' : '#b3261e' },
      },
      hidePostalCode: true,
    }),
    [escuro],
  )

  async function enviar(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setErro(null)
    setEtapa('enviando')

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      })
      if (error) throw new Error(error.message)

      const pagamento = await pagar.mutateAsync({ compraId: compra.id, paymentMethodId: paymentMethod.id })
      let status = pagamento.status

      if (status === 'PENDENTE' && pagamento.clientSecret) {
        // O banco pediu confirmação (3D Secure): a Stripe abre a janela do banco
        setEtapa('banco')
        const resultado = await stripe.handleNextAction({ clientSecret: pagamento.clientSecret })
        if (resultado.error) throw new Error(resultado.error.message)
      }
      if (status === 'PENDENTE') {
        setEtapa('confirmando')
        status = await aguardarResultado(pagamento.id)
      }

      queryClient.invalidateQueries({ queryKey: ['me'] })
      if (status === 'RECUSADO') {
        throw new Error('O banco recusou o pagamento. Confira os dados, use outro cartão ou escolha Pix ou boleto.')
      }
      if (status === 'CANCELADO') throw new Error('O pagamento foi cancelado. Você pode tentar de novo.')
      aoConcluir(status)
    } catch (falha) {
      setErro(falha.message)
    } finally {
      setEtapa(null)
    }
  }

  const textoBotao = {
    enviando: 'Processando…',
    banco: 'Aguardando a confirmação do banco…',
    confirmando: 'Confirmando o pagamento…',
  }[etapa]

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div>
        <label htmlFor="cartao" className="mb-1.5 block text-sm font-medium">
          Dados do cartão
        </label>
        <div
          id="cartao"
          className="rounded-controle border border-input bg-superficie px-3 py-3.5 transition-colors focus-within:border-marca"
        >
          <CardElement
            options={estilo}
            onChange={(ev) => {
              setCompleto(ev.complete)
              setErro(ev.error?.message ?? null)
            }}
          />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-texto-suave">
          <Lock className="size-3.5" aria-hidden="true" />
          Os dados do cartão vão direto para a Stripe. A loja não os recebe nem guarda.
        </p>
      </div>

      {stripeModoTeste && <CartoesDeTeste />}

      {erro && (
        <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-4 py-3 text-sm text-vendido">
          {erro}
        </p>
      )}

      <Button type="submit" tamanho="lg" disabled={!stripe || !completo || Boolean(etapa)}>
        {textoBotao ?? `Pagar ${moeda(compra.valorTotal, { centavos: true })}`}
      </Button>
    </form>
  )
}

// Só aparece com chave pk_test_: os números públicos de teste da Stripe
function CartoesDeTeste() {
  return (
    <details className="rounded-controle border border-dashed px-4 py-3 text-sm">
      <summary className="cursor-pointer font-medium">Cartões de teste (modo de testes da Stripe)</summary>
      <ul className="tipo-dado mt-2 flex flex-col gap-1 text-texto-suave">
        <li>4242 4242 4242 4242: aprovado</li>
        <li>4000 0027 6000 3184: pede confirmação do banco (3D Secure)</li>
        <li>4000 0000 0000 9995: recusado por saldo</li>
        <li>Validade futura qualquer e CVC de 3 dígitos</li>
      </ul>
    </details>
  )
}
