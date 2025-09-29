'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';

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
  const [rankings, setRankings] = useState<RankedTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('축구');
  const [selectedScope, setSelectedScope] = useState('national');
  const [selectedCity, setSelectedCity] = useState('서울');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const { user } = useAuth();

  const districts: Record<string, string[]> = {
    '서울': ['강남구', '강동구', '강서구', '관악구', '송파구', '서초구', '마포구', '용산구'],
    '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안양시', '안산시', '화성시']
  };

  useEffect(() => {
    loadRankings();
  }, [selectedSport, selectedScope, selectedCity, selectedDistrict]);

  const loadRankings = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        sport: selectedSport,
        scope: selectedScope
      });

      if (selectedScope === 'city' && selectedCity) {
        params.append('city', selectedCity);
      }
      if (selectedScope === 'district' && selectedCity && selectedDistrict) {
        params.append('city', selectedCity);
        params.append('district', selectedDistrict);
      }

      const response = await fetch(`/api/rankings?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      }
    } catch (error) {
      console.error('랭킹 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScopeTitle = () => {
    switch (selectedScope) {
      case 'national': return `전국 ${selectedSport} 랭킹`;
      case 'city': return `${selectedCity} ${selectedSport} 랭킹`;
      case 'district': return `${selectedCity} ${selectedDistrict} ${selectedSport} 랭킹`;
      default: return '랭킹';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">랭킹</h1>
          <p className="text-gray-600">팀들의 성과를 확인해보세요</p>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                범위
              </label>
              <select
                value={selectedScope}
                onChange={(e) => {
                  setSelectedScope(e.target.value);
                  setSelectedDistrict('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="national">전국</option>
                <option value="city">시/도</option>
                <option value="district">구/군</option>
              </select>
            </div>

            {(selectedScope === 'city' || selectedScope === 'district') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지역
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedDistrict('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="서울">서울</option>
                  <option value="경기도">경기도</option>
                </select>
              </div>
            )}

            {selectedScope === 'district' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구/시
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {districts[selectedCity]?.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 랭킹 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{getScopeTitle()}</h2>
            <p className="text-sm text-gray-500 mt-1">총 {rankings.length}개 팀</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : rankings.length > 0 ? (
            <div className="overflow-x-auto">
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
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">랭킹 데이터가 없습니다</h3>
              <p className="text-gray-500">아직 해당 지역에 팀이 없거나 경기가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 랭킹 설명 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">랭킹 시스템 안내</h3>
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
      </div>
    </div>
  );
}