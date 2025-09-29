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
      include: { creator: true }
    });

    if (!match) {
      return NextResponse.json(
        { error: '경기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (match.status === 'completed' || match.status === 'cancelled') {
      return NextResponse.json(
        { error: '이미 완료되었거나 취소된 경기입니다' },
        { status: 400 }
      );
    }

    // 경기 생성자이거나 관리자만 취소 가능
    if (match.creator.id !== user.id && !user.isAdmin) {
      return NextResponse.json(
        { error: '경기를 취소할 권한이 없습니다' },
        { status: 403 }
      );
    }

    const updatedMatch = await prisma.match.update({
      where: { id: params.id },
      data: {
        status: 'cancelled'
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        creator: true
      }
    });

    return NextResponse.json(updatedMatch);
  } catch (error) {
    console.error('Cancel match error:', error);
    return NextResponse.json(
      { error: '경기 취소에 실패했습니다' },
      { status: 500 }
    );
  }
}