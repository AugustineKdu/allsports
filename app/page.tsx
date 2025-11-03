'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const [myTeams, setMyTeams] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 사용자가 로그인한 경우 개인 데이터 로드
      if (user) {
        const token = localStorage.getItem('token');
        const currentSport = user.currentSport;

        // 랭킹 데이터 로드 (user의 도시 기반)
        const rankingsResponse = await fetch(`/api/rankings?sport=${currentSport}&scope=city&city=${user.city}`);
        if (rankingsResponse.ok) {
          const rankingsData = await rankingsResponse.json();
          setRankings(rankingsData.slice(0, 5)); // TOP 5만 표시
        }

        // 내 팀 데이터 로드
        const teamsResponse = await fetch(`/api/teams?sport=${currentSport}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          // 사용자가 멤버로 속한 팀들만 필터링
          const userTeams = teamsData.filter((team: any) =>
            team.members.some((member: any) => member.user.id === user.id)
          );
          setMyTeams(userTeams.slice(0, 3));
        }

        // 예정된 경기 데이터 로드 (내 팀이 참여한 경기만)
        const matchesResponse = await fetch(`/api/matches?sport=${currentSport}`);
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          // 내 팀이 참여한 경기만 필터링 (제안됨 or 확정됨)
          const myMatches = matchesData.filter((match: any) =>
            (match.status === 'proposed' || match.status === 'confirmed') &&
            (match.homeTeam.owner?.id === user.id ||
             match.awayTeam.owner?.id === user.id ||
             match.creator.id === user.id)
          );
          setUpcomingMatches(myMatches.slice(0, 3));
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
          <div className="max-w-7xl mx-auto px-4 py-20 text-center relative">
            <div className="text-5xl mb-4">🏆</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-blue-600 break-keep">
              AllSports
            </h1>
            <p className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 break-keep">
              전국을 향한 도전
            </p>
            <p className="text-base md:text-lg mb-4 text-gray-600 break-keep">
              지역을 대표하는 팀이 되어<br />전국 랭킹의 정상에 오르세요
            </p>

            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-xl p-6 mb-8 max-w-2xl mx-auto shadow-lg">
              <div className="text-3xl mb-3">⚡</div>
              <p className="text-lg md:text-xl font-semibold mb-2 text-white break-keep">전국 아마추어 스포츠의 새로운 시작</p>
              <p className="text-sm md:text-base text-blue-100 mb-3 break-keep">
                지역별 팀 매칭부터 전국 랭킹까지! 현재 베타 버전에서는 축구와 풋살을 지원하며, 정식 서비스 출시 시 다양한 스포츠 종목이 추가될 예정입니다.
              </p>
              <p className="text-base md:text-lg font-medium text-yellow-300 break-keep">
                🎯 팀을 만들고, 경기를 하고, 랭킹을 올려보세요!
              </p>
              <div className="mt-3 text-xs text-blue-200 break-keep">
                <span className="bg-yellow-400/20 px-2 py-1 rounded">BETA</span>
                <span className="ml-2">⚽ 축구 · 풋살 지원</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 justify-center mb-6">
              <Link
                href="/register"
                className="inline-block bg-blue-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg whitespace-nowrap"
              >
                🚀 전국 제패 시작하기
              </Link>
              <Link
                href="/login"
                className="inline-block border-2 border-blue-600 text-blue-600 px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-blue-600 hover:text-white transition-all hover:scale-105 whitespace-nowrap"
              >
                로그인
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto text-center">
              <div>
                <div className="text-2xl mb-2">🏆</div>
                <p className="text-xs md:text-sm font-semibold text-gray-900 break-keep">전국을 향한 도전</p>
                <p className="text-xs text-gray-600 break-keep">지역을 대표하는 팀이 되어<br />전국 랭킹의 정상에 오르세요</p>
              </div>
              <div>
                <div className="text-2xl mb-2">⚽</div>
                <p className="text-xs md:text-sm font-semibold text-gray-900 break-keep">팀 매칭</p>
                <p className="text-xs text-gray-600 break-keep">지역부터 전국까지<br />어디든 매칭하여 경기하세요</p>
              </div>
              <div>
                <div className="text-2xl mb-2">📊</div>
                <p className="text-xs md:text-sm font-semibold text-gray-900 break-keep">성장 기록</p>
                <p className="text-xs text-gray-600 break-keep">모든 경기를 기록으로 남겨<br />팀의 성장 스토리를 만드세요</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 사용자별 대시보드 */}
            {user && (
              <>
                {/* AllSports 소개 */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-xl p-6 mb-8 text-white shadow-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🏆</div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 break-keep">
                      AllSports와 함께하는 전국 제패의 여정
                    </h2>
                    <p className="text-base md:text-lg text-blue-100 mb-4 break-keep">
                      지역을 대표하는 팀이 되어 전국 랭킹의 정상을 향해 도전하세요.<br />
                      모든 경기를 기록으로 남기고, 팀의 성장 스토리를 만들어갑니다.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
                      <div className="bg-white/10 px-4 py-2 rounded-lg">
                        <span className="font-semibold">⚽</span> 지역별 팀 매칭
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-lg">
                        <span className="font-semibold">📊</span> 실시간 랭킹 업데이트
                      </div>
                      <div className="bg-white/10 px-4 py-2 rounded-lg">
                        <span className="font-semibold">🎯</span> 성장 기록 관리
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* 내 팀 정보 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">내 팀</h2>
                  {myTeams.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {myTeams.map((team: any) => (
                          <Link
                            key={team.id}
                            href={`/teams/${team.id}`}
                            className="block border-l-4 border-blue-500 pl-3 hover:bg-gray-50 py-1 -ml-3 px-3 rounded-r transition-colors"
                          >
                            <p className="font-medium">{team.name}</p>
                            <p className="text-sm text-gray-600">{team.city} {team.district}</p>
                            <p className="text-sm text-gray-500">포인트: {team.points}</p>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/teams"
                        className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-3"
                      >
                        전체 팀 보기 →
                      </Link>
                    </>
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
                      {upcomingMatches.map((match: any) => {
                        const isAwaitingResponse = match.status === 'proposed' &&
                          match.creator.id !== user.id &&
                          (match.homeTeam.owner?.id === user.id || match.awayTeam.owner?.id === user.id);

                        return (
                          <Link
                            key={match.id}
                            href={`/matches/${match.id}`}
                            className="block border border-gray-200 rounded p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-sm">
                                {match.homeTeam.name} vs {match.awayTeam.name}
                              </p>
                              {isAwaitingResponse ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  ⚡ 응답 필요
                                </span>
                              ) : match.status === 'confirmed' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  ✅ 확정됨
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  ⏳ 대기 중
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">
                              📅 {new Date(match.matchDate).toLocaleDateString()}
                            </p>
                            {match.location && (
                              <p className="text-xs text-gray-500">📍 {match.location}</p>
                            )}
                          </Link>
                        );
                      })}
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
                  <Link
                    href="/matches"
                    className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-3"
                  >
                    전체 경기 보기 →
                  </Link>
                </div>

                {/* 지역 랭킹 TOP 5 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {user.city} TOP 5
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
              </>
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

            {/* Prism 포인트 소개 섹션 */}
            <div className="mb-12 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* 왼쪽: Prism 소개 */}
                <div className="p-8 md:p-10 text-white">
                  <div className="inline-block bg-yellow-400 text-purple-900 px-3 py-1 rounded-full text-xs font-bold mb-4">
                    NEW FEATURE
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 break-keep">
                    💎 Prism 포인트
                  </h2>
                  <p className="text-lg md:text-xl text-purple-100 mb-6 break-keep">
                    경기하고, 팀 활동하고, 포인트 받으세요!
                  </p>
                  <p className="text-base text-purple-100 mb-6 break-keep leading-relaxed">
                    AllSports와 함께하면 단순히 경기만 하는 것이 아닙니다.
                    팀을 만들고, 경기를 하고, 친구를 초대하는 모든 활동이
                    <span className="font-bold text-yellow-300"> Prism 포인트</span>로 적립됩니다.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3 text-purple-100">
                      <span className="text-xl">✨</span>
                      <span className="text-sm">경기장 예약 비용 할인</span>
                    </div>
                    <div className="flex items-center space-x-3 text-purple-100">
                      <span className="text-xl">⚽</span>
                      <span className="text-sm">스포츠 용품 구매 할인</span>
                    </div>
                    <div className="flex items-center space-x-3 text-purple-100">
                      <span className="text-xl">🎁</span>
                      <span className="text-sm">다양한 경품 및 혜택</span>
                    </div>
                  </div>
                  <Link
                    href={user ? "/missions" : "/prism"}
                    className="inline-block bg-yellow-400 text-purple-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg"
                  >
                    {user ? "내 미션 보기 →" : "자세히 알아보기 →"}
                  </Link>
                </div>

                {/* 오른쪽: 미션 예시 */}
                <div className="bg-white/10 backdrop-blur-sm p-8 md:p-10">
                  <h3 className="text-xl font-bold text-white mb-6">포인트 적립 방법</h3>
                  <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold text-sm">🎉 회원가입</span>
                        <span className="text-yellow-300 font-bold">+300P</span>
                      </div>
                      <p className="text-xs text-purple-100">첫 가입만 해도 포인트 지급!</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold text-sm">👥 팀 만들기/가입</span>
                        <span className="text-yellow-300 font-bold">+500P</span>
                      </div>
                      <p className="text-xs text-purple-100">팀을 만들거나 가입하면 보상</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold text-sm">⚽ 경기 등록</span>
                        <span className="text-yellow-300 font-bold">+1,000P</span>
                      </div>
                      <p className="text-xs text-purple-100">경기를 진행할 때마다 적립</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-semibold text-sm">✅ 매일 출석</span>
                        <span className="text-yellow-300 font-bold">+50P</span>
                      </div>
                      <p className="text-xs text-purple-100">로그인만 해도 매일 적립</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-xs text-purple-200 text-center break-keep">
                      💡 포인트는 경기장 예약, 용품 구매 등<br />다양한 곳에서 사용 가능합니다
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
              <Link href={user ? "/missions" : "/prism"} className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow p-6 text-center hover:shadow-lg transition-shadow group text-white">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💎</div>
                <div className="font-medium">Prism 포인트</div>
                <div className="text-sm text-purple-100 mt-1">미션 완료하고 포인트 받아서 다양한 혜택을 누리세요</div>
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

            {/* 베타 서비스 안내 */}
            <div className="mt-16 mb-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 border-2 border-yellow-300 rounded-2xl p-8 text-center shadow-lg">
              <div className="text-4xl mb-4">🚀</div>
              <div className="inline-block bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
                BETA SERVICE
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 break-keep">
                현재 베타 서비스 운영중입니다
              </h3>
              <p className="text-base md:text-lg text-gray-700 mb-6 break-keep">
                AllSports는 더 나은 서비스를 위해 여러분의 소중한 의견을 기다립니다.<br />
                불편사항, 개선사항, 추가 기능 제안 등 무엇이든 환영합니다!
              </p>

              <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-md">
                <h4 className="text-lg font-bold text-gray-900 mb-4">📞 문의 및 피드백</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <span className="text-xl">📧</span>
                    <span className="font-medium">담당자 이메일:</span>
                    <a
                      href="mailto:contact@allsports.com"
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                    >
                      contact@allsports.com
                    </a>
                  </div>
                  <div className="flex items-center justify-center space-x-3 text-gray-700">
                    <span className="text-xl">💬</span>
                    <span className="font-medium">카카오톡 오픈채팅:</span>
                    <a
                      href="https://open.kakao.com/o/YOUR_CHAT_LINK"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                    >
                      오픈채팅방 참여하기 →
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-6 break-keep">
                여러분의 피드백으로 AllSports가 성장합니다. 감사합니다! 🙏
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}