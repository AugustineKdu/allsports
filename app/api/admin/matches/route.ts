import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 경기 목록 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const sport = searchParams.get('sport') || '';
    const city = searchParams.get('city') || '';

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (sport) {
      where.sport = sport;
    }
    if (city) {
      where.OR = [
        { homeTeam: { city } },
        { awayTeam: { city } }
      ];
    }

    const matches = await prisma.match.findMany({
      where,
      select: {
        id: true,
        sport: true,
        matchDate: true,
        location: true,
        status: true,
        homeScore: true,
        awayScore: true,
        createdAt: true,
        homeTeam: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: '경기 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
