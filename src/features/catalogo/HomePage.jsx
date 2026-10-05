import { BuscaPainel } from './home/BuscaPainel'
import { Categorias } from './home/Categorias'
import { Chamada } from './home/Chamada'
import { ComoFunciona } from './home/ComoFunciona'
import { Estoque } from './home/Estoque'
import { Garantias } from './home/Garantias'
import { Hero } from './home/Hero'
import { useCarros, useLookups } from './hooks'

const VITRINE = { status: 'DISPONIVEL', size: 8, sort: 'preco,desc' }

export default function HomePage() {
  const lookups = useLookups()
  const vitrine = useCarros(VITRINE)
  const carros = vitrine.data?.itens ?? []
  // Linhas completas na grade de 4 colunas (com menos de 4, mostra o que houver)
  const visiveis = carros.length >= 4 ? carros.slice(0, carros.length - (carros.length % 4)) : carros

  return (
    <>
      <Hero totalDisponiveis={vitrine.data?.total} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BuscaPainel marcas={lookups.marcas} categorias={lookups.categorias} />
        <Garantias />
      </div>
      <Estoque consulta={vitrine} carros={visiveis} porId={lookups.porId} />
      <Categorias categorias={lookups.categorias} />
      <ComoFunciona />
      <Chamada />
    </>
  )
}
