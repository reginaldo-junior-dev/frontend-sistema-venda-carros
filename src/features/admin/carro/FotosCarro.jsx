import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ImagePlus, LoaderCircle, Trash2, TriangleAlert } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { FotoCarro } from '@/features/catalogo/FotoCarro'
import { ordenarImagens } from '@/features/catalogo/descrever'
import { cn } from '@/lib/utils'
import { enviarImagem } from '../api'
import { useExcluirImagem } from '../hooks'
import { useConfirmacao } from '../useConfirmacao'

const TIPOS = ['image/jpeg', 'image/png', 'image/webp']
const LIMITE_MB = 10 // spring.servlet.multipart.max-file-size

/**
 * Fotos do carro: arrastar e soltar (ou escolher), envio em fila com progresso e exclusão.
 * A API não reordena: a primeira foto enviada é a principal, e a ordem de envio é a da galeria.
 */
export function FotosCarro({ carro }) {
  const queryClient = useQueryClient()
  const entrada = useRef(null)
  const [arrastando, setArrastando] = useState(false)
  const [fila, setFila] = useState([]) // { id, nome, progresso, erro }
  const excluir = useExcluirImagem(carro.id)
  const { confirmar, dialogo } = useConfirmacao()
  const fotos = ordenarImagens(carro.imagens)
  const enviando = fila.some((f) => !f.erro && f.progresso < 100)

  async function adicionar(arquivos) {
    const novos = [...arquivos].map((arquivo) => {
      const erro = !TIPOS.includes(arquivo.type)
        ? 'Use JPG, PNG ou WEBP.'
        : arquivo.size > LIMITE_MB * 1024 * 1024
          ? `Maior que ${LIMITE_MB} MB.`
          : null
      return { id: crypto.randomUUID(), arquivo, nome: arquivo.name, progresso: 0, erro }
    })
    setFila((atual) => [...atual.filter((f) => f.erro || f.progresso < 100), ...novos])

    // Um por vez: mantém a ordem escolhida e não sobrecarrega o upload para o S3
    let enviados = 0
    for (const item of novos.filter((n) => !n.erro)) {
      try {
        await enviarImagem(carro.id, item.arquivo, (p) =>
          setFila((atual) => atual.map((f) => (f.id === item.id ? { ...f, progresso: Math.min(p, 99) } : f))),
        )
        setFila((atual) => atual.map((f) => (f.id === item.id ? { ...f, progresso: 100 } : f)))
        enviados++
        await queryClient.invalidateQueries({ queryKey: ['carro', carro.id] })
      } catch (e) {
        setFila((atual) => atual.map((f) => (f.id === item.id ? { ...f, erro: e.message } : f)))
      }
    }
    if (enviados) {
      toast.success(enviados === 1 ? 'Foto enviada.' : `${enviados} fotos enviadas.`)
      queryClient.invalidateQueries({ queryKey: ['carros'] })
      // Some com os que terminaram; os com erro continuam visíveis
      setTimeout(() => setFila((atual) => atual.filter((f) => f.erro)), 1200)
    }
  }

  function pedirExclusao(foto, indice) {
    confirmar({
      titulo: 'Excluir esta foto?',
      descricao: indice === 0 ? 'Ela é a foto principal: a próxima da lista passa a ser a principal.' : undefined,
      textoBotao: 'Excluir foto',
      perigo: true,
      aoConfirmar: async () => {
        await excluir.mutateAsync(foto.id)
        toast.success('Foto excluída.')
      },
    })
  }

  return (
    <section aria-labelledby="titulo-fotos" className="rounded-foto border bg-superficie p-5 sm:p-6">
      <div className="mb-4">
        <h2 id="titulo-fotos" className="text-lead font-semibold">
          Fotos
        </h2>
        <p className="text-sm text-texto-suave">
          A primeira foto é a principal (aparece no card). Envie na ordem em que quer mostrar. JPG, PNG ou WEBP de até{' '}
          {LIMITE_MB} MB.
        </p>
      </div>

      <button
        type="button"
        onClick={() => entrada.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArrastando(false)
          adicionar(e.dataTransfer.files)
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-controle border-2 border-dashed px-6 py-10 text-center transition-colors',
          arrastando ? 'border-marca bg-marca-suave' : 'border-borda hover:border-texto/40 hover:bg-superficie-funda/50',
        )}
      >
        <ImagePlus className={cn('size-8', arrastando ? 'text-marca' : 'text-texto-suave')} aria-hidden="true" />
        <span className="font-semibold">{arrastando ? 'Solte as fotos aqui' : 'Arraste as fotos ou clique para escolher'}</span>
        <span className="text-sm text-texto-suave">Dá para enviar várias de uma vez</span>
      </button>
      <input
        ref={entrada}
        type="file"
        accept={TIPOS.join(',')}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          adicionar(e.target.files)
          e.target.value = ''
        }}
      />

      {fila.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2" aria-live="polite">
          {fila.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-controle border px-3 py-2 text-sm">
              {f.erro ? (
                <TriangleAlert className="size-4 shrink-0 text-vendido" aria-hidden="true" />
              ) : (
                <LoaderCircle className={cn('size-4 shrink-0 text-marca', f.progresso < 100 && 'animate-spin')} aria-hidden="true" />
              )}
              <span className="min-w-0 flex-1 truncate">{f.nome}</span>
              {f.erro ? (
                <span className="text-vendido">{f.erro}</span>
              ) : (
                <span className="tipo-dado w-24 text-right text-texto-suave">
                  {f.progresso === 100 ? 'Enviada' : `${f.progresso}%`}
                </span>
              )}
              {!f.erro && (
                <div className="h-1 w-24 overflow-hidden rounded-full bg-borda" aria-hidden="true">
                  <div className="h-full bg-marca transition-[width] duration-200" style={{ width: `${f.progresso}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {fotos.length > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {fotos.map((foto, i) => (
              <motion.li
                key={foto.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden rounded-controle"
              >
                <FotoCarro imagem={foto} alt={`Foto ${i + 1}`} className="aspect-[4/3]" />
                {i === 0 && (
                  <Badge tom="marca" className="absolute top-2 left-2">
                    Principal
                  </Badge>
                )}
                <span className="tipo-dado absolute bottom-2 left-2 rounded-plaqueta bg-asfalto/70 px-1.5 text-xs text-white">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => pedirExclusao(foto, i)}
                  aria-label={`Excluir foto ${i + 1}`}
                  className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-asfalto/60 text-white opacity-100 transition-opacity hover:bg-vendido sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        !enviando && <p className="mt-4 text-sm text-sinal-texto">Este carro ainda não tem fotos e aparece com "Foto em breve" no site.</p>
      )}
      {dialogo}
    </section>
  )
}
