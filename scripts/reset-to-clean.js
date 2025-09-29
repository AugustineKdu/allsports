const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetToClean() {
    try {
        console.log('🧹 Starting database cleanup...');
        console.log('⚠️  This will remove ALL data except admin account and regions!');

        // 1. 관련 데이터들을 올바른 순서로 삭제 (외래키 제약 조건 고려)
        console.log('🗑️  Deleting disputes...');
        await prisma.dispute.deleteMany({});

        console.log('🗑️  Deleting matches...');
        await prisma.match.deleteMany({});

        console.log('🗑️  Deleting team join requests...');
        await prisma.teamJoinRequest.deleteMany({});

        console.log('🗑️  Deleting team members...');
        await prisma.teamMember.deleteMany({});

        console.log('🗑️  Deleting teams...');
        await prisma.team.deleteMany({});

        console.log('🗑️  Deleting non-admin users...');
        // 관리자가 아닌 모든 사용자 삭제
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                isAdmin: false
            }
        });
        console.log(`   ✅ Deleted ${deletedUsers.count} non-admin users`);

        // 2. 관리자 계정 정보 업데이트 (필요한 경우)
        const adminExists = await prisma.user.findFirst({
            where: { isAdmin: true }
        });

        if (adminExists) {
            console.log('✅ Admin account preserved');
        } else {
            console.log('⚠️  No admin account found - will be created during next seed');
        }

        // 3. 지역 데이터는 유지 (삭제하지 않음)
        const regionCount = await prisma.region.count();
        console.log(`✅ ${regionCount} regions preserved`);

        console.log('');
        console.log('🎯 Database cleanup completed!');
        console.log('📊 Remaining data:');
        console.log(`   👤 Admin users: ${adminExists ? 1 : 0}`);
        console.log(`   📍 Regions: ${regionCount}`);
        console.log(`   🏆 Teams: 0`);
        console.log(`   ⚽ Matches: 0`);
        console.log('');
        console.log('💡 Run "npm run prisma:seed" to add fresh admin account and regions');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// 스크립트 직접 실행 시
if (require.main === module) {
    resetToClean()
        .then(() => {
            console.log('✅ Cleanup completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Cleanup failed:', error);
            process.exit(1);
        });
}

module.exports = { resetToClean };
