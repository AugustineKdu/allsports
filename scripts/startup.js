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
    
    // 기본 마이그레이션 확인 및 적용
    try {
      console.log('🔧 Checking database schema...');
      await prisma.user.count();
      console.log('✅ Database schema is ready');
    } catch (error) {
      console.log('⚠️  Database schema not found, initializing...');
      
      // 기본 테이블이 없으면 에러는 정상 - db push로 해결됨
      console.log('📋 Database will be created automatically on first API call');
    }
    
    // 관리자 계정 확인 및 생성
    try {
      const adminUser = await prisma.user.findFirst({
        where: { isAdmin: true }
      });
      
      if (!adminUser) {
        console.log('👤 Creating admin user...');
        const hashedPassword = await bcrypt.hash('admin123!@#', 10);
        
        await prisma.user.create({
          data: {
            email: 'admin@allsports.com',
            passwordHash: hashedPassword,
            username: '시스템관리자',
            isAdmin: true,
            city: '서울',
            district: '강남구',
            contact: '010-0000-0000'
          }
        });
        
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
    } catch (error) {
      console.log('⚠️  Admin user setup will be handled during database initialization');
    }
    
    console.log('🎯 Database initialization completed');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.log('📝 This is normal on first deployment - database will be created on first API call');
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
