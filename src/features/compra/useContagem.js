import { useEffect, useState } from 'react'

// Milissegundos que faltam até `alvo`, atualizado a cada segundo (nunca negativo)
export function useContagem(alvo) {
  const [agora, setAgora] = useState(() => Date.now())

  useEffect(() => {
    if (!alvo) return
    const id = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(id)
  }, [alvo])

  return alvo ? Math.max(0, alvo - agora) : null
}
