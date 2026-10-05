import { Link } from 'react-router'
import { Plaqueta } from '@/components/shared/Plaqueta'

export function Logo() {
  return (
    <Link to="/" aria-label="Pátio, página inicial" className="rounded-plaqueta">
      <Plaqueta tamanho="md" className="min-w-0 px-0.5">
        Pátio
      </Plaqueta>
    </Link>
  )
}
