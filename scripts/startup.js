const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database on startup...');
    
    // 데이터베이스 연결 테스트
    console.log('📊 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // 스키마 강제 적용 (db push 효과)
    console.log('🔧 Applying database schema...');
    
    // 필수 테이블들을 하나씩 생성
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password_hash" TEXT NOT NULL,
        "username" TEXT NOT NULL,
        "contact" TEXT,
        "is_admin" BOOLEAN NOT NULL DEFAULT false,
        "current_sport" TEXT NOT NULL DEFAULT '축구',
        "city" TEXT NOT NULL DEFAULT '서울',
        "district" TEXT,
        "last_active_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "regions" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "city" TEXT NOT NULL,
        "district" TEXT NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true
      )
    `;
    
    await prisma.$executeRaw`
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
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "last_active_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "description" TEXT,
        "max_members" INTEGER NOT NULL DEFAULT 20,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `;
    
    console.log('✅ Database schema created');
    
    // 관리자 계정 확인 및 생성
    console.log('👤 Checking admin user...');
    
    const adminCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users WHERE is_admin = true`;
    const count = adminCount[0]?.count || 0;
    
    if (count === 0) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123!@#', 10);
      const adminId = 'admin-' + Date.now();
      
      await prisma.$executeRaw`
        INSERT INTO users (id, email, password_hash, username, is_admin, city, district, contact)
        VALUES (${adminId}, 'admin@allsports.com', ${hashedPassword}, '시스템관리자', true, '서울', '강남구', '010-0000-0000')
      `;
      
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // 기본 지역 데이터 추가
    console.log('📍 Setting up regions...');
    const regionCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM regions`;
    const regions = regionCount[0]?.count || 0;
    
    if (regions === 0) {
      console.log('📍 Creating basic regions...');
      await prisma.$executeRaw`
        INSERT OR IGNORE INTO regions (city, district) VALUES
        ('서울', '강남구'),
        ('서울', '강동구'),
        ('서울', '송파구'),
        ('경기도', '수원시'),
        ('경기도', '성남시')
      `;
      console.log('✅ Basic regions created');
    }
    
    console.log('🎯 Database initialization completed successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Error details:', error.message);
    // 실패해도 앱은 계속 실행
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('🏁 Startup script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Startup script failed:', error);
            process.exit(0); // 실패해도 앱은 계속 실행되도록
        });
}

module.exports = { initializeDatabase };
