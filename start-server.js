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

    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL);

    // Simple database push - create tables
    console.log('📊 Creating database tables...');
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
      timeout: 60000
    });

    // Run seed script
    console.log('🌱 Adding initial data...');
    execSync('npx prisma db seed', {
      stdio: 'inherit',
      env: process.env,
      timeout: 30000
    });

    console.log('✅ Database ready!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('⚠️  Starting server without database setup...');
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