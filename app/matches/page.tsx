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
    owner?: { id: string; };
  };
  awayTeam: {
    id: string;
    name: string;
    owner?: { id: string; };
  };
  creator: {
    id: string;
    username: string;
  };
}

export default function MatchesPage() {
  const [myMatches, setMyMatches] = useState<Match[]>([]);
  const [otherMatches, setOtherMatches] = useState<Match[]>([]);
  const [filteredOtherMatches, setFilteredOtherMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('축구');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 10;
  const { user } = useAuth();

  useEffect(() => {
    loadMatches();
  }, [selectedSport, selectedStatus, user]);

  useEffect(() => {
    filterMatches();
  }, [otherMatches, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSport, selectedStatus]);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ sport: selectedSport });
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`/api/matches?${params}`);
      if (response.ok) {
        const data = await response.json();

        if (user) {
          // 내 팀이 참여한 시합과 그렇지 않은 시합 분리
          const userMatches = data.filter((match: Match) =>
            match.homeTeam.owner?.id === user.id ||
            match.awayTeam.owner?.id === user.id ||
            match.creator.id === user.id
          ).sort((a: Match, b: Match) => {
            // 오너인 팀의 시합을 먼저 표시
            const aIsOwnerMatch = a.homeTeam.owner?.id === user.id || a.awayTeam.owner?.id === user.id;
            const bIsOwnerMatch = b.homeTeam.owner?.id === user.id || b.awayTeam.owner?.id === user.id;

            if (aIsOwnerMatch && !bIsOwnerMatch) return -1;
            if (!aIsOwnerMatch && bIsOwnerMatch) return 1;

            // 날짜순 정렬 (최신순)
            return new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime();
          });

          const otherMatchesList = data.filter((match: Match) =>
            match.homeTeam.owner?.id !== user.id &&
            match.awayTeam.owner?.id !== user.id &&
            match.creator.id !== user.id
          ).sort((a: Match, b: Match) =>
            new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
          );

          setMyMatches(userMatches);
          setOtherMatches(otherMatchesList);
        } else {
          setMyMatches([]);
          setOtherMatches(data.sort((a: Match, b: Match) =>
            new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
          ));
        }
      }
    } catch (error) {
      console.error('매치 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMatches = () => {
    if (!searchQuery.trim()) {
      setFilteredOtherMatches(otherMatches);
      return;
    }

    const filtered = otherMatches.filter((match) =>
      match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (match.location && match.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredOtherMatches(filtered);
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredOtherMatches.length / matchesPerPage);
  const startIndex = (currentPage - 1) * matchesPerPage;
  const endIndex = startIndex + matchesPerPage;
  const currentMatches = filteredOtherMatches.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">시합 관리</h1>
          {user && (
            <Link
              href="/matches/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              시합 만들기
            </Link>
          )}
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                스포츠
              </label>
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="축구">축구</option>
                <option value="풋살">풋살</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="proposed">제안됨</option>
                <option value="confirmed">확정됨</option>
                <option value="completed">완료됨</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="팀명, 제안자, 위치로 검색..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {searchQuery && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">"{searchQuery}"</span> 검색 결과: {filteredOtherMatches.length}개
            </div>
          )}
        </div>

        {/* 매치 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 내 시합 */}
            {user && myMatches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">내 팀 시합</h2>
                <div className="space-y-4">
                  {myMatches.map((match) => (
                    <MatchCard key={match.id} match={match} user={user} isMyMatch={true} />
                  ))}
                </div>
              </div>
            )}

            {/* 다른 시합들 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedSport} 시합 ({filteredOtherMatches.length}개)
              </h2>
              {filteredOtherMatches.length > 0 ? (
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
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? '검색 결과가 없습니다' : '해당 조건의 시합이 없습니다'}
                  </p>
                  {user && !searchQuery && (
                    <Link
                      href="/matches/create"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      첫 번째 시합을 만들어보세요!
                    </Link>
                  )}
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