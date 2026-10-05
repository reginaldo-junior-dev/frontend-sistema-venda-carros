import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'
import NaoEncontrada from './NaoEncontrada'

// Captura erros de renderização e de carregamento de rotas (inclusive chunk lazy que falhou)
export default function ErroRota() {
  const erro = useRouteError()
  if (isRouteErrorResponse(erro) && erro.status === 404) return <NaoEncontrada />

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="tipo-emblema text-h2">A página não carregou.</h1>
      <p className="max-w-[50ch] text-texto-suave">
        Recarregue para tentar de novo. Se continuar, volte ao início e navegue até aqui outra vez.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => window.location.reload()}>Recarregar</Button>
        <Button asChild variante="secundaria">
          <Link to="/">Ir para o início</Link>
        </Button>
      </div>
    </div>
  )
}
