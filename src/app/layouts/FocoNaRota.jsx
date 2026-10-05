import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

// Leva o foco ao <h1> da nova página, para leitores de tela anunciarem a troca de rota
export function FocoNaRota() {
  const { pathname } = useLocation()
  const primeiraCarga = useRef(true)

  useEffect(() => {
    if (primeiraCarga.current) {
      primeiraCarga.current = false
      return
    }
    const id = requestAnimationFrame(() => {
      const h1 = document.querySelector('main h1')
      if (!h1) return
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return null
}
