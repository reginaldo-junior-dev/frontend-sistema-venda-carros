import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/utils'

const SECOES = [
  { para: '/admin', rotulo: 'Resumo', end: true },
  { para: '/admin/carros', rotulo: 'Estoque' },
  { para: '/admin/cadastros', rotulo: 'Cadastros' },
  { para: '/admin/vendas', rotulo: 'Vendas' },
  { para: '/admin/interesses', rotulo: 'Interesses' },
  { para: '/admin/usuarios', rotulo: 'Usuários' },
]

export function AdminLayout() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[14rem_1fr] lg:px-8">
      <nav aria-label="Painel da revenda" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <ul className="flex gap-1 lg:sticky lg:top-28 lg:flex-col">
          {SECOES.map((s) => (
            <li key={s.para}>
              <NavLink
                to={s.para}
                end={s.end}
                className={({ isActive }) =>
                  cn(
                    'block rounded-controle px-3 py-2 font-medium whitespace-nowrap',
                    isActive ? 'bg-marca-suave text-marca' : 'text-texto-suave hover:bg-superficie-funda hover:text-texto',
                  )
                }
              >
                {s.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
