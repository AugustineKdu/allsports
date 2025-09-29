#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 복구 설정
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DB_PATH = process.env.DATABASE_URL || './prisma/dev.db';

// 명령행 인수에서 백업 파일명 가져오기
const backupFileName = process.argv[2];

if (!backupFileName) {
  console.log('사용법: node scripts/restore.js <백업파일명>');
  console.log('예시: node scripts/restore.js backup-2024-01-01T12-00-00-000Z.db');

  // 사용 가능한 백업 파일 목록 표시
  if (fs.existsSync(BACKUP_DIR)) {
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-'))
      .sort()
      .reverse();

    if (backupFiles.length > 0) {
      console.log('\n사용 가능한 백업 파일:');
      backupFiles.forEach(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${stats.mtime.toLocaleString()})`);
      });
    } else {
      console.log('\n사용 가능한 백업 파일이 없습니다.');
    }
  }

  process.exit(1);
}

const backupPath = path.join(BACKUP_DIR, backupFileName);

// 백업 파일 존재 확인
if (!fs.existsSync(backupPath)) {
  console.error(`❌ 백업 파일을 찾을 수 없습니다: ${backupPath}`);
  process.exit(1);
}

try {
  console.log('🔄 데이터베이스 복구 시작...');
  console.log(`📁 백업 파일: ${backupFileName}`);

  // 현재 데이터베이스 백업 (안전장치)
  const currentBackupPath = path.join(BACKUP_DIR, `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);

  if (DB_PATH.includes('.db')) {
    // SQLite 복구
    const dbFilePath = DB_PATH.replace('file:', '');

    if (fs.existsSync(dbFilePath)) {
      fs.copyFileSync(dbFilePath, currentBackupPath);
      console.log(`🛡️  현재 DB 백업 완료: ${path.basename(currentBackupPath)}`);
    }

    // 백업 파일로 덮어쓰기
    fs.copyFileSync(backupPath, dbFilePath);
    console.log(`✅ SQLite 복구 완료`);

  } else if (DB_PATH.includes('postgresql://')) {
    // PostgreSQL 복구
    console.log('⚠️  PostgreSQL 복구는 수동으로 진행해주세요:');
    console.log(`psql "${DB_PATH}" < "${backupPath}"`);

  } else if (DB_PATH.includes('mysql://')) {
    // MySQL 복구
    const dbUrl = new URL(DB_PATH);
    console.log('⚠️  MySQL 복구는 수동으로 진행해주세요:');
    console.log(`mysql -h ${dbUrl.hostname} -P ${dbUrl.port || 3306} -u ${dbUrl.username} -p${dbUrl.password} ${dbUrl.pathname.slice(1)} < "${backupPath}"`);
  }

  // Prisma 스키마 동기화
  if (fs.existsSync('./node_modules/.bin/prisma')) {
    console.log('🔄 Prisma 스키마 동기화 중...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ 스키마 동기화 완료');
  }

  // 복구 정보 저장
  const restoreInfo = {
    timestamp: new Date().toISOString(),
    backupFile: backupFileName,
    preRestoreBackup: path.basename(currentBackupPath),
    success: true
  };

  fs.writeFileSync(
    path.join(BACKUP_DIR, 'latest-restore.json'),
    JSON.stringify(restoreInfo, null, 2)
  );

  console.log(`🎉 데이터베이스 복구 완료!`);
  console.log(`📝 이전 데이터베이스는 다음 위치에 백업되었습니다: ${currentBackupPath}`);

} catch (error) {
  console.error('❌ 복구 실패:', error.message);

  // 실패 정보 저장
  const restoreInfo = {
    timestamp: new Date().toISOString(),
    backupFile: backupFileName,
    error: error.message,
    success: false
  };

  fs.writeFileSync(
    path.join(BACKUP_DIR, 'latest-restore.json'),
    JSON.stringify(restoreInfo, null, 2)
  );

  process.exit(1);
}