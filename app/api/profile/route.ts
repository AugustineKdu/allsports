import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { username, contact, currentSport, city, district } = await request.json();

    // 입력 검증
    if (!username?.trim()) {
      return NextResponse.json(
        { error: '이름을 입력해주세요' },
        { status: 400 }
      );
    }

    if (!currentSport) {
      return NextResponse.json(
        { error: '선호 스포츠를 선택해주세요' },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { error: '지역을 선택해주세요' },
        { status: 400 }
      );
    }

    if (!district) {
      return NextResponse.json(
        { error: '구/시를 선택해주세요' },
        { status: 400 }
      );
    }

    // 프로필 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username.trim(),
        contact: contact || null,
        currentSport,
        city,
        district
      },
      select: {
        id: true,
        email: true,
        username: true,
        contact: true,
        isAdmin: true,
        currentSport: true,
        city: true,
        district: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: '프로필 업데이트에 실패했습니다' },
      { status: 500 }
    );
  }
}

// 사용자 활동 통계 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    // 사용자 활동 통계 계산
    const [teamCount, matchCount, winCount] = await Promise.all([
      // 가입한 팀 수
      prisma.teamMember.count({
        where: {
          userId: user.id,
          status: 'active'
        }
      }),
      // 참여한 경기 수 (홈팀 또는 원정팀의 멤버로 참여한 경기)
      prisma.match.count({
        where: {
          OR: [
            {
              homeTeam: {
                members: {
                  some: {
                    userId: user.id,
                    status: 'active'
                  }
                }
              }
            },
            {
              awayTeam: {
                members: {
                  some: {
                    userId: user.id,
                    status: 'active'
                  }
                }
              }
            }
          ],
          status: 'completed'
        }
      }),
      // 승리한 경기 수는 별도로 계산
      0 // 임시로 0, 아래에서 따로 계산
    ]);

    // 승리한 경기 수를 별도로 계산
    const completedMatches = await prisma.match.findMany({
      where: {
        OR: [
          {
            homeTeam: {
              members: {
                some: {
                  userId: user.id,
                  status: 'active'
                }
              }
            }
          },
          {
            awayTeam: {
              members: {
                some: {
                  userId: user.id,
                  status: 'active'
                }
              }
            }
          }
        ],
        status: 'completed',
        homeScore: { not: null },
        awayScore: { not: null }
      },
      select: {
        homeScore: true,
        awayScore: true,
        homeTeam: {
          select: {
            members: {
              where: {
                userId: user.id,
                status: 'active'
              },
              select: { userId: true }
            }
          }
        }
      }
    });

    // 승리한 경기 수 계산
    const actualWinCount = completedMatches.filter(match => {
      const isHomeTeamMember = match.homeTeam.members.length > 0;
      if (isHomeTeamMember) {
        return (match.homeScore || 0) > (match.awayScore || 0);
      } else {
        return (match.awayScore || 0) > (match.homeScore || 0);
      }
    }).length;

    return NextResponse.json({
      teamCount,
      matchCount,
      winCount: actualWinCount,
      mvpCount: 0 // MVP 기능은 향후 구현
    });
  } catch (error) {
    console.error('Get profile stats error:', error);
    return NextResponse.json(
      { error: '통계 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}