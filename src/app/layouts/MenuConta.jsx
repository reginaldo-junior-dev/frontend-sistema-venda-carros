import { Link, useNavigate } from 'react-router'
import { Heart, LayoutDashboard, LogOut, Receipt, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/useAuth'

export function MenuConta() {
  const { usuario, ehAdmin, sair } = useAuth()
  const navigate = useNavigate()
  const primeiroNome = usuario?.nomeCompleto?.split(' ')[0] ?? 'Minha conta'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variante="secundaria" tamanho="sm">
          <UserRound />
          <span className="max-w-[12ch] truncate">{primeiroNome}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {usuario && (
          <>
            <DropdownMenuLabel className="font-normal">
              <span className="block truncate font-semibold">{usuario.nomeCompleto}</span>
              <span className="block truncate text-sm text-texto-suave">{usuario.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link to="/conta">
            <UserRound /> Meus dados
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/conta/favoritos">
            <Heart /> Favoritos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/conta/compras">
            <Receipt /> Minhas compras
          </Link>
        </DropdownMenuItem>
        {ehAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin">
                <LayoutDashboard /> Painel da revenda
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            sair()
            navigate('/')
          }}
        >
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
