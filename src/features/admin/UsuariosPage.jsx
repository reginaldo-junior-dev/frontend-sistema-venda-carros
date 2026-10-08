import { useState } from 'react'
import { MapPin, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EstadoErro } from '@/components/shared/Estados'
import { Paginacao } from '@/components/shared/Paginacao'
import { useAuth } from '@/features/auth/useAuth'
import { PERFIL } from '@/lib/enums'
import { cep, cpf, data, numero, telefone } from '@/lib/format'
import { useClientesAdmin, useEnderecosDoCliente, useExcluirUsuario, useUsuariosAdmin } from './hooks'
import { CabecalhoAdmin, LinhaVazia, LinhasCarregando, Tabela } from './ui'
import { useConfirmacao } from './useConfirmacao'

export default function UsuariosPage() {
  const [pagina, setPagina] = useState(0)
  const usuarios = useUsuariosAdmin({ page: pagina, size: 20, sort: 'nomeCompleto,asc' })
  const clientes = useClientesAdmin()
  const excluir = useExcluirUsuario()
  const { usuario: eu } = useAuth()
  const { confirmar, dialogo } = useConfirmacao()
  const [aberto, setAberto] = useState(null)
  const clientePorUsuario = Object.fromEntries((clientes.data?.itens ?? []).map((c) => [c.usuarioId, c]))

  function pedirExclusao(u) {
    confirmar({
      titulo: `Excluir a conta de ${u.nomeCompleto}?`,
      descricao: 'Remove a conta, os dados de comprador, favoritos, interesses e endereços. Contas com compras não podem ser excluídas.',
      textoBotao: 'Excluir conta',
      perigo: true,
      aoConfirmar: async () => {
        await excluir.mutateAsync(u.id)
        toast.success('Conta excluída.')
      },
    })
  }

  return (
    <div>
      <CabecalhoAdmin
        titulo="Usuários"
        descricao={usuarios.data ? `${numero(usuarios.data.total)} contas cadastradas` : 'Contas de clientes e da equipe'}
      />
      {usuarios.isError ? (
        <EstadoErro erro={usuarios.error} aoTentarDeNovo={usuarios.refetch} />
      ) : (
        <Tabela className={usuarios.isPlaceholderData ? 'opacity-60' : undefined}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Entrada</th>
              <th>Comprador</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.isPending ? (
              <LinhasCarregando colunas={6} />
            ) : usuarios.data.itens.length === 0 ? (
              <LinhaVazia colunas={6}>Nenhuma conta cadastrada.</LinhaVazia>
            ) : (
              usuarios.data.itens.map((u) => {
                const souEu = u.id === eu?.id
                return (
                  <tr key={u.id}>
                    <td>
                      <button type="button" onClick={() => setAberto(u)} className="font-semibold hover:underline">
                        {u.nomeCompleto}
                      </button>
                      {souEu && <span className="ml-2 text-sm text-texto-suave">(você)</span>}
                    </td>
                    <td className="text-texto-suave">{u.email}</td>
                    <td>
                      <Badge tom={u.perfil === 'ADMINISTRADOR' ? 'marca' : 'neutro'}>{PERFIL[u.perfil]}</Badge>
                    </td>
                    <td>{u.provedor === 'GOOGLE' ? 'Google' : 'E-mail e senha'}</td>
                    <td>{clientePorUsuario[u.id] ? 'Cadastro completo' : <span className="text-texto-suave">Sem cadastro</span>}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button tamanho="sm" variante="secundaria" onClick={() => setAberto(u)}>
                          Detalhes
                        </Button>
                        <Button
                          variante="fantasma"
                          tamanho="icone"
                          className="size-9 text-vendido"
                          disabled={u.perfil === 'ADMINISTRADOR'}
                          aria-label={
                            u.perfil === 'ADMINISTRADOR'
                              ? 'Contas de administrador não podem ser excluídas'
                              : `Excluir ${u.nomeCompleto}`
                          }
                          onClick={() => pedirExclusao(u)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </Tabela>
      )}
      {usuarios.data && (
        <div className="mt-6 flex justify-center">
          <Paginacao pagina={usuarios.data.pagina} totalPaginas={usuarios.data.totalPaginas} aoMudar={setPagina} />
        </div>
      )}

      <Sheet open={Boolean(aberto)} onOpenChange={(v) => !v && setAberto(null)}>
        <SheetContent side="right" className="w-[min(28rem,95vw)] gap-0 overflow-y-auto p-0">
          {aberto && <Detalhes usuario={aberto} cliente={clientePorUsuario[aberto.id]} />}
        </SheetContent>
      </Sheet>
      {dialogo}
    </div>
  )
}

function Detalhes({ usuario, cliente }) {
  const enderecos = useEnderecosDoCliente(cliente?.id)
  return (
    <>
      <SheetHeader className="border-b p-6">
        <SheetTitle className="text-h3">{usuario.nomeCompleto}</SheetTitle>
        <SheetDescription>{usuario.email}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-8 p-6">
        <section>
          <h3 className="mb-3 font-semibold">Dados de comprador</h3>
          {cliente ? (
            <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-texto-suave">CPF</dt>
              <dd className="tipo-dado">{cpf(cliente.cpf)}</dd>
              <dt className="text-texto-suave">Nascimento</dt>
              <dd className="tipo-dado">{data(cliente.dataNascimento)}</dd>
              <dt className="text-texto-suave">Telefone</dt>
              <dd className="tipo-dado">{telefone(cliente.telefone)}</dd>
            </dl>
          ) : (
            <p className="text-sm text-texto-suave">Ainda não preencheu os dados de comprador.</p>
          )}
        </section>
        {cliente && (
          <section>
            <h3 className="mb-3 font-semibold">Endereços</h3>
            {enderecos.isPending ? (
              <div className="h-20 animate-pulse rounded-controle bg-superficie-funda" />
            ) : enderecos.data?.length ? (
              <ul className="flex flex-col gap-3">
                {enderecos.data.map((e) => (
                  <li key={e.id} className="flex gap-3 rounded-controle border p-3 text-sm">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-marca" aria-hidden="true" />
                    <address className="not-italic">
                      {e.logradouro}, {e.numero}
                      {e.complemento ? ` - ${e.complemento}` : ''}
                      <br />
                      {e.bairro}, {e.cidade} - {e.estado}
                      <br />
                      <span className="tipo-dado text-texto-suave">CEP {cep(e.cep)}</span>
                      {e.principal && (
                        <Badge tom="marca" className="ml-2">
                          Principal
                        </Badge>
                      )}
                    </address>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-texto-suave">Nenhum endereço cadastrado.</p>
            )}
          </section>
        )}
      </div>
    </>
  )
}
