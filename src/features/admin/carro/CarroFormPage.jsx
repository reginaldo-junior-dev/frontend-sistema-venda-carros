import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Segmentado } from '@/components/ui/segmentado'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Campo } from '@/components/shared/Campo'
import { EstadoErro } from '@/components/shared/Estados'
import { Plaqueta } from '@/components/shared/Plaqueta'
import { Preco } from '@/components/shared/Preco'
import { FotoCarro } from '@/features/catalogo/FotoCarro'
import { fotoPrincipal } from '@/features/catalogo/descrever'
import { useCarro, useLookups } from '@/features/catalogo/hooks'
import { CAMBIO, COMBUSTIVEL, STATUS_CARRO, TOM_STATUS_CARRO } from '@/lib/enums'
import { anos, km, numero, soDigitos } from '@/lib/format'
import { useAlterado } from '@/lib/useAlterado'
import { useSalvarCarro } from '../hooks'
import { enviarImagem } from '../api'
import { FotosCarro } from './FotosCarro'
import { FotosNovoCarro } from './FotosNovoCarro'

const ANO_ATUAL = new Date().getFullYear()

const esquema = z
  .object({
    nome: z.string().trim().min(3, 'Informe o nome do anúncio, como "Corolla XEi 2.0"').max(150, 'Use no máximo 150 caracteres'),
    marcaId: z.string().min(1, 'Escolha a marca'),
    modeloId: z.string().min(1, 'Escolha o modelo'),
    categoriaId: z.string().min(1, 'Escolha a categoria'),
    corId: z.string().min(1, 'Escolha a cor'),
    anoFabricacao: z.coerce.number().int().min(1950, 'Ano inválido').max(ANO_ATUAL + 1, 'Ano no futuro'),
    anoModelo: z.coerce.number().int().min(1950, 'Ano inválido').max(ANO_ATUAL + 2, 'Ano no futuro'),
    quilometragem: z.coerce.number().int().min(0, 'Não pode ser negativa'),
    condicao: z.enum(['NOVO', 'USADO']),
    cambio: z.enum(['MANUAL', 'AUTOMATICO']),
    combustivel: z.string().min(1, 'Escolha o combustível'),
    preco: z.coerce.number().positive('Informe o preço'),
    descricao: z.string().trim().min(10, 'Descreva o carro em pelo menos uma frase').max(2000, 'Use no máximo 2000 caracteres'),
  })
  // O ano do modelo é o de fabricação ou o seguinte
  .refine((v) => v.anoModelo >= v.anoFabricacao && v.anoModelo <= v.anoFabricacao + 1, {
    path: ['anoModelo'],
    message: 'Deve ser igual ao ano de fabricação ou o seguinte',
  })

const VAZIO = {
  nome: '',
  marcaId: '',
  modeloId: '',
  categoriaId: '',
  corId: '',
  anoFabricacao: String(ANO_ATUAL),
  anoModelo: String(ANO_ATUAL),
  quilometragem: '0',
  condicao: 'USADO',
  cambio: 'AUTOMATICO',
  combustivel: 'FLEX',
  preco: '',
  descricao: '',
}

export default function CarroFormPage() {
  const { id } = useParams()
  const editando = Boolean(id)
  const carro = useCarro(id)
  const lookups = useLookups()

  if (editando && carro.isPending) return <div className="h-96 animate-pulse rounded-foto bg-superficie-funda" />
  if (editando && carro.isError) return <EstadoErro erro={carro.error} aoTentarDeNovo={carro.refetch} />
  if (lookups.carregando) return <div className="h-96 animate-pulse rounded-foto bg-superficie-funda" />

  // key: troca de carro recria o formulário com os valores certos
  return <Formulario key={id ?? 'novo'} carro={editando ? carro.data : null} lookups={lookups} />
}

function Formulario({ carro, lookups }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const salvar = useSalvarCarro()
  // Carro novo: fotos escolhidas antes de salvar, enviadas logo depois do cadastro
  const [fotosNovas, setFotosNovas] = useState([])
  const [progressoFotos, setProgressoFotos] = useState(null)
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: carro
      ? {
          nome: carro.nome,
          marcaId: lookups.porId.modelo[carro.modeloId]?.marcaId ?? '',
          modeloId: carro.modeloId,
          categoriaId: carro.categoriaId,
          corId: carro.corId,
          anoFabricacao: String(carro.anoFabricacao),
          anoModelo: String(carro.anoModelo),
          quilometragem: String(carro.quilometragem),
          condicao: carro.condicao,
          cambio: carro.cambio,
          combustivel: carro.combustivel,
          preco: String(Math.round(Number(carro.preco))),
          descricao: carro.descricao ?? '',
        }
      : VAZIO,
  })
  const valores = useWatch({ control })
  const { alterado, marcarSalvo } = useAlterado(control, valores)
  const modelosDaMarca = lookups.modelos.filter((m) => m.marcaId === valores.marcaId)

  async function enviar(v) {
    const { marcaId: _marca, ...dados } = v
    let salvo
    try {
      salvo = await salvar.mutateAsync({ ...dados, id: carro?.id })
      reset(v)
      marcarSalvo(v)
    } catch (erro) {
      mostrarErro(erro)
      return
    }

    if (carro) {
      toast.success('Alterações salvas.')
      return
    }

    // Carro novo: envia as fotos escolhidas, uma por vez, na ordem mostrada
    const falhas = []
    for (const [i, arquivo] of fotosNovas.entries()) {
      setProgressoFotos(`Enviando fotos ${i + 1} de ${fotosNovas.length}…`)
      try {
        await enviarImagem(salvo.id, arquivo)
      } catch {
        falhas.push(arquivo.name)
      }
    }
    setProgressoFotos(null)
    queryClient.invalidateQueries({ queryKey: ['carro', salvo.id] })
    queryClient.invalidateQueries({ queryKey: ['carros'] })

    if (falhas.length) {
      toast.error(`Carro cadastrado, mas ${falhas.length === 1 ? 'uma foto não foi enviada' : `${falhas.length} fotos não foram enviadas`}. Tente de novo na página do carro.`)
    } else {
      toast.success(fotosNovas.length ? 'Carro cadastrado com as fotos.' : 'Carro cadastrado. Você pode adicionar fotos agora.')
    }
    navigate(`/admin/carros/${salvo.id}`, { replace: true })
  }

  function mostrarErro(erro) {
    if (erro.campos && Object.keys(erro.campos).length) {
      Object.entries(erro.campos).forEach(([campo, mensagem]) => setError(campo, { message: mensagem }))
    } else {
      setError('root', { message: erro.message })
    }
  }

  return (
    <div>
      <nav aria-label="Você está em" className="mb-4">
        <ol className="flex items-center gap-1.5 text-sm text-texto-suave">
          <li>
            <Link to="/admin/carros" className="hover:text-texto hover:underline">
              Estoque
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="font-medium text-texto">
            {carro ? carro.nome : 'Novo carro'}
          </li>
        </ol>
      </nav>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="tipo-emblema text-h2">{carro ? 'Editar carro' : 'Novo carro'}</h1>
        {carro && <Badge tom={TOM_STATUS_CARRO[carro.status]}>{STATUS_CARRO[carro.status]}</Badge>}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_20rem]">
        <form id="form-carro" onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-6">
          {errors.root && (
            <p role="alert" className="rounded-controle border border-vendido/40 bg-vendido/8 px-4 py-3 text-vendido">
              {errors.root.message}
            </p>
          )}

          <Bloco titulo="Identificação">
            <Campo rotulo="Nome do anúncio" erro={errors.nome?.message} ajuda="Modelo e versão, como aparece no card.">
              {(props) => <Input {...props} placeholder="Corolla XEi 2.0" {...register('nome')} />}
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectCampo
                control={control}
                nome="marcaId"
                rotulo="Marca"
                erro={errors.marcaId?.message}
                itens={lookups.marcas}
                aoMudar={() => setValue('modeloId', '', { shouldDirty: true })}
              />
              <SelectCampo
                control={control}
                nome="modeloId"
                rotulo="Modelo"
                erro={errors.modeloId?.message}
                itens={modelosDaMarca}
                vazio={valores.marcaId ? 'Escolha o modelo' : 'Escolha a marca primeiro'}
                desabilitado={!valores.marcaId}
              />
              <SelectCampo control={control} nome="categoriaId" rotulo="Categoria" erro={errors.categoriaId?.message} itens={lookups.categorias} />
              <SelectCampo control={control} nome="corId" rotulo="Cor" erro={errors.corId?.message} itens={lookups.cores} />
            </div>
            <p className="text-sm text-texto-suave">
              Faltou marca, modelo, cor ou categoria?{' '}
              <Link to="/admin/cadastros" className="font-semibold text-marca hover:underline">
                Cadastre em Cadastros
              </Link>
              .
            </p>
          </Bloco>

          <Bloco titulo="Ficha técnica">
            <div className="grid gap-4 sm:grid-cols-3">
              <Campo rotulo="Ano de fabricação" erro={errors.anoFabricacao?.message}>
                {(props) => <Input {...props} inputMode="numeric" className="tipo-dado" {...register('anoFabricacao')} />}
              </Campo>
              <Campo rotulo="Ano do modelo" erro={errors.anoModelo?.message}>
                {(props) => <Input {...props} inputMode="numeric" className="tipo-dado" {...register('anoModelo')} />}
              </Campo>
              <Controller
                name="quilometragem"
                control={control}
                render={({ field }) => (
                  <Campo rotulo="Quilometragem" erro={errors.quilometragem?.message}>
                    {(props) => (
                      <Input
                        {...props}
                        inputMode="numeric"
                        className="tipo-dado"
                        value={field.value ? numero(Number(field.value)) : '0'}
                        onChange={(e) => field.onChange(soDigitos(e.target.value).slice(0, 7) || '0')}
                        onBlur={field.onBlur}
                      />
                    )}
                  </Campo>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="condicao"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Condição</span>
                    <Segmentado
                      rotulo="Condição"
                      valor={field.value}
                      aoMudar={field.onChange}
                      opcoes={[
                        { valor: 'NOVO', rotulo: 'Zero km' },
                        { valor: 'USADO', rotulo: 'Seminovo' },
                      ]}
                    />
                  </div>
                )}
              />
              <Controller
                name="cambio"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Câmbio</span>
                    <Segmentado
                      rotulo="Câmbio"
                      valor={field.value}
                      aoMudar={field.onChange}
                      opcoes={Object.entries(CAMBIO).map(([valor, rotulo]) => ({ valor, rotulo }))}
                    />
                  </div>
                )}
              />
              <SelectCampo
                control={control}
                nome="combustivel"
                rotulo="Combustível"
                erro={errors.combustivel?.message}
                itens={Object.entries(COMBUSTIVEL).map(([id, nome]) => ({ id, nome }))}
              />
            </div>
          </Bloco>

          <Bloco titulo="Preço e descrição">
            <Controller
              name="preco"
              control={control}
              render={({ field }) => (
                <Campo rotulo="Preço" erro={errors.preco?.message}>
                  {(props) => (
                    <div className="relative sm:w-64">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-texto-suave">R$</span>
                      <Input
                        {...props}
                        inputMode="numeric"
                        className="tipo-dado pl-10 text-lead"
                        value={field.value ? numero(Number(field.value)) : ''}
                        onChange={(e) => field.onChange(soDigitos(e.target.value).slice(0, 9))}
                        onBlur={field.onBlur}
                      />
                    </div>
                  )}
                </Campo>
              )}
            />
            <Campo
              rotulo="Descrição"
              erro={errors.descricao?.message}
              ajuda="Estado de conservação, revisões, opcionais e o que mais o comprador precisa saber."
            >
              {(props) => (
                <textarea
                  {...props}
                  rows={6}
                  className="w-full rounded-controle border border-input bg-superficie px-3 py-2.5 text-base outline-none focus-visible:border-marca focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-marca/40 aria-invalid:border-vendido"
                  {...register('descricao')}
                />
              )}
            </Campo>
          </Bloco>

          {carro ? (
            <FotosCarro carro={carro} />
          ) : (
            <FotosNovoCarro arquivos={fotosNovas} aoMudar={setFotosNovas} desabilitado={isSubmitting} />
          )}
        </form>

        {/* Prévia do card como aparece na vitrine, atualizada enquanto digita */}
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <p className="mb-3 text-sm font-semibold text-texto-suave">Como aparece no site</p>
          <Previa valores={valores} lookups={lookups} carro={carro} fotoLocal={fotosNovas[0]} />
          <div className="mt-5 flex flex-col gap-2">
            <Button type="submit" form="form-carro" tamanho="lg" disabled={isSubmitting || (carro && !alterado)}>
              {progressoFotos ?? (isSubmitting ? 'Salvando…' : carro ? 'Salvar alterações' : 'Cadastrar carro')}
            </Button>
            <Button asChild variante="fantasma">
              <Link to="/admin/carros">Voltar ao estoque</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Bloco({ titulo, children }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-foto border bg-superficie p-5 sm:p-6">
      <legend className="float-left mb-1 w-full text-lead font-semibold">{titulo}</legend>
      {children}
    </fieldset>
  )
}

function SelectCampo({ control, nome, rotulo, erro, itens, vazio = 'Escolha', desabilitado, aoMudar }) {
  return (
    <Controller
      name={nome}
      control={control}
      render={({ field }) => (
        <Campo rotulo={rotulo} erro={erro}>
          {(props) => (
            <Select
              value={field.value ?? ''}
              onValueChange={(v) => {
                field.onChange(v)
                aoMudar?.(v)
              }}
              disabled={desabilitado}
            >
              <SelectTrigger id={props.id} aria-invalid={props['aria-invalid']} className="w-full">
                <SelectValue placeholder={vazio} />
              </SelectTrigger>
              <SelectContent>
                {itens.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Campo>
      )}
    />
  )
}

function Previa({ valores, lookups, carro, fotoLocal }) {
  const modelo = lookups.porId.modelo[valores.modeloId]?.nome
  const marca = lookups.porId.marca[valores.marcaId]?.nome
  const anoF = Number(valores.anoFabricacao) || null
  const anoM = Number(valores.anoModelo) || null

  // Carro novo: mostra a primeira foto escolhida, ainda no navegador
  const urlLocal = useMemo(() => (fotoLocal ? URL.createObjectURL(fotoLocal) : null), [fotoLocal])
  useEffect(() => () => urlLocal && URL.revokeObjectURL(urlLocal), [urlLocal])

  return (
    <article className="rounded-foto border bg-superficie p-3">
      <div className="relative pb-5">
        {urlLocal ? (
          <img src={urlLocal} alt="" className="aspect-[4/3] w-full rounded-controle object-cover" />
        ) : (
          <FotoCarro imagem={carro ? fotoPrincipal(carro) : null} alt="" className="aspect-[4/3] rounded-controle" />
        )}
        <Plaqueta tamanho="sm" className="absolute bottom-1 left-1/2 max-w-[80%] -translate-x-1/2">
          {modelo || 'Modelo'}
        </Plaqueta>
      </div>
      <div className="mt-2 flex flex-col gap-1.5 px-1 pb-1">
        <p className="text-sm text-texto-suave">{marca || 'Marca'}</p>
        <p className="text-lead leading-snug font-semibold">{valores.nome || 'Nome do anúncio'}</p>
        {valores.preco ? <Preco valor={valores.preco} tamanho="sm" /> : <p className="text-texto-suave">Preço</p>}
        <p className="tipo-dado text-texto-suave">
          {[anos(anoF, anoM), km(Number(valores.quilometragem) || 0), CAMBIO[valores.cambio]].filter(Boolean).join('  |  ')}
        </p>
      </div>
    </article>
  )
}
