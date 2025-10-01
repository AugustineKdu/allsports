import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const admin = await getUserFromToken(token);

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      );
    }

    // 더미 데이터 생성
    const hashedPassword = await hashPassword('test1234');

    // 서울 강남구 데이터
    const seoulTeams = [
      '강남 FC',
      '강남 유나이티드',
      '강남 스포츠클럽',
      '강남 피닉스',
      '강남 다이나믹스'
    ];

    // 경기도 수원시 데이터
    const suwonTeams = [
      '수원 블루윙즈 아마추어',
      '수원 시민 FC',
      '수원 드래곤즈',
      '수원 유나이티드',
      '수원 챌린저스'
    ];

    let createdUsers = 0;
    let createdTeams = 0;
    let createdMemberships = 0;

    // 서울 강남구 팀 생성
    for (let i = 0; i < seoulTeams.length; i++) {
      // 오너 생성
      const owner = await prisma.user.create({
        data: {
          email: `seoul_owner_${i + 1}@test.com`,
          username: `강남오너${i + 1}`,
          passwordHash: hashedPassword,
          city: '서울',
          district: '강남구',
          currentSport: '축구',
          isAdmin: false
        }
      });
      createdUsers++;

      // 팀 생성
      const team = await prisma.team.create({
        data: {
          name: seoulTeams[i],
          canonicalName: seoulTeams[i].replace(/\s/g, '').toLowerCase(),
          sport: '축구',
          city: '서울',
          district: '강남구',
          description: `${seoulTeams[i]} 입니다. 열정적인 선수들을 모집합니다!`,
          maxMembers: 20,
          ownerId: owner.id
        }
      });
      createdTeams++;

      // 오너를 팀 멤버로 추가
      await prisma.teamMember.create({
        data: {
          userId: owner.id,
          teamId: team.id,
          role: 'owner',
          status: 'active'
        }
      });
      createdMemberships++;

      // 멤버 2명 추가
      for (let j = 1; j <= 2; j++) {
        const member = await prisma.user.create({
          data: {
            email: `seoul_member_${i + 1}_${j}@test.com`,
            username: `강남선수${i + 1}-${j}`,
            passwordHash: hashedPassword,
            city: '서울',
            district: '강남구',
            currentSport: '축구',
            isAdmin: false
          }
        });
        createdUsers++;

        await prisma.teamMember.create({
          data: {
            userId: member.id,
            teamId: team.id,
            role: 'member',
            status: 'active'
          }
        });
        createdMemberships++;
      }
    }

    // 경기도 수원시 팀 생성
    for (let i = 0; i < suwonTeams.length; i++) {
      // 오너 생성
      const owner = await prisma.user.create({
        data: {
          email: `suwon_owner_${i + 1}@test.com`,
          username: `수원오너${i + 1}`,
          passwordHash: hashedPassword,
          city: '경기도',
          district: '수원시',
          currentSport: '축구',
          isAdmin: false
        }
      });
      createdUsers++;

      // 팀 생성
      const team = await prisma.team.create({
        data: {
          name: suwonTeams[i],
          canonicalName: suwonTeams[i].replace(/\s/g, '').toLowerCase(),
          sport: '축구',
          city: '경기도',
          district: '수원시',
          description: `${suwonTeams[i]} 입니다. 함께 땀 흘릴 선수들을 찾습니다!`,
          maxMembers: 20,
          ownerId: owner.id
        }
      });
      createdTeams++;

      // 오너를 팀 멤버로 추가
      await prisma.teamMember.create({
        data: {
          userId: owner.id,
          teamId: team.id,
          role: 'owner',
          status: 'active'
        }
      });
      createdMemberships++;

      // 멤버 2명 추가
      for (let j = 1; j <= 2; j++) {
        const member = await prisma.user.create({
          data: {
            email: `suwon_member_${i + 1}_${j}@test.com`,
            username: `수원선수${i + 1}-${j}`,
            passwordHash: hashedPassword,
            city: '경기도',
            district: '수원시',
            currentSport: '축구',
            isAdmin: false
          }
        });
        createdUsers++;

        await prisma.teamMember.create({
          data: {
            userId: member.id,
            teamId: team.id,
            role: 'member',
            status: 'active'
          }
        });
        createdMemberships++;
      }
    }

    return NextResponse.json({
      message: '더미 데이터가 성공적으로 생성되었습니다',
      created: {
        users: createdUsers,
        teams: createdTeams,
        memberships: createdMemberships
      }
    });
  } catch (error) {
    console.error('Seed data error:', error);
    return NextResponse.json(
      { error: '더미 데이터 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const admin = await getUserFromToken(token);

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      );
    }

    // 더미 데이터 삭제 (test.com 이메일을 가진 사용자들)
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: '@test.com'
        }
      }
    });

    const testUserIds = testUsers.map(u => u.id);

    // 해당 사용자들이 오너인 팀 찾기
    const testTeams = await prisma.team.findMany({
      where: {
        ownerId: {
          in: testUserIds
        }
      }
    });

    const testTeamIds = testTeams.map(t => t.id);

    // 1. 팀 멤버십 삭제
    const deletedMemberships = await prisma.teamMember.deleteMany({
      where: {
        OR: [
          { userId: { in: testUserIds } },
          { teamId: { in: testTeamIds } }
        ]
      }
    });

    // 2. 경기 삭제 (해당 팀이 참여한 경기)
    const deletedMatches = await prisma.match.deleteMany({
      where: {
        OR: [
          { homeTeamId: { in: testTeamIds } },
          { awayTeamId: { in: testTeamIds } },
          { createdBy: { in: testUserIds } }
        ]
      }
    });

    // 3. 팀 삭제
    const deletedTeams = await prisma.team.deleteMany({
      where: {
        id: { in: testTeamIds }
      }
    });

    // 4. 사용자 삭제
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: { in: testUserIds }
      }
    });

    return NextResponse.json({
      message: '더미 데이터가 성공적으로 삭제되었습니다',
      deleted: {
        users: deletedUsers.count,
        teams: deletedTeams.count,
        memberships: deletedMemberships.count,
        matches: deletedMatches.count
      }
    });
  } catch (error) {
    console.error('Delete seed data error:', error);
    return NextResponse.json(
      { error: '더미 데이터 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}
