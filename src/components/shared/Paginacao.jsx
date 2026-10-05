import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// pagina é zero-based, como na API; o texto mostra a partir de 1
export function Paginacao({ pagina, totalPaginas, aoMudar }) {
  if (totalPaginas <= 1) return null
  return (
    <nav aria-label="Paginação" className="flex items-center gap-3">
      <Button variante="secundaria" tamanho="icone" disabled={pagina === 0} onClick={() => aoMudar(pagina - 1)} aria-label="Página anterior">
        <ChevronLeft />
      </Button>
      <span className="tipo-dado text-lead">
        {pagina + 1} <span className="text-texto-suave">de {totalPaginas}</span>
      </span>
      <Button
        variante="secundaria"
        tamanho="icone"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => aoMudar(pagina + 1)}
        aria-label="Próxima página"
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}
