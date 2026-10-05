import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EstadoVazio({ titulo, descricao, acao, className }) {
  return (
    <div className={cn('flex flex-col items-start gap-3 rounded-foto border border-dashed px-6 py-10', className)}>
      <p className="text-lead font-semibold">{titulo}</p>
      {descricao && <p className="max-w-[60ch] text-texto-suave">{descricao}</p>}
      {acao}
    </div>
  )
}

export function EstadoErro({ erro, aoTentarDeNovo, className }) {
  return (
    <div role="alert" className={cn('flex flex-col items-start gap-3 rounded-foto border border-vendido/40 bg-vendido/6 px-6 py-8', className)}>
      <p className="font-semibold">{erro?.message ?? 'Não foi possível carregar.'}</p>
      {aoTentarDeNovo && (
        <Button variante="secundaria" tamanho="sm" onClick={aoTentarDeNovo}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}
