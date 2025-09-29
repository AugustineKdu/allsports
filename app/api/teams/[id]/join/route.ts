import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 팀 가입 요청
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

    const { message } = await request.json();
    const teamId = params.id;

    // 팀 존재 확인
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { _count: { select: { members: true } } }
    });

    if (!team) {
      return NextResponse.json(
        { error: '팀을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 이미 팀 멤버이거나 가입 요청을 했는지 확인
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id
        }
      }
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        return NextResponse.json(
          { error: '이미 팀 멤버입니다' },
          { status: 400 }
        );
      } else if (existingMember.status === 'pending') {
        return NextResponse.json(
          { error: '이미 가입 요청을 보냈습니다' },
          { status: 400 }
        );
      }
    }

    // 팀 인원 제한 확인
    if (team._count.members >= team.maxMembers) {
      return NextResponse.json(
        { error: '팀 인원이 가득찼습니다' },
        { status: 400 }
      );
    }

    // 가입 요청 생성
    const joinRequest = await prisma.teamMember.create({
      data: {
        teamId,
        userId: user.id,
        message: message || null,
        status: 'pending',
        role: 'member',
        requestedAt: new Date()
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
      }
    });

    return NextResponse.json({
      message: '가입 요청이 전송되었습니다',
      request: joinRequest
    });

  } catch (error) {
    console.error('Join request error:', error);
    return NextResponse.json(
      { error: '가입 요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}