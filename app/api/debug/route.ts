import { NextResponse } from 'next/server';

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: 'SQLite (file-based)',
    status: 'simplified for easy deployment',
    message: 'Using SQLite for simplicity - no environment setup needed!'
  };

  return NextResponse.json(debug);
}
