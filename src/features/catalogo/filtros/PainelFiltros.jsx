import { useState } from 'react'
import { Chip } from '@/components/ui/chip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Segmentado } from '@/components/ui/segmentado'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { tomDaCor } from '@/lib/cores'
import { COMBUSTIVEL } from '@/lib/enums'
import { numero, soDigitos } from '@/lib/format'
import { useAdiado } from '@/lib/useAdiado'

const TODOS = 'todos'
const ANO_ATUAL = new Date().getFullYear()
const ANOS = Array.from({ length: ANO_ATUAL + 2 - 1990 }, (_, i) => String(ANO_ATUAL + 1 - i))
const FAIXAS_KM = [
  { valor: '10000', rotulo: 'Até 10 mil km' },
  { valor: '30000', rotulo: 'Até 30 mil km' },
  { valor: '60000', rotulo: 'Até 60 mil km' },
  { valor: '100000', rotulo: 'Até 100 mil km' },
]

/**
 * Todos os filtros do catálogo. Cada mudança vai direto para a URL (aoMudar);
 * os campos de preço esperam a pessoa parar de digitar.
 */
export function PainelFiltros({ filtros, lookups, incluirIndisponiveis, aoMudar }) {
  const modelosDaMarca = filtros.marcaId ? lookups.modelos.filter((m) => m.marcaId === filtros.marcaId) : []
  const alternar = (campo, valor) => aoMudar({ [campo]: filtros[campo] === valor ? '' : valor })

  return (
    <div className="flex flex-col divide-y">
      <Grupo titulo="Condição">
        <Segmentado
          rotulo="Condição"
          valor={filtros.condicao ?? ''}
          aoMudar={(v) => aoMudar({ condicao: v })}
          opcoes={[
            { valor: '', rotulo: 'Todos' },
            { valor: 'NOVO', rotulo: 'Zero km' },
            { valor: 'USADO', rotulo: 'Seminovos' },
          ]}
        />
      </Grupo>

      <Grupo titulo="Marca e modelo">
        <div className="flex flex-col gap-3">
          <SelectFiltro
            rotulo="Marca"
            valor={filtros.marcaId}
            todos="Todas as marcas"
            itens={lookups.marcas}
            aoMudar={(v) => aoMudar({ marcaId: v })}
          />
          <SelectFiltro
            rotulo="Modelo"
            valor={filtros.modeloId}
            todos={filtros.marcaId ? 'Todos os modelos' : 'Escolha a marca primeiro'}
            itens={modelosDaMarca}
            desabilitado={!filtros.marcaId}
            aoMudar={(v) => aoMudar({ modeloId: v })}
          />
        </div>
      </Grupo>

      {lookups.categorias.length > 0 && (
        <Grupo titulo="Tipo de carro">
          <div className="flex flex-wrap gap-2">
            {lookups.categorias.map((c) => (
              <Chip key={c.id} ativo={filtros.categoriaId === c.id} onClick={() => alternar('categoriaId', c.id)}>
                {c.nome}
              </Chip>
            ))}
          </div>
        </Grupo>
      )}

      <Grupo titulo="Preço">
        <div className="grid grid-cols-2 gap-3">
          <CampoValor rotulo="Mínimo" valor={filtros.precoMin} aoMudar={(v) => aoMudar({ precoMin: v })} />
          <CampoValor rotulo="Máximo" valor={filtros.precoMax} aoMudar={(v) => aoMudar({ precoMax: v })} />
        </div>
      </Grupo>

      <Grupo titulo="Ano do modelo">
        <div className="grid grid-cols-2 gap-3">
          <SelectFiltro
            rotulo="De"
            valor={filtros.anoMin}
            todos="Qualquer"
            itens={ANOS.map((a) => ({ id: a, nome: a }))}
            aoMudar={(v) => aoMudar({ anoMin: v })}
          />
          <SelectFiltro
            rotulo="Até"
            valor={filtros.anoMax}
            todos="Qualquer"
            itens={ANOS.map((a) => ({ id: a, nome: a }))}
            aoMudar={(v) => aoMudar({ anoMax: v })}
          />
        </div>
      </Grupo>

      <Grupo titulo="Quilometragem">
        <div className="flex flex-wrap gap-2">
          {FAIXAS_KM.map((f) => (
            <Chip
              key={f.valor}
              ativo={filtros.quilometragemMax === f.valor}
              onClick={() => alternar('quilometragemMax', f.valor)}
            >
              {f.rotulo}
            </Chip>
          ))}
        </div>
      </Grupo>

      <Grupo titulo="Câmbio">
        <Segmentado
          rotulo="Câmbio"
          valor={filtros.cambio ?? ''}
          aoMudar={(v) => aoMudar({ cambio: v })}
          opcoes={[
            { valor: '', rotulo: 'Todos' },
            { valor: 'AUTOMATICO', rotulo: 'Automático' },
            { valor: 'MANUAL', rotulo: 'Manual' },
          ]}
        />
      </Grupo>

      <Grupo titulo="Combustível">
        <div className="flex flex-wrap gap-2">
          {Object.entries(COMBUSTIVEL).map(([valor, rotulo]) => (
            <Chip key={valor} ativo={filtros.combustivel === valor} onClick={() => alternar('combustivel', valor)}>
              {rotulo}
            </Chip>
          ))}
        </div>
      </Grupo>

      {lookups.cores.length > 0 && (
        <Grupo titulo="Cor">
          <div className="flex flex-wrap gap-2">
            {lookups.cores.map((c) => {
              const tom = tomDaCor(c.nome)
              return (
                <Chip key={c.id} ativo={filtros.corId === c.id} onClick={() => alternar('corId', c.id)}>
                  <span
                    aria-hidden="true"
                    className="size-3.5 rounded-full border border-black/15"
                    style={{ background: tom ?? 'conic-gradient(#b3261e, #e8c21a, #2f6b3a, #1f4fa3, #b3261e)' }}
                  />
                  {c.nome}
                </Chip>
              )
            })}
          </div>
        </Grupo>
      )}

      <Grupo>
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-semibold">Mostrar reservados e vendidos</span>
            <span className="block text-sm text-texto-suave">Útil para comparar preços</span>
          </span>
          <Interruptor ligado={incluirIndisponiveis} aoMudar={(v) => aoMudar({ todos: v })} />
        </label>
      </Grupo>
    </div>
  )
}

function Grupo({ titulo, children }) {
  return (
    <fieldset className="flex flex-col gap-3 py-5 first:pt-0">
      {titulo && <legend className="mb-3 float-left w-full font-semibold">{titulo}</legend>}
      {children}
    </fieldset>
  )
}

function SelectFiltro({ rotulo, valor, todos, itens, desabilitado, aoMudar }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm text-texto-suave">{rotulo}</Label>
      <Select value={valor ?? TODOS} onValueChange={(v) => aoMudar(v === TODOS ? '' : v)} disabled={desabilitado}>
        <SelectTrigger className="w-full" aria-label={rotulo}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>{todos}</SelectItem>
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

// Valor em reais com separador de milhar; vai para a URL quando a pessoa para de digitar
function CampoValor({ rotulo, valor, aoMudar }) {
  const [texto, setTexto] = useState(valor ? numero(Number(valor)) : '')
  const [valorAnterior, setValorAnterior] = useState(valor)
  const enviar = useAdiado(aoMudar, 600)

  // Acompanha mudanças vindas de fora (limpar filtros, voltar no navegador)
  if (valor !== valorAnterior) {
    setValorAnterior(valor)
    if (soDigitos(texto) !== (valor ?? '')) setTexto(valor ? numero(Number(valor)) : '')
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm text-texto-suave">{rotulo}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-texto-suave">R$</span>
        <Input
          inputMode="numeric"
          aria-label={`Preço ${rotulo.toLowerCase()}`}
          className="tipo-dado pl-9"
          value={texto}
          onChange={(e) => {
            const digitos = soDigitos(e.target.value).slice(0, 9)
            setTexto(digitos ? numero(Number(digitos)) : '')
            enviar(digitos)
          }}
        />
      </div>
    </div>
  )
}

function Interruptor({ ligado, aoMudar }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      onClick={() => aoMudar(!ligado)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${ligado ? 'bg-marca' : 'bg-borda'}`}
    >
      <span
        className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform duration-200 ease-patio ${ligado ? 'translate-x-5' : ''}`}
      />
    </button>
  )
}
