# Plano de Arquitetura — Front-end Sistema de Venda de Carros

> Front-end React para a API `api-sistema-venda-carros` (Spring Boot).
> Este documento traz a visão completa do projeto e o detalhamento da **Fase 1**.
> As fases seguintes ganham seu próprio detalhamento quando a anterior for concluída.

---

## 1. Contexto

| | |
|---|---|
| **Produto** | Revenda de carros novos e usados: vitrine pública, área do cliente e painel administrativo |
| **Público** | Compradores brasileiros (maioria no celular) e a equipe da revenda (desktop) |
| **Trabalho principal da interface** | Fazer o comprador achar o carro certo e reservá-lo com segurança; dar à equipe controle rápido do estoque e das vendas |
| **API** | `http://localhost:8080` — JWT stateless, CORS liberado para `http://localhost:5173` |

### O que a API entrega (e como o front usa)

| Recurso | Endpoints | Acesso | Uso no front |
|---|---|---|---|
| Auth | `POST /auth/login`, `/oauth2/authorization/google` | público | Login e-mail/senha e Google |
| Usuário | `POST /usuario`, `GET/PUT/DELETE /usuario/me` | público / autenticado | Cadastro e conta |
| Cliente | `POST /cliente`, `GET/PUT/DELETE /cliente/me` | autenticado | Dados de comprador (CPF, nascimento, telefone) |
| Endereço | `/endereco` CRUD | autenticado | Endereços do cliente |
| Carro | `GET /carro` (filtros + paginação), `GET /carro/{id}` | público | Catálogo e detalhe |
| Lookups | `GET /marca`, `/modelo`, `/cor`, `/categoria` | público | Nomes nos cards + opções de filtro |
| Imagens | `POST /carro/{id}/imagens` (multipart), `DELETE /carro/imagens/{id}` | admin | Upload no painel |
| Favorito | `POST/DELETE /carro/{id}/favorito`, `GET /cliente/me/favoritos` | autenticado | Coração no card |
| Interesse | `POST /carro/{id}/interesse`, `GET /cliente/me/interesses` | autenticado | "Tenho interesse" |
| Compra | `POST /compra`, `GET /cliente/me/compras` | autenticado | Reserva (expira em **30 min** sem pagamento) |
| Pagamento | `POST /pagamento/cartao` (Stripe), `POST /pagamento`, `GET /cliente/me/pagamentos` | autenticado | Checkout |
| Parcelas | `GET /pagamento/{id}/parcelas`, `GET /parcela/{id}` | dono ou admin | Acompanhamento |
| Admin | CRUDs + `/compra`, `/pagamento/{id}/aprovar\|recusar\|cancelar`, `/interesse/{id}/status`, `/parcela/{id}/pagar` | admin | Painel |

**Contratos importantes**

- **Token:** JWT com `sub` = id do usuário e claim `perfil` (`USUARIO` | `ADMINISTRADOR`).
- **Paginação:** `?page=0&size=20&sort=campo,desc` → resposta `{ content: [...], page: { size, number, totalElements, totalPages } }`.
- **Erros:** `ErroResposta { status, mensagem, data }` e `ErroValidacao { status, mensagens: { campo: msg }, data }`. O segundo é mapeado direto para os campos do formulário.
- **Carro:** `CarroResponse` traz os dados completos e as imagens (`id`, `principal`, `ordem`), mas os relacionamentos chegam só como ID (`modeloId`, `categoriaId`, `corId`). A marca vem via `ModeloResponse.marcaId`. O front resolve os nomes com as listas de lookup em cache (seção 4.4).
- **Imagens:** o `ImagemCarroMapper` ignora o campo `url`, então ele chega `null` no `CarroResponse`. O front busca a URL assinada do S3 (válida por 15 min) em `GET /carro/imagens/{id}/url`, com cache de 10 min (`useUrlImagem`). Isso dá uma requisição por foto. *Melhoria sugerida no back-end:* preencher `url` no mapper e eliminar essas chamadas.
- **Enums:** `CondicaoCarro`, `TipoCombustivel`, `TipoCambio`, `StatusCarro`, `StatusCompra`, `StatusPagamento`, `StatusParcela`, `StatusInteresse`, `MetodoPagamento`. Os rótulos em português ficam em um único arquivo (`lib/enums.js`).

### Ajuste necessário no back-end

O `OAuth2LoginSucessoHandler` hoje escreve o token como texto na resposta. Para o login Google funcionar no front, ele precisa redirecionar:

```java
String destino = UriComponentsBuilder
        .fromUriString(frontendUrl + "/oauth/callback")   // frontendUrl vindo de propriedade
        .queryParam("token", token)
        .build().toUriString();
response.sendRedirect(destino);
```

O front lê o token em `/oauth/callback`, salva e limpa a URL. **Esse ajuste é pré-requisito só do login Google (Fase 3).** A Fase 1 não depende dele.

---

## 2. Stack

| Camada | Escolha | Por quê |
|---|---|---|
| Base | **Vite 8 + React 19** (já no projeto), JavaScript | Já configurado |
| Estilo | **Tailwind CSS v4** (`@tailwindcss/vite`) | Tokens via `@theme`, sem arquivo de config |
| Componentes | **shadcn/ui** (Radix por baixo) | Acessíveis, código no projeto, totalmente restilizáveis |
| Animação | **Motion** (`motion/react`) | Layout animations, transições compartilhadas card → detalhe, `useReducedMotion` |
| Rotas | **React Router 7** (modo data, `createBrowserRouter`) | Loaders, lazy routes, guards |
| Dados do servidor | **TanStack Query 5** + **Axios** | Cache, paginação, invalidação, interceptor de JWT |
| Formulários | **React Hook Form + Zod** | Validação espelhando as regras da API |
| Pagamento | **@stripe/react-stripe-js** | Cartão nunca passa pela API (só `paymentMethodId`) |
| Feedback | **Sonner** | Toasts |
| Ícones | **Lucide** | Padrão do shadcn |
| Gráficos (admin) | **Recharts** | Dashboard |
| Testes | **Vitest + Testing Library**; **Playwright** para fluxos E2E | Fase 6 |

**Ficam de fora de propósito:** Redux/Zustand (o estado global é só a sessão, que cabe num Context; o resto é estado de servidor no TanStack Query) e Lenis/scroll-jacking (prejudica acessibilidade e a rolagem nativa do celular).

---

## 3. Direção visual

### Conceito: "Pátio"

A linguagem vem do próprio mundo da revenda brasileira: **a placa Mercosul**, a **ficha técnica** e o **portão da garagem**. Nada de visual genérico de concessionária com fundo preto e vermelho.

- **Elemento memorável (o único lugar com ousadia):** a faixa azul da placa Mercosul. Ela aparece como a barra de identidade no topo do site, e cada card de carro tem uma "plaqueta" com modelo e ano no formato de placa: fundo branco, faixa azul no topo, cantos de 4px e tipografia expandida.
- **Ficha técnica:** o detalhe do carro mostra as especificações como uma ficha de verdade, em linhas com rótulo à esquerda e valor tabular à direita, sem grade de cards com ícones.
- **Um único momento orquestrado:** na home, a foto do carro em destaque entra com uma revelação de baixo para cima (`clip-path`), **como um portão de garagem subindo**. Nenhuma outra animação acontece sem ação do usuário.

### Tokens

**Cores**

| Token | Hex | Papel |
|---|---|---|
| `asfalto` | `#1E2428` | Texto principal e fundos escuros (cinza-azulado, não preto) |
| `concreto` | `#E8EAE9` | Fundo da página (cinza frio de pátio) |
| `placa` | `#F7F8F6` | Superfícies: cards, plaquetas, formulários |
| `mercosul` | `#0B3D91` | Cor de marca e ações primárias (azul da faixa da placa) |
| `sinal` | `#E8A317` | Âmbar de sinalização, usado **só** para estado de atenção (reservado, expira em…) |
| `verde-livre` / `vermelho-vendido` | `#1F7A4D` / `#B3261E` | Status disponível / vendido e erros |

O modo escuro inverte para fundo `asfalto` e superfícies `#272E33`, mantendo o `mercosul` clareado (`#4C7BD9`) para contraste AA.

**Tipografia: uma família só, usando largura como expressão**

- **Archivo** (variável, eixo de largura 62–125, Google Fonts).
  - *Expandida + pesada* (`wdth 125`, 800) nos títulos e na plaqueta, que lembra o emblema traseiro de um carro.
  - *Normal* (`wdth 100`, 400–500) no corpo do texto.
  - *Condensada* (`wdth 75`, 500) com numerais tabulares (`font-variant-numeric: tabular-nums`) em preços, quilometragem e ficha técnica.
- Escala modular 1.25 (16 → 20 → 25 → 31 → 39 → 49 → 61px), corpo com 16px/1.55 e medida máxima de 70ch.

**Forma**

- O raio varia com a hierarquia: plaqueta e badges 4px, botões e campos 8px, fotos 14px. Nada de um raio único em tudo.
- Sombras só em elementos flutuantes (menus, drawer, modal). Os cards se separam pela cor da superfície (`placa` sobre `concreto`).

### Regras de escrita e de movimento

- **Textos:** sentence case, verbos diretos ("Reservar carro", "Salvar endereço") e o mesmo verbo do botão ao toast ("Reservar" → "Carro reservado"). Erros dizem o que aconteceu e como resolver. Sem rótulos em CAIXA ALTA e sem "→" nos botões.
- **Movimento:**
  - Só o hero da home anima sozinho. Todo o resto responde a uma ação: favoritar (o coração "pulsa"), filtrar (os cards se reorganizam com `layout`), abrir um carro (a foto do card expande até virar a foto do detalhe) e abrir o drawer de filtros.
  - Duração de 180–320ms, easing `[0.22, 1, 0.36, 1]`.
  - Com `prefers-reduced-motion`, as transições viram fade simples ou nenhuma.

### Revisão contra o genérico (o que mudou no rascunho)

| Primeiro impulso | Problema | Decisão final |
|---|---|---|
| Fundo preto + vermelho "esportivo" | É o padrão de qualquer site de carro | Cinza concreto + azul da placa Mercosul, que é brasileiro e específico |
| Hero com número grande ("+500 carros") e gradiente | Tratamento padrão de landing page | Foto do carro em destaque com revelação de portão de garagem + busca direta |
| Fade-up em toda seção ao rolar | Lê como gerado por IA | Uma animação só, as demais por ação do usuário |
| Ícones em cards para as especificações | Kit SaaS | Ficha técnica tabular |
| Duas fontes (serif display + sans) | Sem relação com o tema | Archivo variando a largura, como os emblemas automotivos |

---

## 4. Arquitetura

### 4.1 Estrutura de pastas (por funcionalidade)

```
src/
├── app/
│   ├── router.jsx            # createBrowserRouter, rotas lazy
│   ├── providers.jsx         # QueryClient, AuthProvider, Toaster, MotionConfig
│   └── layouts/
│       ├── SiteLayout.jsx    # header com faixa Mercosul + footer
│       ├── ContaLayout.jsx   # navegação da área do cliente
│       └── AdminLayout.jsx   # sidebar do painel
├── features/
│   ├── auth/                 # api.js, AuthContext, useAuth, guards, páginas login/cadastro/callback
│   ├── catalogo/             # api.js, hooks (useCarros, useCarro, useLookups), CarroCard, Plaqueta, Filtros, páginas
│   ├── favoritos/
│   ├── interesses/
│   ├── cliente/              # perfil de comprador + endereços
│   ├── compra/               # reserva, contagem regressiva, checkout, Stripe
│   └── admin/                # dashboard, CRUDs, upload de imagens, gestão
├── components/
│   ├── ui/                   # gerados pelo shadcn (button, input, dialog, sheet...)
│   └── shared/               # EstadoVazio, EstadoErro, Paginacao, Preco, Skeletons
├── lib/
│   ├── http.js               # instância Axios + interceptors
│   ├── query-client.js
│   ├── enums.js              # rótulos PT-BR dos enums da API
│   ├── format.js             # moeda BRL, km, datas, CPF, telefone
│   ├── motion.js             # durações, easings e variants compartilhadas
│   └── utils.js              # cn() do shadcn
├── styles/
│   └── index.css             # @import tailwind, @theme com os tokens, fontes
└── main.jsx
```

Cada feature expõe **`api.js`** (chamadas HTTP puras), **`hooks.js`** (TanStack Query) e componentes. Páginas não chamam Axios direto.

### 4.2 Fluxo de dados

```
Componente ──► hook (useCarros) ──► TanStack Query ──► api.js ──► http (Axios) ──► API
                                       │                             │
                                  cache/invalidação          interceptor: Bearer token,
                                                              401 → logout + redirect
```

- **Query keys** hierárquicas: `['carros', filtros]`, `['carro', id]`, `['lookups', 'marca']`, `['me', 'favoritos']`.
- Os **filtros do catálogo vivem na URL** (`?marcaId=…&precoMax=…&page=1`), então dá para compartilhar e o botão voltar funciona.
- **Mutations** usam update otimista quando a ação é instantânea para o usuário (favoritar) e invalidação simples nas demais.

### 4.3 Autenticação

- `AuthProvider` guarda o token no `localStorage` e decodifica `sub`, `perfil` e `exp`.
- Na carga do app, se houver token, chama `GET /usuario/me` para hidratar nome e e-mail.
- **Guards:** `<RotaAutenticada>` redireciona para `/entrar?voltar=/rota`; `<RotaAdmin>` exige `perfil === 'ADMINISTRADOR'`.
- **401** em qualquer chamada limpa a sessão e leva ao login preservando a rota. **403** mostra a página "Sem acesso".
- Fluxo de comprador: depois do cadastro de usuário, a primeira tentativa de reservar pede os dados de cliente (CPF, nascimento, telefone) num passo único, em vez de exigir antes.

> Observação: guardar o JWT no `localStorage` é o que a API stateless atual permite. Se no futuro a API passar a emitir cookie `HttpOnly`, só o `http.js` e o `AuthProvider` mudam.

### 4.4 Resolução de nomes (lookups)

`useLookups()` busca `/marca`, `/modelo`, `/cor` e `/categoria` em paralelo (com `staleTime` de 30 min) e devolve mapas `id → objeto`. Um helper `descreverCarro(carro, lookups)` retorna `{ marca, modelo, cor, categoria }`. As mesmas listas preenchem os selects de filtro e os formulários do admin.

### 4.5 Rotas

| Rota | Página | Acesso |
|---|---|---|
| `/` | Home: hero, destaques, categorias | público |
| `/carros` | Catálogo com filtros e paginação | público |
| `/carros/:id` | Detalhe: galeria, ficha técnica, ações | público |
| `/entrar`, `/criar-conta`, `/oauth/callback` | Auth | público |
| `/conta` | Dados, endereços | autenticado |
| `/conta/favoritos`, `/conta/interesses`, `/conta/compras` | Área do cliente | autenticado |
| `/conta/compras/:id/pagamento` | Checkout | autenticado |
| `/admin` | Dashboard | admin |
| `/admin/carros`, `/admin/carros/novo`, `/admin/carros/:id` | Estoque + imagens | admin |
| `/admin/cadastros` | Marcas, modelos, cores, categorias (abas) | admin |
| `/admin/vendas` | Compras, pagamentos, parcelas | admin |
| `/admin/interesses` | Funil de interesses | admin |
| `/admin/usuarios` | Usuários e clientes | admin |
| `*` | 404 | público |

Todas as páginas são carregadas com `lazy()`. O admin vira um chunk separado e não pesa para o comprador.

---

## 5. Roteiro de fases

| Fase | Entrega | Depende de |
|---|---|---|
| **1. Fundação** | Setup, design system, camada HTTP/auth, layouts, home | — |
| **2. Catálogo** | Lista com filtros, paginação, card com plaqueta, detalhe com galeria e ficha técnica, favoritos, interesse | 1 |
| **3. Conta** | Login, cadastro, Google, perfil de cliente, endereços, minhas listas | 1 (+ ajuste OAuth no back) |
| **4. Compra e pagamento** | Reserva com contagem regressiva de 30 min, checkout com Stripe Elements (3DS), PIX/boleto, parcelas, histórico | 2, 3 |
| **5. Painel admin** | Dashboard com gráficos, CRUD de estoque, upload de imagens com arrastar e soltar, cadastros, vendas, interesses | 1 |
| **6. Qualidade e entrega** | Testes, acessibilidade, performance, build de produção, README. Remover o `.env.example` e criar o `.env.production` com a URL da API em produção | todas |

### Status da Fase 2 (Catálogo): concluída

- `/carros`: filtros na URL (cada filtro vira um passo no histórico), gaveta de filtros no celular, etiquetas dos filtros ativos, ordenação, paginação de 12 em 12 e grade que se reorganiza com animação.
- `/carros/:id`: galeria (deslize, arrastar, teclado, miniaturas, tela cheia), painel de compra fixo, ficha técnica, descrição e "Parecidos com este".
- Transição card → detalhe pela View Transitions API (`viewTransition` do React Router + `view-transition-name` na foto).
- Favoritos com atualização otimista; "Tenho interesse" com formulário preenchido a partir da conta.
- **Descoberta no back-end:** favoritar e registrar interesse exigem cadastro de cliente (`/cliente`). O `CadastroClienteProvider` pede CPF, nascimento e telefone uma única vez e depois continua a ação.
- **Pendente para a Fase 4:** o botão "Reservar carro" ainda mostra um aviso; a criação da compra (`POST /compra`) e o pagamento entram lá.

### Status da Fase 3 (Conta): concluída

- `/entrar` e `/criar-conta` com foto ao lado, mostrar/esconder senha, indicador de força e botão do Google. Depois de criar a conta, a pessoa entra direto e volta para onde estava (`?voltar=`).
- `/conta` (Meus dados): dados de acesso, dados de comprador (cria ou edita o cliente), endereços com preenchimento pelo CEP (ViaCEP) e exclusão da conta com confirmação.
- `/conta/favoritos` e `/conta/interesses` com os carros, datas e o significado de cada status.
- "Sair" leva à home; sessão expirada leva ao login e volta depois (`saiuPorConta` no `AuthContext`).
- **Regras do back-end refletidas no front:**
  - `PUT /usuario/me` grava a senha enviada como nova senha, sem conferir a atual. O formulário avisa isso. *Melhoria sugerida no back-end:* pedir a senha atual e só trocar quando vier uma nova.
  - Conta Google não pode trocar o e-mail; o campo fica somente leitura.
  - O endereço principal só deixa de ser principal quando outro assume; o primeiro é sempre principal.
- **Pendente no back-end:** o login com Google só funciona depois que o `OAuth2LoginSucessoHandler` redirecionar para `/oauth/callback?token=...` (seção 1).

---

## 6. Fase 1 — Fundação (detalhada)

**Objetivo:** ao fim da fase, o app sobe em `localhost:5173` com a identidade visual aplicada, navega entre rotas, conversa com a API, já sabe quem está logado (com login e-mail/senha básico, para testar os guards) e mostra uma home real com carros vindos do back-end.

### Passo 1 — Limpeza e dependências

1. Remover o conteúdo de exemplo do Vite (`App.jsx`, `App.css`, `assets/hero.png`, `react.svg`, `vite.svg`).
2. Instalar:
   ```bash
   npm i react-router motion @tanstack/react-query axios react-hook-form zod @hookform/resolvers sonner lucide-react clsx tailwind-merge
   npm i -D tailwindcss @tailwindcss/vite @tanstack/react-query-devtools
   ```
3. `vite.config.js`: plugin do Tailwind e alias `@` → `src` (também em `jsconfig.json`, que o shadcn exige).
4. `.env.development` com `VITE_API_URL=http://localhost:8080`, e `.env.example` versionado.

**Pronto quando:** `npm run dev` sobe uma página em branco sem erros e `npm run lint` passa.

### Passo 2 — Design system

1. `styles/index.css`: `@import "tailwindcss"`, Archivo variável (Google Fonts, `wdth` 62..125), `@theme` com as cores, a escala tipográfica, os raios e as durações da seção 3, e as variáveis do modo escuro via `prefers-color-scheme` + classe `.dark`.
2. `npx shadcn@latest init` e mapear as variáveis do shadcn (`--primary`, `--background`…) para os tokens do "Pátio".
3. Adicionar os componentes base: `button input label select sheet dialog dropdown-menu skeleton badge separator tabs sonner`.
4. Restilizar o `button` (variantes `primaria` em `mercosul`, `secundaria`, `fantasma`, `perigo`) e o `badge` (status do carro).
5. Criar `lib/motion.js` com os easings, as durações e as variants (`revelarPortao`, `trocaDeLayout`), e envolver o app em `<MotionConfig reducedMotion="user">`.
6. Criar os componentes de identidade:
   - **`<Plaqueta modelo ano />`**: placa no padrão Mercosul (faixa azul com "BR", texto expandido).
   - **`<Preco valor />`**: BRL condensado e tabular.
   - **`<FaixaMercosul />`**: a barra de identidade do header.
7. Rota temporária `/_kit` mostrando todos os tokens e componentes, para conferir o visual de uma vez. Ela sai antes do build de produção.

**Pronto quando:** `/_kit` mostra cores, escala de tipo, botões, badges e plaqueta em claro e escuro, com foco de teclado visível.

### Passo 3 — Camada HTTP e utilitários

1. `lib/http.js`:
   - Instância Axios com `baseURL` vindo do `.env`.
   - Interceptor de request adiciona `Authorization: Bearer`.
   - Interceptor de response normaliza erros para `{ status, mensagem, campos }`, a partir de `ErroResposta`/`ErroValidacao`, e trata 401.
2. `lib/query-client.js`: `staleTime` de 60s, `retry` só em erro de rede (nunca em 4xx).
3. `lib/enums.js`: rótulos de todos os enums ("FLEX" → "Flex", "AUTOMATICO" → "Automático"…).
4. `lib/format.js`: `moeda`, `km`, `data`, `cpf`, `telefone` (com `Intl`).
5. `components/shared`: `EstadoVazio`, `EstadoErro` (com "Tentar de novo"), `Paginacao`, `SkeletonCard`.

**Pronto quando:** uma chamada para `/carro` com a API de pé loga a página paginada, e com a API desligada o `EstadoErro` aparece com uma mensagem clara.

### Passo 4 — Autenticação base

1. `features/auth/api.js`: `login`, `cadastrar`, `buscarMe`.
2. `AuthContext` + `useAuth()`: `usuario`, `perfil`, `estaLogado`, `ehAdmin`, `entrar()`, `sair()`. Expiração lida do `exp` do JWT.
3. Guards `RotaAutenticada` e `RotaAdmin`.
4. Página `/entrar` com RHF + Zod e erros da API exibidos nos campos. A versão visual completa, o cadastro e o Google ficam na Fase 3.

**Pronto quando:** logar com um usuário comum deixa entrar em `/conta` e bloqueia `/admin`; logar como admin libera os dois; o token expirado ou inválido volta para `/entrar?voltar=…`.

### Passo 5 — Rotas e layouts

1. `app/router.jsx` com todas as rotas da seção 4.5. As páginas que ainda não existem mostram um placeholder simples com o nome da página.
2. **`SiteLayout`:**
   - Faixa Mercosul no topo, logo em Archivo expandida, navegação (Carros, Favoritos, Entrar/menu da conta) e footer.
   - No celular, a navegação vira `Sheet` lateral.
3. `ContaLayout` e `AdminLayout` só com a estrutura.
4. Páginas 404 e "Sem acesso".
5. Restaurar o scroll ao trocar de rota e mover o foco para o `<h1>` de cada página (acessibilidade).

**Pronto quando:** todas as rotas navegam e os layouts funcionam de 360px a 1440px, sem rolagem horizontal.

### Passo 6 — Home

1. **`useLookups()`** e **`useCarros(filtros)`** em `features/catalogo/hooks.js`.
2. **Hero:**
   - À esquerda, título curto em Archivo expandida e uma busca direta (marca + faixa de preço) que leva a `/carros?…`.
   - À direita, a foto do carro disponível mais recente, revelada pelo efeito **portão de garagem**: `clip-path` de baixo para cima, ~700ms, uma vez só.
   ```
   ┌───────────────────────────────────────────────────┐
   │▓▓ BR ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ faixa Mercosul
   │ Logo                  Carros  Favoritos   Entrar   │
   ├───────────────────────────────────────────────────┤
   │ Seu próximo carro     │ ┌───────────────────────┐ │
   │ está no pátio.        │ │                       │ │
   │                       │ │   foto em destaque    │ │
   │ [Marca ▾][Até R$ ▾]   │ │   (portão subindo)    │ │
   │ [Ver carros]          │ └──[COROLLA 2024]───────┘ │
   ├───────────────────────────────────────────────────┤
   │ Chegaram agora                                    │
   │ [card] [card] [card] [card]   ← rolagem lateral no celular
   ├───────────────────────────────────────────────────┤
   │ Por categoria: Sedã  SUV  Hatch  Picape …         │
   └───────────────────────────────────────────────────┘
   ```
3. **`CarroCard`** (versão inicial, refinada na Fase 2):
   - Foto principal, plaqueta, preço, km e câmbio.
   - Badge de status quando o carro não está disponível.
   - Tem `layoutId` na foto, para a transição até o detalhe na Fase 2.
4. Estados de carregamento com skeleton no formato real do card, estado vazio ("Ainda não há carros no pátio") e estado de erro.

**Pronto quando:** a home mostra carros reais da API, com nomes de marca/modelo resolvidos pelos lookups; o hero anima uma vez e respeita o `prefers-reduced-motion`; o Lighthouse no celular fica ≥ 90 em acessibilidade.

### Checklist de saída da Fase 1

- [x] `npm run build` e `npm run lint` sem erros (resta só um aviso de fast refresh no `tabs.jsx` gerado pelo shadcn)
- [x] Visual conferido no navegador em 390px e 1440px, claro e escuro (com uma API de teste)
- [ ] Navegação completa por teclado com foco visível
- [ ] Login/guards testados com usuário comum e admin, **com a API real**
- [x] API desligada mostra o estado de erro com "Tentar de novo"
- [ ] Revisão com `/code-review` e `/simplify`

### Notas de implementação

- O `tailwind-merge` precisa conhecer os tokens do tema (`lib/utils.js`). Sem isso, ele trata `text-lead` como cor e apaga `text-marca-texto`.
- `networkMode: 'always'` no QueryClient: a API roda na rede local, então o erro deve aparecer em vez de a consulta ficar pausada quando o navegador se diz offline.
- Estados de carregamento usam `isPending`, e não `isLoading`, que fica `false` quando o TanStack pausa as novas tentativas.
- A rota `/_kit` (vitrine do design system) só existe em desenvolvimento.

### Skills usadas na Fase 1

- `frontend-design`: direção visual e revisão de cada tela.
- `run` + `claude-in-chrome`: subir o app e conferir telas, responsividade e animação.
- `code-review` / `simplify`: no fechamento da fase.
