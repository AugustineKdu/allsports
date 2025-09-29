FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create empty database file
RUN mkdir -p prisma && touch prisma/dev.db

# Initialize database with Prisma
RUN npx prisma db push --force-reset || true

# Seed the database
RUN npx prisma db seed || true

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy the database file created during build
COPY --from=builder --chown=nextjs:nodejs /app/prisma/dev.db ./prisma/dev.db || true

# Create and set permissions for database directory
RUN mkdir -p ./prisma && chown -R nextjs:nodejs ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Copy startup script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/startup-simple.js ./scripts/startup-simple.js

# Make prisma directory writable
RUN mkdir -p ./prisma && chmod 777 ./prisma

CMD ["sh", "-c", "node scripts/startup-simple.js || true && node server.js"]