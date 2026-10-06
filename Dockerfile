# Imagem do site para rodar com Docker (o deploy oficial é na Vercel, que não usa este arquivo)

# 1) Build com o Node. O Vite grava as variáveis VITE_* no JavaScript nesta etapa
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_STRIPE_PUBLISHABLE_KEY=
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
RUN npm run build

# 2) Só os arquivos gerados, servidos pelo nginx, que também repassa /api para a API (API_URL)
FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV API_URL=http://host.docker.internal:8080
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
