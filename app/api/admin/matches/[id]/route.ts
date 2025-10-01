import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 경기 수정 (결과 수정)
export async function PATCH(
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

    const { homeScore, awayScore, status } = await request.json();
    const { id } = params;

    const updateData: any = {};
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;
    if (status) updateData.status = status;

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: updateData,
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Update match error:', error);
    return NextResponse.json(
      { error: '경기 수정에 실패했습니다' },
      { status: 500 }
    );
  }
}

// 경기 삭제
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

    await prisma.match.delete({
      where: { id }
    });

    return NextResponse.json({
      message: '경기가 성공적으로 삭제되었습니다'
    });
  } catch (error) {
    console.error('Delete match error:', error);
    return NextResponse.json(
      { error: '경기 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
