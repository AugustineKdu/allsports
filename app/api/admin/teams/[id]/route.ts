import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 팀 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const admin = await getUserFromToken(token);

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      );
    }

    const { id } = params;

    // 팀 멤버십 삭제
    await prisma.teamMember.deleteMany({
      where: { teamId: id }
    });

    // 해당 팀이 참여한 경기 삭제
    await prisma.match.deleteMany({
      where: {
        OR: [
          { homeTeamId: id },
          { awayTeamId: id }
        ]
      }
    });

    // 팀 삭제
    await prisma.team.delete({
      where: { id }
    });

    return NextResponse.json({
      message: '팀이 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      { error: '팀 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
