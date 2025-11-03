import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

// GET /api/prism/transactions - Prism 포인트 거래 내역 조회
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // URL에서 limit 파라미터 추출
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const transactions = await prisma.prismTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // 총 적립 금액과 사용 금액 계산
    const stats = await prisma.prismTransaction.aggregate({
      where: { userId },
      _sum: {
        amount: true
      }
    });

    const earned = await prisma.prismTransaction.aggregate({
      where: {
        userId,
        amount: { gt: 0 }
      },
      _sum: {
        amount: true
      }
    });

    const spent = await prisma.prismTransaction.aggregate({
      where: {
        userId,
        amount: { lt: 0 }
      },
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      transactions,
      stats: {
        totalEarned: earned._sum.amount || 0,
        totalSpent: Math.abs(spent._sum.amount || 0),
        currentBalance: stats._sum.amount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching prism transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
