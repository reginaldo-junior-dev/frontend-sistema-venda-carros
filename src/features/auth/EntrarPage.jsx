import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from './useAuth'

const esquema = z.object({
  email: z.email('Informe um e-mail válido, como nome@exemplo.com'),
  senha: z.string().min(1, 'Informe sua senha'),
})

// Só aceita caminhos internos, para o ?voltar= não virar um redirecionamento externo
function destinoSeguro(voltar) {
  return voltar && voltar.startsWith('/') && !voltar.startsWith('//') ? voltar : '/'
}

export default function EntrarPage() {
  const { estaLogado, entrar } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const destino = destinoSeguro(params.get('voltar'))

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { email: '', senha: '' } })

  if (estaLogado) return <Navigate to={destino} replace />

  async function enviar(valores) {
    try {
      await entrar(valores)
      toast.success('Você entrou na sua conta.')
      navigate(destino, { replace: true })
    } catch (erro) {
      // A API responde 401/403 para credenciais erradas, sem detalhar o motivo
      if (erro.status === 401 || erro.status === 403) {
        setError('root', { message: 'E-mail ou senha incorretos. Confira e tente de novo.' })
      } else {
        setError('root', { message: erro.message })
      }
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-16 sm:py-24">
      <div className="flex flex-col gap-2">
        <h1 className="tipo-emblema text-h2">Entre na sua conta</h1>
        <p className="text-texto-suave">Para reservar carros, salvar favoritos e acompanhar suas compras.</p>
      </div>

      <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-5">
        {errors.root && (
          <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-4 py-3 text-vendido">
            {errors.root.message}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-erro' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-erro" className="text-sm text-vendido">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.senha)}
            aria-describedby={errors.senha ? 'senha-erro' : undefined}
            {...register('senha')}
          />
          {errors.senha && (
            <p id="senha-erro" className="text-sm text-vendido">
              {errors.senha.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="text-texto-suave">
        Ainda não tem conta?{' '}
        <Link to="/criar-conta" className="font-semibold text-marca underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
