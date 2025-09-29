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

# Install SQLite
RUN apk add --no-cache sqlite

# Copy scripts
COPY --from=builder --chown=nextjs:nodejs /app/scripts/startup-simple.js ./scripts/startup-simple.js

# Make prisma directory writable and create empty database
RUN mkdir -p ./prisma && chmod 777 ./prisma && touch ./prisma/dev.db && chmod 666 ./prisma/dev.db

# Create database tables directly with SQLite
RUN sqlite3 ./prisma/dev.db < /dev/stdin << 'EOF'
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "contact" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT 0,
    "current_sport" TEXT NOT NULL DEFAULT '축구',
    "city" TEXT NOT NULL DEFAULT '서울',
    "district" TEXT,
    "last_active_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "regions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT 1,
    UNIQUE("city", "district")
);

CREATE TABLE IF NOT EXISTS "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "canonical_name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT 1,
    "last_active_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "max_members" INTEGER NOT NULL DEFAULT 20,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE("canonical_name", "sport", "city", "district")
);

CREATE TABLE IF NOT EXISTS "team_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "role" TEXT NOT NULL DEFAULT 'member',
    "message" TEXT,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requested_at" DATETIME,
    "approved_at" DATETIME,
    "approved_by" TEXT,
    FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("approved_by") REFERENCES "users" ("id"),
    UNIQUE("team_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "team_join_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handled_by" TEXT,
    "handled_at" DATETIME,
    FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("handled_by") REFERENCES "users" ("id"),
    UNIQUE("team_id", "user_id")
);

CREATE TABLE IF NOT EXISTS "matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sport" TEXT NOT NULL,
    "home_team_id" TEXT NOT NULL,
    "away_team_id" TEXT NOT NULL,
    "match_date" DATETIME NOT NULL,
    "match_time" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "home_score" INTEGER,
    "away_score" INTEGER,
    "created_by" TEXT NOT NULL,
    "contact_info" TEXT,
    "message" TEXT,
    "result_entered_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("home_team_id") REFERENCES "teams" ("id"),
    FOREIGN KEY ("away_team_id") REFERENCES "teams" ("id"),
    FOREIGN KEY ("created_by") REFERENCES "users" ("id")
);

CREATE TABLE IF NOT EXISTS "disputes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "match_id" TEXT NOT NULL,
    "reported_by" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "admin_notes" TEXT,
    "resolved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("match_id") REFERENCES "matches" ("id"),
    FOREIGN KEY ("reported_by") REFERENCES "users" ("id")
);

-- 관리자 계정 생성
INSERT OR IGNORE INTO "users" (
    "id", "email", "password_hash", "username", "is_admin", "city", "district", "contact"
) VALUES (
    'admin-default',
    'admin@allsports.com',
    '$2a$10$GhLGrbaLTBxfGWQqzrq/WeuqN5zLNnRr7h371lhk3x1u2LRytv5iO',
    '시스템관리자',
    1,
    '서울',
    '강남구',
    '010-0000-0000'
);

-- 기본 지역 추가
INSERT OR IGNORE INTO "regions" ("city", "district") VALUES
('서울', '강남구'),
('서울', '강동구'),
('서울', '송파구'),
('경기도', '수원시'),
('경기도', '성남시');
EOF

CMD ["node", "server.js"]