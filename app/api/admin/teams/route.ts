import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 팀 목록 조회
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
    const search = searchParams.get('search') || '';
    const sport = searchParams.get('sport') || '';
    const city = searchParams.get('city') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (sport) {
      where.sport = sport;
    }
    if (city) {
      where.city = city;
    }

    const teams = await prisma.team.findMany({
      where,
      select: {
        id: true,
        name: true,
        sport: true,
        city: true,
        district: true,
        description: true,
        maxMembers: true,
        points: true,
        wins: true,
        losses: true,
        draws: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { error: '팀 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
