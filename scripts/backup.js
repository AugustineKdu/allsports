#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 백업 설정
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DB_PATH = process.env.DATABASE_URL || './prisma/dev.db';
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS) || 7; // 7일치 백업 유지

// 백업 디렉토리 생성
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 현재 시간 기반 백업 파일명 생성
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFileName = `backup-${timestamp}.db`;
const backupPath = path.join(BACKUP_DIR, backupFileName);

try {
  console.log('🔄 데이터베이스 백업 시작...');

  // SQLite 데이터베이스 백업
  if (DB_PATH.includes('.db')) {
    // SQLite 파일 복사
    fs.copyFileSync(DB_PATH.replace('file:', ''), backupPath);
    console.log(`✅ SQLite 백업 완료: ${backupPath}`);
  } else if (DB_PATH.includes('postgresql://')) {
    // PostgreSQL 백업 (Cloudtype에서 주로 사용)
    const backupSqlPath = backupPath.replace('.db', '.sql');
    execSync(`pg_dump "${DB_PATH}" > "${backupSqlPath}"`, { stdio: 'inherit' });
    console.log(`✅ PostgreSQL 백업 완료: ${backupSqlPath}`);
  } else if (DB_PATH.includes('mysql://')) {
    // MySQL 백업
    const dbUrl = new URL(DB_PATH);
    const backupSqlPath = backupPath.replace('.db', '.sql');
    execSync(`mysqldump -h ${dbUrl.hostname} -P ${dbUrl.port || 3306} -u ${dbUrl.username} -p${dbUrl.password} ${dbUrl.pathname.slice(1)} > "${backupSqlPath}"`, { stdio: 'inherit' });
    console.log(`✅ MySQL 백업 완료: ${backupSqlPath}`);
  }

  // 오래된 백업 파일 삭제
  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup-'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
    }))
    .sort((a, b) => b.time - a.time);

  if (backupFiles.length > MAX_BACKUPS) {
    const filesToDelete = backupFiles.slice(MAX_BACKUPS);
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`🗑️  오래된 백업 삭제: ${file.name}`);
    });
  }

  // 백업 정보 저장
  const backupInfo = {
    timestamp: new Date().toISOString(),
    filename: backupFileName,
    size: fs.statSync(backupPath).size,
    success: true
  };

  fs.writeFileSync(
    path.join(BACKUP_DIR, 'latest-backup.json'),
    JSON.stringify(backupInfo, null, 2)
  );

  console.log(`🎉 백업 완료! 파일: ${backupFileName}`);

} catch (error) {
  console.error('❌ 백업 실패:', error.message);

  // 실패 정보 저장
  const backupInfo = {
    timestamp: new Date().toISOString(),
    error: error.message,
    success: false
  };

  fs.writeFileSync(
    path.join(BACKUP_DIR, 'latest-backup.json'),
    JSON.stringify(backupInfo, null, 2)
  );

  process.exit(1);
}