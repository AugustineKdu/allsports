import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

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

    // 출석체크의 경우 하루에 한 번만 가능
    if (missionType === 'DAILY_CHECK_IN') {
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
          return NextResponse.json(
            { error: 'Already checked in today' },
            { status: 400 }
          );
        }
      }
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
