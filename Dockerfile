# ==========================================
# Base image
# ==========================================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat vips-dev openssl
WORKDIR /app


# ==========================================
# Install dependencies
# ==========================================
FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate


# ==========================================
# Build application
# ==========================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ==========================================
# Production runner (standalone mode)
# ==========================================
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat vips-dev openssl

WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S nodejs -g 1001
RUN adduser -S nextjs -u 1001

# Copy standalone build (web)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
# Worker needs full node_modules (tsx), lib, tsconfig
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json

# Ensure uploads dirs exist (volume will override at runtime)
RUN mkdir -p /app/public/uploads/original /app/public/uploads/small \
    /app/public/uploads/medium /app/public/uploads/large \
    && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
