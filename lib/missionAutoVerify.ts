import { PrismaClient } from '@prisma/client';
import { completeMissionInTransaction } from './missionUtils';

/**
 * 미션 자동 검증 서비스
 * 미션의 verificationRules에 따라 자동으로 미션 완료를 검증하고 처리
 */
export class MissionAutoVerifyService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 사용자의 미션 자동 검증 실행
   * @param userId 사용자 ID
   * @param eventType 이벤트 타입 (예: TEAM_JOIN, MATCH_COMPLETE, etc.)
   * @param eventData 이벤트 관련 데이터
   */
  async verifyMissions(userId: string, eventType: string, eventData?: any) {
    try {
      // autoVerify가 true인 모든 활성 미션 조회
      const autoVerifyMissions = await this.prisma.mission.findMany({
        where: {
          autoVerify: true,
          isActive: true,
        },
        include: {
          userMissions: {
            where: { userId },
          },
        },
      });

      const completedMissions = [];

      for (const mission of autoVerifyMissions) {
        // 이미 완료한 미션이고 반복 불가능한 경우 건너뛰기
        if (mission.userMissions.length > 0 &&
            mission.userMissions[0].status === 'completed' &&
            !mission.isRepeatable) {
          continue;
        }

        // verificationRules에 따라 검증
        const isEligible = await this.checkMissionEligibility(
          mission,
          userId,
          eventType,
          eventData
        );

        if (isEligible) {
          // 미션 완료 처리
          const result = await this.completeMissionAuto(userId, mission.type);
          if (result.success) {
            completedMissions.push({
              missionType: mission.type,
              title: mission.title,
              reward: mission.reward,
            });
          }
        }
      }

      return {
        success: true,
        completedMissions,
      };
    } catch (error) {
      console.error('Auto verify missions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 미션 완료 자격 검증
   */
  private async checkMissionEligibility(
    mission: any,
    userId: string,
    eventType: string,
    eventData?: any
  ): Promise<boolean> {
    if (!mission.verificationRules) return false;

    const rules = mission.verificationRules as any;

    switch (rules.type) {
      case 'AUTO_ON_SIGNUP':
        // 회원가입 시 자동 완료
        return eventType === 'USER_SIGNUP';

      case 'CHECK_TEAM_MEMBER':
        // 팀 멤버 확인
        if (eventType !== 'TEAM_JOIN') return false;
        const teamMember = await this.prisma.teamMember.findFirst({
          where: {
            userId,
            status: 'active',
          },
        });
        return !!teamMember;

      case 'DAILY_CHECK':
        // 일일 체크인 - 24시간 쿨다운
        if (eventType !== 'DAILY_CHECK_IN') return false;
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user?.lastCheckIn) return true;

        const lastCheckIn = new Date(user.lastCheckIn);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
        return hoursDiff >= 24;

      case 'CHECK_MATCH_PARTICIPATION':
        // 경기 참여 확인
        if (eventType !== 'MATCH_UPDATE' && eventType !== 'MATCH_CREATE') return false;
        const match = eventData?.match;
        if (!match) return false;

        // 사용자가 속한 팀이 경기에 참여하는지 확인
        const userTeams = await this.prisma.teamMember.findMany({
          where: {
            userId,
            status: 'active',
          },
          select: {
            teamId: true,
          },
        });

        const teamIds = userTeams.map(t => t.teamId);
        return teamIds.includes(match.homeTeamId) || teamIds.includes(match.awayTeamId);

      case 'FIRST_MATCH_COMPLETE':
        // 첫 경기 완료
        if (eventType !== 'MATCH_COMPLETE') return false;

        // 이미 미션을 완료했는지 확인
        const firstMatchMission = await this.prisma.userMission.findFirst({
          where: {
            userId,
            mission: { type: 'FIRST_MATCH' },
            status: 'completed',
          },
        });
        if (firstMatchMission) return false;

        // 완료된 경기가 있는지 확인
        const completedMatch = await this.prisma.match.findFirst({
          where: {
            status: 'completed',
            OR: [
              {
                homeTeam: {
                  members: {
                    some: {
                      userId,
                      status: 'active',
                    },
                  },
                },
              },
              {
                awayTeam: {
                  members: {
                    some: {
                      userId,
                      status: 'active',
                    },
                  },
                },
              },
            ],
          },
        });
        return !!completedMatch;

      case 'CHECK_PROFILE':
        // 프로필 완성 확인
        if (eventType !== 'PROFILE_UPDATE') return false;
        const profile = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!profile) return false;
        const requiredFields = rules.fields || [];
        return requiredFields.every((field: string) =>
          profile[field as keyof typeof profile] !== null &&
          profile[field as keyof typeof profile] !== ''
        );

      case 'WEEKLY_ACTIVITY':
        // 주간 활동 달성
        if (eventType !== 'ACTIVITY_CHECK') return false;

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // 지난 7일간 활동 횟수 확인
        const activities = await this.prisma.prismTransaction.findMany({
          where: {
            userId,
            createdAt: {
              gte: oneWeekAgo,
            },
            type: 'MISSION_REWARD',
          },
        });

        return activities.length >= (rules.count || 3);

      default:
        return false;
    }
  }

  /**
   * 미션 자동 완료 처리
   */
  private async completeMissionAuto(userId: string, missionType: string) {
    return await this.prisma.$transaction(async (tx) => {
      // 미션 정보 조회
      const mission = await tx.mission.findUnique({
        where: { type: missionType },
      });

      if (!mission) {
        throw new Error('Mission not found');
      }

      // 일일 체크인의 경우 lastCheckIn 업데이트
      if (missionType === 'DAILY_CHECK_IN') {
        await tx.user.update({
          where: { id: userId },
          data: { lastCheckIn: new Date() },
        });
      }

      // 미션 완료 처리
      const result = await completeMissionInTransaction(tx, userId, missionType);

      // 참여자 수 증가
      await tx.mission.update({
        where: { id: mission.id },
        data: {
          participantCount: {
            increment: 1,
          },
        },
      });

      return result;
    });
  }

  /**
   * 특정 이벤트 발생 시 자동 미션 체크
   */
  async checkMissionsOnEvent(userId: string, eventType: string, eventData?: any) {
    // 비동기로 실행하여 메인 플로우를 막지 않음
    setImmediate(async () => {
      await this.verifyMissions(userId, eventType, eventData);
    });
  }

  /**
   * 일일 체크인 미션 자동 완료
   */
  async performDailyCheckIn(userId: string) {
    return await this.verifyMissions(userId, 'DAILY_CHECK_IN');
  }

  /**
   * 프로필 업데이트 후 미션 체크
   */
  async checkProfileCompleteMission(userId: string) {
    return await this.verifyMissions(userId, 'PROFILE_UPDATE');
  }

  /**
   * 팀 가입 후 미션 체크
   */
  async checkTeamJoinMission(userId: string) {
    return await this.verifyMissions(userId, 'TEAM_JOIN');
  }

  /**
   * 경기 상태 업데이트 후 미션 체크
   */
  async checkMatchMissions(userId: string, match: any, eventType: 'MATCH_CREATE' | 'MATCH_UPDATE' | 'MATCH_COMPLETE') {
    return await this.verifyMissions(userId, eventType, { match });
  }

  /**
   * 주간 활동 체크 (크론잡 등에서 호출)
   */
  async checkWeeklyActivityMissions() {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
    });

    const results = [];
    for (const user of users) {
      const result = await this.verifyMissions(user.id, 'ACTIVITY_CHECK');
      if (result.completedMissions.length > 0) {
        results.push({
          userId: user.id,
          completedMissions: result.completedMissions,
        });
      }
    }

    return results;
  }
}

// 싱글톤 인스턴스
let autoVerifyService: MissionAutoVerifyService | null = null;

export function getAutoVerifyService(prisma: PrismaClient): MissionAutoVerifyService {
  if (!autoVerifyService) {
    autoVerifyService = new MissionAutoVerifyService(prisma);
  }
  return autoVerifyService;
}