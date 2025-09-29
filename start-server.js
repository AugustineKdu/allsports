const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting AllSports server...');

async function initializeDatabase() {
  console.log('🔄 Initializing database...');

  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      process.exit(1);
    }

    console.log('📊 Database URL found, creating schema...');

    // Run Prisma DB push to create tables
    console.log('📊 Running Prisma DB push...');
    execSync('npx prisma db push --force-reset', {
      stdio: 'inherit',
      env: process.env
    });

    // Run seed script
    console.log('🌱 Seeding database...');
    execSync('npx prisma db seed', {
      stdio: 'inherit',
      env: process.env
    });

    console.log('✅ Database initialization complete!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);

    // Try without force reset
    try {
      console.log('🔄 Retrying without force reset...');
      execSync('npx prisma db push', {
        stdio: 'inherit',
        env: process.env
      });
      execSync('npx prisma db seed', {
        stdio: 'inherit',
        env: process.env
      });
      console.log('✅ Database initialization complete (retry)!');
    } catch (retryError) {
      console.error('❌ Database retry failed:', retryError.message);
      console.log('⚠️  Continuing without database initialization...');
    }
  }
}

async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    // Start Next.js server
    console.log('🌐 Starting Next.js server...');
    execSync('next start', {
      stdio: 'inherit',
      env: process.env
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();