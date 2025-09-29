#!/bin/sh

echo "🚀 Initializing database..."

# 데이터베이스 파일이 없으면 생성
if [ ! -f "prisma/dev.db" ]; then
  echo "📁 Creating database file..."
  mkdir -p prisma
  touch prisma/dev.db
fi

# Prisma 스키마 적용
echo "🔧 Applying database schema..."
npx prisma db push --force-reset

# 시드 데이터 추가
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Database initialization complete!"
