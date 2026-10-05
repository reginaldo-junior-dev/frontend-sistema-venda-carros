import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Ensina ao tailwind-merge os tokens do tema; sem isso, "text-lead" é tratado como cor e remove "text-marca-texto"
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['lead', 'h3', 'h2', 'h1', 'display', 'display-xl'],
      radius: ['plaqueta', 'controle', 'foto'],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
