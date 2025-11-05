'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function MorePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">더보기</h1>

        {/* 주요 기능 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">주요 기능</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/teams"
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-bold text-gray-900 mb-1">팀 관리</h3>
              <p className="text-sm text-gray-600">내 팀 만들고 관리하기</p>
            </Link>

            <Link
              href="/matches"
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">⚽</div>
              <h3 className="font-bold text-gray-900 mb-1">경기 관리</h3>
              <p className="text-sm text-gray-600">경기 일정 및 결과</p>
            </Link>

            <Link
              href="/rankings"
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-bold text-gray-900 mb-1">랭킹</h3>
              <p className="text-sm text-gray-600">지역 팀 순위 보기</p>
            </Link>

            <Link
              href="/prism"
              className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">💎</div>
              <h3 className="font-bold text-gray-900 mb-1">Prism 내역</h3>
              <p className="text-sm text-gray-600">포인트 적립/사용 내역</p>
            </Link>
          </div>
        </section>

        {/* 커뮤니티 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">커뮤니티</h2>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" disabled>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">자유 게시판</h3>
                    <p className="text-sm text-gray-600">자유롭게 이야기 나눠요</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">준비중</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" disabled>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤝</span>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">용병 구하기</h3>
                    <p className="text-sm text-gray-600">경기에 함께할 멤버 찾기</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">준비중</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" disabled>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📢</span>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">공지사항</h3>
                    <p className="text-sm text-gray-600">새로운 소식과 업데이트</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">준비중</span>
              </button>
            </div>
          </div>
        </section>

        {/* 설정 및 지원 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">설정 및 지원</h2>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="space-y-4">
              <Link
                href="/profile"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚙️</span>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">계정 설정</h3>
                    <p className="text-sm text-gray-600">프로필 및 정보 관리</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </Link>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" disabled>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔔</span>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">알림 설정</h3>
                    <p className="text-sm text-gray-600">푸시 알림 관리</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">준비중</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" disabled>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❓</span>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">FAQ / 고객센터</h3>
                    <p className="text-sm text-gray-600">자주 묻는 질문</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">준비중</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" disabled>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">이용약관 / 개인정보처리방침</h3>
                    <p className="text-sm text-gray-600">서비스 약관 및 정책</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">준비중</span>
              </button>
            </div>
          </div>
        </section>

        {/* 관리자 메뉴 */}
        {user?.isAdmin && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">관리자</h2>
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow p-6">
              <Link
                href="/admin"
                className="flex items-center justify-between text-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔧</span>
                  <div className="text-left">
                    <h3 className="font-bold">관리자 대시보드</h3>
                    <p className="text-sm text-red-100">사용자, 미션, 제휴 관리</p>
                  </div>
                </div>
                <span className="text-white">→</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
