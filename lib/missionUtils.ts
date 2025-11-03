import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type MissionType =
  | 'SPORT_SELECT'
  | 'TEAM_JOIN'
  | 'INVITE_MEMBER'
  | 'MATCH_VERIFY'
  | 'DAILY_CHECK_IN'
  | 'TEAM_MATCH';

interface CompleteMissionResult {
  success: boolean;
  reward?: number;
  newBalance?: number;
  alreadyCompleted?: boolean;
}

/**
 * 미션 완료 처리 (트랜잭션 내부에서 사용)
 * @param tx Prisma Transaction Client
 * @param userId 유저 ID
 * @param missionType 미션 타입
 * @returns 미션 완료 결과
 */
export async function completeMissionInTransaction(
  tx: any,
  userId: string,
  missionType: MissionType
): Promise<CompleteMissionResult> {
  try {
    // 미션 정보 조회
    const mission = await tx.mission.findUnique({
      where: { type: missionType }
    });

    if (!mission || !mission.isActive) {
      return { success: false };
    }

    // 기존 유저 미션 확인
    const existingUserMission = await tx.userMission.findUnique({
      where: {
        userId_missionId: {
          userId,
          missionId: mission.id
        }
      }
    });

    // 반복 불가능한 미션이 이미 완료된 경우
    if (existingUserMission && !mission.isRepeatable && existingUserMission.status === 'completed') {
      return { success: false, alreadyCompleted: true };
    }

    // 출석체크의 경우 하루에 한 번만 가능 (여기서는 체크하지 않음 - API에서 별도 처리)
    if (missionType === 'DAILY_CHECK_IN') {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { lastCheckIn: true }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (user?.lastCheckIn) {
        const lastCheckIn = new Date(user.lastCheckIn);
        lastCheckIn.setHours(0, 0, 0, 0);

        if (lastCheckIn.getTime() === today.getTime()) {
          return { success: false, alreadyCompleted: true };
        }
      }
    }

    // 유저의 현재 잔액 조회
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { prismBalance: true }
    });

    const newBalance = (user?.prismBalance || 0) + mission.reward;

    // 유저 잔액 업데이트
    await tx.user.update({
      where: { id: userId },
      data: {
        prismBalance: newBalance,
        ...(missionType === 'DAILY_CHECK_IN' ? { lastCheckIn: new Date() } : {})
      }
    });

    // 포인트 거래 내역 생성
    await tx.prismTransaction.create({
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
    await tx.userMission.upsert({
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
      success: true,
      reward: mission.reward,
      newBalance
    };
  } catch (error) {
    console.error('Error completing mission in transaction:', error);
    return { success: false };
  }
}

/**
 * 독립적인 미션 완료 처리 (트랜잭션 없이)
 * @param userId 유저 ID
 * @param missionType 미션 타입
 * @returns 미션 완료 결과
 */
export async function completeMission(
  userId: string,
  missionType: MissionType
): Promise<CompleteMissionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      return await completeMissionInTransaction(tx, userId, missionType);
    });

    return result;
  } catch (error) {
    console.error('Error completing mission:', error);
    return { success: false };
  } finally {
    await prisma.$disconnect();
  }
}
