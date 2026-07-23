# ---- deps ----
FROM docker.arvancloud.ir/node:20-alpine AS deps

RUN sed -i 's|https://dl-cdn.alpinelinux.org|https://mirror.arvancloud.ir|g' /etc/apk/repositories \
  && apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./

ENV npm_config_registry=https://mirror.arvancloud.ir/npm/

RUN \
  if [ -f yarn.lock ]; then \
    yarn config set registry https://mirror.arvancloud.ir/npm/ \
    && yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci --registry=https://mirror.arvancloud.ir/npm/; \
  else \
    npm install --registry=https://mirror.arvancloud.ir/npm/; \
  fi

# ---- builder ----
FROM docker.arvancloud.ir/node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN \
  if [ -f yarn.lock ]; then yarn build; \
  else npm run build; \
  fi

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
