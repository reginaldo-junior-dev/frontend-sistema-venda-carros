import { Link } from 'react-router'

// Página provisória das rotas que chegam nas próximas fases
export function EmBreve({ titulo, fase }) {
  return (
    <div className="flex flex-col items-start gap-3 py-12">
      <h1 className="tipo-emblema text-h2">{titulo}</h1>
      <p className="text-texto-suave">Esta página chega na fase {fase} do projeto.</p>
      <Link to="/" className="font-semibold text-marca underline-offset-4 hover:underline">
        Voltar para o início
      </Link>
    </div>
  )
}
