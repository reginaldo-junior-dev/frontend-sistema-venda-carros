# Pátio · Front-end

Projeto de portfólio full stack que simula o site de uma revenda de carros novos e seminovos, a **Pátio**: vitrine pública, área do cliente com reserva e pagamento online, e painel para a equipe da revenda. Os pagamentos rodam no modo de testes da Stripe.

Este repositório é o **front-end** (React). Ele consome a API [api-sistema-venda-carros](https://github.com/reginaldo-junior-dev/api-sistema-venda-carros) (Spring Boot), que precisa estar rodando para o site funcionar.

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Rodar com Docker](#rodar-com-docker)
- [Pagamentos de teste](#pagamentos-de-teste)
- [Login com Google](#login-com-google)
- [Acesso ao painel da revenda](#acesso-ao-painel-da-revenda)
- [Testes](#testes)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Deploy na Vercel](#deploy-na-vercel)
- [Créditos das imagens](#créditos-das-imagens)

---

## Sobre o projeto

O site tem três tipos de uso:

**Visitante**
- Catálogo com busca por nome, filtros (condição, marca e modelo, tipo de carro, preço, ano, quilometragem, câmbio, combustível e cor) e ordenação. Os filtros ficam na URL, então o link pode ser compartilhado e o botão voltar funciona.
- Página de cada carro com galeria de fotos (tela cheia, deslizar, teclado), ficha técnica e carros parecidos.

**Cliente** (conta de usuário comum)
- Cadastro com e-mail e senha ou com a conta Google.
- **Reserva online**: ao reservar, o carro sai da vitrine e fica separado por 30 minutos enquanto a pessoa paga.
- Pagamento com **cartão de crédito** (Stripe, com a confirmação do banco quando ele pede), **Pix** ou **boleto**. Pix e boleto são confirmados pela equipe.
- Favoritos, "Tenho interesse" (a equipe entra em contato), minhas compras com pagamentos e parcelas, dados pessoais e endereços (com preenchimento pelo CEP).

**Revenda** (conta de administrador)
- Resumo com faturamento aprovado, estoque por status, pendências e vendas por mês.
- Estoque: cadastro e edição de carros com envio de fotos por arrastar e soltar.
- Cadastros de marcas, modelos, categorias e cores.
- Vendas: confirmar ou recusar Pix e boleto, cancelar reservas, criar e dar baixa em parcelas.
- Quadro de interesses dos clientes e lista de usuários.

O administrador só gerencia: no site ele não reserva, não favorita e não registra interesse.

Outros cuidados do projeto:
- **Acessibilidade**: uso pelo teclado, título próprio em cada página e verificação automática (WCAG 2.1 AA, com axe) das páginas principais nos temas claro e escuro.
- **Tema claro e escuro**, seguindo o sistema ou escolhido no botão do cabeçalho.
- **Desempenho**: cada página é carregada sob demanda, as fotos têm versões em vários tamanhos e o painel da revenda não pesa para quem só compra.
- **Sessão segura**: o login fica num cookie `HttpOnly`, que nenhum JavaScript lê (nem um script injetado), com proteção contra CSRF. O site chama a API pelo próprio endereço (`/api`), por isso o cookie é do próprio site e funciona em todos os navegadores.

---

## Tecnologias

| Área | Ferramenta |
|---|---|
| Base | [React 19](https://react.dev) + [Vite 8](https://vite.dev), em JavaScript |
| Estilo | [Tailwind CSS 4](https://tailwindcss.com) e componentes [shadcn/ui](https://ui.shadcn.com) (Radix) |
| Rotas | [React Router 7](https://reactrouter.com) |
| Dados da API | [TanStack Query 5](https://tanstack.com/query) + [Axios](https://axios-http.com) |
| Formulários | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Pagamento | [Stripe Elements](https://docs.stripe.com/payments/elements) |
| Animações | [Motion](https://motion.dev) |
| Testes | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com), [Playwright](https://playwright.dev) + [axe](https://github.com/dequelabs/axe-core) |
| Lint | [Oxlint](https://oxc.rs) |

---

## Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org) **20.19 ou mais novo** (recomendado: 22)
- A **API rodando** em `http://localhost:8080`. Siga o README do [repositório da API](https://github.com/reginaldo-junior-dev/api-sistema-venda-carros), com Java e PostgreSQL ou pelo Docker.

### Passo a passo

1. **Clone e instale as dependências**

   ```bash
   git clone https://github.com/reginaldo-junior-dev/frontend-sistema-venda-carros.git
   cd frontend-sistema-venda-carros
   npm install
   ```

2. **Crie o arquivo `.env`** na raiz do projeto (ele não vai para o Git):

   ```env
   # Para onde o Vite repassa as chamadas de /api (a API Spring Boot), sem barra no final
   API_URL=http://localhost:8080

   # Chave publicável da Stripe (pk_test_... em desenvolvimento). Opcional
   VITE_STRIPE_PUBLISHABLE_KEY=
   ```

   Todas as variáveis estão explicadas em [Variáveis de ambiente](#variáveis-de-ambiente).

3. **Suba o site**

   ```bash
   npm run dev
   ```

   Abra **http://localhost:5173**. O site chama a API em `/api/...` no próprio endereço, e o Vite repassa essas chamadas para o `API_URL`. Use essa porta: é para ela que a API devolve o login com Google.

---

## Variáveis de ambiente

As variáveis `VITE_*` são gravadas no JavaScript **na hora do build**. Mudou o valor, reinicie o `npm run dev` (ou gere o build de novo).

| Variável | Obrigatória | Para que serve |
|---|---|---|
| `API_URL` | Não | Para onde o `npm run dev` e o `npm run preview` repassam as chamadas de `/api` (padrão: `http://localhost:8080`). Não vai para o JavaScript do site. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Não | Chave **publicável** da Stripe (`pk_test_...` ou `pk_live_...`). Sem ela, o pagamento com cartão mostra um aviso e Pix e boleto continuam funcionando. |
| `VITE_RESERVA_MINUTOS` | Não | Quantos minutos a reserva dura sem pagamento (padrão: `30`). Precisa ser igual ao `compra.expiracao.tempo` da API, senão a contagem na tela fica errada. |

A chave **secreta** da Stripe (`sk_...`) nunca vai no front: ela fica só na API.

---

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o site em modo de desenvolvimento em http://localhost:5173 |
| `npm run build` | Gera a versão de produção na pasta `dist/` |
| `npm run preview` | Serve o build de produção localmente, para conferir antes do deploy |
| `npm run lint` | Verifica o código com o Oxlint |
| `npm test` | Roda os testes unitários e de componente uma vez |
| `npm run test:watch` | Roda os testes unitários a cada arquivo salvo |
| `npm run test:e2e` | Roda os testes de ponta a ponta no navegador (veja [Testes](#testes)) |

---

## Rodar com Docker

Para rodar o site sem instalar o Node. A imagem gera o build e serve os arquivos com o nginx.

```bash
docker compose up --build
```

O site fica em **http://localhost:5173**. O nginx da imagem repassa as chamadas de `/api` para a API em `http://localhost:8080` da sua máquina, que sobe pelo `compose.yaml` do repositório dela.

Para apontar para outra API ou usar uma chave da Stripe, defina no `.env`:

```env
API_URL=http://host.docker.internal:8080
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

O `API_URL` vale ao subir o container. A chave da Stripe entra no build: depois de mudá-la, rode de novo com `--build`.

---

## Pagamentos de teste

Com uma chave `pk_test_...`, nenhum dinheiro de verdade é cobrado, e a tela de pagamento mostra os cartões de teste da Stripe:

| Cartão | Resultado |
|---|---|
| `4242 4242 4242 4242` | Aprovado na hora |
| `4000 0027 6000 3184` | Pede a confirmação do banco (3D Secure) |
| `4000 0000 0000 9995` | Recusado por saldo |

Use qualquer validade futura e qualquer CVC de 3 dígitos.

**Cartão com confirmação do banco:** o resultado chega à API pelo webhook da Stripe. Em desenvolvimento, deixe o [Stripe CLI](https://docs.stripe.com/stripe-cli) encaminhando os avisos para a API num terminal aberto:

```bash
stripe listen --forward-to localhost:8080/stripe/webhook
```

Sem ele, a API ainda confere esses pagamentos direto na Stripe a cada minuto, então a compra é aprovada com até 1 minuto de atraso.

**Pix e boleto** ficam aguardando até alguém da equipe confirmar o recebimento em **Painel → Vendas → Pagamentos**.

---

## Login com Google

O botão "Continuar com Google" leva para a API (pelo `/api` do site), que faz o login com o Google, grava o cookie da sessão e devolve a pessoa para `/oauth/callback`. Essa página só pergunta à API quem entrou e segue para a home, ou para o painel se for administrador.

Para funcionar, a API precisa das credenciais do Google configuradas (veja o README da API), e o endereço de retorno cadastrado no Google Cloud passa pelo site:

- em desenvolvimento: `http://localhost:5173/api/login/oauth2/code/google`;
- em produção: `https://<seu-site>.vercel.app/api/login/oauth2/code/google`.

Sem as credenciais, o login com e-mail e senha continua funcionando normalmente.

---

## Acesso ao painel da revenda

O painel fica em **`/admin`** e só abre para contas de administrador. O cadastro pelo site sempre cria uma conta de cliente; para virar administrador:

1. Crie uma conta normalmente pelo site (`/criar-conta`).
2. Promova a conta no banco de dados da API:

   ```sql
   UPDATE usuario SET perfil = 'ADMINISTRADOR' WHERE email = 'seu@email.com';
   ```

   Se a API estiver rodando pelo Docker, o mesmo comando vai assim (na pasta da API):

   ```bash
   docker compose exec db psql -U venda_carros -d venda_carros -c "UPDATE usuario SET perfil = 'ADMINISTRADOR' WHERE email = 'seu@email.com';"
   ```

3. **Recarregue a página**: a API confere o perfil no banco a cada requisição, e o site busca a conta de novo ao carregar.

Ao entrar como administrador, o site leva direto para o painel.

---

## Testes

```bash
npm test            # unitários e de componente
npm run test:e2e    # ponta a ponta
```

**Unitários e de componente (Vitest + Testing Library):** regras de negócio do front (filtros do catálogo, prazo da reserva, formatação de valores, tratamento de erros da API) e componentes como as proteções de rota e o que o administrador vê no detalhe do carro.

**Ponta a ponta (Playwright):** fluxos completos no navegador, em tela de computador e de celular:
- visitante buscando e filtrando carros;
- cliente reservando e pagando com Pix;
- administrador entrando no painel;
- saída da conta e volta do login com Google;
- verificação de acessibilidade com axe em todas as páginas principais, nos temas claro e escuro.

Esses testes **não precisam da API**: eles usam uma API simulada (`e2e/api-falsa.js`) e rodam contra o build de produção. Na primeira vez, instale o navegador usado por eles:

```bash
npx playwright install chromium
```

Quando algum teste falha, o relatório fica em `playwright-report/` (abra com `npx playwright show-report`).

**CI:** a cada push e pull request na `main`, o GitHub Actions roda o lint e todos os testes (`.github/workflows/ci.yml`).

---

## Estrutura de pastas

```
src/
├── app/              # rotas, layouts (site, conta, painel) e páginas gerais (404, erro, sem acesso)
├── components/
│   ├── ui/           # componentes base (botão, diálogo, select...) a partir do shadcn/ui
│   └── shared/       # componentes do projeto usados em várias telas (plaqueta, preço, estados)
├── features/         # uma pasta por área do site
│   ├── admin/        # painel da revenda
│   ├── auth/         # login, cadastro, sessão e proteção de rotas
│   ├── catalogo/     # home, catálogo, filtros e detalhe do carro
│   ├── cliente/      # dados de comprador (CPF, telefone, nascimento)
│   ├── compra/       # reserva, pagamento e minhas compras
│   ├── conta/        # meus dados, endereços, favoritos e interesses
│   ├── favoritos/
│   └── interesses/
├── lib/              # cliente HTTP, sessão, formatação, enums e outros utilitários
├── styles/           # tema (cores, tipografia) do Tailwind
└── test/             # configuração e utilitários dos testes unitários
e2e/                  # testes de ponta a ponta e a API simulada
public/               # imagens, vídeos e arquivos servidos como estão
```

Cada pasta de `features/` segue o mesmo padrão: `api.js` com as chamadas HTTP, `hooks.js` com as consultas do TanStack Query, e os componentes da área. Os testes unitários ficam ao lado do arquivo que testam (`filtros.js` → `filtros.test.js`).

---

## Deploy na Vercel

1. Importe o repositório na [Vercel](https://vercel.com). Ela reconhece o Vite sozinha (build `npm run build`, pasta `dist`).
2. No `vercel.json`, troque `SUA-API.onrender.com` pelo endereço da API no Render. É por ele que a Vercel repassa as chamadas de `/api`. O build na Vercel **falha de propósito** enquanto o endereço de exemplo estiver lá.
3. Em **Settings → Environment Variables**, cadastre `VITE_STRIPE_PUBLISHABLE_KEY`: `pk_test_...` enquanto o site estiver em teste, `pk_live_...` para cobrar de verdade.
4. Na API publicada, configure `FRONTEND_URL` com o endereço do site na Vercel (sem barra no final), para o login com Google voltar para ele.

O que o `vercel.json` faz:
- repassa `/api/...` para a API, **sem guardar as respostas em cache**, porque elas trazem dados de quem está logado;
- faz as rotas do site (`/carros/123`, `/conta`...) abrirem direto pelo link;
- deixa os arquivos de `/assets` em cache por um ano;
- adiciona os cabeçalhos de segurança.

---

## Créditos das imagens

As fotos são do [Unsplash](https://unsplash.com) (licença Unsplash: uso livre, inclusive comercial, sem necessidade de atribuição). Cada uma pode ser aberta em `https://images.unsplash.com/<foto>`:

| Arquivo em `public/imagens` | Foto |
|---|---|
| `hero-garagem.webp` | `photo-1621007947382-bb3c3994e3fb` |
| `sedan.webp` | `photo-1502877338535-766e1452684a` |
| `suv.webp` | `photo-1617469767053-d3b523a0b982` |
| `hatch.webp` | `photo-1541899481282-d53bffe3c35d` |
| `picape.webp` | `photo-1559416523-140ddc3d238c` |
| `estrada.webp` | `photo-1568605117036-5fe5e7bab0b7` |
| `volante.webp` | `photo-1449965408869-eaa3f722e40d` |
| `portao.webp` | `photo-1563720223185-11003d516935` |

As versões `-480` e `-800` das fotos de categoria são as mesmas imagens em tamanhos menores.
