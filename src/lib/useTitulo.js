import { useEffect } from 'react'

const PADRAO = 'Pátio · Carros novos e usados'

/**
 * Título da aba do navegador para a página atual ("Corolla XEi · Pátio").
 * Sem título (ou enquanto os dados carregam), volta ao nome do site.
 * Diferencia as abas e o histórico, e o leitor de tela anuncia a página nova (WCAG 2.4.2).
 */
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Pátio` : PADRAO
  }, [titulo])
}
