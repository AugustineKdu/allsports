import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 시합 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const status = searchParams.get('status');

    const where: any = {};
    if (sport) where.sport = sport;
    if (status) where.status = status;

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: {
          include: {
            owner: {
              select: {
                id: true
              }
            }
          }
        },
        awayTeam: {
          include: {
            owner: {
              select: {
                id: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        matchDate: 'desc'
      }
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: '시합 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// 시합 생성/제안
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { sport, homeTeamId, awayTeamId, matchDate, matchTime, location, contactInfo, message } = await request.json();

    // 홈팀과 어웨이팀 조회
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({
        where: { id: homeTeamId },
        include: { members: { where: { status: 'active' } } }
      }),
      prisma.team.findUnique({
        where: { id: awayTeamId },
        include: { members: { where: { status: 'active' } } }
      })
    ]);

    if (!homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: '선택한 팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 같은 종목인지 확인
    if (homeTeam.sport !== awayTeam.sport || homeTeam.sport !== sport) {
      return NextResponse.json(
        { error: '같은 종목의 팀끼리만 경기를 생성할 수 있습니다' },
        { status: 400 }
      );
    }

    // 홈팀 또는 어웨이팀의 멤버인지 확인 (팀 오너뿐만 아니라 모든 멤버 허용)
    const isHomeTeamMember = homeTeam.members.some(member => member.userId === user.id);
    const isAwayTeamMember = awayTeam.members.some(member => member.userId === user.id);

    if (!isHomeTeamMember && !isAwayTeamMember && !user.isAdmin) {
      return NextResponse.json(
        { error: '참가하는 팀의 멤버만 시합을 생성할 수 있습니다' },
        { status: 403 }
      );
    }

    const match = await prisma.match.create({
      data: {
        sport: homeTeam.sport,
        homeTeamId,
        awayTeamId,
        matchDate: new Date(matchDate),
        matchTime,
        location,
        contactInfo,
        message,
        status: 'proposed',
        createdBy: user.id
      },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error('Create match error:', error);
    return NextResponse.json(
      { error: '시합 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}