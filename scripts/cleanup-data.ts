import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    console.log('🧹 Starting data cleanup...');

    // 관리자가 아닌 모든 사용자 찾기
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        isAdmin: false
      }
    });

    console.log(`Found ${nonAdminUsers.length} non-admin users to delete`);

    // 관리자가 아닌 사용자들의 ID 목록
    const nonAdminUserIds = nonAdminUsers.map(u => u.id);

    if (nonAdminUserIds.length > 0) {
      // 트랜잭션으로 모든 데이터 삭제
      await prisma.$transaction(async (tx) => {
        // 1. 매칭 관련 데이터 삭제
        console.log('Deleting matches...');
        await tx.match.deleteMany({});

        // 2. 팀 멤버 삭제
        console.log('Deleting team members...');
        await tx.teamMember.deleteMany({
          where: {
            userId: { in: nonAdminUserIds }
          }
        });

        // 3. 팀 가입 요청 삭제
        console.log('Deleting team join requests...');
        await tx.teamJoinRequest.deleteMany({
          where: {
            userId: { in: nonAdminUserIds }
          }
        });

        // 4. 팀 삭제 (관리자가 아닌 사용자가 소유한 팀)
        console.log('Deleting teams...');
        await tx.team.deleteMany({
          where: {
            ownerId: { in: nonAdminUserIds }
          }
        });

        // 5. UserMission 삭제
        console.log('Deleting user missions...');
        await tx.userMission.deleteMany({
          where: {
            userId: { in: nonAdminUserIds }
          }
        });

        // 6. PrismTransaction 삭제
        console.log('Deleting prism transactions...');
        await tx.prismTransaction.deleteMany({
          where: {
            userId: { in: nonAdminUserIds }
          }
        });

        // 7. 사용자 삭제
        console.log('Deleting users...');
        await tx.user.deleteMany({
          where: {
            id: { in: nonAdminUserIds }
          }
        });
      });

      console.log('✅ Cleanup completed successfully!');
      console.log(`Deleted ${nonAdminUserIds.length} users and their related data`);
    } else {
      console.log('No non-admin users found. Nothing to delete.');
    }

    // 관리자 계정 확인
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true, username: true, email: true }
    });

    console.log('\n👑 Remaining admin accounts:');
    admins.forEach(admin => {
      console.log(`  - ${admin.username} (${admin.email})`);
    });

    // 미션 정의 확인
    const missions = await prisma.mission.findMany();
    console.log(`\n✨ Mission definitions: ${missions.length} missions available`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanup()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
