import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputSenha } from '@/components/ui/input-senha'
import { Campo } from '@/components/shared/Campo'
import { cn } from '@/lib/utils'
import { criarConta } from './api'
import { AuthLayout } from './AuthLayout'
import { BotaoGoogle, Separador } from './BotaoGoogle'
import { destinoSeguro } from './destino'
import { useAuth } from './useAuth'

// A API aceita até 72 caracteres (limite do BCrypt); o mínimo é regra do front
const esquema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo').max(150, 'Use no máximo 150 caracteres'),
  email: z.email('Informe um e-mail válido, como nome@exemplo.com').max(150, 'Use no máximo 150 caracteres'),
  senha: z.string().min(8, 'Use pelo menos 8 caracteres').max(72, 'Use no máximo 72 caracteres'),
})

export default function CriarContaPage() {
  const { estaLogado, entrar } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const voltar = params.get('voltar')
  const destino = destinoSeguro(voltar)

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { nomeCompleto: '', email: '', senha: '' } })
  const senha = useWatch({ control, name: 'senha' }) ?? ''

  if (estaLogado) return <Navigate to={destino} replace />

  async function enviar(valores) {
    try {
      await criarConta(valores)
    } catch (erro) {
      if (erro.campos && Object.keys(erro.campos).length) {
        Object.entries(erro.campos).forEach(([campo, mensagem]) => setError(campo, { message: mensagem }))
      } else if (erro.status === 409) {
        setError('email', { message: 'Já existe uma conta com este e-mail. Entre com ele ou use outro.' })
      } else {
        setError('root', { message: erro.message })
      }
      return
    }

    // Conta criada: entra direto, sem pedir o login de novo
    try {
      await entrar({ email: valores.email, senha: valores.senha })
      toast.success(`Conta criada. Boas-vindas, ${valores.nomeCompleto.trim().split(' ')[0]}!`)
      navigate(destino, { replace: true })
    } catch {
      toast.success('Conta criada. Entre com seu e-mail e senha.')
      navigate(`/entrar${voltar ? `?voltar=${encodeURIComponent(voltar)}` : ''}`, { replace: true })
    }
  }

  return (
    <AuthLayout titulo="Crie sua conta" descricao="Leva menos de um minuto. Você recebe um e-mail de boas-vindas.">
      <BotaoGoogle>Criar conta com Google</BotaoGoogle>
      <Separador />
      <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-5">
        {errors.root && (
          <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-4 py-3 text-vendido">
            {errors.root.message}
          </p>
        )}
        <Campo rotulo="Nome completo" erro={errors.nomeCompleto?.message}>
          {(props) => <Input {...props} autoComplete="name" {...register('nomeCompleto')} />}
        </Campo>
        <Campo rotulo="E-mail" erro={errors.email?.message}>
          {(props) => <Input {...props} type="email" autoComplete="email" {...register('email')} />}
        </Campo>
        <Campo rotulo="Senha" erro={errors.senha?.message}>
          {(props) => <InputSenha {...props} autoComplete="new-password" {...register('senha')} />}
        </Campo>
        <ForcaSenha senha={senha} />
        <Button type="submit" disabled={isSubmitting} className="mt-1">
          {isSubmitting ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
      <p className="text-texto-suave">
        Já tem conta?{' '}
        <Link
          to={voltar ? `/entrar?voltar=${encodeURIComponent(voltar)}` : '/entrar'}
          className="font-semibold text-marca underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}

// Indicador simples: tamanho, mistura de letras e números, símbolo
function ForcaSenha({ senha }) {
  if (!senha) return null
  const pontos = [senha.length >= 8, senha.length >= 12, /[a-z]/i.test(senha) && /\d/.test(senha), /[^a-z0-9]/i.test(senha)].filter(Boolean).length
  const nivel = pontos <= 1 ? 0 : pontos <= 3 ? 1 : 2
  const rotulos = ['Senha fraca', 'Senha razoável', 'Senha forte']
  const cores = ['bg-vendido', 'bg-sinal', 'bg-livre']

  return (
    <div className="-mt-2 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= nivel ? cores[nivel] : 'bg-borda')} />
        ))}
      </div>
      <span className="text-sm text-texto-suave">{rotulos[nivel]}</span>
    </div>
  )
}
