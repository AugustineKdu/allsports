import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Dynamic route handler를 위한 설정
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport') || '축구';
    const scope = searchParams.get('scope') || 'national';
    const city = searchParams.get('city');
    const district = searchParams.get('district');

    let where: any = { sport };

    switch(scope) {
      case 'district':
        if (city && district) {
          where.city = city;
          where.district = district;
        }
        break;
      case 'city':
        if (city) {
          where.city = city;
        }
        break;
      case 'national':
      default:
        // sport만 필터링
        break;
    }

    const teams = await prisma.team.findMany({
      where,
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    // 승률 계산 및 정렬
    const rankedTeams = teams
      .map((team: any) => {
        const totalGames = team.wins + team.draws + team.losses;
        const winRate = totalGames > 0 ? team.wins / totalGames : 0;
        return {
          ...team,
          winRate
        };
      })
      .sort((a, b) => {
        // 1순위: 포인트
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        // 2순위: 승률
        return b.winRate - a.winRate;
      })
      .map((team: any, index: number) => ({
        ...team,
        rank: index + 1
      }));

    return NextResponse.json(rankedTeams);
  } catch (error) {
    console.error('Get rankings error:', error);
    return NextResponse.json(
      { error: '랭킹을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}