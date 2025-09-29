import { PrismaClient } from '@prisma/client';

// 환경변수 검증
function validateDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  
  console.log('🔍 Database URL validation:');
  console.log('  DATABASE_URL exists:', !!dbUrl);
  console.log('  DATABASE_URL type:', typeof dbUrl);
  console.log('  DATABASE_URL preview:', dbUrl ? `${dbUrl.substring(0, 20)}...` : 'NOT SET');
  
  if (!dbUrl) {
    throw new Error('❌ DATABASE_URL environment variable is not set!');
  }
  
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.error('❌ Invalid DATABASE_URL format!');
    console.error('  Current:', dbUrl);
    console.error('  Expected: postgresql://username:password@host:port/database');
    throw new Error('DATABASE_URL must start with postgresql:// or postgres://');
  }
  
  console.log('✅ DATABASE_URL validation passed');
}

// 프로덕션에서는 환경변수 검증
if (process.env.NODE_ENV === 'production') {
  validateDatabaseUrl();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;