'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Match {
  id: string;
  sport: string;
  matchDate: string;
  location: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  createdAt: string;
  homeTeam: {
    id: string;
    name: string;
    city: string;
    district: string;
  };
  awayTeam: {
    id: string;
    name: string;
    city: string;
    district: string;
  };
  creator: {
    id: string;
    username: string;
    email: string;
  };
}

export default function AdminMatchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editHomeScore, setEditHomeScore] = useState<number>(0);
  const [editAwayScore, setEditAwayScore] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isAdmin) {
      router.push('/');
      return;
    }
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (sportFilter) params.append('sport', sportFilter);
      if (cityFilter) params.append('city', cityFilter);

      const response = await fetch(`/api/admin/matches?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('경기 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMatch = async (matchId: string, homeTeam: string, awayTeam: string) => {
    if (!confirm(`정말로 "${homeTeam} vs ${awayTeam}" 경기를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('경기가 성공적으로 삭제되었습니다');
        loadMatches();
      } else {
        const error = await response.json();
        alert(error.error || '경기 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('경기 삭제 실패:', error);
      alert('경기 삭제 중 오류가 발생했습니다');
    }
  };

  const startEditScore = (match: Match) => {
    setEditingMatch(match.id);
    setEditHomeScore(match.homeScore || 0);
    setEditAwayScore(match.awayScore || 0);
  };

  const saveScore = async (matchId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeScore: editHomeScore,
          awayScore: editAwayScore,
          status: 'completed'
        })
      });

      if (response.ok) {
        alert('경기 결과가 수정되었습니다');
        setEditingMatch(null);
        loadMatches();
      } else {
        const error = await response.json();
        alert(error.error || '경기 결과 수정에 실패했습니다');
      }
    } catch (error) {
      console.error('경기 결과 수정 실패:', error);
      alert('경기 결과 수정 중 오류가 발생했습니다');
    }
  };

  const updateStatus = async (matchId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/matches/${matchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('경기 상태가 변경되었습니다');
        loadMatches();
      } else {
        const error = await response.json();
        alert(error.error || '경기 상태 변경에 실패했습니다');
      }
    } catch (error) {
      console.error('경기 상태 변경 실패:', error);
      alert('경기 상태 변경 중 오류가 발생했습니다');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'proposed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">제안됨</span>;
      case 'confirmed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">확정됨</span>;
      case 'completed':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">완료됨</span>;
      case 'cancelled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">취소됨</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // 고유한 종목 목록
  const uniqueSports = Array.from(new Set(matches.map(m => m.sport)));
  // 고유한 도시 목록 (홈팀과 원정팀 모두에서)
  const uniqueCities = Array.from(new Set([
    ...matches.map(m => m.homeTeam.city),
    ...matches.map(m => m.awayTeam.city)
  ]));

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
          <h1 className="text-3xl font-bold text-gray-900">🏆 경기 관리</h1>
          <p className="text-gray-600 mt-2">경기 정보 조회 및 관리</p>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">모든 상태</option>
              <option value="proposed">제안됨</option>
              <option value="confirmed">확정됨</option>
              <option value="completed">완료됨</option>
              <option value="cancelled">취소됨</option>
            </select>
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
            onClick={loadMatches}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            검색
          </button>
        </div>

        {/* 경기 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                전체 경기 ({matches.length}개)
              </h2>
            </div>

            {/* 데스크톱 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      경기 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      홈팀
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결과
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      원정팀
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성자
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map((match) => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(match.matchDate).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="text-sm text-gray-500">{match.location}</div>
                          <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {match.sport}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{match.homeTeam.name}</div>
                        <div className="text-sm text-gray-500">{match.homeTeam.city} {match.homeTeam.district}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editingMatch === match.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              value={editHomeScore}
                              onChange={(e) => setEditHomeScore(parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              min="0"
                            />
                            <span>:</span>
                            <input
                              type="number"
                              value={editAwayScore}
                              onChange={(e) => setEditAwayScore(parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                              min="0"
                            />
                            <button
                              onClick={() => saveScore(match.id)}
                              className="ml-2 text-green-600 hover:text-green-900"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingMatch(null)}
                              className="text-red-600 hover:text-red-900"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm font-semibold text-gray-900">
                            {match.homeScore !== null && match.awayScore !== null ? (
                              <span>{match.homeScore} : {match.awayScore}</span>
                            ) : (
                              <span className="text-gray-400">- : -</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{match.awayTeam.name}</div>
                        <div className="text-sm text-gray-500">{match.awayTeam.city} {match.awayTeam.district}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(match.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{match.creator.username}</div>
                        <div className="text-sm text-gray-500">{match.creator.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex flex-col gap-1">
                          {match.status === 'completed' && editingMatch !== match.id && (
                            <button
                              onClick={() => startEditScore(match)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              결과 수정
                            </button>
                          )}
                          {match.status !== 'completed' && match.status !== 'cancelled' && (
                            <button
                              onClick={() => updateStatus(match.id, match.status === 'proposed' ? 'confirmed' : 'completed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              {match.status === 'proposed' ? '확정하기' : '완료하기'}
                            </button>
                          )}
                          <button
                            onClick={() => deleteMatch(match.id, match.homeTeam.name, match.awayTeam.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden">
              {matches.map((match) => (
                <div key={match.id} className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(match.matchDate).toLocaleDateString('ko-KR')}
                      </div>
                      <div className="text-xs text-gray-500">{match.location}</div>
                    </div>
                    {getStatusBadge(match.status)}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{match.homeTeam.name}</div>
                        <div className="text-xs text-gray-500">{match.homeTeam.city}</div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {match.homeScore !== null ? match.homeScore : '-'}
                      </div>
                    </div>
                    <div className="text-center text-gray-400 my-2">vs</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{match.awayTeam.name}</div>
                        <div className="text-xs text-gray-500">{match.awayTeam.city}</div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {match.awayScore !== null ? match.awayScore : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    생성자: {match.creator.username}
                  </div>
                  <div className="flex gap-2">
                    {match.status === 'completed' && (
                      <button
                        onClick={() => startEditScore(match)}
                        className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        결과 수정
                      </button>
                    )}
                    {match.status !== 'completed' && match.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(match.id, match.status === 'proposed' ? 'confirmed' : 'completed')}
                        className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        {match.status === 'proposed' ? '확정' : '완료'}
                      </button>
                    )}
                    <button
                      onClick={() => deleteMatch(match.id, match.homeTeam.name, match.awayTeam.name)}
                      className="flex-1 py-2 px-4 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
