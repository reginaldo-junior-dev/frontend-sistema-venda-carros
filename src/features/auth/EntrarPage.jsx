import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputSenha } from '@/components/ui/input-senha'
import { Campo } from '@/components/shared/Campo'
import { AuthLayout } from './AuthLayout'
import { BotaoGoogle, Separador } from './BotaoGoogle'
import { destinoAposEntrar } from './destino'
import { useAuth } from './useAuth'

const esquema = z.object({
  email: z.email('Informe um e-mail válido, como nome@exemplo.com'),
  senha: z.string().min(1, 'Informe sua senha'),
})

export default function EntrarPage() {
  const { estaLogado, perfil, entrar } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const voltar = params.get('voltar')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { email: '', senha: '' } })

  // Já logado (ou acabou de entrar): mesmo destino do envio do formulário
  if (estaLogado) return <Navigate to={destinoAposEntrar(voltar, perfil)} replace />

  async function enviar(valores) {
    try {
      const conta = await entrar(valores)
      toast.success('Você entrou na sua conta.')
      navigate(destinoAposEntrar(voltar, conta.perfil), { replace: true })
    } catch (erro) {
      // Credenciais erradas voltam como 401/403, sem dizer qual campo errou
      setError('root', {
        message:
          erro.status === 401 || erro.status === 403 ? 'E-mail ou senha incorretos. Confira e tente de novo.' : erro.message,
      })
    }
  }

  return (
    <AuthLayout titulo="Entre na sua conta" descricao="Para reservar carros, salvar favoritos e acompanhar suas compras.">
      <BotaoGoogle />
      <Separador />
      <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-5">
        {errors.root && (
          <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-4 py-3 text-vendido">
            {errors.root.message}
          </p>
        )}
        <Campo rotulo="E-mail" erro={errors.email?.message}>
          {(props) => <Input {...props} type="email" autoComplete="email" {...register('email')} />}
        </Campo>
        <Campo rotulo="Senha" erro={errors.senha?.message}>
          {(props) => <InputSenha {...props} autoComplete="current-password" {...register('senha')} />}
        </Campo>
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <p className="text-texto-suave">
        Ainda não tem conta?{' '}
        <Link
          to={voltar ? `/criar-conta?voltar=${encodeURIComponent(voltar)}` : '/criar-conta'}
          className="font-semibold text-marca underline-offset-4 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  )
}
