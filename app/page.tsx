'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const [currentSport, setCurrentSport] = useState('축구');
  const [myTeams, setMyTeams] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [currentSport, user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 랭킹 데이터 로드
      const rankingsResponse = await fetch(`/api/rankings?sport=${currentSport}&scope=city&city=${user?.city || '서울'}`);
      if (rankingsResponse.ok) {
        const rankingsData = await rankingsResponse.json();
        setRankings(rankingsData.slice(0, 5)); // TOP 5만 표시
      }

      // 사용자가 로그인한 경우 개인 데이터 로드
      if (user) {
        const token = localStorage.getItem('token');

        // 내 팀 데이터 로드
        const teamsResponse = await fetch(`/api/teams?sport=${currentSport}&city=${user.city}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          // 사용자가 멤버로 속한 팀들을 필터링해야 함 (임시로 모든 팀 표시)
          setMyTeams(teamsData.slice(0, 3));
        }

        // 예정된 경기 데이터 로드
        const matchesResponse = await fetch(`/api/matches?sport=${currentSport}&status=proposed`);
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setUpcomingMatches(matchesData.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 히어로 섹션 */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">
              아마추어 스포츠 매칭 플랫폼
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              축구와 풋살 팀을 만들고, 경기를 주선하고, 랭킹을 확인하세요
            </p>
            <div className="space-x-4">
              <Link
                href="/register"
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                시작하기
              </Link>
              <Link
                href="/login"
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 스포츠 전환 토글 */}
      <div className="flex justify-center p-4 bg-white border-b">
        <div className="flex gap-2">
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentSport === '축구'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setCurrentSport('축구')}
          >
            ⚽ 축구
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentSport === '풋살'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setCurrentSport('풋살')}
          >
            ⚽ 풋살
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 사용자별 대시보드 */}
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* 내 팀 정보 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">내 팀</h2>
                  {myTeams.length > 0 ? (
                    <div className="space-y-3">
                      {myTeams.map((team: any) => (
                        <div key={team.id} className="border-l-4 border-blue-500 pl-3">
                          <p className="font-medium">{team.name}</p>
                          <p className="text-sm text-gray-600">{team.city} {team.district}</p>
                          <p className="text-sm text-gray-500">포인트: {team.points}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500 mb-3">아직 가입한 팀이 없습니다</p>
                      <Link
                        href="/teams"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        팀 만들기 →
                      </Link>
                    </div>
                  )}
                </div>

                {/* 예정된 경기 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">예정된 경기</h2>
                  {upcomingMatches.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingMatches.map((match: any) => (
                        <div key={match.id} className="border border-gray-200 rounded p-3">
                          <p className="font-medium text-sm">
                            {match.homeTeam.name} vs {match.awayTeam.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(match.matchDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">{match.location}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500 mb-3">예정된 경기가 없습니다</p>
                      <Link
                        href="/matches"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        경기 만들기 →
                      </Link>
                    </div>
                  )}
                </div>

                {/* 지역 랭킹 TOP 5 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {user?.city || '서울'} TOP 5
                  </h2>
                  {rankings.length > 0 ? (
                    <div className="space-y-2">
                      {rankings.map((team: any, index) => (
                        <div key={team.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium">{team.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">{team.points}pt</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">랭킹 정보가 없습니다</p>
                  )}
                  <Link
                    href="/rankings"
                    className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-3"
                  >
                    전체 랭킹 보기 →
                  </Link>
                </div>
              </div>
            )}

            {/* 빠른 메뉴 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/teams" className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
                <div className="font-medium text-gray-900">팀 관리</div>
                <div className="text-sm text-gray-500 mt-1">팀 생성 및 관리</div>
              </Link>
              <Link href="/matches" className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚽</div>
                <div className="font-medium text-gray-900">시합 관리</div>
                <div className="text-sm text-gray-500 mt-1">경기 생성 및 결과</div>
              </Link>
              <Link href="/rankings" className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
                <div className="font-medium text-gray-900">랭킹</div>
                <div className="text-sm text-gray-500 mt-1">전국/지역 순위</div>
              </Link>
              <Link href="/profile" className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👤</div>
                <div className="font-medium text-gray-900">마이페이지</div>
                <div className="text-sm text-gray-500 mt-1">개인 정보 관리</div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}