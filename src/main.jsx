import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { Providers } from './app/providers'
import { router } from './app/router'
// Archivo variável (peso e largura) servida pelo próprio site: sem depender do Google Fonts
import '@fontsource-variable/archivo/wdth.css'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
)
