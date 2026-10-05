import { useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion } from 'motion/react'
import { LoaderCircle, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Campo } from '@/components/shared/Campo'
import { EstadoErro } from '@/components/shared/Estados'
import { cep as mascaraCep, soDigitos } from '@/lib/format'
import { buscarCep } from './enderecosApi'
import { useEnderecos, useExcluirEndereco, useSalvarEndereco } from './hooks'

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

export function Enderecos() {
  const consulta = useEnderecos()
  const [editando, setEditando] = useState(null) // null = fechado, {} = novo, endereço = edição
  const [excluindo, setExcluindo] = useState(null)
  const salvar = useSalvarEndereco()

  if (consulta.isPending) return <div className="h-32 animate-pulse rounded-foto bg-superficie-funda" />
  if (consulta.isError) return <EstadoErro erro={consulta.error} aoTentarDeNovo={consulta.refetch} />

  // Principal sempre primeiro
  const enderecos = [...consulta.data].sort((a, b) => Number(b.principal) - Number(a.principal))

  function tornarPrincipal(endereco) {
    salvar.mutate(
      { ...endereco, principal: true },
      {
        onSuccess: () => toast.success('Endereço principal atualizado.'),
        onError: (erro) => toast.error(erro.message),
      },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {enderecos.length === 0 ? (
        <p className="text-texto-suave">Nenhum endereço cadastrado ainda.</p>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {enderecos.map((e) => (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col gap-3 rounded-foto border bg-superficie p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-marca" aria-hidden="true" />
                    <address className="not-italic">
                      <span className="block font-semibold">
                        {e.logradouro}, {e.numero}
                        {e.complemento ? ` - ${e.complemento}` : ''}
                      </span>
                      <span className="block text-texto-suave">
                        {e.bairro}, {e.cidade} - {e.estado}
                      </span>
                      <span className="tipo-dado block text-texto-suave">CEP {mascaraCep(e.cep)}</span>
                    </address>
                  </div>
                  {e.principal && <Badge tom="marca">Principal</Badge>}
                </div>
                <div className="flex flex-wrap gap-1 border-t pt-3">
                  <Button variante="fantasma" tamanho="sm" onClick={() => setEditando(e)}>
                    <Pencil /> Editar
                  </Button>
                  {!e.principal && (
                    <Button variante="fantasma" tamanho="sm" onClick={() => tornarPrincipal(e)} disabled={salvar.isPending}>
                      Tornar principal
                    </Button>
                  )}
                  <Button variante="fantasma" tamanho="sm" className="ml-auto text-vendido" onClick={() => setExcluindo(e)}>
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <Button variante="secundaria" className="self-start" onClick={() => setEditando({})}>
        <Plus /> Adicionar endereço
      </Button>

      <Dialog open={Boolean(editando)} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-h3">{editando?.id ? 'Editar endereço' : 'Novo endereço'}</DialogTitle>
            <DialogDescription>Digite o CEP para preencher rua, bairro e cidade automaticamente.</DialogDescription>
          </DialogHeader>
          {editando && (
            <FormularioEndereco
              endereco={editando}
              primeiro={enderecos.length === 0}
              aoConcluir={() => setEditando(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmarExclusao endereco={excluindo} aoFechar={() => setExcluindo(null)} />
    </div>
  )
}

const esquema = z.object({
  cep: z.string().refine((v) => soDigitos(v).length === 8, 'O CEP tem 8 números'),
  logradouro: z.string().trim().min(1, 'Informe a rua').max(100, 'Use no máximo 100 caracteres'),
  numero: z.string().trim().min(1, 'Informe o número (use S/N se não houver)').max(10, 'Use no máximo 10 caracteres'),
  complemento: z.string().trim().max(50, 'Use no máximo 50 caracteres'),
  bairro: z.string().trim().min(1, 'Informe o bairro').max(100, 'Use no máximo 100 caracteres'),
  cidade: z.string().trim().min(1, 'Informe a cidade').max(100, 'Use no máximo 100 caracteres'),
  estado: z.string().length(2, 'Escolha o estado'),
  // Campo desabilitado chega vazio no React Hook Form; o envio completa o valor
  principal: z.boolean().optional(),
})

function FormularioEndereco({ endereco, primeiro, aoConcluir }) {
  const salvar = useSalvarEndereco()
  const [buscandoCep, setBuscandoCep] = useState(false)
  const ultimoCep = useRef(endereco.cep ?? '')
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      cep: endereco.cep ? mascaraCep(endereco.cep) : '',
      logradouro: endereco.logradouro ?? '',
      numero: endereco.numero ?? '',
      complemento: endereco.complemento ?? '',
      bairro: endereco.bairro ?? '',
      cidade: endereco.cidade ?? '',
      estado: endereco.estado ?? '',
      principal: endereco.principal ?? primeiro,
    },
  })

  async function aoCompletarCep(valor) {
    const digitos = soDigitos(valor)
    if (digitos.length !== 8 || digitos === ultimoCep.current) return
    ultimoCep.current = digitos
    setBuscandoCep(true)
    const achado = await buscarCep(digitos)
    setBuscandoCep(false)
    if (!achado) {
      setError('cep', { message: 'CEP não encontrado. Confira ou preencha o endereço à mão.' })
      return
    }
    for (const [campo, v] of Object.entries(achado)) if (v) setValue(campo, v, { shouldValidate: true })
    setFocus('numero')
  }

  async function enviar(valores) {
    try {
      await salvar.mutateAsync({
        ...valores,
        id: endereco.id,
        cep: soDigitos(valores.cep),
        complemento: valores.complemento || null,
        principal: travarPrincipal ? true : Boolean(valores.principal),
      })
      toast.success(endereco.id ? 'Endereço atualizado.' : 'Endereço adicionado.')
      aoConcluir()
    } catch (erro) {
      if (erro.campos && Object.keys(erro.campos).length) {
        Object.entries(erro.campos).forEach(([campo, mensagem]) => setError(campo, { message: mensagem }))
      } else {
        setError('root', { message: erro.message })
      }
    }
  }

  // O principal só deixa de ser principal quando outro endereço assume (regra da API)
  const travarPrincipal = primeiro || endereco.principal

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="grid gap-4 sm:grid-cols-6">
      {errors.root && (
        <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-3 py-2 text-sm text-vendido sm:col-span-6">
          {errors.root.message}
        </p>
      )}
      <div className="sm:col-span-2">
        <Controller
          name="cep"
          control={control}
          render={({ field }) => (
            <Campo rotulo="CEP" erro={errors.cep?.message}>
              {(props) => (
                <div className="relative">
                  <Input
                    {...props}
                    {...field}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="00000-000"
                    className="tipo-dado"
                    onChange={(e) => {
                      const v = mascaraCep(e.target.value)
                      field.onChange(v)
                      aoCompletarCep(v)
                    }}
                  />
                  {buscandoCep && (
                    <LoaderCircle
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-texto-suave"
                      aria-label="Buscando CEP"
                    />
                  )}
                </div>
              )}
            </Campo>
          )}
        />
      </div>
      <div className="sm:col-span-4">
        <Campo rotulo="Rua" erro={errors.logradouro?.message}>
          {(props) => <Input {...props} autoComplete="address-line1" {...register('logradouro')} />}
        </Campo>
      </div>
      <div className="sm:col-span-2">
        <Campo rotulo="Número" erro={errors.numero?.message}>
          {(props) => <Input {...props} autoComplete="address-line2" {...register('numero')} />}
        </Campo>
      </div>
      <div className="sm:col-span-4">
        <Campo rotulo="Complemento (opcional)" erro={errors.complemento?.message}>
          {(props) => <Input {...props} placeholder="Apto, bloco, casa" {...register('complemento')} />}
        </Campo>
      </div>
      <div className="sm:col-span-3">
        <Campo rotulo="Bairro" erro={errors.bairro?.message}>
          {(props) => <Input {...props} {...register('bairro')} />}
        </Campo>
      </div>
      <div className="sm:col-span-2">
        <Campo rotulo="Cidade" erro={errors.cidade?.message}>
          {(props) => <Input {...props} autoComplete="address-level2" {...register('cidade')} />}
        </Campo>
      </div>
      <div className="sm:col-span-1">
        <Controller
          name="estado"
          control={control}
          render={({ field }) => (
            <Campo rotulo="UF" erro={errors.estado?.message}>
              {(props) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger id={props.id} aria-invalid={props['aria-invalid']} className="w-full">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Campo>
          )}
        />
      </div>
      <label className="flex items-center gap-3 sm:col-span-6">
        <input
          type="checkbox"
          disabled={travarPrincipal}
          className="size-5 accent-[var(--marca)]"
          {...register('principal')}
        />
        <span>
          Usar como endereço principal
          {travarPrincipal && (
            <span className="block text-sm text-texto-suave">
              {primeiro ? 'O primeiro endereço é sempre o principal.' : 'Para trocar, marque outro endereço como principal.'}
            </span>
          )}
        </span>
      </label>
      <DialogFooter className="sm:col-span-6">
        <Button type="button" variante="secundaria" onClick={aoConcluir}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar endereço'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function ConfirmarExclusao({ endereco, aoFechar }) {
  const excluir = useExcluirEndereco()

  return (
    <Dialog open={Boolean(endereco)} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-h3">Excluir este endereço?</DialogTitle>
          <DialogDescription>
            {endereco && `${endereco.logradouro}, ${endereco.numero} - ${endereco.cidade}.`}
            {endereco?.principal && ' Outro endereço passa a ser o principal.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variante="secundaria" onClick={aoFechar}>
            Manter
          </Button>
          <Button
            variante="perigo"
            disabled={excluir.isPending}
            onClick={() =>
              excluir.mutate(endereco.id, {
                onSuccess: () => {
                  toast.success('Endereço excluído.')
                  aoFechar()
                },
                onError: (erro) => toast.error(erro.message),
              })
            }
          >
            {excluir.isPending ? 'Excluindo…' : 'Excluir endereço'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
