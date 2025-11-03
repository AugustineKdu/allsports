import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';
import { normalizeTeamName } from '@/lib/utils';
import { completeMissionInTransaction } from '@/lib/missionUtils';

// 팀 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const city = searchParams.get('city');
    const district = searchParams.get('district');

    const where: any = {};
    if (sport) where.sport = sport;
    if (city) where.city = city;
    if (district) where.district = district;

    const teams = await prisma.team.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            username: true
          }
        },
        members: {
          where: {
            status: 'active'
          },
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        _count: {
          select: {
            members: {
              where: {
                status: 'active'
              }
            }
          }
        }
      },
      orderBy: {
        points: 'desc'
      }
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { error: '팀 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}

// 팀 생성
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const { name, sport, city, district, description, maxMembers } = await request.json();

    // 팀명 정규화
    const canonicalName = normalizeTeamName(name);

    if (!canonicalName) {
      return NextResponse.json(
        { error: '유효한 팀명을 입력해주세요' },
        { status: 400 }
      );
    }

    // 중복 체크 (정규화된 이름으로)
    const existingTeam = await prisma.team.findFirst({
      where: {
        canonicalName,
        sport,
        city,
        district
      }
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: '해당 지역에 이미 같은 이름의 팀이 존재합니다' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 팀 생성 + 멤버 추가 + 미션 완료
    const team = await prisma.$transaction(async (tx: any) => {
      // 팀 생성
      const newTeam = await tx.team.create({
        data: {
          name,
          canonicalName,
          sport,
          city,
          district,
          ownerId: user.id,
          description: description || '',
          maxMembers: maxMembers || 20
        }
      });

      // 오너를 멤버로 추가
      await tx.teamMember.create({
        data: {
          teamId: newTeam.id,
          userId: user.id,
          status: 'active',
          role: 'owner',
          approvedBy: user.id,
          approvedAt: new Date()
        }
      });

      // 팀 등록/참여 미션 완료
      await completeMissionInTransaction(tx, user.id, 'TEAM_JOIN');

      return newTeam;
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: '팀 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}