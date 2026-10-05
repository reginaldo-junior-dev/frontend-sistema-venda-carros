import { loadStripe } from '@stripe/stripe-js'

const CHAVE = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export const stripeConfigurada = Boolean(CHAVE)
export const stripeModoTeste = Boolean(CHAVE?.startsWith('pk_test_'))

// O script da Stripe só é baixado quando alguém abre o pagamento
let promessa = null
export function obterStripe() {
  if (!CHAVE) return null
  promessa ??= loadStripe(CHAVE, { locale: 'pt-BR' })
  return promessa
}
