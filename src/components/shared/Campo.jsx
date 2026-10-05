import { useId } from 'react'
import { Label } from '@/components/ui/label'

/**
 * Rótulo + controle + ajuda/erro, com os ids de acessibilidade ligados.
 * `children` recebe as props que o controle precisa: (props) => <Input {...props} />
 */
export function Campo({ rotulo, erro, ajuda, children }) {
  const id = useId()
  const idDescricao = `${id}-descricao`
  const descricao = erro ?? ajuda

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{rotulo}</Label>
      {children({
        id,
        'aria-invalid': Boolean(erro) || undefined,
        'aria-describedby': descricao ? idDescricao : undefined,
      })}
      {descricao && (
        <p id={idDescricao} className={erro ? 'text-sm text-vendido' : 'text-sm text-texto-suave'}>
          {descricao}
        </p>
      )}
    </div>
  )
}
