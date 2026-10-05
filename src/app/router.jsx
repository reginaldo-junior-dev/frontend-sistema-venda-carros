import { createBrowserRouter } from 'react-router'
import { RotaAdmin, RotaAutenticada } from '@/features/auth/guards'
import { AdminLayout } from './layouts/AdminLayout'
import { ContaLayout } from './layouts/ContaLayout'
import { SiteLayout } from './layouts/SiteLayout'
import ErroRota from './paginas/ErroRota'
import NaoEncontrada from './paginas/NaoEncontrada'

// Carrega a página só quando a rota é visitada (o painel admin fica fora do bundle do comprador)
const pagina = (importar) => async () => ({ Component: (await importar()).default })

const rotasDev = import.meta.env.DEV ? [{ path: '_kit', lazy: pagina(() => import('./paginas/KitPage')) }] : []

export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    errorElement: <ErroRota />,
    // Primeira carga de uma rota sob demanda: tela neutra até o código chegar
    hydrateFallbackElement: <div className="min-h-dvh bg-fundo" />,
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
                  { index: true, lazy: pagina(() => import('@/features/admin/ResumoPage')) },
                  { path: 'carros', lazy: pagina(() => import('@/features/admin/EstoquePage')) },
                  { path: 'carros/novo', lazy: pagina(() => import('@/features/admin/carro/CarroFormPage')) },
                  { path: 'carros/:id', lazy: pagina(() => import('@/features/admin/carro/CarroFormPage')) },
                  { path: 'cadastros', lazy: pagina(() => import('@/features/admin/CadastrosPage')) },
                  { path: 'vendas', lazy: pagina(() => import('@/features/admin/vendas/VendasPage')) },
                  { path: 'interesses', lazy: pagina(() => import('@/features/admin/InteressesPage')) },
                  { path: 'usuarios', lazy: pagina(() => import('@/features/admin/UsuariosPage')) },
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
