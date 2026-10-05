import { lazy, Suspense } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthContext'
import { queryClient } from '@/lib/query-client'
import { useTema } from '@/lib/tema'

const Devtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : () => null

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* reducedMotion="user": animações de transform viram só opacidade quando o sistema pede menos movimento */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Notificacoes />
      </AuthProvider>
      <Suspense>
        <Devtools buttonPosition="bottom-left" />
      </Suspense>
    </QueryClientProvider>
  )
}

function Notificacoes() {
  const { escuro } = useTema()
  return (
    <Toaster
      theme={escuro ? 'dark' : 'light'}
      position="bottom-center"
      toastOptions={{
        className: '!rounded-controle !border-borda !bg-superficie !text-texto !font-sans',
      }}
    />
  )
}
