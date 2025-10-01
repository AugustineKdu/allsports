'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

interface Stats {
  overall: {
    totalUsers: number;
    totalTeams: number;
    totalMatches: number;
    completedMatches: number;
    proposedMatches: number;
    confirmedMatches: number;
    adminUsers: number;
  };
  recent: {
    recentUsers: number;
    recentTeams: number;
    recentMatches: number;
  };
  sportStats: Array<{ sport: string; _count: { sport: number } }>;
  cityStats: Array<{ city: string; _count: { city: number } }>;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('통계 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('더미 데이터를 생성하시겠습니까?\n\n서울 강남구와 경기도 수원시에 각 5개 팀 (총 10개 팀, 30명 사용자)이 생성됩니다.')) {
      return;
    }

    setIsSeeding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`더미 데이터 생성 완료!\n\n사용자: ${data.created.users}명\n팀: ${data.created.teams}개\n멤버십: ${data.created.memberships}개`);
        loadStats();
      } else {
        const error = await response.json();
        alert(error.error || '더미 데이터 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('더미 데이터 생성 실패:', error);
      alert('더미 데이터 생성 중 오류가 발생했습니다');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDeleteSeedData = async () => {
    if (!confirm('⚠️ 경고: 모든 더미 데이터를 삭제하시겠습니까?\n\n@test.com 이메일을 가진 모든 사용자, 팀, 경기가 영구적으로 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다!')) {
      return;
    }

    if (!confirm('정말로 삭제하시겠습니까? 다시 한번 확인해주세요.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/seed', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`더미 데이터 삭제 완료!\n\n사용자: ${data.deleted.users}명\n팀: ${data.deleted.teams}개\n멤버십: ${data.deleted.memberships}개\n경기: ${data.deleted.matches}개`);
        loadStats();
      } else {
        const error = await response.json();
        alert(error.error || '더미 데이터 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('더미 데이터 삭제 실패:', error);
      alert('더미 데이터 삭제 중 오류가 발생했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-4">관리자만 접근할 수 있는 페이지입니다.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">⚙️ 관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">시스템 관리 및 모니터링</p>
        </div>

        {/* 전체 통계 카드 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">전체 사용자</p>
                    <p className="text-3xl font-bold mt-2">{stats.overall.totalUsers}</p>
                    <p className="text-blue-100 text-xs mt-2">최근 7일: +{stats.recent.recentUsers}</p>
                  </div>
                  <div className="text-5xl opacity-20">👥</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">전체 팀</p>
                    <p className="text-3xl font-bold mt-2">{stats.overall.totalTeams}</p>
                    <p className="text-green-100 text-xs mt-2">최근 7일: +{stats.recent.recentTeams}</p>
                  </div>
                  <div className="text-5xl opacity-20">🏃‍♂️</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">전체 경기</p>
                    <p className="text-3xl font-bold mt-2">{stats.overall.totalMatches}</p>
                    <p className="text-yellow-100 text-xs mt-2">최근 7일: +{stats.recent.recentMatches}</p>
                  </div>
                  <div className="text-5xl opacity-20">⚽</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">완료된 경기</p>
                    <p className="text-3xl font-bold mt-2">{stats.overall.completedMatches}</p>
                    <p className="text-purple-100 text-xs mt-2">제안: {stats.overall.proposedMatches} / 확정: {stats.overall.confirmedMatches}</p>
                  </div>
                  <div className="text-5xl opacity-20">🏆</div>
                </div>
              </div>
            </div>

            {/* 종목별 및 지역별 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">종목별 팀 분포</h3>
                <div className="space-y-3">
                  {stats.sportStats.map((stat) => (
                    <div key={stat.sport} className="flex items-center justify-between">
                      <span className="text-gray-700">{stat.sport}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(stat._count.sport / stats.overall.totalTeams) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                          {stat._count.sport}팀
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 5개 지역</h3>
                <div className="space-y-3">
                  {stats.cityStats.map((stat, index) => (
                    <div key={stat.city} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{stat.city}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {stat._count.city}팀
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 사용자 관리 */}
          <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">사용자 관리</h3>
                <p className="text-sm text-gray-500">사용자 정보 및 권한 관리</p>
              </div>
            </div>
            <p className="text-sm text-blue-600 font-medium">관리하기 →</p>
          </Link>

          {/* 팀 관리 */}
          <Link href="/admin/teams" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏃‍♂️</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">팀 관리</h3>
                <p className="text-sm text-gray-500">팀 정보 및 삭제</p>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium">관리하기 →</p>
          </Link>

          {/* 경기 관리 */}
          <Link href="/admin/matches" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚽</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">경기 관리</h3>
                <p className="text-sm text-gray-500">경기 결과 수정 및 취소</p>
              </div>
            </div>
            <p className="text-sm text-yellow-600 font-medium">관리하기 →</p>
          </Link>
        </div>

        {/* 더미 데이터 관리 */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">🧪 더미 데이터 관리</h2>
              <p className="text-sm text-gray-600">테스트용 더미 데이터를 생성하거나 삭제할 수 있습니다</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">생성될 데이터</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                서울 강남구: 5개 팀, 15명 사용자 (각 팀 오너 1명 + 멤버 2명)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                경기도 수원시: 5개 팀, 15명 사용자 (각 팀 오너 1명 + 멤버 2명)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                모든 계정 비밀번호: <code className="bg-gray-100 px-2 py-0.5 rounded">test1234</code>
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                이메일 형식: <code className="bg-gray-100 px-2 py-0.5 rounded">*@test.com</code>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSeedData}
              disabled={isSeeding || isDeleting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isSeeding ? '생성 중...' : '✨ 더미 데이터 생성'}
            </button>

            <button
              onClick={handleDeleteSeedData}
              disabled={isSeeding || isDeleting}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isDeleting ? '삭제 중...' : '🗑️ 더미 데이터 삭제'}
            </button>
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>주의:</strong> 더미 데이터 삭제는 @test.com 이메일을 가진 모든 사용자와 관련 데이터(팀, 경기)를 영구적으로 삭제합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}