# 🔧 Cloudtype 환경변수 설정 가이드

## 🚨 **현재 문제: DATABASE_URL 설정 오류**

로그에서 확인된 오류:
```
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

이는 Cloudtype에서 `DATABASE_URL` 환경변수가 올바르게 설정되지 않았기 때문입니다.

## ✅ **해결 방법**

### 1. Cloudtype 콘솔에서 PostgreSQL 데이터베이스 생성

1. **Cloudtype 콘솔 접속**: https://console.cloudtype.io
2. **프로젝트 페이지** → **데이터베이스** 탭
3. **PostgreSQL 데이터베이스 생성** 클릭
4. 데이터베이스 이름: `allsports_db` (원하는 이름)
5. **생성 완료 후 연결 정보 확인**

### 2. 환경변수 설정

Cloudtype 콘솔에서 **환경변수** 탭으로 이동하여 다음 설정:

#### 🔵 **필수 환경변수**
```bash
# 데이터베이스 URL (Cloudtype에서 제공하는 PostgreSQL URL)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# JWT 시크릿 (강력한 랜덤 문자열)
JWT_SECRET=your-super-secure-random-secret-key-here

# 프로덕션 환경
NODE_ENV=production

# 텔레메트리 비활성화
NEXT_TELEMETRY_DISABLED=1
```

#### 🟡 **선택 환경변수**
```bash
# 애플리케이션 URL
APP_URL=https://your-app-name-xxx.cloudtype.app

# 백업 설정
BACKUP_DIR=/app/backups
MAX_BACKUPS=14
AUTO_RECOVER=true

# 알림 웹훅 (Slack 등)
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 3. DATABASE_URL 형식 확인

✅ **올바른 형식**:
```
postgresql://user:password@host:5432/database
postgres://user:password@host:5432/database
```

❌ **잘못된 형식**:
```
file:./dev.db                    # SQLite (로컬용)
mysql://...                      # MySQL
host:5432/database               # 프로토콜 누락
postgresql:///database           # 호스트 정보 누락
```

### 4. JWT_SECRET 생성

터미널에서 강력한 시크릿 생성:
```bash
# 방법 1: OpenSSL 사용
openssl rand -base64 32

# 방법 2: Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 예시 결과
YourGeneratedSecretHere1234567890ABCDEF==
```

## 🔄 **설정 완료 후 재배포**

1. **환경변수 저장** 후 자동 재배포 대기
2. **재배포 완료 후 확인**:
   ```
   https://your-app.cloudtype.app/api/health
   ```

3. **성공 시 응답**:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "databaseUrl": "set",
     "userCount": 1
   }
   ```

## 🛠️ **문제 해결**

### DATABASE_URL이 여전히 잘못된 경우

1. **Cloudtype 데이터베이스 상태 확인**
   - 데이터베이스가 실제로 생성되었는지 확인
   - 상태가 "Running"인지 확인

2. **환경변수 다시 설정**
   - 복사/붙여넣기 시 공백이나 특수문자 확인
   - 따옴표 제거 (환경변수는 값만 입력)

3. **재배포 강제 실행**
   - 환경변수 변경 후 자동 재배포가 안 되면 수동 재배포

### 로그에서 확인할 내용

재배포 후 로그에서 다음 메시지 확인:
```
🔍 Database URL validation:
  DATABASE_URL exists: true
  DATABASE_URL type: string
  DATABASE_URL preview: postgresql://...
✅ DATABASE_URL validation passed
```

## 📋 **체크리스트**

배포 전 확인사항:
- [ ] Cloudtype PostgreSQL 데이터베이스 생성됨
- [ ] DATABASE_URL 환경변수 설정됨 (`postgresql://` 시작)
- [ ] JWT_SECRET 환경변수 설정됨 (32자 이상 랜덤 문자열)
- [ ] NODE_ENV=production 설정됨
- [ ] 재배포 완료됨
- [ ] `/api/health` 엔드포인트 정상 응답

---

**🎯 이 가이드대로 설정하면 데이터베이스 연결 오류가 해결됩니다!**
