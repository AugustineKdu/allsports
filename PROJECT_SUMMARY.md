# AllSports 프로젝트 개발 및 배포 과정 정리

## 📋 프로젝트 개요

**AllSports**는 Next.js 14를 기반으로 한 스포츠 팀 매칭 및 관리 웹 애플리케이션입니다.

### 주요 기능
- 사용자 회원가입/로그인 (JWT 인증)
- 스포츠 팀 생성 및 관리
- 팀 가입 신청 시스템
- 경기 제안 및 결과 기록
- 팀 랭킹 시스템
- 지역별 팀 검색 필터링

### 기술 스택
- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT + bcryptjs
- **Deployment**: Cloudtype

---

## 🔧 개발 과정에서 해결한 주요 이슈

### 1. 팀 가입 신청 기능 개선
**문제**:
- 가입 신청이 도착하지 않음
- 메시지 필드 누락
- 연락처 정보 공유 불가능

**해결**:
```typescript
// TeamMember 모델에 requestedAt 필드 추가
model TeamMember {
  requestedAt DateTime? @map("requested_at")
  message     String?   // 가입 신청 메시지
}

// User 모델에 연락처 필드 추가
model User {
  contact String? // 연락처 (전화번호)
}
```

### 2. 매치 제안 방향 수정
**문제**: Away 팀 오너가 자신의 매치를 볼 수 없음

**해결**:
```typescript
// API에서 팀 오너 정보 포함하도록 수정
const matches = await prisma.match.findMany({
  include: {
    homeTeam: { include: { owner: true } },
    awayTeam: { include: { owner: true } }
  }
});
```

### 3. TypeScript 컴파일 오류 해결
**문제**: 클라우드 배포 시 implicit 'any' 타입 오류

**해결**:
```typescript
// 콜백 함수에 명시적 타입 추가
const isHomeTeamMember = homeTeam.members.some((member: any) => member.userId === user.id);
const rankedTeams = teams.map((team: any, index: number) => ({ ...team, rank: index + 1 }));
```

---

## ⚠️ 주요 배포 문제와 해결 과정

### 1. GitHub 파일 크기 제한 문제
**문제**: node_modules, .next 등 대용량 파일로 인한 푸시 실패

**해결**:
```gitignore
# .gitignore 강화
node_modules/
.next/
.env*
*.log
prisma/dev.db*
```

### 2. SQLite → PostgreSQL 마이그레이션
**문제**: 로컬 개발은 SQLite, 프로덕션은 PostgreSQL 필요

**해결**:
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // SQLite에서 변경
  url      = env("DATABASE_URL")
}
```

### 3. 빌드 과정에서 데이터베이스 연결 실패
**문제**: 빌드 시점에 PostgreSQL 서비스 연결 불가

**해결**:
```json
// package.json - 빌드와 런타임 분리
{
  "scripts": {
    "build": "npx prisma generate && next build --no-lint",
    "start": "node start-server.js"
  }
}
```

### 4. 데이터베이스 초기화 스크립트 미실행
**문제**: init-db.js가 실행되지 않아 테이블 생성 안됨

**최종 해결**:
```javascript
// start-server.js - 통합 서버 시작 스크립트
async function initializeDatabase() {
  console.log('📊 DATABASE_URL:', process.env.DATABASE_URL);

  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    timeout: 60000
  });

  execSync('npx prisma db seed', {
    stdio: 'inherit',
    timeout: 30000
  });
}
```

---

## 🗂️ 현재 프로젝트 구조

### 핵심 파일들
```
allsport_update/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # 인증 관련 API
│   │   ├── teams/                # 팀 관리 API
│   │   ├── matches/              # 매치 관리 API
│   │   └── rankings/             # 랭킹 API
│   ├── login/                    # 로그인 페이지
│   ├── register/                 # 회원가입 페이지
│   ├── teams/                    # 팀 관리 페이지
│   └── matches/                  # 매치 관리 페이지
├── components/                   # 재사용 컴포넌트
│   └── AuthContext.tsx           # 인증 Context
├── lib/                          # 유틸리티 함수
├── prisma/                       # 데이터베이스 설정
│   ├── schema.prisma             # DB 스키마 정의
│   └── seed.ts                   # 초기 데이터
├── scripts/                      # 유틸리티 스크립트
│   └── test-db.js                # DB 연결 테스트
├── start-server.js               # 서버 시작 스크립트
├── package.json                  # 프로젝트 설정
├── cloudtype.yml                 # Cloudtype 배포 설정
└── .env.production               # 환경 변수
```

### 간소화된 package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npx prisma generate && NEXT_TELEMETRY_DISABLED=1 next build --no-lint",
    "start": "node start-server.js",
    "lint": "next lint",
    "db:push": "npx prisma db push",
    "db:seed": "npx prisma db seed"
  }
}
```

---

## 🐛 해결해야 할 현재 문제

### PostgreSQL 연결 및 초기화 이슈
**증상**:
```
The table `public.teams` does not exist in the current database.
The table `public.users` does not exist in the current database.
```

**원인 분석**:
1. PostgreSQL 서비스 자체에 데이터베이스가 생성되지 않았을 가능성
2. start-server.js의 데이터베이스 초기화 스크립트가 실행되지 않음
3. Environment Variables 설정 문제

**시도한 해결 방법**:
- 내부 연결 (`allsportsdb:5432`) → 외부 연결 (`svc.sel3.cloudtype.app:30161`)
- 다양한 데이터베이스 초기화 스크립트 작성
- 빌드와 런타임 분리
- 프로젝트 파일 정리 및 간소화

---

## 🔧 현재 설정 정보

### Environment Variables (Cloudtype)
```
NODE_ENV=production
DATABASE_URL=postgresql://root:allsports2025@svc.sel3.cloudtype.app:30161/allsportsdb
JWT_SECRET=abc9b8bc8c213cc583883b84450bf9bb55f7ecdd6fa0ce6f9cc0062632708cf506f7b006c0564568b88215d7fb2c501a416db51f51da30829db004214052c31b
NEXT_TELEMETRY_DISABLED=1
```

### PostgreSQL 정보
```
Host: svc.sel3.cloudtype.app
Port: 30161
Username: root
Password: allsports2025
Database: allsportsdb
```

### Cloudtype 배포 설정
```yaml
# cloudtype.yml
name: allsports
app: allsports
options:
  ports: 3000
  buildCommand: npm run build
  startCommand: npm start
  nodeVersion: 22
```

---

## 📊 데이터베이스 스키마

### 주요 모델들
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  username     String
  contact      String?  // 연락처 추가
  isAdmin      Boolean  @default(false)
  currentSport String   @default("축구")
  city         String   @default("서울")
  district     String?
}

model Team {
  id           String  @id @default(uuid())
  name         String
  canonicalName String @unique
  sport        String
  city         String
  district     String
  ownerId      String
  points       Int     @default(0)
  wins         Int     @default(0)
  draws        Int     @default(0)
  losses       Int     @default(0)
}

model TeamMember {
  id          String    @id @default(uuid())
  teamId      String
  userId      String
  status      String    @default("active")
  role        String    @default("member")
  message     String?   // 가입 신청 메시지 추가
  requestedAt DateTime? // 신청 시간 추가
  approvedAt  DateTime?
}

model Match {
  id          String   @id @default(uuid())
  sport       String
  homeTeamId  String
  awayTeamId  String
  matchDate   DateTime
  location    String?
  status      String   @default("proposed")
  homeScore   Int?
  awayScore   Int?
  contactInfo String?  // 연락처 정보 추가
  message     String?  // 매치 메시지 추가
}
```

---

## 🎯 다음 단계 및 개선 사항

### 즉시 해결 필요
1. **PostgreSQL 데이터베이스 초기화 완료**
   - 테이블 생성 확인
   - 시드 데이터 추가 확인

2. **배포 후 기능 테스트**
   - 회원가입/로그인
   - 팀 생성 및 가입
   - 매치 제안 및 결과 입력

### 향후 개선 사항
1. **사용자 경험 개선**
   - 반응형 디자인 최적화
   - 로딩 상태 표시
   - 에러 메시지 개선

2. **기능 확장**
   - 실시간 알림 시스템
   - 매치 일정 캘린더
   - 팀 통계 및 분석

3. **성능 최적화**
   - 이미지 최적화
   - 캐싱 전략
   - DB 쿼리 최적화

---

## 📝 배포 체크리스트

### 배포 전 확인사항
- [ ] PostgreSQL 서비스 실행 중
- [ ] Environment Variables 정확히 설정
- [ ] GitHub 저장소 최신 상태
- [ ] 빌드 성공 확인

### 배포 후 확인사항
- [ ] 서버 시작 로그에서 데이터베이스 초기화 성공 메시지 확인
- [ ] 애플리케이션 정상 접속
- [ ] 기본 기능 (로그인, 팀 생성 등) 테스트
- [ ] 데이터 영속성 확인

---

## 🚀 성공 시나리오

배포가 성공하면 다음 로그가 표시되어야 함:
```
🚀 Starting AllSports server...
🔄 Initializing database...
📊 DATABASE_URL: postgresql://root:allsports2025@svc.sel3.cloudtype.app:30161/allsportsdb
📊 Creating database tables...
🌱 Adding initial data...
✅ Database ready!
🌐 Starting Next.js server...
▲ Next.js 14.0.4
✓ Ready in 505ms
```

이후 사용자는 다음과 같은 워크플로우로 서비스를 이용할 수 있음:
1. 회원가입 → 2. 로그인 → 3. 팀 생성/가입 → 4. 매치 제안/참여 → 5. 결과 기록

---

*이 문서는 AllSports 프로젝트의 현재 상태와 개발 과정을 요약한 것입니다. 추가 이슈나 개선사항이 발생하면 지속적으로 업데이트됩니다.*