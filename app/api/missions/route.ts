import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

// GET /api/missions - 미션 목록 조회 (유저 진행 상황 포함)
export async function GET(request: Request) {
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

    // 모든 미션 조회
    const missions = await prisma.mission.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    // 유저의 미션 진행 상황 조회
    const userMissions = await prisma.userMission.findMany({
      where: { userId }
    });

    // 유저의 Prism 잔액 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { prismBalance: true }
    });

    // 미션 데이터와 유저 진행 상황 병합
    const missionsWithProgress = missions.map(mission => {
      const userMission = userMissions.find(um => um.missionId === mission.id);
      return {
        ...mission,
        isCompleted: userMission?.status === 'completed',
        completedAt: userMission?.completedAt,
        count: userMission?.count || 0
      };
    });

    return NextResponse.json({
      missions: missionsWithProgress,
      prismBalance: user?.prismBalance || 0
    });
  } catch (error) {
    console.error('Error fetching missions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
