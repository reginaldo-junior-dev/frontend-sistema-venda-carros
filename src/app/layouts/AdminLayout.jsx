import { NavLink, Outlet } from 'react-router'
import { CarFront, LayoutDashboard, MessagesSquare, Receipt, Tags, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const SECOES = [
  { para: '/admin', rotulo: 'Resumo', icone: LayoutDashboard, end: true },
  { para: '/admin/carros', rotulo: 'Estoque', icone: CarFront },
  { para: '/admin/vendas', rotulo: 'Vendas', icone: Receipt },
  { para: '/admin/interesses', rotulo: 'Interesses', icone: MessagesSquare },
  { para: '/admin/cadastros', rotulo: 'Cadastros', icone: Tags },
  { para: '/admin/usuarios', rotulo: 'Usuários', icone: Users },
]

export function AdminLayout() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[13rem_1fr] lg:px-8">
      <nav aria-label="Painel da revenda" className="-mx-4 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:self-start lg:px-0">
        <p className="mb-3 hidden text-sm font-semibold text-texto-suave lg:block">Painel da revenda</p>
        <ul className="flex gap-1 lg:flex-col">
          {SECOES.map(({ para, rotulo, icone: Icone, end }) => (
            <li key={para}>
              <NavLink
                to={para}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-controle px-3 py-2 font-medium whitespace-nowrap transition-colors',
                    isActive ? 'bg-marca text-marca-texto' : 'text-texto-suave hover:bg-superficie-funda hover:text-texto',
                  )
                }
              >
                <Icone className="size-4.5" aria-hidden="true" />
                {rotulo}
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
