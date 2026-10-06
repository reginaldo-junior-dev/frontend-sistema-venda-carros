import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useTitulo } from '@/lib/useTitulo'

export default function SemAcesso() {
  useTitulo('Área restrita')
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="tipo-emblema text-h1">Área restrita à equipe da revenda.</h1>
      <p className="max-w-[50ch] text-lead text-texto-suave">
        Sua conta é de cliente. Se você trabalha na revenda, entre com a conta de administrador.
      </p>
      <Button asChild variante="secundaria">
        <Link to="/">Voltar para o início</Link>
      </Button>
    </div>
  )
}
