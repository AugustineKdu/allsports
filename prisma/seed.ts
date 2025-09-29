import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 지역 데이터 추가
  const regions = [
    // 서울
    { city: '서울', district: '강남구' },
    { city: '서울', district: '강동구' },
    { city: '서울', district: '강서구' },
    { city: '서울', district: '관악구' },
    { city: '서울', district: '송파구' },
    { city: '서울', district: '서초구' },
    { city: '서울', district: '마포구' },
    { city: '서울', district: '용산구' },
    // 경기도
    { city: '경기도', district: '수원시' },
    { city: '경기도', district: '성남시' },
    { city: '경기도', district: '고양시' },
    { city: '경기도', district: '용인시' },
    { city: '경기도', district: '부천시' },
    { city: '경기도', district: '안양시' },
    { city: '경기도', district: '안산시' },
    { city: '경기도', district: '화성시' }
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: {
        city_district: {
          city: region.city,
          district: region.district
        }
      },
      update: {},
      create: region
    });
  }

  // 관리자 계정 생성
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@allsports.com' },
    update: {},
    create: {
      email: 'admin@allsports.com',
      passwordHash: hashedPassword,
      username: '관리자',
      isAdmin: true,
      city: '서울',
      district: '강남구'
    }
  });

  // 테스트 사용자 계정들 생성
  const testPassword = await bcrypt.hash('test123', 10);
  const users = [
    {
      email: 'user1@test.com',
      passwordHash: testPassword,
      username: '김축구',
      city: '서울',
      district: '강남구',
      currentSport: '축구'
    },
    {
      email: 'user2@test.com',
      passwordHash: testPassword,
      username: '이풋살',
      city: '서울',
      district: '강동구',
      currentSport: '풋살'
    },
    {
      email: 'user3@test.com',
      passwordHash: testPassword,
      username: '박선수',
      city: '서울',
      district: '송파구',
      currentSport: '축구'
    },
    {
      email: 'user4@test.com',
      passwordHash: testPassword,
      username: '최골키',
      city: '경기도',
      district: '수원시',
      currentSport: '축구'
    },
    {
      email: 'user5@test.com',
      passwordHash: testPassword,
      username: '정미드',
      city: '경기도',
      district: '성남시',
      currentSport: '풋살'
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
    createdUsers.push(user);
  }

  // 더미 팀들 생성
  const teams = [
    {
      name: 'FC 강남',
      canonicalName: 'fc강남',
      sport: '축구',
      city: '서울',
      district: '강남구',
      ownerId: createdUsers[0].id,
      description: '강남 최강 축구팀입니다!',
      points: 45,
      wins: 15,
      draws: 0,
      losses: 3
    },
    {
      name: '강동 드래곤즈',
      canonicalName: '강동드래곤즈',
      sport: '풋살',
      city: '서울',
      district: '강동구',
      ownerId: createdUsers[1].id,
      description: '드래곤처럼 강한 풋살팀',
      points: 38,
      wins: 12,
      draws: 2,
      losses: 4
    },
    {
      name: '송파 유나이티드',
      canonicalName: '송파유나이티드',
      sport: '축구',
      city: '서울',
      district: '송파구',
      ownerId: createdUsers[2].id,
      description: '하나 된 송파팀!',
      points: 52,
      wins: 17,
      draws: 1,
      losses: 2
    },
    {
      name: '수원 킹스',
      canonicalName: '수원킹스',
      sport: '축구',
      city: '경기도',
      district: '수원시',
      ownerId: createdUsers[3].id,
      description: '수원의 왕자들',
      points: 31,
      wins: 10,
      draws: 1,
      losses: 7
    },
    {
      name: '성남 레전드',
      canonicalName: '성남레전드',
      sport: '풋살',
      city: '경기도',
      district: '성남시',
      ownerId: createdUsers[4].id,
      description: '전설이 되자!',
      points: 29,
      wins: 9,
      draws: 2,
      losses: 6
    }
  ];

  const createdTeams = [];
  for (const teamData of teams) {
    const team = await prisma.team.upsert({
      where: {
        canonicalName_sport_city_district: {
          canonicalName: teamData.canonicalName,
          sport: teamData.sport,
          city: teamData.city,
          district: teamData.district
        }
      },
      update: {},
      create: teamData
    });
    createdTeams.push(team);

    // 팀 오너를 멤버로 추가
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: teamData.ownerId
        }
      },
      update: {},
      create: {
        teamId: team.id,
        userId: teamData.ownerId,
        status: 'active',
        role: 'owner',
        approvedBy: teamData.ownerId,
        approvedAt: new Date()
      }
    });
  }

  // 추가 팀 멤버들 생성 (팀간 멤버 교차 참여)
  const additionalMemberships = [
    { teamId: createdTeams[0].id, userId: createdUsers[2].id, role: 'member' }, // 박선수가 FC강남에도 참여
    { teamId: createdTeams[2].id, userId: createdUsers[0].id, role: 'captain' }, // 김축구가 송파 유나이티드 주장
    { teamId: createdTeams[3].id, userId: createdUsers[0].id, role: 'member' }, // 김축구가 수원킹스에도 참여
    { teamId: createdTeams[1].id, userId: createdUsers[4].id, role: 'member' }, // 정미드가 강동드래곤즈에도 참여
  ];

  for (const membership of additionalMemberships) {
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: {
          teamId: membership.teamId,
          userId: membership.userId
        }
      },
      update: {},
      create: {
        teamId: membership.teamId,
        userId: membership.userId,
        status: 'active',
        role: membership.role,
        approvedBy: createdTeams.find(t => t.id === membership.teamId)?.ownerId,
        approvedAt: new Date()
      }
    });
  }

  // 더미 매치 생성
  const matches = [
    {
      sport: '축구',
      homeTeamId: createdTeams[0].id, // FC강남
      awayTeamId: createdTeams[2].id, // 송파 유나이티드
      matchDate: new Date('2024-01-15'),
      location: '강남 스포츠센터',
      status: 'completed',
      homeScore: 2,
      awayScore: 3,
      createdBy: createdUsers[0].id
    },
    {
      sport: '축구',
      homeTeamId: createdTeams[3].id, // 수원킹스
      awayTeamId: createdTeams[0].id, // FC강남
      matchDate: new Date('2024-01-20'),
      location: '수원월드컵경기장',
      status: 'completed',
      homeScore: 1,
      awayScore: 2,
      createdBy: createdUsers[3].id
    },
    {
      sport: '풋살',
      homeTeamId: createdTeams[1].id, // 강동드래곤즈
      awayTeamId: createdTeams[4].id, // 성남레전드
      matchDate: new Date('2024-01-25'),
      location: '강동풋살장',
      status: 'completed',
      homeScore: 4,
      awayScore: 2,
      createdBy: createdUsers[1].id
    },
    {
      sport: '축구',
      homeTeamId: createdTeams[2].id, // 송파 유나이티드
      awayTeamId: createdTeams[3].id, // 수원킹스
      matchDate: new Date(),
      location: '송파구민체육관',
      status: 'proposed',
      createdBy: createdUsers[2].id
    }
  ];

  for (const matchData of matches) {
    await prisma.match.upsert({
      where: {
        id: `${matchData.homeTeamId}-${matchData.awayTeamId}-${matchData.matchDate.getTime()}`
      },
      update: {},
      create: {
        ...matchData,
        id: `${matchData.homeTeamId}-${matchData.awayTeamId}-${matchData.matchDate.getTime()}`
      }
    });
  }

  console.log('✅ Seed data created successfully');
  console.log('📊 Test accounts created:');
  console.log('   - admin@allsports.com / admin123 (관리자)');
  console.log('   - user1@test.com / test123 (김축구)');
  console.log('   - user2@test.com / test123 (이풋살)');
  console.log('   - user3@test.com / test123 (박선수)');
  console.log('   - user4@test.com / test123 (최골키)');
  console.log('   - user5@test.com / test123 (정미드)');
  console.log('🏆 Teams created: 5 teams with various stats');
  console.log('⚽ Matches created: 4 matches (3 completed, 1 proposed)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });