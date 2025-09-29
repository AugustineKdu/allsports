import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// 가입 신청 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 토큰 검증
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 없습니다' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

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

    // 팀 오너 또는 관리자만 가입 신청 조회 가능
    const userMembership = team.members[0];
    if (!userMembership || (userMembership.role !== 'owner' && userMembership.role !== 'admin')) {
      return NextResponse.json({ error: '가입 신청을 조회할 권한이 없습니다' }, { status: 403 });
    }

    // 대기 중인 가입 신청 목록 조회
    const joinRequests = await prisma.teamMember.findMany({
      where: {
        teamId: params.id,
        status: 'pending'
      },
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
      orderBy: {
        requestedAt: 'desc'
      }
    });

    return NextResponse.json(joinRequests);

  } catch (error) {
    console.error('가입 신청 조회 실패:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}