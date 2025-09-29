// 팀명 정규화 함수
export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '') // 공백 제거
    .replace(/[^\w가-힣]/g, '') // 특수문자 제거 (한글, 영문, 숫자만 유지)
    .trim();
}

// 날짜 포맷팅 함수
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 시간 포맷팅 함수
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 상대적 시간 표시 함수
export function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDate(target);
}

// 온라인 상태 확인 함수
export function isUserOnline(lastActiveAt: Date | string): boolean {
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  return diffMins < 5; // 5분 이내 활동하면 온라인으로 간주
}

// 팀 활성 상태 확인 함수
export function isTeamActive(lastActiveAt: Date | string): boolean {
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays < 30; // 30일 이내 활동하면 활성 팀으로 간주
}