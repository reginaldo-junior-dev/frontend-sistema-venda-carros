import { Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plaqueta } from '@/components/shared/Plaqueta'
import { Preco } from '@/components/shared/Preco'
import { EstadoErro, EstadoVazio } from '@/components/shared/Estados'

// Vitrine do design system, só em desenvolvimento (rota /_kit)
const CORES = [
  ['fundo', 'Concreto'],
  ['superficie', 'Placa'],
  ['superficie-funda', 'Superfície funda'],
  ['texto', 'Asfalto'],
  ['texto-suave', 'Texto suave'],
  ['marca', 'Mercosul'],
  ['sinal', 'Sinal'],
  ['livre', 'Livre'],
  ['vendido', 'Vendido'],
]

const ESCALA = [
  ['text-display-xl', '61px'],
  ['text-display', '49px'],
  ['text-h1', '39px'],
  ['text-h2', '31px'],
  ['text-h3', '25px'],
  ['text-lead', '20px'],
  ['text-base', '16px'],
  ['text-sm', '14px'],
]

export default function KitPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="tipo-emblema text-h1">Kit do Pátio</h1>

      <Secao titulo="Cores">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CORES.map(([token, nome]) => (
            <div key={token} className="flex flex-col gap-2">
              <div className="h-20 rounded-controle border" style={{ background: `var(--${token})` }} />
              <p className="font-semibold">{nome}</p>
              <p className="text-sm text-texto-suave">--{token}</p>
            </div>
          ))}
        </div>
      </Secao>

      <Secao titulo="Tipografia">
        <div className="flex flex-col gap-4">
          {ESCALA.map(([classe, px]) => (
            <div key={classe} className="flex items-baseline gap-6 border-b pb-4">
              <span className="tipo-dado w-14 shrink-0 text-texto-suave">{px}</span>
              <span className={`tipo-emblema ${classe} truncate`}>Corolla XEi 2.0</span>
            </div>
          ))}
          <p className="max-w-[70ch]">
            Corpo em Archivo largura normal. Sedã completo, único dono, revisões na concessionária e manual. Pneus
            novos e documentação em dia, pronto para transferência.
          </p>
          <p className="tipo-dado text-h3">R$ 129.900 / 32.450 km / 2023/2024</p>
        </div>
      </Secao>

      <Secao titulo="Identidade">
        <div className="flex flex-wrap items-end gap-6">
          <Plaqueta tamanho="sm">Onix</Plaqueta>
          <Plaqueta tamanho="md">Compass</Plaqueta>
          <Plaqueta tamanho="lg">Corolla</Plaqueta>
          <Preco valor={129900} tamanho="sm" />
          <Preco valor={129900} tamanho="md" />
          <Preco valor={129900} tamanho="lg" />
        </div>
      </Secao>

      <Secao titulo="Botões">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Reservar carro</Button>
          <Button variante="secundaria">Tenho interesse</Button>
          <Button variante="fantasma">Cancelar</Button>
          <Button variante="perigo">Excluir carro</Button>
          <Button variante="link">Ver ficha completa</Button>
          <Button variante="secundaria" tamanho="icone" aria-label="Favoritar">
            <Heart />
          </Button>
          <Button tamanho="sm">Pequeno</Button>
          <Button tamanho="lg">Grande</Button>
          <Button disabled>Desabilitado</Button>
        </div>
      </Secao>

      <Secao titulo="Status">
        <div className="flex flex-wrap gap-3">
          <Badge tom="livre">Disponível</Badge>
          <Badge tom="atencao">Reservado</Badge>
          <Badge tom="vendido">Vendido</Badge>
          <Badge tom="marca">Zero km</Badge>
          <Badge>Flex</Badge>
        </div>
      </Secao>

      <Secao titulo="Campos">
        <div className="grid max-w-md gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kit-email">E-mail</Label>
            <Input id="kit-email" placeholder="nome@exemplo.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kit-cpf">CPF</Label>
            <Input id="kit-cpf" aria-invalid defaultValue="111.111.111-11" />
            <p className="text-sm text-vendido">CPF inválido. Confira os 11 números.</p>
          </div>
        </div>
      </Secao>

      <Secao titulo="Estados">
        <div className="grid gap-4 md:grid-cols-2">
          <EstadoVazio titulo="Nenhum favorito ainda" descricao="Toque no coração de um carro para guardar aqui." />
          <EstadoErro erro={new Error('Não foi possível conectar ao servidor.')} aoTentarDeNovo={() => {}} />
        </div>
      </Secao>
    </div>
  )
}

function Secao({ titulo, children }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lead font-semibold text-texto-suave">{titulo}</h2>
      {children}
    </section>
  )
}
