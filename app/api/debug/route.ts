import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ error: 'Debug API only available in production' }, { status: 403 });
  }

  const debug = {
    nodeEnv: process.env.NODE_ENV,
    databaseUrlExists: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
    jwtSecretExists: !!process.env.JWT_SECRET,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(debug);
}
