# ---- deps ----
FROM docker.arvancloud.ir/node:20-alpine AS deps

RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirror.arvancloud.ir|g' /etc/apk/repositories \
  && apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./

# Prefer npm + package-lock. Use npmmirror (more reliable than Arvan npm which returned 503).
ENV npm_config_registry=https://registry.npmmirror.com
ENV yarn_registry=https://registry.npmmirror.com

RUN set -eux; \
  if [ -f package-lock.json ]; then \
    npm ci --registry=https://registry.npmmirror.com \
      || npm ci --registry=https://mirror.arvancloud.ir/npm/ \
      || npm ci --registry=https://repo.huaweicloud.com/repository/npm/; \
  elif [ -f yarn.lock ]; then \
    yarn config set registry https://registry.npmmirror.com \
      && yarn --frozen-lockfile; \
  else \
    npm install --registry=https://registry.npmmirror.com; \
  fi

# ---- builder ----
FROM docker.arvancloud.ir/node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ---- runner ----
FROM docker.arvancloud.ir/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirror.arvancloud.ir|g' /etc/apk/repositories \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
