'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout, prismBalance, refreshPrismBalance } = useAuth();

  // Prism 포인트 초기 조회
  useEffect(() => {
    if (user) {
      refreshPrismBalance();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    // 페이지 새로고침으로 완전히 로그아웃 상태 반영
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 및 메인 네비게이션 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">AllSports</span>
            </Link>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:ml-10 md:flex md:space-x-6">
              <Link
                href="/missions"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                미션
              </Link>
              <Link
                href="/shortcut"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                숏컷
              </Link>
              <Link
                href="/best-missions"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                베스트미션
              </Link>
              <Link
                href="/partners"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                제휴
              </Link>
              <Link
                href="/profile"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                MY
              </Link>
              <Link
                href="/more"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                더보기
              </Link>
            </div>
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Prism 포인트 표시 */}
                <Link
                  href="/missions"
                  className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  <span className="text-lg">💎</span>
                  <span className="font-bold">{prismBalance.toLocaleString()}</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <div className="text-left hidden md:block">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.city} {user.district} · {user.currentSport}
                      </div>
                    </div>
                    <div className="text-left md:hidden">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.username}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                {/* 드롭다운 메뉴 */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs">{user.city} {user.district}</p>
                      <p className="text-xs">Sport: {user.currentSport}</p>

                      {/* Prism 포인트 (모바일/드롭다운) */}
                      <Link
                        href="/missions"
                        className="mt-2 flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="text-xs font-medium">My Prism</span>
                        <span className="flex items-center gap-1">
                          <span>💎</span>
                          <span className="font-bold">{prismBalance.toLocaleString()}</span>
                        </span>
                      </Link>
                    </div>

                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* 모바일 메뉴 버튼 - 주석처리 (하단 탭바로 대체) */}
            {/* <button
              className="ml-4 md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button> */}
          </div>
        </div>

        {/* 모바일 메뉴 - 주석처리 (하단 탭바로 대체) */}
        {/* {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href="/teams"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                팀 관리
              </Link>
              <Link
                href="/matches"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                시합 관리
              </Link>
              <Link
                href="/rankings"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                랭킹
              </Link>
            </div>
          </div>
        )} */}
      </div>
    </nav>
  );
}