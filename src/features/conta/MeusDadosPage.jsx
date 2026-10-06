import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { InputSenha } from '@/components/ui/input-senha'
import { Campo } from '@/components/shared/Campo'
import { useAuth } from '@/features/auth/useAuth'
import { FormularioCliente } from '@/features/cliente/FormularioCliente'
import { useMeuCliente } from '@/features/cliente/hooks'
import { useTitulo } from '@/lib/useTitulo'
import { Enderecos } from './Enderecos'
import { useAtualizarMe, useExcluirMe } from './hooks'

export default function MeusDadosPage() {
  useTitulo('Meus dados')
  const { usuario } = useAuth()
  const cliente = useMeuCliente()

  return (
    <div className="flex flex-col py-10">
      <h1 className="tipo-emblema mb-2 text-h2">Meus dados</h1>
      <p className="mb-6 text-texto-suave">Seus dados de acesso, de comprador e de entrega.</p>

      <Secao titulo="Dados de acesso" descricao="Nome e e-mail usados para entrar e para receber os avisos das suas compras.">
        {usuario ? <FormularioAcesso usuario={usuario} /> : <Carregando />}
      </Secao>

      <Secao
        titulo="Dados de comprador"
        descricao="Necessários para reservar, favoritar e falar com a equipe. O CPF aparece na nota da compra."
      >
        {cliente.isPending ? (
          <Carregando />
        ) : (
          <FormularioCliente
            key={cliente.data?.id ?? 'novo'}
            cliente={cliente.data}
            textoBotao={cliente.data ? 'Salvar dados de comprador' : 'Salvar e liberar a compra'}
            aoConcluir={() => toast.success('Dados de comprador salvos.')}
            className="flex max-w-md flex-col gap-4"
          />
        )}
      </Secao>

      <Secao titulo="Endereços" descricao="Onde a equipe combina a entrega do carro. O principal aparece primeiro.">
        {cliente.isPending ? (
          <Carregando />
        ) : cliente.data ? (
          <Enderecos />
        ) : (
          <p className="text-texto-suave">Preencha os dados de comprador acima para cadastrar endereços.</p>
        )}
      </Secao>

      <Secao titulo="Excluir conta" descricao="Apaga sua conta, seus dados de comprador, favoritos e endereços.">
        <ExcluirConta />
      </Secao>
    </div>
  )
}

// Seção de configuração: título e explicação à esquerda, conteúdo à direita
function Secao({ titulo, descricao, children }) {
  return (
    <section className="grid gap-6 border-t py-10 md:grid-cols-[17rem_1fr] md:gap-12">
      <div>
        <h2 className="text-lead font-semibold">{titulo}</h2>
        <p className="mt-1 text-sm text-texto-suave">{descricao}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

function Carregando() {
  return (
    <div aria-busy="true" className="flex max-w-md flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-11 animate-pulse rounded-controle bg-superficie-funda" />
      ))}
    </div>
  )
}

const esquemaAcesso = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo').max(150, 'Use no máximo 150 caracteres'),
  email: z.email('Informe um e-mail válido').max(150, 'Use no máximo 150 caracteres'),
  senha: z.string().min(1, 'Digite sua senha para salvar').max(72, 'Use no máximo 72 caracteres'),
})

function FormularioAcesso({ usuario }) {
  const atualizar = useAtualizarMe()
  const contaGoogle = usuario.provedor && usuario.provedor !== 'LOCAL'
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(esquemaAcesso),
    defaultValues: { nomeCompleto: usuario.nomeCompleto, email: usuario.email, senha: '' },
  })

  async function enviar(valores) {
    try {
      const salvo = await atualizar.mutateAsync(valores)
      reset({ nomeCompleto: salvo.nomeCompleto, email: salvo.email, senha: '' })
      toast.success('Dados de acesso salvos.')
    } catch (erro) {
      if (erro.campos && Object.keys(erro.campos).length) {
        Object.entries(erro.campos).forEach(([campo, mensagem]) => setError(campo, { message: mensagem }))
      } else if (erro.status === 409) {
        setError('email', { message: 'Este e-mail já é usado por outra conta.' })
      } else {
        setError('root', { message: erro.message })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex max-w-md flex-col gap-4">
      {errors.root && (
        <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-3 py-2 text-sm text-vendido">
          {errors.root.message}
        </p>
      )}
      <Campo rotulo="Nome completo" erro={errors.nomeCompleto?.message}>
        {(props) => <Input {...props} autoComplete="name" {...register('nomeCompleto')} />}
      </Campo>
      <Campo
        rotulo="E-mail"
        erro={errors.email?.message}
        ajuda={contaGoogle ? 'Conta vinculada ao Google: o e-mail não pode ser alterado.' : undefined}
      >
        {(props) => <Input {...props} type="email" autoComplete="email" readOnly={contaGoogle} {...register('email')} />}
      </Campo>
      {/* O back-end grava a senha enviada: digitar a atual mantém, digitar outra troca */}
      <Campo
        rotulo="Senha"
        erro={errors.senha?.message}
        ajuda={
          contaGoogle
            ? 'Crie uma senha para também poder entrar com e-mail e senha.'
            : 'Digite sua senha atual para salvar. Se digitar uma nova, ela passa a valer.'
        }
      >
        {(props) => <InputSenha {...props} autoComplete="current-password" {...register('senha')} />}
      </Campo>
      <Button type="submit" disabled={isSubmitting || !isDirty} className="mt-2 self-start">
        {isSubmitting ? 'Salvando…' : 'Salvar dados de acesso'}
      </Button>
    </form>
  )
}

function ExcluirConta() {
  const [aberto, setAberto] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const excluir = useExcluirMe()
  const { sair } = useAuth()
  const navigate = useNavigate()
  const PALAVRA = 'EXCLUIR'

  function confirmar() {
    excluir.mutate(undefined, {
      onSuccess: () => {
        sair()
        navigate('/', { replace: true })
        toast.success('Sua conta foi excluída.')
      },
    })
  }

  return (
    <>
      <Button variante="perigo" onClick={() => setAberto(true)}>
        Excluir minha conta
      </Button>
      <Dialog
        open={aberto}
        onOpenChange={(v) => {
          setAberto(v)
          if (!v) {
            setConfirmacao('')
            excluir.reset()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-h3">Excluir sua conta?</DialogTitle>
            <DialogDescription>
              Seus dados de comprador, favoritos, interesses e endereços serão apagados. Isso não pode ser desfeito. Contas com
              compras registradas não podem ser excluídas.
            </DialogDescription>
          </DialogHeader>
          {excluir.isError && (
            <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-3 py-2 text-sm text-vendido">
              {excluir.error.message}
            </p>
          )}
          <Campo rotulo={`Para confirmar, digite ${PALAVRA}`}>
            {(props) => (
              <Input {...props} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} autoComplete="off" />
            )}
          </Campo>
          <DialogFooter>
            <Button variante="secundaria" onClick={() => setAberto(false)}>
              Manter conta
            </Button>
            <Button variante="perigo" disabled={confirmacao !== PALAVRA || excluir.isPending} onClick={confirmar}>
              {excluir.isPending ? 'Excluindo…' : 'Excluir conta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
