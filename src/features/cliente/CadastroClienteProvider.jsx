import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/shared/Campo'
import { useAuth } from '@/features/auth/useAuth'
import { cpf as mascaraCpf, soDigitos, telefone as mascaraTelefone } from '@/lib/format'
import { cpfValido, telefoneValido } from '@/lib/validacao'
import * as api from './api'
import { CadastroClienteContext } from './contexto'
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

export function CadastroClienteProvider({ children }) {
  const { estaLogado } = useAuth()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const queryClient = useQueryClient()
  const [pendente, setPendente] = useState(null)

  const exigirCliente = useCallback(
    async (acao, motivo) => {
      if (!estaLogado) {
        navigate(`/entrar?voltar=${encodeURIComponent(pathname + search)}`)
        return
      }
      const cliente = await queryClient.ensureQueryData({ queryKey: ['me', 'cliente'], queryFn: api.buscarMeuCliente })
      if (cliente) return acao()
      setPendente({ acao, motivo })
    },
    [estaLogado, navigate, pathname, search, queryClient],
  )

  const valor = useMemo(() => ({ exigirCliente }), [exigirCliente])

  function concluir() {
    const acao = pendente?.acao
    setPendente(null)
    acao?.()
  }

  return (
    <CadastroClienteContext value={valor}>
      {children}
      <Dialog open={Boolean(pendente)} onOpenChange={(aberto) => !aberto && setPendente(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="tipo-emblema text-h3">Complete seu cadastro</DialogTitle>
            <DialogDescription>
              {pendente?.motivo ?? 'Para continuar,'} precisamos de alguns dados de comprador. Você só faz isso uma vez.
            </DialogDescription>
          </DialogHeader>
          {pendente && <FormularioCliente aoConcluir={concluir} />}
        </DialogContent>
      </Dialog>
    </CadastroClienteContext>
  )
}

function FormularioCliente({ aoConcluir }) {
  const cadastrar = useCadastrarCliente()
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { cpf: '', dataNascimento: '', telefone: '' } })

  async function enviar(valores) {
    try {
      await cadastrar.mutateAsync({
        cpf: soDigitos(valores.cpf),
        dataNascimento: valores.dataNascimento,
        telefone: soDigitos(valores.telefone),
      })
      aoConcluir()
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
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
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
      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Salvando…' : 'Salvar e continuar'}
      </Button>
    </form>
  )
}
