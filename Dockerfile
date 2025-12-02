# ---------------------------------------------------
# Etapa 1: Dependencias
# ---------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
# Copiamos solo el package.json para instalar librerías
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------
# Etapa 2: Construccion 
# ---------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_GATEWAY_URL
ENV NEXT_PUBLIC_API_GATEWAY_URL=$NEXT_PUBLIC_API_GATEWAY_URL

RUN npm run build

# ---------------------------------------------------
# Etapa 3: Imagen Final - La que va a GKE
# ---------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Creamos un usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos solo lo necesario desde el builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]