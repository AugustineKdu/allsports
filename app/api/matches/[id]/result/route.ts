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

    const { homeScore, awayScore } = await request.json();

    // 매치 조회
    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        homeTeam: { include: { members: { where: { status: 'active' } } } },
        awayTeam: { include: { members: { where: { status: 'active' } } } },
        creator: true
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: '시합을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (match.status !== 'confirmed') {
      return NextResponse.json(
        { error: '확정된 경기만 결과를 입력할 수 있습니다' },
        { status: 400 }
      );
    }

    // 경기 생성자, 확정자, 또는 양팀 멤버, 관리자만 결과 입력 가능
    const isHomeTeamMember = match.homeTeam.members.some(member => member.userId === user.id);
    const isAwayTeamMember = match.awayTeam.members.some(member => member.userId === user.id);
    const isCreator = match.creator.id === user.id;

    if (!isHomeTeamMember && !isAwayTeamMember && !isCreator && !user.isAdmin) {
      return NextResponse.json(
        { error: '관련된 팀의 멤버만 결과를 입력할 수 있습니다' },
        { status: 403 }
      );
    }

    // 트랜잭션으로 결과 업데이트
    await prisma.$transaction(async (tx) => {
      // 매치 결과 저장
      await tx.match.update({
        where: { id: params.id },
        data: {
          homeScore,
          awayScore,
          status: 'completed',
          resultEnteredAt: new Date()
        }
      });

      // 팀 통계 업데이트
      if (homeScore > awayScore) {
        // 홈팀 승리
        await tx.team.update({
          where: { id: match.homeTeamId },
          data: {
            wins: { increment: 1 },
            points: { increment: 3 }
          }
        });
        await tx.team.update({
          where: { id: match.awayTeamId },
          data: { losses: { increment: 1 } }
        });
      } else if (homeScore < awayScore) {
        // 원정팀 승리
        await tx.team.update({
          where: { id: match.awayTeamId },
          data: {
            wins: { increment: 1 },
            points: { increment: 3 }
          }
        });
        await tx.team.update({
          where: { id: match.homeTeamId },
          data: { losses: { increment: 1 } }
        });
      } else {
        // 무승부
        await tx.team.update({
          where: { id: match.homeTeamId },
          data: {
            draws: { increment: 1 },
            points: { increment: 1 }
          }
        });
        await tx.team.update({
          where: { id: match.awayTeamId },
          data: {
            draws: { increment: 1 },
            points: { increment: 1 }
          }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update result error:', error);
    return NextResponse.json(
      { error: '결과 입력에 실패했습니다' },
      { status: 500 }
    );
  }
}