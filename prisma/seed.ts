import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting clean seed (admin + regions only)...');

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
    { city: '서울', district: '종로구' },
    { city: '서울', district: '중구' },
    { city: '서울', district: '영등포구' },
    { city: '서울', district: '동작구' },
    { city: '서울', district: '은평구' },
    { city: '서울', district: '서대문구' },
    { city: '서울', district: '노원구' },
    { city: '서울', district: '도봉구' },
    { city: '서울', district: '성북구' },
    { city: '서울', district: '중랑구' },
    { city: '서울', district: '동대문구' },
    { city: '서울', district: '성동구' },
    { city: '서울', district: '광진구' },
    { city: '서울', district: '강북구' },
    { city: '서울', district: '금천구' },
    { city: '서울', district: '구로구' },
    { city: '서울', district: '양천구' },
    // 경기도
    { city: '경기도', district: '수원시' },
    { city: '경기도', district: '성남시' },
    { city: '경기도', district: '고양시' },
    { city: '경기도', district: '용인시' },
    { city: '경기도', district: '부천시' },
    { city: '경기도', district: '안양시' },
    { city: '경기도', district: '안산시' },
    { city: '경기도', district: '화성시' },
    { city: '경기도', district: '의정부시' },
    { city: '경기도', district: '시흥시' },
    { city: '경기도', district: '평택시' },
    { city: '경기도', district: '김포시' },
    { city: '경기도', district: '광명시' },
    { city: '경기도', district: '광주시' },
    { city: '경기도', district: '군포시' },
    { city: '경기도', district: '오산시' },
    // 인천
    { city: '인천', district: '남동구' },
    { city: '인천', district: '연수구' },
    { city: '인천', district: '부평구' },
    { city: '인천', district: '계양구' },
    { city: '인천', district: '서구' },
    { city: '인천', district: '중구' },
    { city: '인천', district: '동구' },
    { city: '인천', district: '미추홀구' },
    // 부산
    { city: '부산', district: '해운대구' },
    { city: '부산', district: '부산진구' },
    { city: '부산', district: '동래구' },
    { city: '부산', district: '남구' },
    { city: '부산', district: '중구' },
    { city: '부산', district: '서구' },
    { city: '부산', district: '사하구' },
    { city: '부산', district: '금정구' }
  ];

  console.log(`📍 Creating ${regions.length} regions...`);
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

  // 관리자 계정 생성 (유일한 사용자)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@allsports.com' },
    update: {
      passwordHash: hashedPassword, // 비밀번호 업데이트
    },
    create: {
      email: 'admin@allsports.com',
      passwordHash: hashedPassword,
      username: '시스템관리자',
      isAdmin: true,
      city: '서울',
      district: '강남구',
      contact: '010-0000-0000'
    }
  });

  // 미션 데이터 생성 (자동화 및 카테고리 포함)
  const missions = [
    {
      type: 'SPORT_SELECT',
      title: '좋아하는 스포츠 선택',
      description: 'UI 상 다양한 종목 중 선택 (현재는 풋살만 활성화)',
      reward: 300,
      category: 'DAILY',
      icon: 'trophy',
      isRepeatable: false,
      autoVerify: true,
      verificationRules: {
        type: 'AUTO_ON_SIGNUP',
        description: '회원가입 시 자동 완료'
      },
      priority: 1,
      order: 1
    },
    {
      type: 'TEAM_JOIN',
      title: '팀 등록 / 참여',
      description: '팀 만들기 또는 팀 합류 시 보상',
      reward: 500,
      category: 'TEAM',
      icon: 'users',
      isRepeatable: false,
      autoVerify: true,
      verificationRules: {
        type: 'CHECK_TEAM_MEMBER',
        table: 'TeamMember',
        condition: 'status = active',
        description: '팀 멤버 상태가 active일 때 자동 완료'
      },
      priority: 2,
      order: 2
    },
    {
      type: 'INVITE_MEMBER',
      title: '팀원 초대',
      description: '친구 또는 동료 초대 시 보상',
      reward: 200,
      category: 'TEAM',
      icon: 'user-plus',
      isRepeatable: true,
      autoVerify: false,
      priority: 3,
      order: 3
    },
    {
      type: 'MATCH_VERIFY',
      title: '경기 인증',
      description: '경기 후 간단 인증 (사진 업로드 등)',
      reward: 800,
      category: 'MATCH',
      icon: 'check-circle',
      isRepeatable: true,
      autoVerify: false,
      priority: 5,
      order: 4
    },
    {
      type: 'DAILY_CHECK_IN',
      title: '매일 출석체크',
      description: '일일 로그인 시 자동 보상',
      reward: 50,
      category: 'DAILY',
      icon: 'calendar-check',
      isRepeatable: true,
      autoVerify: true,
      verificationRules: {
        type: 'DAILY_CHECK',
        cooldown: '24h',
        description: '24시간마다 자동 체크인 가능'
      },
      priority: 10,
      order: 5
    },
    {
      type: 'TEAM_MATCH',
      title: '팀 경기 참가',
      description: '소속 팀이 다른 팀과 경기 등록 시',
      reward: 1000,
      category: 'MATCH',
      icon: 'flag',
      isRepeatable: true,
      autoVerify: true,
      verificationRules: {
        type: 'CHECK_MATCH_PARTICIPATION',
        table: 'Match',
        condition: 'status = confirmed OR status = completed',
        description: '팀 경기 확정 또는 완료 시 자동 지급'
      },
      priority: 4,
      order: 6
    },
    // 새로운 미션 추가
    {
      type: 'FIRST_MATCH',
      title: '첫 경기 참가',
      description: '첫 번째 경기를 완료하면 보상 지급',
      reward: 1500,
      category: 'SPECIAL',
      icon: 'star',
      isRepeatable: false,
      autoVerify: true,
      verificationRules: {
        type: 'FIRST_MATCH_COMPLETE',
        description: '첫 경기 완료 시 자동 지급'
      },
      priority: 8,
      order: 7
    },
    {
      type: 'PROFILE_COMPLETE',
      title: '프로필 완성',
      description: '프로필 정보를 모두 입력하면 보상',
      reward: 200,
      category: 'DAILY',
      icon: 'user-check',
      isRepeatable: false,
      autoVerify: true,
      verificationRules: {
        type: 'CHECK_PROFILE',
        fields: ['username', 'contact', 'city', 'district'],
        description: '프로필 필수 정보 입력 시 자동 완료'
      },
      priority: 6,
      order: 8
    },
    {
      type: 'WEEKLY_ACTIVITY',
      title: '주간 활동 달성',
      description: '일주일 동안 3회 이상 활동',
      reward: 500,
      category: 'SPECIAL',
      icon: 'award',
      isRepeatable: true,
      autoVerify: true,
      verificationRules: {
        type: 'WEEKLY_ACTIVITY',
        count: 3,
        period: '7d',
        description: '주간 3회 이상 활동 시 자동 지급'
      },
      priority: 7,
      order: 9
    }
  ];

  console.log(`🎯 Creating ${missions.length} missions...`);
  for (const mission of missions) {
    await prisma.mission.upsert({
      where: { type: mission.type },
      update: mission,
      create: mission
    });
  }

  console.log('✅ Clean seed completed successfully!');
  console.log('👤 Only essential data created:');
  console.log(`   📍 ${regions.length} regions (서울, 경기도, 인천, 부산)`);
  console.log('   🔐 admin@allsports.com / admin123 (관리자)');
  console.log(`   🎯 ${missions.length} missions`);
  console.log('');
  console.log('🎯 Ready for production - no dummy data!');
  console.log('📝 Users can now register and create their own teams/matches');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });