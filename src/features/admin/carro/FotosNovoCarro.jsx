import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TriangleAlert, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { problemaDoArquivo } from './arquivos'
import { ZonaFotos } from './ZonaFotos'

/**
 * Fotos escolhidas antes de o carro existir: ficam no navegador com prévia e
 * são enviadas logo depois do cadastro, na ordem mostrada (a primeira é a principal).
 */
export function FotosNovoCarro({ arquivos, aoMudar, desabilitado }) {
  const [recusados, setRecusados] = useState([])

  // Prévia local de cada arquivo; as URLs são liberadas quando a lista muda
  const previas = useMemo(() => arquivos.map((a) => ({ arquivo: a, url: URL.createObjectURL(a) })), [arquivos])
  useEffect(() => () => previas.forEach((p) => URL.revokeObjectURL(p.url)), [previas])

  function escolher(novos) {
    const validos = []
    const ruins = []
    for (const a of novos) {
      const problema = problemaDoArquivo(a)
      if (problema) ruins.push({ nome: a.name, problema })
      else validos.push(a)
    }
    setRecusados(ruins)
    if (validos.length) aoMudar([...arquivos, ...validos])
  }

  return (
    <section aria-labelledby="titulo-fotos-novo" className="rounded-foto border bg-superficie p-5 sm:p-6">
      <div className="mb-4">
        <h2 id="titulo-fotos-novo" className="text-lead font-semibold">
          Fotos
        </h2>
        <p className="text-sm text-texto-suave">
          Escolha agora: elas são enviadas assim que o carro for cadastrado. A primeira é a principal (aparece no card).
        </p>
      </div>

      <ZonaFotos aoEscolher={escolher} desabilitada={desabilitado} />

      {recusados.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1" role="alert">
          {recusados.map((r) => (
            <li key={r.nome} className="flex items-center gap-2 text-sm text-vendido">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              {r.nome}: {r.problema}
            </li>
          ))}
        </ul>
      )}

      {previas.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {previas.map((p, i) => (
              <motion.li
                key={p.url}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden rounded-controle bg-superficie-funda"
              >
                <img src={p.url} alt={`Foto ${i + 1}: ${p.arquivo.name}`} className="aspect-[4/3] w-full object-cover" />
                {i === 0 && (
                  <Badge tom="marca" className="absolute top-2 left-2">
                    Principal
                  </Badge>
                )}
                <span className="tipo-dado absolute bottom-2 left-2 rounded-plaqueta bg-asfalto/70 px-1.5 text-xs text-white">
                  {i + 1}
                </span>
                {!desabilitado && (
                  <button
                    type="button"
                    onClick={() => aoMudar(arquivos.filter((_, j) => j !== i))}
                    aria-label={`Tirar a foto ${i + 1}`}
                    className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-asfalto/60 text-white transition-colors hover:bg-vendido"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  )
}
