const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🚀 Simple startup script running...');
  
  const dbPath = path.join(__dirname, '../prisma/dev.db');
  
  // 데이터베이스 파일이 없으면 생성
  if (!fs.existsSync(dbPath)) {
    console.log('📁 Creating database file...');
    
    try {
      // Prisma db push로 스키마 적용
      console.log('🔧 Applying database schema...');
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      
      // 시드 데이터 추가
      console.log('🌱 Seeding database...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      
      console.log('✅ Database initialized successfully!');
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      console.log('📝 App will continue with empty database');
    }
  } else {
    console.log('✅ Database file already exists');
  }
  
  // 데이터베이스 연결 테스트
  const prisma = new PrismaClient();
  try {
    const userCount = await prisma.user.count();
    console.log(`👥 Users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  No users found - running seed...');
      try {
        execSync('npx prisma db seed', { stdio: 'inherit' });
      } catch (error) {
        console.log('⚠️  Seed failed, but continuing...');
      }
    }
  } catch (error) {
    console.log('⚠️  Database connection test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('🏁 Startup complete');
}

// 스크립트 직접 실행 시
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(0); // 에러가 있어도 앱은 계속 실행
    });
}

module.exports = { initializeDatabase };
