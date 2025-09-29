#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 헬스체크 설정
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DB_PATH = process.env.DATABASE_URL || './prisma/dev.db';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Slack, Discord 등 알림용

// 헬스체크 함수들
async function checkDatabase() {
  try {
    if (DB_PATH.includes('.db')) {
      // SQLite 파일 존재 및 읽기 가능 여부 확인
      const dbFilePath = DB_PATH.replace('file:', '');
      if (!fs.existsSync(dbFilePath)) {
        throw new Error('데이터베이스 파일이 존재하지 않습니다');
      }

      // 간단한 쿼리 테스트
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.user.count();
      await prisma.$disconnect();
    } else {
      // PostgreSQL/MySQL 연결 테스트
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.user.count();
      await prisma.$disconnect();
    }

    return { success: true, message: '데이터베이스 연결 정상' };
  } catch (error) {
    return { success: false, message: `데이터베이스 오류: ${error.message}` };
  }
}

async function checkApplication() {
  try {
    const response = await fetch(`${APP_URL}/api/health`);
    if (response.ok) {
      return { success: true, message: '애플리케이션 응답 정상' };
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    return { success: false, message: `애플리케이션 오류: ${error.message}` };
  }
}

async function checkDiskSpace() {
  try {
    const output = execSync('df -h .', { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    const data = lines[1].split(/\s+/);
    const used = parseInt(data[4]);

    if (used > 90) {
      return { success: false, message: `디스크 사용량 위험: ${used}%` };
    } else if (used > 80) {
      return { success: false, message: `디스크 사용량 경고: ${used}%` };
    }

    return { success: true, message: `디스크 사용량 정상: ${used}%` };
  } catch (error) {
    return { success: false, message: `디스크 확인 오류: ${error.message}` };
  }
}

async function sendAlert(message) {
  if (!WEBHOOK_URL) return;

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 AllSports 알림: ${message}`,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('알림 전송 실패:', error.message);
  }
}

async function autoRecover() {
  console.log('🔧 자동 복구 시도...');

  try {
    // 최신 백업 파일 찾기
    if (!fs.existsSync(BACKUP_DIR)) {
      throw new Error('백업 디렉토리가 존재하지 않습니다');
    }

    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      throw new Error('사용 가능한 백업 파일이 없습니다');
    }

    const latestBackup = backupFiles[0];
    console.log(`📁 최신 백업 사용: ${latestBackup}`);

    // 복구 스크립트 실행
    execSync(`node scripts/restore.js ${latestBackup}`, { stdio: 'inherit' });

    // 애플리케이션 재시작 (PM2 사용 시)
    try {
      execSync('pm2 restart allsports', { stdio: 'inherit' });
    } catch (error) {
      console.log('PM2 재시작 실패, 수동 재시작이 필요할 수 있습니다');
    }

    await sendAlert('자동 복구 완료');
    return true;

  } catch (error) {
    console.error('❌ 자동 복구 실패:', error.message);
    await sendAlert(`자동 복구 실패: ${error.message}`);
    return false;
  }
}

// 메인 헬스체크 실행
async function main() {
  console.log('🏥 헬스체크 시작...', new Date().toLocaleString());

  const checks = [
    { name: '데이터베이스', check: checkDatabase },
    { name: '애플리케이션', check: checkApplication },
    { name: '디스크 공간', check: checkDiskSpace }
  ];

  const results = [];
  let hasErrors = false;

  for (const { name, check } of checks) {
    const result = await check();
    results.push({ name, ...result });

    if (result.success) {
      console.log(`✅ ${name}: ${result.message}`);
    } else {
      console.log(`❌ ${name}: ${result.message}`);
      hasErrors = true;
    }
  }

  // 결과 저장
  const healthStatus = {
    timestamp: new Date().toISOString(),
    overall: hasErrors ? 'ERROR' : 'OK',
    checks: results
  };

  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs', { recursive: true });
  }

  fs.writeFileSync(
    './logs/health-status.json',
    JSON.stringify(healthStatus, null, 2)
  );

  // 오류가 있고 AUTO_RECOVER 환경변수가 설정된 경우 자동 복구 시도
  if (hasErrors && process.env.AUTO_RECOVER === 'true') {
    const dbError = results.find(r => r.name === '데이터베이스' && !r.success);
    if (dbError) {
      const recovered = await autoRecover();
      if (recovered) {
        console.log('🎉 자동 복구 성공');
        process.exit(0);
      }
    }
  }

  // 오류가 있으면 알림 전송
  if (hasErrors) {
    const errorMessages = results
      .filter(r => !r.success)
      .map(r => `${r.name}: ${r.message}`)
      .join(', ');

    await sendAlert(`헬스체크 실패 - ${errorMessages}`);
    process.exit(1);
  }

  console.log('🎉 모든 헬스체크 통과');
  process.exit(0);
}

// 스크립트가 직접 실행된 경우
if (require.main === module) {
  main().catch(error => {
    console.error('헬스체크 오류:', error);
    process.exit(1);
  });
}