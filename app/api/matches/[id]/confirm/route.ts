import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function POST(
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

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        homeTeam: { include: { members: { where: { status: 'active' } } } },
        awayTeam: { include: { members: { where: { status: 'active' } } } }
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: '경기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (match.status !== 'proposed') {
      return NextResponse.json(
        { error: '제안된 경기만 확정할 수 있습니다' },
        { status: 400 }
      );
    }

    // 홈팀 또는 어웨이팀의 멤버인지 확인
    const isHomeTeamMember = match.homeTeam.members.some((member: any) => member.userId === user.id);
    const isAwayTeamMember = match.awayTeam.members.some((member: any) => member.userId === user.id);

    if (!isHomeTeamMember && !isAwayTeamMember && !user.isAdmin) {
      return NextResponse.json(
        { error: '해당 팀의 멤버만 경기를 확정할 수 있습니다' },
        { status: 403 }
      );
    }

    const updatedMatch = await prisma.match.update({
      where: { id: params.id },
      data: {
        status: 'confirmed'
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        creator: true
      }
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Confirm match error:', error);
    return NextResponse.json(
      { error: '경기 확정에 실패했습니다' },
      { status: 500 }
    );
  }
}