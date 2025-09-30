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
        <div className="bg-white text-gray-900 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 text-6xl">🏆</div>
            <div className="absolute top-20 right-20 text-5xl">⚽</div>
            <div className="absolute bottom-20 left-1/4 text-5xl">🥅</div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-20 text-center relative">
            <div className="text-5xl mb-4">🏆</div>
            <h1 className="text-5xl font-bold mb-3 text-blue-600">
              AllSports
            </h1>
            <p className="text-2xl font-semibold mb-3 text-gray-900">
              지역을 대표하고 전국을 제패하라
            </p>
            <p className="text-lg mb-4 text-gray-600">
              랭킹과 기록이 만들어가는<br />나와 팀의 성장스토리
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <div className="text-3xl mb-3">⚡</div>
              <p className="text-xl font-semibold mb-2 text-gray-900">전국 아마추어 스포츠의 새로운 시작</p>
              <p className="text-gray-600 mb-3">
                지역별 팀 매칭부터 전국 랭킹까지! 현재 베타 버전에서는 축구와 풋살을 지원하며, 정식 서비스 출시 시 다양한 스포츠 종목이 추가될 예정입니다.
              </p>
              <p className="text-lg font-medium text-blue-600">
                🎯 팀을 만들고, 경기를 하고, 랭킹을 올려보세요!
              </p>
              <div className="mt-3 text-xs text-gray-600">
                <span className="bg-yellow-400/20 px-2 py-1 rounded">BETA</span>
                <span className="ml-2">⚽ 축구 · 풋살 지원</span>
              </div>
            </div>

            <div className="space-x-4 mb-6">
              <Link
                href="/register"
                className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
              >
                🚀 전국 제패 시작하기
              </Link>
              <Link
                href="/login"
                className="inline-block border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 hover:text-white transition-all hover:scale-105"
              >
                로그인
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
              <div>
                <div className="text-2xl mb-2">🏆</div>
                <p className="text-sm font-semibold text-gray-900">전국을 향한 도전</p>
                <p className="text-xs text-gray-600">지역을 대표하는 팀이 되어<br />전국 랭킹의 정상에 오르세요</p>
              </div>
              <div>
                <div className="text-2xl mb-2">⚽</div>
                <p className="text-sm font-semibold text-gray-900">팀 매칭</p>
                <p className="text-xs text-gray-600">지역부터 전국까지<br />어디든 매칭하여 경기하세요</p>
              </div>
              <div>
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm font-semibold text-gray-900">성장 기록</p>
                <p className="text-xs text-gray-600">모든 경기를 기록으로 남겨<br />팀의 성장 스토리를 만드세요</p>
              </div>
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

            {/* 기능 소개 섹션 */}
            {!user && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-center mb-8">
                  AllSports의 핵심 기능
                </h2>
                <p className="text-center text-gray-600 mb-8">
                  지역부터 전국까지, 팀의 성장을 지원합니다
                </p>
              </div>
            )}

            {/* 빠른 메뉴 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href={user ? "/teams" : "/register"} className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
                <div className="font-medium text-gray-900">팀 만들기</div>
                <div className="text-sm text-gray-500 mt-1">지역을 대표하는 팀을 만들고 멤버를 모집하세요</div>
                {!user && <div className="text-xs text-blue-600 mt-2 font-medium">회원가입 →</div>}
              </Link>
              <Link href={user ? "/matches" : "/login"} className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📅</div>
                <div className="font-medium text-gray-900">전국 매칭</div>
                <div className="text-sm text-gray-500 mt-1">지역부터 전국까지 어디든 팀과 매칭하여 경기하세요</div>
                {!user && <div className="text-xs text-blue-600 mt-2 font-medium">로그인 →</div>}
              </Link>
              <Link href="/rankings" className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏆</div>
                <div className="font-medium text-gray-900">전국 랭킹</div>
                <div className="text-sm text-gray-500 mt-1">지역/전국 랭킹에서 팀의 실력을 확인하고 전국 제패에 도전하세요</div>
              </Link>
              <Link href={user ? "/profile" : "/register"} className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎯</div>
                <div className="font-medium text-gray-900">성장 기록</div>
                <div className="text-sm text-gray-500 mt-1">모든 경기와 승부를 기록으로 남겨 팀의 성장 스토리를 만들어가세요</div>
              </Link>
            </div>

            {/* CTA 섹션 */}
            {!user && (
              <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-10 text-center text-white">
                <h2 className="text-3xl font-bold mb-3">🏆 전국 제패의 꿈</h2>
                <h3 className="text-2xl font-semibold mb-4">지금 시작하세요!</h3>
                <p className="text-lg mb-6 text-blue-100">
                  지역을 대표하는 팀이 되어 전국 랭킹의 정상에 오르는<br />
                  나와 팀의 성장 스토리를 만들어보세요.
                </p>
                <Link
                  href="/register"
                  className="inline-block bg-yellow-400 text-blue-900 px-12 py-4 rounded-xl font-bold text-xl hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg"
                >
                  🚀 전국 제패 시작하기
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}