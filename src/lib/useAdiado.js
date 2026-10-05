import { useEffect, useRef } from 'react'

// Chama `fn` só depois de `espera` ms sem novas chamadas (para campos de texto e números)
export function useAdiado(fn, espera = 450) {
  const ultimaFn = useRef(fn)
  const timer = useRef(null)

  useEffect(() => {
    ultimaFn.current = fn
  })

  useEffect(() => () => clearTimeout(timer.current), [])

  return (...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => ultimaFn.current(...args), espera)
  }
}
