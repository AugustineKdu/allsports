import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// 가입 신청 수락/거절
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    // 토큰 검증
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 없습니다' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { action } = await request.json(); // 'approve' 또는 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: '잘못된 액션입니다' }, { status: 400 });
    }

    // 팀 존재 확인 및 권한 체크
    const team = await prisma.team.findUnique({
      where: { id: params.id },
      include: {
        members: {
          where: {
            userId: decoded.userId,
            status: 'active'
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: '팀을 찾을 수 없습니다' }, { status: 404 });
    }

    // 팀 오너 또는 관리자만 가입 신청 처리 가능
    const userMembership = team.members[0];
    if (!userMembership || (userMembership.role !== 'owner' && userMembership.role !== 'admin')) {
      return NextResponse.json({ error: '가입 신청을 처리할 권한이 없습니다' }, { status: 403 });
    }

    // 가입 신청 존재 확인
    const joinRequest = await prisma.teamMember.findUnique({
      where: {
        id: params.requestId,
        teamId: params.id,
        status: 'pending'
      }
    });

    if (!joinRequest) {
      return NextResponse.json({ error: '가입 신청을 찾을 수 없습니다' }, { status: 404 });
    }

    if (action === 'approve') {
      // 팀 최대 인원 확인
      const currentMemberCount = await prisma.teamMember.count({
        where: {
          teamId: params.id,
          status: 'active'
        }
      });

      if (currentMemberCount >= team.maxMembers) {
        return NextResponse.json({ error: '팀 최대 인원을 초과했습니다' }, { status: 400 });
      }

      // 가입 승인
      await prisma.teamMember.update({
        where: { id: params.requestId },
        data: {
          status: 'active',
          role: 'member',
          approvedBy: decoded.userId,
          approvedAt: new Date()
        }
      });

      return NextResponse.json({ message: '가입이 승인되었습니다' });

    } else {
      // 가입 거절 (레코드 삭제)
      await prisma.teamMember.delete({
        where: { id: params.requestId }
      });

      return NextResponse.json({ message: '가입이 거절되었습니다' });
    }

  } catch (error) {
    console.error('가입 신청 처리 실패:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}