import { CAMBIO, COMBUSTIVEL, CONDICAO } from '@/lib/enums'
import { km } from '@/lib/format'
import { tomDaCor } from '@/lib/cores'

// Ficha técnica como numa ficha de pátio: rótulo à esquerda, valor tabular à direita
export function FichaTecnica({ carro, d }) {
  const linhas = [
    ['Marca', d.marca],
    ['Modelo', d.modelo],
    ['Versão', carro.nome],
    ['Ano de fabricação', carro.anoFabricacao, true],
    ['Ano do modelo', carro.anoModelo, true],
    ['Quilometragem', km(carro.quilometragem), true],
    ['Condição', carro.condicao === 'NOVO' ? 'Zero km' : CONDICAO[carro.condicao]],
    ['Câmbio', CAMBIO[carro.cambio]],
    ['Combustível', COMBUSTIVEL[carro.combustivel]],
    ['Categoria', d.categoria],
    ['Cor', d.cor],
  ].filter(([, valor]) => valor !== '' && valor != null)

  return (
    <section aria-labelledby="titulo-ficha">
      <h2 id="titulo-ficha" className="tipo-emblema mb-6 text-h3">
        Ficha técnica
      </h2>
      <dl className="grid border-t sm:grid-cols-2 sm:gap-x-10">
        {linhas.map(([rotulo, valor, numerico]) => (
          <div key={rotulo} className="flex items-baseline justify-between gap-6 border-b py-3.5">
            <dt className="text-texto-suave">{rotulo}</dt>
            <dd className={numerico ? 'tipo-dado text-lead font-semibold' : 'text-right font-semibold'}>
              {rotulo === 'Cor' && tomDaCor(valor) && (
                <span
                  aria-hidden="true"
                  className="mr-2 inline-block size-3 rounded-full border border-black/15 align-middle"
                  style={{ background: tomDaCor(valor) }}
                />
              )}
              {valor}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
