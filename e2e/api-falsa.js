import { test as base, expect } from '@playwright/test'
import { API } from '../playwright.config.js'

/**
 * API falsa, com estado em memória por teste. Responde só o que o front usa,
 * no mesmo formato do Spring (página com content/page, ErroResposta com mensagem).
 */

const marcas = [
  { id: 'm-toyota', nome: 'Toyota' },
  { id: 'm-honda', nome: 'Honda' },
]
const modelos = [
  { id: 'mo-corolla', nome: 'Corolla', marcaId: 'm-toyota' },
  { id: 'mo-civic', nome: 'Civic', marcaId: 'm-honda' },
]
const cores = [{ id: 'c-prata', nome: 'Prata' }]
const categorias = [{ id: 'ca-seda', nome: 'Sedã' }]

const carroBase = {
  corId: 'c-prata',
  categoriaId: 'ca-seda',
  condicao: 'USADO',
  combustivel: 'FLEX',
  cambio: 'AUTOMATICO',
  portas: 4,
  descricao: 'Único dono, revisões na concessionária.',
  imagens: [],
}

export const CARROS = [
  { ...carroBase, id: 'car-corolla', nome: 'Corolla XEi', modeloId: 'mo-corolla', preco: 129900, quilometragem: 32000, anoFabricacao: 2022, anoModelo: 2023, status: 'DISPONIVEL' },
  { ...carroBase, id: 'car-civic', nome: 'Civic Touring', modeloId: 'mo-civic', preco: 154900, quilometragem: 18000, anoFabricacao: 2023, anoModelo: 2023, status: 'DISPONIVEL' },
]

// JWT de mentira: o front só lê o payload
export function token(perfil = 'USUARIO', sub = `usuario-${perfil.toLowerCase()}`) {
  const payload = Buffer.from(JSON.stringify({ sub, perfil, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')
  return `e2e.${payload}.assinatura`
}

const pagina = (itens) => ({ content: itens, page: { size: 100, number: 0, totalElements: itens.length, totalPages: 1 } })

export class ApiFalsa {
  constructor() {
    this.carros = structuredClone(CARROS)
    this.cliente = { id: 'cli-1', usuarioId: 'usuario-usuario', cpf: '12345678909', dataNascimento: '1990-05-10', telefone: '11987654321' }
    this.compras = []
    this.pagamentos = []
    this.naoTratadas = []
    // Credenciais aceitas pelo POST /auth/login
    this.contas = {
      'ana@exemplo.com': { senha: 'senha123', perfil: 'USUARIO', nome: 'Ana Souza' },
      'admin@patio.com': { senha: 'admin123', perfil: 'ADMINISTRADOR', nome: 'Equipe Pátio' },
    }
    this.perfilLogado = null
  }

  async instalar(page) {
    await page.route(`${API}/**`, (rota) => this.responder(rota))
  }

  async responder(rota) {
    const req = rota.request()
    const url = new URL(req.url())
    const metodo = req.method()
    const caminho = url.pathname
    const json = (corpo, status = 200) => rota.fulfill({ status, json: corpo })
    const erro = (status, mensagem) => json({ status, mensagem, data: new Date().toISOString() }, status)

    // Público
    if (metodo === 'GET' && caminho === '/marca') return json(marcas)
    if (metodo === 'GET' && caminho === '/modelo') return json(modelos)
    if (metodo === 'GET' && caminho === '/cor') return json(cores)
    if (metodo === 'GET' && caminho === '/categoria') return json(categorias)
    if (metodo === 'GET' && caminho === '/carro') return json(pagina(this.filtrarCarros(url.searchParams)))
    const carro = caminho.match(/^\/carro\/([^/]+)$/)
    if (metodo === 'GET' && carro) {
      const achado = this.carros.find((c) => c.id === carro[1])
      return achado ? json(achado) : erro(404, 'Carro não encontrado')
    }

    if (metodo === 'POST' && caminho === '/auth/login') {
      const { email, senha } = req.postDataJSON()
      const conta = this.contas[email]
      if (!conta || conta.senha !== senha) return erro(401, 'Credenciais inválidas')
      this.perfilLogado = conta.perfil
      return json({ token: token(conta.perfil) })
    }

    // Daqui em diante exige token
    const auth = req.headers().authorization
    if (!auth) return erro(401, 'Não autenticado')
    const perfil = JSON.parse(Buffer.from(auth.split('.')[1], 'base64url').toString()).perfil

    if (metodo === 'GET' && caminho === '/usuario/me') {
      const conta = Object.entries(this.contas).find(([, c]) => c.perfil === perfil)
      return json({ id: `usuario-${perfil.toLowerCase()}`, nomeCompleto: conta[1].nome, email: conta[0], perfil })
    }
    if (metodo === 'GET' && caminho === '/cliente/me') return perfil === 'USUARIO' ? json(this.cliente) : erro(404, 'Cliente não encontrado')
    if (metodo === 'GET' && ['/cliente/me/favoritos', '/cliente/me/interesses'].includes(caminho)) return json(pagina([]))
    if (metodo === 'GET' && caminho === '/endereco') return json([])
    if (metodo === 'GET' && caminho === '/cliente/me/compras') return json(pagina(this.compras))
    if (metodo === 'GET' && caminho === '/cliente/me/pagamentos') return json(pagina(this.pagamentos))

    if (metodo === 'POST' && caminho === '/compra') {
      const { carroId } = req.postDataJSON()
      const alvo = this.carros.find((c) => c.id === carroId)
      if (alvo.status !== 'DISPONIVEL') return erro(409, 'Carro indisponível')
      alvo.status = 'RESERVADO'
      const compra = {
        id: `compra-${this.compras.length + 1}`,
        carroId,
        clienteId: this.cliente.id,
        status: 'PENDENTE',
        valorTotal: alvo.preco,
        dataCompra: new Date().toISOString().slice(0, 19),
      }
      this.compras.unshift(compra)
      return json(compra, 201)
    }
    if (metodo === 'POST' && caminho === '/pagamento') {
      const { compraId, metodo: forma } = req.postDataJSON()
      const pagamento = { id: `pag-${this.pagamentos.length + 1}`, compraId, metodo: forma, status: 'PENDENTE', idExterno: null, dataPagamento: new Date().toISOString() }
      this.pagamentos.unshift(pagamento)
      return json(pagamento, 201)
    }

    // Painel: listas vazias bastam para as telas abrirem
    if (metodo === 'GET' && perfil === 'ADMINISTRADOR') return json(pagina([]))

    this.naoTratadas.push(`${metodo} ${caminho}`)
    return erro(500, `API falsa não sabe responder ${metodo} ${caminho}`)
  }

  filtrarCarros(params) {
    return this.carros.filter((c) => {
      const modelo = modelos.find((m) => m.id === c.modeloId)
      if (params.get('status') && c.status !== params.get('status')) return false
      if (params.get('marcaId') && modelo.marcaId !== params.get('marcaId')) return false
      if (params.get('nome') && !c.nome.toLowerCase().includes(params.get('nome').toLowerCase())) return false
      return true
    })
  }
}

/**
 * `api`: a API falsa já instalada na página.
 * `entrarComo(perfil)`: começa o teste com a sessão salva, sem passar pela tela de login.
 */
export const test = base.extend({
  // auto: instalada em todo teste, mesmo nos que não usam `api` diretamente
  api: [
    async ({ page }, use) => {
      const api = new ApiFalsa()
      await api.instalar(page)
      await use(api)
      // Qualquer chamada que o front fez e a API falsa não conhece é um teste desatualizado
      expect(api.naoTratadas, 'chamadas sem resposta na API falsa').toEqual([])
    },
    { auto: true },
  ],
  entrarComo: async ({ page }, use) => {
    await use(async (perfil) => {
      await page.addInitScript((t) => localStorage.setItem('patio.token', t), token(perfil))
    })
  },
})

export { expect }
