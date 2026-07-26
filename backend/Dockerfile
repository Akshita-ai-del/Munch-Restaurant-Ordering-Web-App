# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: build (generate Prisma client) ───────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

# ── Stage 3: production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy production node_modules (without dev deps)
COPY --from=deps /app/node_modules ./node_modules
# Copy generated Prisma client over the production modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy source
COPY src ./src
COPY prisma ./prisma

# Expose API port
EXPOSE 5000

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
