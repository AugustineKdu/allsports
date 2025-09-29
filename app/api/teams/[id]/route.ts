import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 팀 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const currentUser = await getUserFromToken(token);

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            city: true,
            district: true
          }
        },
        members: {
          where: { status: 'active' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                city: true,
                district: true,
                currentSport: true,
                contact: true
              }
            }
          },
          orderBy: [
            { role: 'asc' }, // owner, captain, member 순
            { joinedAt: 'asc' }
          ]
        },
        homeMatches: {
          take: 5,
          orderBy: { matchDate: 'desc' },
          include: {
            awayTeam: { select: { id: true, name: true } }
          }
        },
        awayMatches: {
          take: 5,
          orderBy: { matchDate: 'desc' },
          include: {
            homeTeam: { select: { id: true, name: true } }
          }
        },
        _count: {
          select: {
            members: { where: { status: 'active' } },
            joinRequests: { where: { status: 'pending' } }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 최근 경기 결합 및 정렬
    const recentMatches = [
      ...team.homeMatches.map(match => ({ ...match, isHome: true })),
      ...team.awayMatches.map(match => ({ ...match, isHome: false }))
    ]
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
      .slice(0, 5);

    // 현재 사용자가 팀장이나 관리자가 아니라면 연락처 정보 숨김
    let canViewContacts = false;
    if (currentUser) {
      const userMembership = team.members.find(member => member.user.id === currentUser.id);
      canViewContacts = userMembership?.role === 'owner' || userMembership?.role === 'admin' || currentUser.isAdmin;
    }

    // 연락처 정보 필터링
    const filteredMembers = team.members.map(member => ({
      ...member,
      user: {
        ...member.user,
        contact: canViewContacts ? member.user.contact : null
      }
    }));

    const teamWithMatches = {
      ...team,
      members: filteredMembers,
      recentMatches,
      homeMatches: undefined,
      awayMatches: undefined
    };

    return NextResponse.json(teamWithMatches);

  } catch (error) {
    console.error('Get team detail error:', error);
    return NextResponse.json(
      { error: '팀 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// 팀 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const teamId = params.id;
    const { name, description, maxMembers } = await request.json();

    // 팀 소유자인지 확인
    const team = await prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (team.ownerId !== user.id) {
      return NextResponse.json(
        { error: '팀 오너만 팀 정보를 수정할 수 있습니다' },
        { status: 403 }
      );
    }

    // 팀 정보 업데이트
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(maxMembers && { maxMembers }),
      }
    });

    return NextResponse.json(updatedTeam);

  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json(
      { error: '팀 정보 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// 팀 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const teamId = params.id;

    // 팀 소유자인지 확인
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: {
            homeMatches: { where: { status: { in: ['proposed', 'confirmed'] } } },
            awayMatches: { where: { status: { in: ['proposed', 'confirmed'] } } }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (team.ownerId !== user.id) {
      return NextResponse.json(
        { error: '팀 오너만 팀을 삭제할 수 있습니다' },
        { status: 403 }
      );
    }

    // 예정된 경기가 있는지 확인
    const upcomingMatches = team._count.homeMatches + team._count.awayMatches;
    if (upcomingMatches > 0) {
      return NextResponse.json(
        { error: '예정된 경기가 있는 팀은 삭제할 수 없습니다' },
        { status: 400 }
      );
    }

    // 팀을 비활성화 (완전 삭제 대신)
    await prisma.team.update({
      where: { id: teamId },
data: { name: `${team.name}_deleted_${Date.now()}` }
    });

    return NextResponse.json({
      message: '팀이 삭제되었습니다'
    });

  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      { error: '팀 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}