import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // Sem pausar quando o navegador se diz offline: a API pode estar na rede local, e o erro precisa aparecer
      networkMode: 'always',
      refetchOnWindowFocus: false,
      // Erros 4xx são definitivos; só vale insistir em falha de rede ou 5xx
      retry: (tentativas, erro) => tentativas < 2 && (erro?.status === 0 || erro?.status >= 500),
    },
    mutations: { retry: false, networkMode: 'always' },
  },
})
