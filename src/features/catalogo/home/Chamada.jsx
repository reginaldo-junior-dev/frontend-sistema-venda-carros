import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function Chamada() {
  return (
    <section aria-labelledby="titulo-chamada" className="mx-auto mt-28 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-foto bg-asfalto px-6 py-20 text-white sm:px-12 lg:py-28">
        <img src="/imagens/volante.webp" alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(23_28_31/0.9)_0%,rgb(23_28_31/0.6)_50%,rgb(23_28_31/0.2)_100%)]"
        />
        <h2 id="titulo-chamada" className="tipo-emblema max-w-[16ch] text-h2 sm:text-display">
          A próxima viagem começa aqui.
        </h2>
        <p className="mt-4 max-w-[40ch] text-lead text-white/80">
          Veja o estoque completo, compare a ficha técnica e reserve em poucos minutos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild tamanho="lg" className="bg-white text-asfalto hover:bg-white/90">
            <Link to="/carros">Ver carros disponíveis</Link>
          </Button>
          <Button asChild tamanho="lg" variante="fantasma" className="border border-white/30 text-white hover:bg-white/10">
            <Link to="/criar-conta">Criar conta</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
