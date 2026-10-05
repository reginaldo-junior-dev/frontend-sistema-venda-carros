import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Plaqueta } from '@/components/shared/Plaqueta'

export default function NaoEncontrada() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:px-8">
      <Plaqueta tamanho="lg">404</Plaqueta>
      <h1 className="tipo-emblema text-h1">Esta página não está no pátio.</h1>
      <p className="max-w-[50ch] text-lead text-texto-suave">
        O endereço pode ter mudado ou o carro já foi vendido. Veja os carros disponíveis agora.
      </p>
      <Button asChild>
        <Link to="/carros">Ver carros disponíveis</Link>
      </Button>
    </div>
  )
}
