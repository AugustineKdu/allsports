const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function initializeDatabase() {
  console.log('🔄 Initializing database...');

  try {
    // Run Prisma DB push to create tables
    console.log('📊 Creating database schema...');
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });

    // Run seed script
    console.log('🌱 Seeding database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });

    console.log('✅ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);

    // Try without force reset
    try {
      console.log('🔄 Retrying without force reset...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('✅ Database initialization complete (retry)!');
    } catch (retryError) {
      console.error('❌ Database retry failed:', retryError.message);
      process.exit(1);
    }
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };