'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

interface RankedTeam {
  id: string;
  name: string;
  sport: string;
  city: string;
  district: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  rank: number;
  _count: {
    members: number;
  };
}

export default function RankingsPage() {
  const { user } = useAuth();
  const [districtRankings, setDistrictRankings] = useState<RankedTeam[]>([]);
  const [cityRankings, setCityRankings] = useState<RankedTeam[]>([]);
  const [nationalRankings, setNationalRankings] = useState<RankedTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'district' | 'city' | 'national'>('district');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllRankings();
    }
  }, [user]);

  const loadAllRankings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const sport = user.currentSport;
      const city = user.city;
      const district = user.district;

      // 1. 구/군 랭킹
      const districtParams = new URLSearchParams({
        sport,
        scope: 'district',
        city,
        district
      });
      const districtResponse = await fetch(`/api/rankings?${districtParams}`);
      if (districtResponse.ok) {
        const districtData = await districtResponse.json();
        setDistrictRankings(districtData);
      }

      // 2. 시/도 랭킹
      const cityParams = new URLSearchParams({
        sport,
        scope: 'city',
        city
      });
      const cityResponse = await fetch(`/api/rankings?${cityParams}`);
      if (cityResponse.ok) {
        const cityData = await cityResponse.json();
        setCityRankings(cityData);
      }

      // 3. 전국 랭킹
      const nationalParams = new URLSearchParams({
        sport,
        scope: 'national'
      });
      const nationalResponse = await fetch(`/api/rankings?${nationalParams}`);
      if (nationalResponse.ok) {
        const nationalData = await nationalResponse.json();
        setNationalRankings(nationalData);
      }
    } catch (error) {
      console.error('랭킹 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-white border-gray-200';
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

  const getCurrentRankings = () => {
    let rankings: RankedTeam[] = [];
    switch (activeTab) {
      case 'district':
        rankings = districtRankings;
        break;
      case 'city':
        rankings = cityRankings;
        break;
      case 'national':
        rankings = nationalRankings;
        break;
      default:
        rankings = [];
    }
    // 최대 20위까지만 표시
    return rankings.slice(0, 20);
  };

  const getCurrentTitle = () => {
    switch (activeTab) {
      case 'district':
        return `${user.district} 랭킹`;
      case 'city':
        return `${user.city} 랭킹`;
      case 'national':
        return '전국 랭킹';
      default:
        return '랭킹';
    }
  };

  const getCurrentEmptyMessage = () => {
    switch (activeTab) {
      case 'district':
        return `${user.district}에 아직 팀이 없습니다`;
      case 'city':
        return `${user.city}에 아직 팀이 없습니다`;
      case 'national':
        return '전국에 아직 팀이 없습니다';
      default:
        return '팀이 없습니다';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="text-5xl">🏆</div>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-blue-600">
                VS
              </div>
              <div className="text-5xl">🔥</div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 break-keep">
              지역을 넘어 전국 정상으로
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-semibold mb-4 break-keep">
              {user.district} → {user.city} → 대한민국
            </p>
            <p className="text-sm text-gray-500 font-medium">
              💪 경기마다 포인트를 쌓아 랭킹을 올리고, 지역 대표 팀이 되어 전국을 제패하세요!
            </p>
          </div>
        </div>

        {/* 탭 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('district')}
                className={`${
                  activeTab === 'district'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {user.district}
              </button>
              <button
                onClick={() => setActiveTab('city')}
                className={`${
                  activeTab === 'city'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                {user.city}
              </button>
              <button
                onClick={() => setActiveTab('national')}
                className={`${
                  activeTab === 'national'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                전국
              </button>
            </nav>
          </div>
        </div>

        {/* 랭킹 시스템 안내 */}
        <div className="mb-8 bg-blue-50 rounded-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-blue-900">랭킹 시스템 안내</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {showDetails ? '접기 ▲' : '자세히 보기 ▼'}
            </button>
          </div>

          {/* 간단 안내 */}
          <div className="text-sm text-blue-800">
            <p className="font-medium">승리 +3pt · 무승부 +1pt · 패배 0pt</p>
            <p className="mt-1">순위: 포인트 → 승률 순 (최대 20위까지 표시)</p>
          </div>

          {/* 자세한 내용 */}
          {showDetails && (
            <div className="mt-6 pt-6 border-t border-blue-200">
              {/* 포인트 획득 */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">포인트 획득 방법</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                  <div>
                    <div className="font-medium mb-1">승리: +3 포인트</div>
                    <div>경기에서 승리할 때마다 3포인트를 획득합니다.</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">무승부: +1 포인트</div>
                    <div>경기가 무승부로 끝날 때 1포인트를 획득합니다.</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">패배: 0 포인트</div>
                    <div>경기에서 패배하면 포인트를 획득하지 않습니다.</div>
                  </div>
                </div>
              </div>

              {/* 순위 산정 */}
              <div className="border-t border-blue-200 pt-4">
                <h4 className="font-semibold text-blue-900 mb-3">순위 산정 방법</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <div className="flex items-start">
                    <span className="font-medium mr-2">1순위:</span>
                    <span>포인트가 높은 팀이 상위 랭킹에 위치합니다.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">2순위:</span>
                    <span>포인트가 같은 경우, 승률(승리 ÷ 총 경기 수)이 높은 팀이 상위에 위치합니다.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">※</span>
                    <span>랭킹은 최대 20위까지 표시됩니다.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <RankingSection
            title={getCurrentTitle()}
            rankings={getCurrentRankings()}
            getRankBadge={getRankBadge}
            getRankColor={getRankColor}
            emptyMessage={getCurrentEmptyMessage()}
          />
        )}
      </div>
    </div>
  );
}

// 랭킹 섹션 컴포넌트
function RankingSection({
  title,
  rankings,
  getRankBadge,
  getRankColor,
  emptyMessage
}: {
  title: string;
  rankings: RankedTeam[];
  getRankBadge: (rank: number) => string | number;
  getRankColor: (rank: number) => string;
  emptyMessage: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">총 {rankings.length}개 팀</p>
      </div>

      {rankings.length > 0 ? (
        <>
          {/* 모바일: 카드 형식 */}
          <div className="md:hidden">
            {rankings.map((team) => (
              <div
                key={team.id}
                className={`p-4 border-b border-gray-100 ${getRankColor(team.rank)} border-l-4`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getRankBadge(team.rank)}</span>
                    {typeof getRankBadge(team.rank) === 'number' && (
                      <span className="text-xl font-bold text-gray-900">#{team.rank}</span>
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{team.name}</div>
                      <div className="text-xs text-gray-500">{team.city} {team.district}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{team.points}</div>
                    <div className="text-xs text-gray-500">포인트</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-green-600 font-medium">{team.wins}승</span>
                    {' '}
                    <span className="text-gray-600">{team.draws}무</span>
                    {' '}
                    <span className="text-red-600">{team.losses}패</span>
                    <span className="text-gray-500 ml-2">({team.wins + team.draws + team.losses}경기)</span>
                  </div>
                  <div className="text-gray-600">{team._count.members}명</div>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크톱: 테이블 형식 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    순위
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    팀명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    지역
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    포인트
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    경기 기록
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    인원
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.map((team) => (
                  <tr
                    key={team.id}
                    className={`hover:bg-gray-50 ${getRankColor(team.rank)} border-l-4`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getRankBadge(team.rank)}</span>
                        {typeof getRankBadge(team.rank) === 'number' && (
                          <span className="text-lg font-bold text-gray-900">#{team.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team.city}</div>
                      <div className="text-sm text-gray-500">{team.district}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-blue-600">{team.points}</div>
                      <div className="text-xs text-gray-500">포인트</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="text-green-600 font-medium">{team.wins}승</span>
                        {' '}
                        <span className="text-gray-600">{team.draws}무</span>
                        {' '}
                        <span className="text-red-600">{team.losses}패</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        총 {team.wins + team.draws + team.losses}경기
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{team._count.members}명</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}