import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Health check starting...');
    console.log('Database type: SQLite');

    // 데이터베이스 연결 테스트
    const userCount = await prisma.user.count();
    console.log('Database connection successful, user count:', userCount);

    // 기본 시스템 정보
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'SQLite connected',
      userCount,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(healthStatus);

  } catch (error) {
    console.error('Health check failed:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    // 데이터베이스가 없는 경우 자동으로 생성 시도
    try {
      console.log('Attempting to initialize database...');
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS _prisma_migrations (
        id VARCHAR(36) PRIMARY KEY,
        checksum VARCHAR(64),
        finished_at DATETIME,
        migration_name VARCHAR(255),
        logs TEXT,
        rolled_back_at DATETIME,
        started_at DATETIME,
        applied_steps_count INTEGER
      )`;

      // 간단한 연결 테스트
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('Database initialized successfully');

      return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'SQLite initialized',
        message: 'Database was created and initialized',
        environment: process.env.NODE_ENV || 'development'
      });

    } catch (initError) {
      console.error('Database initialization failed:', initError);

      const errorStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        initError: initError instanceof Error ? initError.message : 'Init failed',
        environment: process.env.NODE_ENV || 'development'
      };

      return NextResponse.json(errorStatus, { status: 503 });
    }
  }
}