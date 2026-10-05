import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { surgir } from '@/lib/motion'

const FAIXAS_PRECO = [
  { valor: 'qualquer', rotulo: 'Qualquer preço' },
  { valor: '60000', rotulo: 'Até R$ 60 mil' },
  { valor: '100000', rotulo: 'Até R$ 100 mil' },
  { valor: '150000', rotulo: 'Até R$ 150 mil' },
  { valor: '250000', rotulo: 'Até R$ 250 mil' },
]

// Busca encaixada na base do hero: o caminho mais curto até a lista filtrada
export function BuscaPainel({ marcas, categorias }) {
  const navigate = useNavigate()
  const [marcaId, setMarcaId] = useState('qualquer')
  const [categoriaId, setCategoriaId] = useState('qualquer')
  const [precoMax, setPrecoMax] = useState('qualquer')

  function buscar(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (marcaId !== 'qualquer') params.set('marcaId', marcaId)
    if (categoriaId !== 'qualquer') params.set('categoriaId', categoriaId)
    if (precoMax !== 'qualquer') params.set('precoMax', precoMax)
    navigate(`/carros${params.size ? `?${params}` : ''}`)
  }

  return (
    <motion.form
      onSubmit={buscar}
      variants={surgir}
      custom={0.5}
      initial="oculto"
      animate="visivel"
      aria-label="Buscar carros"
      className="relative z-20 -mt-20 grid gap-3 rounded-foto border bg-superficie p-4 shadow-[0_24px_48px_-24px_rgb(30_36_40/0.45)] sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
    >
      <Campo id="busca-marca" rotulo="Marca" valor={marcaId} aoMudar={setMarcaId} todos="Todas as marcas" itens={marcas} />
      <Campo
        id="busca-categoria"
        rotulo="Tipo de carro"
        valor={categoriaId}
        aoMudar={setCategoriaId}
        todos="Todos os tipos"
        itens={categorias}
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="busca-preco" className="text-texto-suave">
          Preço
        </Label>
        <Select value={precoMax} onValueChange={setPrecoMax}>
          <SelectTrigger id="busca-preco" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FAIXAS_PRECO.map((f) => (
              <SelectItem key={f.valor} value={f.valor}>
                {f.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="h-11 sm:col-span-2 lg:col-span-1 lg:px-8">
        <Search /> Buscar carros
      </Button>
    </motion.form>
  )
}

function Campo({ id, rotulo, valor, aoMudar, todos, itens }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-texto-suave">
        {rotulo}
      </Label>
      <Select value={valor} onValueChange={aoMudar}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="qualquer">{todos}</SelectItem>
          {itens.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
