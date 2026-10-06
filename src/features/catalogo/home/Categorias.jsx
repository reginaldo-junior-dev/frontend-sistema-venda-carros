import { Link } from 'react-router'
import { normalizar } from '@/lib/texto'
import { cn } from '@/lib/utils'

const TIPOS = [
  { nome: 'Sedã', foto: 'sedan', texto: 'Conforto e porta-malas para a família', classe: 'lg:col-span-2 lg:row-span-2', largo: true },
  { nome: 'SUV', foto: 'suv', texto: 'Altura, espaço e posição de dirigir elevada', classe: 'lg:col-span-2', largo: true },
  { nome: 'Hatch', foto: 'hatch', texto: 'Ágil e econômico na cidade', classe: '' },
  { nome: 'Picape', foto: 'picape', texto: 'Carga e força para o trabalho', classe: '' },
]

// Cada foto existe em 480, 800 e 1200 px de largura; o navegador escolhe pelo tamanho que ela ocupa na tela
const srcSet = (foto) => `/imagens/${foto}-480.webp 480w, /imagens/${foto}-800.webp 800w, /imagens/${foto}.webp 1200w`
const larguraNaTela = (largo) => `(min-width: 1024px) ${largo ? '620px' : '300px'}, (min-width: 640px) 50vw, 100vw`

// As fotos são do site; o link usa a categoria da API com o mesmo nome, quando existe
export function Categorias({ categorias }) {
  const porNome = Object.fromEntries(categorias.map((c) => [normalizar(c.nome), c.id]))

  return (
    <section aria-labelledby="titulo-categorias" className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h2 id="titulo-categorias" className="tipo-emblema text-h2 sm:text-h1">
          Escolha pelo jeito que você dirige
        </h2>
      </div>

      <ul className="grid auto-rows-[240px] gap-4 sm:grid-cols-2 lg:h-[600px] lg:auto-rows-auto lg:grid-cols-4 lg:grid-rows-2">
        {TIPOS.map((tipo) => {
          const id = porNome[normalizar(tipo.nome)]
          return (
            <li key={tipo.nome} className={cn('min-h-0', tipo.classe)}>
              <Link
                to={id ? `/carros?categoriaId=${id}` : '/carros'}
                className="group relative isolate flex size-full flex-col justify-end overflow-hidden rounded-foto p-6 text-white"
              >
                <img
                  src={`/imagens/${tipo.foto}-800.webp`}
                  srcSet={srcSet(tipo.foto)}
                  sizes={larguraNaTela(tipo.largo)}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-patio group-hover:scale-[1.06]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(23_28_31/0.92)_0%,rgb(23_28_31/0.45)_50%,transparent_85%)] transition-opacity duration-500 group-hover:opacity-90"
                />
                <span className="tipo-emblema text-h2 leading-none lg:text-h1">{tipo.nome}</span>
                <span className="mt-2 max-w-[32ch] text-white/80 transition-colors group-hover:text-white">{tipo.texto}</span>
                {/* A faixa azul da placa cresce no hover, como sublinhado do tipo escolhido */}
                <span
                  aria-hidden="true"
                  className="mt-4 h-1 w-10 origin-left bg-[#4c7bd9] transition-transform duration-500 ease-patio group-hover:scale-x-[3]"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
