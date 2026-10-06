import { Plaqueta } from '@/components/shared/Plaqueta'
import { MINUTOS_RESERVA } from '@/features/compra/reserva'
import { useTitulo } from '@/lib/useTitulo'

// Moldura das telas de entrar e criar conta: formulário à esquerda, foto do pátio à direita
export function AuthLayout({ titulo, descricao, children }) {
  useTitulo(titulo)
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1fr_1.1fr] lg:items-stretch lg:gap-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="tipo-emblema text-h2">{titulo}</h1>
          {descricao && <p className="text-texto-suave">{descricao}</p>}
        </div>
        {children}
      </div>

      <div className="relative isolate hidden min-h-[560px] overflow-hidden rounded-foto bg-asfalto lg:block">
        <img src="/imagens/hero-garagem.webp" alt="" className="absolute inset-0 -z-10 size-full object-cover object-[60%_center]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(23_28_31/0.9)_0%,rgb(23_28_31/0.2)_55%,transparent_100%)]" />
        <div className="flex h-full flex-col justify-end gap-4 p-10 text-white">
          <Plaqueta tamanho="md" className="self-start">
            Pátio
          </Plaqueta>
          <p className="tipo-emblema max-w-[18ch] text-h2 leading-tight">Reserve online. A chave espera por você.</p>
          <p className="max-w-[40ch] text-white/75">
            Ao reservar, o carro sai da vitrine e fica separado por {MINUTOS_RESERVA} minutos enquanto você paga.
          </p>
        </div>
      </div>
    </div>
  )
}
