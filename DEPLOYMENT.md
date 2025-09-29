# AllSports Cloudtype 배포 가이드

## 🚀 배포 준비

### 1. GitHub 리포지토리 설정

```bash
# 현재 프로젝트를 GitHub에 푸시
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/allsport_update.git
git push -u origin main
```

### 2. Cloudtype 프로젝트 생성

1. [Cloudtype 콘솔](https://console.cloudtype.io)에 로그인
2. "새 프로젝트 생성" 클릭
3. GitHub 연동하여 리포지토리 선택
4. 프로젝트 이름: `allsports`
5. 브랜치: `main`

### 3. 환경 변수 설정

Cloudtype 콘솔에서 다음 환경 변수들을 설정:

```
DATABASE_URL=postgresql://...  # Cloudtype에서 제공하는 PostgreSQL URL
JWT_SECRET=your-super-secure-jwt-secret
NODE_ENV=production
APP_URL=https://allsports-xxx.cloudtype.app
BACKUP_DIR=/app/backups
MAX_BACKUPS=14
AUTO_RECOVER=true
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 4. 데이터베이스 설정

1. Cloudtype에서 PostgreSQL 데이터베이스 생성
2. 데이터베이스 URL을 `DATABASE_URL` 환경 변수에 설정
3. 첫 배포 후 Prisma 마이그레이션 실행:

```bash
# Cloudtype 콘솔 터미널에서
npx prisma migrate deploy
npx prisma db seed
```

## 🔄 자동 배포 설정

### GitHub Actions 설정

1. GitHub 리포지토리 → Settings → Secrets and variables → Actions
2. 다음 시크릿 추가:
   - `CLOUDTYPE_TOKEN`: Cloudtype API 토큰

### 자동 배포 워크플로우

`.github/workflows/deploy.yml` 파일이 이미 설정되어 있습니다.
- `main` 브랜치에 푸시할 때마다 자동 배포
- 테스트 → 빌드 → 배포 순서로 진행

## 🛡️ 백업 및 모니터링

### 자동 백업 설정

1. **수동 백업 실행**:
```bash
npm run backup
```

2. **자동 백업 스케줄 설정** (Cloudtype 콘솔에서):
```bash
# 매일 새벽 2시 백업
crontab -e
0 2 * * * cd /app && npm run backup
```

### 헬스체크 설정

1. **수동 헬스체크**:
```bash
npm run health-check
```

2. **자동 헬스체크 스케줄**:
```bash
# 매 5분마다 헬스체크
*/5 * * * * cd /app && npm run health-check
```

### 복구 시스템

1. **수동 복구**:
```bash
# 사용 가능한 백업 목록 확인
npm run restore

# 특정 백업으로 복구
npm run restore backup-2024-01-01T12-00-00-000Z.db
```

2. **자동 복구**:
- `AUTO_RECOVER=true` 환경 변수 설정
- 헬스체크에서 데이터베이스 오류 감지 시 자동으로 최신 백업으로 복구

## 📊 모니터링

### 헬스체크 엔드포인트

애플리케이션 상태 확인:
```
GET https://your-app.cloudtype.app/api/health
```

응답 예시:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected",
  "uptime": 3600,
  "memory": {
    "used": 45,
    "total": 128
  }
}
```

### 알림 설정

Slack 웹훅 설정:
1. Slack 앱에서 웹훅 URL 생성
2. `WEBHOOK_URL` 환경 변수에 설정
3. 시스템 오류나 복구 상황 시 자동 알림

## 🔧 문제 해결

### 일반적인 문제

1. **배포 실패**:
   - 환경 변수 확인
   - 빌드 로그 확인
   - 데이터베이스 연결 상태 확인

2. **데이터베이스 연결 오류**:
   - `DATABASE_URL` 환경 변수 확인
   - Prisma 마이그레이션 상태 확인
   - 백업에서 복구 시도

3. **성능 문제**:
   - 헬스체크 로그 확인
   - 메모리 사용량 모니터링
   - 디스크 공간 확인

### 로그 확인

```bash
# 애플리케이션 로그
pm2 logs allsports

# 백업 로그
tail -f /var/log/allsports-backup.log

# 헬스체크 로그
tail -f /var/log/allsports-health.log
```

## 📋 체크리스트

배포 전 확인사항:
- [ ] GitHub 리포지토리 설정
- [ ] Cloudtype 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 데이터베이스 생성 및 연결
- [ ] Prisma 마이그레이션 실행
- [ ] 백업 시스템 테스트
- [ ] 헬스체크 설정
- [ ] 알림 웹훅 설정
- [ ] GitHub Actions 시크릿 설정

배포 후 확인사항:
- [ ] 애플리케이션 정상 접속
- [ ] 데이터베이스 연결 확인
- [ ] 회원가입/로그인 테스트
- [ ] 헬스체크 엔드포인트 확인
- [ ] 백업 시스템 동작 확인