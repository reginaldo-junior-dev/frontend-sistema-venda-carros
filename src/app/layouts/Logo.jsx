import { Link } from 'react-router'
import { Plaqueta } from '@/components/shared/Plaqueta'

export function Logo() {
  return (
    // O nome acessível sai do texto visível ("Pátio") + o complemento só para leitor de tela
    <Link to="/" className="rounded-plaqueta">
      <Plaqueta tamanho="md" className="min-w-0 px-0.5">
        Pátio
      </Plaqueta>
      <span className="sr-only">, página inicial</span>
    </Link>
  )
}
