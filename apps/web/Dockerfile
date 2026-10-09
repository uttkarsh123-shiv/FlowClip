# Build context: apps/web
# Run: docker build --build-arg NEXT_PUBLIC_EXTENSION_ID=xxx -t image-name ./apps/web

# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Recreate the lockfile for linux/x64 — the committed lockfile was generated on
# Windows and contains win32 platform-specific binaries that npm ci rejects on Linux.
RUN npm install --ignore-scripts
# Build bcrypt native bindings (required for C++ performance)
RUN npm rebuild bcrypt --build-from-source

# ─── Stage 2: builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* baked into the client bundle at build time
ARG NEXT_PUBLIC_EXTENSION_ID
ENV NEXT_PUBLIC_EXTENSION_ID=$NEXT_PUBLIC_EXTENSION_ID

# Dummy values so module-level guards don't throw during Next.js static analysis.
# Next.js imports all route modules at build time — none of these are actually called.
# Real values are injected at runtime via --env-file.
ARG DATABASE_URL=postgresql://placeholder:placeholder@placeholder/placeholder
ENV DATABASE_URL=$DATABASE_URL
ARG AWS_ENDPOINT_URL_S3=https://placeholder.storage.example.com
ENV AWS_ENDPOINT_URL_S3=$AWS_ENDPOINT_URL_S3
ARG AWS_ACCESS_KEY_ID=placeholder_key_id
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY=placeholder_secret
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ARG AWS_REGION=ap-southeast-1
ENV AWS_REGION=$AWS_REGION
ARG GEMINI_API_KEY=placeholder_gemini_key
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ARG ADMIN_SECRET=placeholder_admin_secret
ENV ADMIN_SECRET=$ADMIN_SECRET

RUN npm run build

# ─── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
