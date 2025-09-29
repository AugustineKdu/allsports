import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

// 팀 가입 요청 목록 조회
export async function GET(
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
        { error: '팀 오너만 가입 요청을 조회할 수 있습니다' },
        { status: 403 }
      );
    }

    // 가입 요청 목록 조회
    const requests = await prisma.teamJoinRequest.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            city: true,
            district: true,
            currentSport: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests);

  } catch (error) {
    console.error('Get join requests error:', error);
    return NextResponse.json(
      { error: '가입 요청 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// 가입 요청 승인/거절
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

    const { requestId, action } = await request.json(); // action: 'approve' | 'reject'
    const teamId = params.id;

    // 팀 소유자인지 확인
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

    if (team.ownerId !== user.id) {
      return NextResponse.json(
        { error: '팀 오너만 가입 요청을 처리할 수 있습니다' },
        { status: 403 }
      );
    }

    // 가입 요청 조회
    const joinRequest = await prisma.teamJoinRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!joinRequest || joinRequest.teamId !== teamId) {
      return NextResponse.json(
        { error: '가입 요청을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    if (joinRequest.status !== 'pending') {
      return NextResponse.json(
        { error: '이미 처리된 요청입니다' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // 팀 인원 제한 확인
      if (team._count.members >= team.maxMembers) {
        return NextResponse.json(
          { error: '팀 인원이 가득찼습니다' },
          { status: 400 }
        );
      }

      // 트랜잭션으로 승인 처리
      await prisma.$transaction(async (tx: any) => {
        // 가입 요청 승인
        await tx.teamJoinRequest.update({
          where: { id: requestId },
          data: {
            status: 'approved',
            handledBy: user.id,
            handledAt: new Date()
          }
        });

        // 팀 멤버로 추가
        await tx.teamMember.create({
          data: {
            teamId,
            userId: joinRequest.userId,
            status: 'active',
            role: 'member',
            approvedBy: user.id,
            approvedAt: new Date()
          }
        });
      });

      return NextResponse.json({
        message: `${joinRequest.user.username}님의 가입을 승인했습니다`
      });

    } else if (action === 'reject') {
      // 가입 요청 거절
      await prisma.teamJoinRequest.update({
        where: { id: requestId },
        data: {
          status: 'rejected',
          handledBy: user.id,
          handledAt: new Date()
        }
      });

      return NextResponse.json({
        message: `${joinRequest.user.username}님의 가입을 거절했습니다`
      });

    } else {
      return NextResponse.json(
        { error: '잘못된 액션입니다' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Handle join request error:', error);
    return NextResponse.json(
      { error: '가입 요청 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}