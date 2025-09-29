# 🚀 AllSports Cloudtype 배포 체크리스트

## ✅ **완료된 수정사항**

### 1. 데이터베이스 설정 수정 완료
- ✅ Prisma schema를 SQLite → PostgreSQL로 변경
- ✅ 환경변수 템플릿 업데이트 (`.env.production.new` 생성)

### 2. 빌드 테스트 완료
- ✅ PostgreSQL 스키마로 빌드 성공 확인
- ✅ 18개 페이지 모두 정상 생성

## 🔧 **Cloudtype 배포 전 필수 작업**

### 1. Cloudtype 콘솔에서 설정해야 할 환경변수

```bash
# 필수 환경변수 (Cloudtype 콘솔에서 설정)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name  # Cloudtype에서 제공
JWT_SECRET=XXXXXXXXXXXXXXXXXX  # 강력한 랜덤 문자열
NODE_ENV=production
APP_URL=https://your-app-name-xxx.cloudtype.app  # 실제 앱 URL
NEXT_TELEMETRY_DISABLED=1

# 선택사항 (백업/모니터링)
BACKUP_DIR=/app/backups
MAX_BACKUPS=14
AUTO_RECOVER=true
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK  # Slack 알림용
```

### 2. JWT 시크릿 생성 명령어
```bash
# 터미널에서 실행하여 강력한 시크릿 생성
openssl rand -base64 32
```

### 3. 첫 배포 후 실행할 명령어 (Cloudtype 콘솔 터미널)
```bash
# 데이터베이스 마이그레이션 실행
npx prisma migrate deploy

# 기존 더미 데이터 정리 (필요한 경우에만)
npm run reset:clean

# 깨끗한 초기 데이터 시딩 (관리자 계정 + 지역 데이터만)
npx prisma db seed
```

### 4. 데이터 관리 명령어
```bash
# 더미 데이터 정리 (관리자 계정과 지역 데이터만 유지)
npm run reset:clean

# 깨끗한 시딩 실행 (관리자 + 지역 데이터)
npm run prisma:seed

# 데이터베이스 백업
npm run backup

# 백업에서 복구
npm run restore
```

## 🚨 **발견된 문제와 해결방안**

### 문제 1: 데이터베이스 호환성 이슈 (해결됨 ✅)
- **원인**: SQLite → PostgreSQL 불일치
- **해결**: Prisma schema 수정 완료

### 문제 2: 환경변수 설정 불일치 (해결됨 ✅)
- **원인**: 프로덕션 환경변수가 SQLite 경로 사용
- **해결**: PostgreSQL용 환경변수 템플릿 생성

### 문제 3: 보안 이슈 (주의 필요 ⚠️)
- **원인**: 기본 JWT 시크릿 사용
- **해결**: Cloudtype에서 강력한 랜덤 시크릿 설정 필요

## 📋 **배포 단계별 가이드**

### Step 1: GitHub 푸시
```bash
git add .
git commit -m "Fix PostgreSQL configuration for production deployment"
git push origin main
```

### Step 2: Cloudtype 프로젝트 설정
1. Cloudtype 콘솔에서 PostgreSQL 데이터베이스 생성
2. 위의 환경변수들을 모두 설정
3. GitHub 리포지토리 연결

### Step 3: 첫 배포 후 설정
```bash
# Cloudtype 콘솔 터미널에서 실행
npx prisma migrate deploy
npx prisma db seed
```

### Step 4: 배포 확인
- `/api/health` 엔드포인트 접속하여 상태 확인
- 회원가입/로그인 테스트
- 팀 생성/경기 생성 테스트

## 🔍 **트러블슈팅**

### 배포 실패 시 확인사항
1. **환경변수 확인**: DATABASE_URL이 올바른 PostgreSQL URL인지
2. **마이그레이션 확인**: `npx prisma migrate deploy` 실행했는지
3. **빌드 로그 확인**: Cloudtype 콘솔에서 빌드 에러 확인

### 데이터베이스 연결 오류 시
1. Cloudtype PostgreSQL 서비스가 실행 중인지 확인
2. DATABASE_URL 형식이 올바른지 확인 (`postgresql://...`)
3. 네트워크 연결 상태 확인

## ✨ **배포 후 추천 작업**

1. **백업 스케줄 설정**: 매일 자동 백업
2. **모니터링 설정**: Slack 웹훅 연결
3. **도메인 설정**: 커스텀 도메인 연결 (선택사항)
4. **SSL 인증서**: 자동으로 설정됨 (Cloudtype 기본)

---

**🎯 이제 배포 준비가 완료되었습니다! 위의 체크리스트를 따라 진행하시면 성공적으로 배포할 수 있습니다.**
