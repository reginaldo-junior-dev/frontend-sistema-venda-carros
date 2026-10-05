import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/shared/Campo'
import { useAuth } from '@/features/auth/useAuth'
import { useMeuCliente } from '@/features/cliente/hooks'
import { soDigitos, telefone as mascaraTelefone } from '@/lib/format'
import { telefoneValido } from '@/lib/validacao'
import { useRegistrarInteresse } from './hooks'

const esquema = z.object({
  nome: z.string().trim().min(1, 'Informe seu nome').max(150, 'Use no máximo 150 caracteres'),
  email: z.email('Informe um e-mail válido, como nome@exemplo.com'),
  telefone: z.string().refine(telefoneValido, 'Informe o telefone com DDD, como (11) 98765-4321'),
  mensagem: z.string().trim().min(1, 'Escreva uma mensagem para a equipe').max(500, 'Use no máximo 500 caracteres'),
})

// Contato com a equipe sobre um carro; os campos vêm preenchidos com os dados da conta
export function InteresseDialog({ aberto, aoMudarAberto, carroId, nomeCarro }) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="tipo-emblema text-h3">Falar com a equipe</DialogTitle>
          <DialogDescription>
            Sobre o {nomeCarro}. A equipe responde pelo telefone ou e-mail que você informar.
          </DialogDescription>
        </DialogHeader>
        {aberto && <Formulario carroId={carroId} nomeCarro={nomeCarro} aoConcluir={() => aoMudarAberto(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function Formulario({ carroId, nomeCarro, aoConcluir }) {
  const { usuario } = useAuth()
  const { data: cliente } = useMeuCliente()
  const registrar = useRegistrarInteresse(carroId)
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      nome: usuario?.nomeCompleto ?? '',
      email: usuario?.email ?? '',
      telefone: cliente?.telefone ? mascaraTelefone(cliente.telefone) : '',
      mensagem: `Olá! Tenho interesse no ${nomeCarro}. Ele ainda está disponível? Gostaria de agendar uma visita.`,
    },
  })
  const tamanhoMensagem = useWatch({ control, name: 'mensagem' })?.length ?? 0

  async function enviar(valores) {
    try {
      await registrar.mutateAsync({ ...valores, telefone: soDigitos(valores.telefone) })
      toast.success('Interesse enviado. A equipe vai entrar em contato.')
      aoConcluir()
    } catch (erro) {
      if (erro.campos && Object.keys(erro.campos).length) {
        Object.entries(erro.campos).forEach(([campo, mensagem]) => setError(campo, { message: mensagem }))
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
      <Campo rotulo="Nome" erro={errors.nome?.message}>
        {(props) => <Input {...props} autoComplete="name" {...register('nome')} />}
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="E-mail" erro={errors.email?.message}>
          {(props) => <Input {...props} type="email" autoComplete="email" {...register('email')} />}
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
      </div>
      <Campo rotulo="Mensagem" erro={errors.mensagem?.message} ajuda={`${tamanhoMensagem} de 500 caracteres`}>
        {(props) => (
          <textarea
            {...props}
            rows={4}
            maxLength={500}
            className="w-full rounded-controle border border-input bg-superficie px-3 py-2.5 text-base outline-none focus-visible:border-marca focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-marca/40 aria-invalid:border-vendido"
            {...register('mensagem')}
          />
        )}
      </Campo>
      <Button type="submit" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Enviando…' : 'Enviar interesse'}
      </Button>
    </form>
  )
}
