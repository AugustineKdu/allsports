import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 사용자 권한 수정
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

    const { isAdmin } = await request.json();
    const { id } = params;

    // 자기 자신의 권한은 변경할 수 없음
    if (admin.id === id) {
      return NextResponse.json(
        { error: '자기 자신의 권한은 변경할 수 없습니다' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: '사용자 권한 변경에 실패했습니다' },
      { status: 500 }
    );
  }
}
