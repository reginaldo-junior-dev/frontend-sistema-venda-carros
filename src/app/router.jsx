import { createBrowserRouter } from 'react-router'
import { RotaAdmin, RotaAutenticada } from '@/features/auth/guards'
import { AdminLayout } from './layouts/AdminLayout'
import { ContaLayout } from './layouts/ContaLayout'
import { SiteLayout } from './layouts/SiteLayout'
import { EmBreve } from './paginas/EmBreve'
import ErroRota from './paginas/ErroRota'
import NaoEncontrada from './paginas/NaoEncontrada'

// Carrega a página só quando a rota é visitada (o painel admin fica fora do bundle do comprador)
const pagina = (importar) => async () => ({ Component: (await importar()).default })

// Rotas das próximas fases, com um aviso no lugar da página
const emBreve = (titulo, fase, contida = true) => ({
  element: contida ? (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <EmBreve titulo={titulo} fase={fase} />
    </div>
  ) : (
    <EmBreve titulo={titulo} fase={fase} />
  ),
})

const rotasDev = import.meta.env.DEV ? [{ path: '_kit', lazy: pagina(() => import('./paginas/KitPage')) }] : []

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    errorElement: <ErroRota />,
    children: [
      {
        errorElement: <ErroRota />,
        children: [
          { index: true, lazy: pagina(() => import('@/features/catalogo/HomePage')) },
          { path: 'carros', lazy: pagina(() => import('@/features/catalogo/CatalogoPage')) },
          { path: 'carros/:id', lazy: pagina(() => import('@/features/catalogo/CarroDetalhePage')) },
          { path: 'entrar', lazy: pagina(() => import('@/features/auth/EntrarPage')) },
          { path: 'criar-conta', lazy: pagina(() => import('@/features/auth/CriarContaPage')) },
          { path: 'oauth/callback', lazy: pagina(() => import('@/features/auth/OAuthCallbackPage')) },
          { path: 'sem-acesso', lazy: pagina(() => import('./paginas/SemAcesso')) },
          {
            element: <RotaAutenticada />,
            children: [
              {
                path: 'conta',
                element: <ContaLayout />,
                children: [
                  { index: true, lazy: pagina(() => import('@/features/conta/MeusDadosPage')) },
                  { path: 'favoritos', lazy: pagina(() => import('@/features/conta/FavoritosPage')) },
                  { path: 'interesses', lazy: pagina(() => import('@/features/conta/InteressesPage')) },
                  { path: 'compras', lazy: pagina(() => import('@/features/compra/MinhasComprasPage')) },
                ],
              },
              {
                path: 'conta/compras/:id/pagamento',
                lazy: pagina(() => import('@/features/compra/PagamentoPage')),
              },
            ],
          },
          {
            element: <RotaAdmin />,
            children: [
              {
                path: 'admin',
                element: <AdminLayout />,
                children: [
                  { index: true, ...emBreve('Resumo da revenda', 5, false) },
                  { path: 'carros', ...emBreve('Estoque', 5, false) },
                  { path: 'carros/novo', ...emBreve('Novo carro', 5, false) },
                  { path: 'carros/:id', ...emBreve('Editar carro', 5, false) },
                  { path: 'cadastros', ...emBreve('Cadastros', 5, false) },
                  { path: 'vendas', ...emBreve('Vendas', 5, false) },
                  { path: 'interesses', ...emBreve('Interesses', 5, false) },
                  { path: 'usuarios', ...emBreve('Usuários', 5, false) },
                ],
              },
            ],
          },
          ...rotasDev,
          { path: '*', element: <NaoEncontrada /> },
        ],
      },
    ],
  },
])
