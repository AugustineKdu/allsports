'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

interface Match {
  id: string;
  sport: string;
  matchDate: string;
  matchTime?: string;
  location?: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  homeTeam: {
    id: string;
    name: string;
    city: string;
    district: string;
    owner?: { id: string; };
  };
  awayTeam: {
    id: string;
    name: string;
    city: string;
    district: string;
    owner?: { id: string; };
  };
  creator: {
    id: string;
    username: string;
  };
}

export default function MatchesPage() {
  const { user } = useAuth();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeRegionTab, setActiveRegionTab] = useState<'district' | 'city' | 'national'>('district');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'proposed' | 'confirmed' | 'completed'>('all');
  const matchesPerPage = 10;

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ sport: user.currentSport });
      const response = await fetch(`/api/matches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAllMatches(data.sort((a: Match, b: Match) =>
          new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
        ));
      }
    } catch (error) {
      console.error('매치 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 지역 + 상태 필터링된 시합 가져오기
  const getFilteredMatches = () => {
    if (!user) return [];

    let filtered = allMatches;

    // 1. 지역 필터링
    switch (activeRegionTab) {
      case 'district':
        filtered = filtered.filter((match: Match) =>
          (match.homeTeam.city === user.city && match.homeTeam.district === user.district) ||
          (match.awayTeam.city === user.city && match.awayTeam.district === user.district)
        );
        break;
      case 'city':
        filtered = filtered.filter((match: Match) =>
          match.homeTeam.city === user.city || match.awayTeam.city === user.city
        );
        break;
      case 'national':
        // 전국 - 필터링 안 함
        break;
    }

    // 2. 상태 필터링
    if (activeStatusTab !== 'all') {
      filtered = filtered.filter((match: Match) => match.status === activeStatusTab);
    }

    return filtered;
  };

  // 내 팀 시합 가져오기
  const getMyMatches = () => {
    if (!user) return [];
    return allMatches.filter((match: Match) =>
      match.homeTeam.owner?.id === user.id ||
      match.awayTeam.owner?.id === user.id ||
      match.creator.id === user.id
    );
  };

  // 페이지네이션 계산
  const filteredMatches = getFilteredMatches();
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);
  const startIndex = (currentPage - 1) * matchesPerPage;
  const endIndex = startIndex + matchesPerPage;
  const currentMatches = filteredMatches.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">시합 관리</h1>
              <p className="text-gray-600 mt-2">{user.currentSport} 시합 목록</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  📍 {user.city} {user.district}
                </span>
              </div>
            </div>
            <Link
              href="/matches/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap self-start md:self-auto"
            >
              시합 만들기
            </Link>
          </div>
        </div>

        {/* 매치 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 내 시합 */}
            {getMyMatches().length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">내 팀 시합</h2>
                <div className="space-y-4">
                  {getMyMatches().map((match) => (
                    <MatchCard key={match.id} match={match} user={user} isMyMatch={true} />
                  ))}
                </div>
              </div>
            )}

            {/* 지역 탭 */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => {
                      setActiveRegionTab('district');
                      setCurrentPage(1);
                    }}
                    className={`${
                      activeRegionTab === 'district'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    {user.district}
                  </button>
                  <button
                    onClick={() => {
                      setActiveRegionTab('city');
                      setCurrentPage(1);
                    }}
                    className={`${
                      activeRegionTab === 'city'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    {user.city}
                  </button>
                  <button
                    onClick={() => {
                      setActiveRegionTab('national');
                      setCurrentPage(1);
                    }}
                    className={`${
                      activeRegionTab === 'national'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    전국
                  </button>
                </nav>
              </div>
            </div>

            {/* 상태 탭 */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setActiveStatusTab('all');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStatusTab === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => {
                    setActiveStatusTab('proposed');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStatusTab === 'proposed'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  제안됨
                </button>
                <button
                  onClick={() => {
                    setActiveStatusTab('confirmed');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStatusTab === 'confirmed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  확정됨
                </button>
                <button
                  onClick={() => {
                    setActiveStatusTab('completed');
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStatusTab === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  완료됨
                </button>
              </div>
            </div>

            {/* 시합 목록 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                시합 목록 ({filteredMatches.length}개)
              </h2>
              {currentMatches.length > 0 ? (
                <>
                  <div className="space-y-4 mb-8">
                    {currentMatches.map((match) => (
                      <MatchCard key={match.id} match={match} user={user} isMyMatch={false} />
                    ))}
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500 mb-4">해당 조건의 시합이 없습니다</p>
                  <Link
                    href="/matches/create"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    첫 번째 시합을 만들어보세요!
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 시합 카드 컴포넌트
function MatchCard({ match, user, isMyMatch }: { match: Match; user: any; isMyMatch: boolean }) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'proposed': return '제안됨';
      case 'confirmed': return '확정됨';
      case 'completed': return '완료됨';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOwnerMatch = match.homeTeam.owner?.id === user?.id || match.awayTeam.owner?.id === user?.id;
  const isCreator = match.creator.id === user?.id;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h3 className="text-lg font-semibold">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </h3>
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                {getStatusText(match.status)}
              </span>
              {isOwnerMatch && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  👑 내 팀
                </span>
              )}
              {isCreator && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  📝 내가 생성
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>📅</span>
              <span>{new Date(match.matchDate).toLocaleDateString('ko-KR')}</span>
              {match.matchTime && <span>{match.matchTime}</span>}
            </div>
            {match.location && (
              <div className="flex items-center space-x-1">
                <span>📍</span>
                <span>{match.location}</span>
              </div>
            )}
          </div>
        </div>

        {match.status === 'completed' && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {match.homeScore} - {match.awayScore}
            </div>
            <div className="text-sm text-gray-500">최종 스코어</div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          제안자: {match.creator.username}
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/matches/${match.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            자세히 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}