# syntax=docker/dockerfile:1
# Aufbau wie im Cockpit, ohne Chromium und ffmpeg.

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Der prepare-Schritt sucht sonst ein .git-Verzeichnis, das hier fehlt.
ENV HUSKY=0
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=ouf-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts --store-dir /pnpm/store

# Die Laufzeitpakete hängen nur an der Sperrdatei und bleiben so zwischengespeichert.
FROM base AS proddeps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=ouf-pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts --store-dir /pnpm/store

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Der Schlüssel der Server Actions bleibt im Build-Cache liegen: Mit einem neuen
# scheiterte nach jeder Auslieferung die nächste Aktion in jedem offenen Tab
# (Cockpit, 23.09.2026). Die Kennung des Baus lässt offene Tabs neu laden.
RUN --mount=type=cache,id=ouf-aktionsschluessel,target=/aktionsschluessel \
    --mount=type=cache,id=ouf-next-cache,target=/app/.next/cache,sharing=locked \
    [ -s /aktionsschluessel/key ] || node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64'))" > /aktionsschluessel/key; \
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /aktionsschluessel/key)" \
    NEXT_DEPLOYMENT_ID="$(date +%s)" pnpm build

# Volle Laufzeitpakete statt nur der von Next abgelegten: Den Migrator von
# Drizzle bündelt Next nicht mit.
FROM base AS bundle
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/.next/standalone ./
COPY --from=proddeps /app/node_modules ./node_modules_prod
RUN rm -r node_modules && mv node_modules_prod node_modules

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=bundle --chown=node:node /app ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --chown=node:node public ./public
COPY --chown=node:node drizzle ./drizzle
COPY --chown=node:node scripts/migrate.mts ./scripts/migrate.mts

USER node
EXPOSE 3000

# Das Manifest ist ohne Anmeldung erreichbar und kostet keine Abfrage.
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --start-interval=2s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/manifest.webmanifest >/dev/null || exit 1

CMD ["sh", "-c", "node scripts/migrate.mts && node server.js"]
