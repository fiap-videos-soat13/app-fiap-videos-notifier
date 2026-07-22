FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache wget

FROM base AS deps
COPY package.json yarn.lock* ./
RUN corepack enable && yarn install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN yarn build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S fiap && adduser -S fiap -G fiap
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
USER fiap
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3002/health/live || exit 1
CMD ["node", "dist/adapter/infra/http/Main.js"]

FROM runner AS migrator
COPY scripts/docker-migrate.js ./scripts/docker-migrate.js
USER fiap
ENTRYPOINT []
CMD ["node", "scripts/docker-migrate.js"]
