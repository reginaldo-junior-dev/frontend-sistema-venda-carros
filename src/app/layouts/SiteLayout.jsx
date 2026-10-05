import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { Menu, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/useAuth'
import { CadastroClienteProvider } from '@/features/cliente/CadastroClienteProvider'
import { useTema } from '@/lib/tema'
import { cn } from '@/lib/utils'
import { FocoNaRota } from './FocoNaRota'
import { Logo } from './Logo'
import { MenuConta } from './MenuConta'

const linkNav = ({ isActive }) =>
  cn(
    'relative py-2 font-medium text-texto-suave transition-colors hover:text-texto',
    'group-data-sobre-hero/cab:text-white/80 group-data-sobre-hero/cab:hover:text-white',
    isActive && 'text-texto after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:bg-marca',
  )

export function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-controle bg-marca px-4 py-2 text-marca-texto focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" className="flex-1">
        <CadastroClienteProvider>
          <Outlet />
        </CadastroClienteProvider>
      </main>
      <Rodape />
      <ScrollRestoration />
      <FocoNaRota />
    </div>
  )
}

// Na home o cabeçalho fica transparente sobre a foto até a página rolar
function useSobreHero() {
  const { pathname } = useLocation()
  const naHome = pathname === '/'
  const [rolou, setRolou] = useState(false)

  useEffect(() => {
    if (!naHome) return
    const aoRolar = () => setRolou(window.scrollY > 24)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [naHome])

  return naHome && !rolou
}

function Cabecalho() {
  const { estaLogado } = useAuth()
  const [menuAberto, setMenuAberto] = useState(false)
  const sobreHero = useSobreHero()

  return (
    <header
      data-sobre-hero={sobreHero || undefined}
      className={cn(
        'group/cab sticky top-0 z-40 border-b transition-[background-color,border-color,color] duration-300',
        sobreHero ? 'border-transparent bg-transparent text-white' : 'bg-fundo/85 backdrop-blur-md',
      )}
    >
      {/* Faixa azul da placa Mercosul: a assinatura do site */}
      <div aria-hidden="true" className="h-1.5 bg-mercosul" />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-6 md:flex">
          <NavLink to="/carros" className={linkNav}>
            Carros
          </NavLink>
          {estaLogado && (
            <NavLink to="/conta/favoritos" className={linkNav}>
              Favoritos
            </NavLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <BotaoTema />
          <div className="hidden md:block">
            {estaLogado ? (
              <MenuConta />
            ) : (
              <Button asChild tamanho="sm">
                <Link to="/entrar">Entrar</Link>
              </Button>
            )}
          </div>
          <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
            <SheetTrigger asChild>
              <Button variante="fantasma" tamanho="icone" className="md:hidden group-data-sobre-hero/cab:text-white group-data-sobre-hero/cab:hover:bg-white/10" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,85vw)] px-5 pt-14">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <MenuCelular aoNavegar={() => setMenuAberto(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function MenuCelular({ aoNavegar }) {
  const { estaLogado, ehAdmin, usuario, sair } = useAuth()
  const item = ({ isActive }) =>
    cn(
      'block rounded-controle px-3 py-3 text-lead font-medium',
      isActive ? 'bg-marca-suave text-marca' : 'hover:bg-superficie-funda',
    )

  return (
    <nav aria-label="Principal" className="flex flex-col gap-1" onClick={(e) => e.target.closest('a') && aoNavegar()}>
      {usuario && <p className="mb-3 truncate px-3 text-texto-suave">Olá, {usuario.nomeCompleto.split(' ')[0]}</p>}
      <NavLink to="/carros" className={item}>
        Carros
      </NavLink>
      {estaLogado ? (
        <>
          <NavLink to="/conta/favoritos" className={item}>
            Favoritos
          </NavLink>
          <NavLink to="/conta/compras" className={item}>
            Minhas compras
          </NavLink>
          <NavLink to="/conta" end className={item}>
            Meus dados
          </NavLink>
          {ehAdmin && (
            <NavLink to="/admin" className={item}>
              Painel da revenda
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => {
              sair()
              aoNavegar()
            }}
            className="mt-4 rounded-controle px-3 py-3 text-left text-lead font-medium text-vendido hover:bg-superficie-funda"
          >
            Sair
          </button>
        </>
      ) : (
        <Button asChild className="mt-4">
          <Link to="/entrar">Entrar</Link>
        </Button>
      )}
    </nav>
  )
}

function BotaoTema() {
  const { escuro, alternar } = useTema()
  return (
    <Button
      variante="fantasma"
      tamanho="icone"
      className="group-data-sobre-hero/cab:text-white group-data-sobre-hero/cab:hover:bg-white/10"
      onClick={alternar}
      aria-label={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      {escuro ? <Sun /> : <Moon />}
    </Button>
  )
}

function Rodape() {
  const link = 'text-white/60 transition-colors hover:text-white'
  return (
    <footer className="mt-28 bg-asfalto text-white dark:bg-[#101417]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        <div className="flex flex-col items-start gap-4">
          <Logo />
          <p className="max-w-[40ch] text-white/60">
            Carros novos e usados com procedência. Reserve online e pague com Pix, boleto ou cartão.
          </p>
        </div>
        <nav aria-label="Comprar" className="flex flex-col gap-2">
          <p className="font-semibold">Comprar</p>
          <Link to="/carros" className={link}>
            Todos os carros
          </Link>
          <Link to="/carros?condicao=NOVO" className={link}>
            Zero quilômetro
          </Link>
          <Link to="/carros?condicao=USADO" className={link}>
            Seminovos
          </Link>
        </nav>
        <nav aria-label="Sua conta" className="flex flex-col gap-2">
          <p className="font-semibold">Sua conta</p>
          <Link to="/conta/compras" className={link}>
            Minhas compras
          </Link>
          <Link to="/conta/favoritos" className={link}>
            Favoritos
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-sm text-white/50 sm:px-6 lg:px-8">
          Pagamentos com cartão processados pela Stripe. O Pátio não guarda os dados do seu cartão.
        </p>
      </div>
    </footer>
  )
}
