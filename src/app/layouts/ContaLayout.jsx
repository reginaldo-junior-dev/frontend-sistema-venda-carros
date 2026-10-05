import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/utils'

const SECOES = [
  { para: '/conta', rotulo: 'Meus dados', end: true },
  { para: '/conta/favoritos', rotulo: 'Favoritos' },
  { para: '/conta/interesses', rotulo: 'Interesses' },
  { para: '/conta/compras', rotulo: 'Compras' },
]

export function ContaLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <nav aria-label="Área do cliente" className="-mx-4 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-6">
          {SECOES.map((s) => (
            <li key={s.para}>
              <NavLink
                to={s.para}
                end={s.end}
                className={({ isActive }) =>
                  cn(
                    'block border-b-2 py-4 font-medium whitespace-nowrap',
                    isActive ? 'border-marca text-texto' : 'border-transparent text-texto-suave hover:text-texto',
                  )
                }
              >
                {s.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </div>
  )
}
