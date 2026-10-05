import { useCallback, useSyncExternalStore } from 'react'

function assinar(callback) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const estaEscuro = () => document.documentElement.classList.contains('dark')

export function useTema() {
  const escuro = useSyncExternalStore(assinar, estaEscuro)
  const alternar = useCallback(() => {
    const novo = !estaEscuro()
    document.documentElement.classList.toggle('dark', novo)
    try {
      localStorage.setItem('tema', novo ? 'escuro' : 'claro')
    } catch {
      // sem storage o tema vale só nesta visita
    }
  }, [])
  return { escuro, alternar }
}
