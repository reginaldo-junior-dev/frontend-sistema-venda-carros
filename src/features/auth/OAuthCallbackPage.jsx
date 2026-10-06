import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useTitulo } from '@/lib/useTitulo'
import { destinoAposEntrar } from './destino'
import { useAuth } from './useAuth'

// Destino do login Google: a API já gravou o cookie da sessão (ou não, se o login falhou) e manda a pessoa para cá
export default function OAuthCallbackPage() {
  useTitulo('Entrando com Google')
  const { recarregarSessao } = useAuth()
  const navigate = useNavigate()
  const tratado = useRef(false)

  useEffect(() => {
    if (tratado.current) return
    tratado.current = true
    const falhou = () => {
      toast.error('Não foi possível entrar com o Google. Tente de novo ou use e-mail e senha.')
      navigate('/entrar', { replace: true })
    }
    recarregarSessao().then((conta) => {
      if (!conta) return falhou()
      toast.success('Você entrou com sua conta Google.')
      navigate(destinoAposEntrar(null, conta.perfil), { replace: true })
    }, falhou)
  }, [recarregarSessao, navigate])

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-lead text-texto-suave">Entrando com Google…</h1>
    </div>
  )
}
