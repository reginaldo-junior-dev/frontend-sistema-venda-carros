import { useState } from 'react'
import { useWatch } from 'react-hook-form'

/**
 * Diz se o formulário mudou desde o último ponto salvo. O isDirty do React Hook Form
 * não acompanha campos com <Controller> nesta versão, então compara os valores direto.
 * Chame `marcarSalvo(valores)` depois de salvar.
 */
export function useAlterado(control, iniciais) {
  const [base, setBase] = useState(() => JSON.stringify(iniciais))
  const atuais = useWatch({ control })
  return { alterado: JSON.stringify(atuais) !== base, marcarSalvo: (v) => setBase(JSON.stringify(v)) }
}
