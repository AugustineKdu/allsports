'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Team {
  id: string;
  name: string;
  sport: string;
  city: string;
  district: string;
  description: string;
  maxMembers: number;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: string;
  owner: {
    id: string;
    username: string;
    email: string;
  };
  _count: {
    members: number;
  };
}

export default function AdminTeamsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isAdmin) {
      router.push('/');
      return;
    }
    loadTeams();
  }, [user]);

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (sportFilter) params.append('sport', sportFilter);
      if (cityFilter) params.append('city', cityFilter);

      const response = await fetch(`/api/admin/teams?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('팀 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`정말로 "${teamName}" 팀을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 팀의 모든 멤버십과 경기 기록이 함께 삭제됩니다.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('팀이 성공적으로 삭제되었습니다');
        loadTeams();
      } else {
        const error = await response.json();
        alert(error.error || '팀 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('팀 삭제 실패:', error);
      alert('팀 삭제 중 오류가 발생했습니다');
    }
  };

  // 고유한 종목 목록
  const uniqueSports = Array.from(new Set(teams.map(t => t.sport)));
  // 고유한 도시 목록
  const uniqueCities = Array.from(new Set(teams.map(t => t.city)));

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← 관리자 대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">⚽ 팀 관리</h1>
          <p className="text-gray-600 mt-2">팀 정보 조회 및 관리</p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadTeams()}
              placeholder="팀 이름 또는 설명으로 검색..."
              className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 종목</option>
              {uniqueSports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 지역</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <button
            onClick={loadTeams}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            검색
          </button>
        </div>

        {/* 팀 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                전체 팀 ({teams.length}개)
              </h2>
            </div>

            {/* 데스크톱 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      팀 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      지역
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      오너
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      멤버/최대
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전적
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      포인트
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성일
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {team.sport}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{team.city}</div>
                        <div className="text-sm text-gray-500">{team.district}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{team.owner.username}</div>
                        <div className="text-sm text-gray-500">{team.owner.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team._count.members} / {team.maxMembers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.wins}승 {team.draws}무 {team.losses}패
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {team.points}P
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => deleteTeam(team.id, team.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden">
              {teams.map((team) => (
                <div key={team.id} className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{team.name}</div>
                      <span className="mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {team.sport}
                      </span>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {team.points}P
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">지역: </span>
                      <span className="text-gray-900">{team.city} {team.district}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">오너: </span>
                      <span className="text-gray-900">{team.owner.username}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">멤버: </span>
                      <span className="text-gray-900">{team._count.members}/{team.maxMembers}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">전적: </span>
                      <span className="text-gray-900">{team.wins}승 {team.draws}무 {team.losses}패</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">생성일: </span>
                      <span className="text-gray-900">
                        {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTeam(team.id, team.name)}
                    className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    팀 삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
