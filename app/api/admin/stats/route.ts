import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

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

    // 전체 통계 조회
    const [
      totalUsers,
      totalTeams,
      totalMatches,
      completedMatches,
      proposedMatches,
      confirmedMatches,
      adminUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.team.count(),
      prisma.match.count(),
      prisma.match.count({ where: { status: 'completed' } }),
      prisma.match.count({ where: { status: 'proposed' } }),
      prisma.match.count({ where: { status: 'confirmed' } }),
      prisma.user.count({ where: { isAdmin: true } })
    ]);

    // 최근 가입 사용자 (7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // 최근 생성 팀 (7일)
    const recentTeams = await prisma.team.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // 최근 경기 (7일)
    const recentMatches = await prisma.match.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // 종목별 통계
    const sportStats = await prisma.team.groupBy({
      by: ['sport'],
      _count: {
        sport: true
      }
    });

    // 지역별 통계 (상위 5개)
    const cityStats = await prisma.team.groupBy({
      by: ['city'],
      _count: {
        city: true
      },
      orderBy: {
        _count: {
          city: 'desc'
        }
      },
      take: 5
    });

    return NextResponse.json({
      overall: {
        totalUsers,
        totalTeams,
        totalMatches,
        completedMatches,
        proposedMatches,
        confirmedMatches,
        adminUsers
      },
      recent: {
        recentUsers,
        recentTeams,
        recentMatches
      },
      sportStats,
      cityStats
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}
