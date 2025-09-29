const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test database query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('⏰ Database time:', result[0].current_time);

    // Check if tables exist
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    console.log('📊 Tables in database:', Number(tableCount[0].count));

    if (Number(tableCount[0].count) === 0) {
      console.log('⚠️  No tables found. Run: npx prisma migrate dev');
    } else {
      console.log('✅ Database tables exist');
    }

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);

    if (error.code === 'ENOTFOUND') {
      console.error('💡 Check your DATABASE_URL host address');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Database server is not running or wrong port');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Check your username/password in DATABASE_URL');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();