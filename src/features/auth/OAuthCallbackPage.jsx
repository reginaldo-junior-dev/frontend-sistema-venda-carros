import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { useTitulo } from '@/lib/useTitulo'
import { destinoAposEntrar } from './destino'
import { useAuth } from './useAuth'

// Destino do login Google: a API redireciona para cá com ?token=
export default function OAuthCallbackPage() {
  useTitulo('Entrando com Google')
  const [params] = useSearchParams()
  const { entrarComToken } = useAuth()
  const navigate = useNavigate()
  const tratado = useRef(false)

  useEffect(() => {
    if (tratado.current) return
    tratado.current = true
    const sessao = entrarComToken(params.get('token') ?? '')
    if (sessao) {
      toast.success('Você entrou com sua conta Google.')
      navigate(destinoAposEntrar(null, sessao.perfil), { replace: true })
    } else {
      toast.error('Não foi possível entrar com o Google. Tente de novo ou use e-mail e senha.')
      navigate('/entrar', { replace: true })
    }
  }, [params, entrarComToken, navigate])

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-lead text-texto-suave">Entrando com Google…</h1>
    </div>
  )
}
