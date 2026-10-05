import { cn } from '@/lib/utils'

// Título da página do painel, com a ação principal à direita
export function CabecalhoAdmin({ titulo, descricao, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="tipo-emblema text-h2">{titulo}</h1>
        {descricao && <p className="mt-1 text-texto-suave">{descricao}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

// Tabela com rolagem lateral no celular; o cabeçalho fica no próprio <table>
export function Tabela({ children, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-foto border bg-superficie', className)}>
      <table className="w-full min-w-[44rem] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:font-medium [&_th]:text-texto-suave [&_thead]:border-b [&_tbody_tr+tr]:border-t [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-superficie-funda/50">
        {children}
      </table>
    </div>
  )
}

export function LinhasCarregando({ colunas, linhas = 5 }) {
  return Array.from({ length: linhas }, (_, i) => (
    <tr key={i} aria-hidden="true">
      {Array.from({ length: colunas }, (_, j) => (
        <td key={j}>
          <div className="h-4 animate-pulse rounded-plaqueta bg-superficie-funda" />
        </td>
      ))}
    </tr>
  ))
}

export function LinhaVazia({ colunas, children }) {
  return (
    <tr>
      <td colSpan={colunas} className="py-10! text-center text-texto-suave">
        {children}
      </td>
    </tr>
  )
}
