import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/shared/Campo'
import { useAtualizarCliente } from '@/features/conta/hooks'
import { cpf as mascaraCpf, soDigitos, telefone as mascaraTelefone } from '@/lib/format'
import { cpfValido, telefoneValido } from '@/lib/validacao'
import { useCadastrarCliente } from './hooks'

const hoje = () => new Date().toISOString().slice(0, 10)

const esquema = z.object({
  cpf: z.string().refine(cpfValido, 'CPF inválido. Confira os 11 números.'),
  dataNascimento: z
    .string()
    .min(1, 'Informe sua data de nascimento')
    .refine((v) => v <= hoje(), 'A data de nascimento não pode ser no futuro'),
  telefone: z.string().refine(telefoneValido, 'Informe o telefone com DDD, como (11) 98765-4321'),
})

/**
 * Dados de comprador (CPF, nascimento, telefone). Sem `cliente` cria o cadastro;
 * com `cliente` atualiza o existente.
 */
export function FormularioCliente({ cliente, textoBotao, aoConcluir, className }) {
  const cadastrar = useCadastrarCliente()
  const atualizar = useAtualizarCliente()
  const {
    control,
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      cpf: cliente ? mascaraCpf(cliente.cpf) : '',
      dataNascimento: cliente?.dataNascimento ?? '',
      telefone: cliente ? mascaraTelefone(cliente.telefone) : '',
    },
  })

  async function enviar(valores) {
    const dados = {
      cpf: soDigitos(valores.cpf),
      dataNascimento: valores.dataNascimento,
      telefone: soDigitos(valores.telefone),
    }
    try {
      const salvo = cliente ? await atualizar.mutateAsync(dados) : await cadastrar.mutateAsync(dados)
      // O formulário passa a considerar os valores salvos como o novo ponto de partida
      reset(valores)
      aoConcluir?.(salvo)
    } catch (erro) {
      if (erro.campos && Object.keys(erro.campos).length) {
        Object.entries(erro.campos).forEach(([campo, mensagem]) => setError(campo, { message: mensagem }))
      } else if (erro.status === 409 && /cpf/i.test(erro.message)) {
        setError('cpf', { message: 'Este CPF já está cadastrado em outra conta.' })
      } else {
        setError('root', { message: erro.message })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className={className ?? 'flex flex-col gap-4'}>
      {errors.root && (
        <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-3 py-2 text-sm text-vendido">
          {errors.root.message}
        </p>
      )}
      <Controller
        name="cpf"
        control={control}
        render={({ field }) => (
          <Campo rotulo="CPF" erro={errors.cpf?.message}>
            {(props) => (
              <Input
                {...props}
                {...field}
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                onChange={(e) => field.onChange(mascaraCpf(e.target.value))}
              />
            )}
          </Campo>
        )}
      />
      <Campo rotulo="Data de nascimento" erro={errors.dataNascimento?.message}>
        {(props) => <Input {...props} type="date" max={hoje()} autoComplete="bday" {...register('dataNascimento')} />}
      </Campo>
      <Controller
        name="telefone"
        control={control}
        render={({ field }) => (
          <Campo rotulo="Telefone" erro={errors.telefone?.message}>
            {(props) => (
              <Input
                {...props}
                {...field}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 98765-4321"
                onChange={(e) => field.onChange(mascaraTelefone(e.target.value))}
              />
            )}
          </Campo>
        )}
      />
      <Button type="submit" disabled={isSubmitting || (cliente && !isDirty)} className="mt-2 self-start">
        {isSubmitting ? 'Salvando…' : textoBotao}
      </Button>
    </form>
  )
}
