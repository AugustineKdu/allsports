import { NextResponse } from 'next/server';

export async function GET() {
  // 프로덕션에서만 접근 가능하도록 제한
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ 
      error: 'Debug API only available in production',
      nodeEnv: process.env.NODE_ENV 
    }, { status: 403 });
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  const debug = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    
    // DATABASE_URL 상세 분석
    databaseUrl: {
      exists: !!databaseUrl,
      type: typeof databaseUrl,
      length: databaseUrl?.length || 0,
      prefix: databaseUrl?.substring(0, 20) || 'NOT_SET',
      isPostgreSQL: databaseUrl?.startsWith('postgresql://') || databaseUrl?.startsWith('postgres://'),
      isSQLite: databaseUrl?.includes('file:') || databaseUrl?.includes('.db'),
      isMySQL: databaseUrl?.startsWith('mysql://'),
    },
    
    // 기타 환경변수
    environment: {
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET?.length || 0,
      nextTelemetryDisabled: process.env.NEXT_TELEMETRY_DISABLED,
      appUrl: process.env.APP_URL || 'NOT_SET'
    },
    
    // 문제 진단
    diagnosis: {
      databaseConfigCorrect: !!(databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))),
      jwtConfigCorrect: !!(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16),
      readyForProduction: false
    }
  };

  // 전체 설정 상태 판단
  debug.diagnosis.readyForProduction = 
    debug.diagnosis.databaseConfigCorrect && 
    debug.diagnosis.jwtConfigCorrect;

  return NextResponse.json(debug, { 
    status: debug.diagnosis.readyForProduction ? 200 : 500 
  });
}
