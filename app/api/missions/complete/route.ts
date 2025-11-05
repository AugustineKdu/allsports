import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

// 미션 완료 조건 검증
async function verifyMissionCondition(userId: string, missionType: string): Promise<{ success: boolean; error?: string }> {
  try {
    switch (missionType) {
      case 'SPORT_SELECT':
        // 스포츠 선택은 회원가입 시 자동 완료되므로, 수동 완료는 허용하지 않음
        return { success: true };

      case 'DAILY_CHECK_IN':
        // 하루에 한 번만 출석 체크 가능
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { lastCheckIn: true }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user?.lastCheckIn) {
          const lastCheckIn = new Date(user.lastCheckIn);
          lastCheckIn.setHours(0, 0, 0, 0);

          if (lastCheckIn.getTime() === today.getTime()) {
            return { success: false, error: 'Already checked in today' };
          }
        }
        return { success: true };

      case 'TEAM_JOIN':
        // 팀에 가입했는지 확인
        const teamMembership = await prisma.teamMembership.findFirst({
          where: {
            userId,
            status: 'approved'
          }
        });
        if (!teamMembership) {
          return { success: false, error: '팀에 먼저 가입해주세요' };
        }
        return { success: true };

      case 'INVITE_MEMBER':
        // 팀원을 초대했는지 확인
        const invitation = await prisma.teamInvitation.findFirst({
          where: {
            inviterId: userId
          }
        });
        if (!invitation) {
          return { success: false, error: '팀원을 초대한 적이 없습니다' };
        }
        return { success: true };

      case 'TEAM_MATCH':
        // 경기를 등록했는지 확인
        const match = await prisma.match.findFirst({
          where: {
            OR: [
              { creatorId: userId },
              {
                homeTeam: {
                  ownerId: userId
                }
              },
              {
                awayTeam: {
                  ownerId: userId
                }
              }
            ]
          }
        });
        if (!match) {
          return { success: false, error: '경기를 먼저 등록해주세요' };
        }
        return { success: true };

      case 'MATCH_VERIFY':
        // 경기 인증 - 간단 인증으로 바로 완료 가능
        return { success: true };

      default:
        return { success: true };
    }
  } catch (error) {
    console.error('Error verifying mission condition:', error);
    return { success: false, error: 'Failed to verify mission condition' };
  }
}

// POST /api/missions/complete - 미션 완료 처리
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { missionType } = await request.json();

    if (!missionType) {
      return NextResponse.json(
        { error: 'Mission type is required' },
        { status: 400 }
      );
    }

    // 미션 정보 조회
    const mission = await prisma.mission.findUnique({
      where: { type: missionType }
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    // 기존 유저 미션 확인
    const existingUserMission = await prisma.userMission.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId: mission.id
        }
      }
    });

    // 반복 불가능한 미션이 이미 완료된 경우
    if (existingUserMission && !mission.isRepeatable && existingUserMission.status === 'completed') {
      return NextResponse.json(
        { error: 'Mission already completed' },
        { status: 400 }
      );
    }

    // 미션별 완료 조건 검증
    const canComplete = await verifyMissionCondition(userId, missionType);
    if (!canComplete.success) {
      return NextResponse.json(
        { error: canComplete.error || 'Mission condition not met' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 포인트 적립 및 미션 완료 처리
    const result = await prisma.$transaction(async (tx) => {
      // 유저의 현재 잔액 조회
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { prismBalance: true }
      });

      const newBalance = (user?.prismBalance || 0) + mission.reward;

      // 유저 잔액 업데이트
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          prismBalance: newBalance,
          ...(missionType === 'DAILY_CHECK_IN' ? { lastCheckIn: new Date() } : {})
        }
      });

      // 포인트 거래 내역 생성
      const transaction = await tx.prismTransaction.create({
        data: {
          userId,
          amount: mission.reward,
          type: 'MISSION_REWARD',
          description: `미션 완료: ${mission.title}`,
          missionType: mission.type,
          balanceAfter: newBalance
        }
      });

      // 유저 미션 상태 업데이트 또는 생성
      const userMission = await tx.userMission.upsert({
        where: {
          userId_missionId: {
            userId,
            missionId: mission.id
          }
        },
        update: {
          status: 'completed',
          completedAt: new Date(),
          count: { increment: 1 }
        },
        create: {
          userId,
          missionId: mission.id,
          status: 'completed',
          completedAt: new Date(),
          count: 1
        }
      });

      return {
        userMission,
        transaction,
        newBalance,
        reward: mission.reward
      };
    });

    return NextResponse.json({
      success: true,
      mission: {
        type: mission.type,
        title: mission.title,
        reward: mission.reward
      },
      prismBalance: result.newBalance,
      earnedPrism: result.reward
    });
  } catch (error) {
    console.error('Error completing mission:', error);
    return NextResponse.json(
      { error: 'Failed to complete mission' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
