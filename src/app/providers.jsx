import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthContext'
import { queryClient } from '@/lib/query-client'
import { useTema } from '@/lib/tema'

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* reducedMotion="user": animações de transform viram só opacidade quando o sistema pede menos movimento */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Notificacoes />
      </AuthProvider>
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
