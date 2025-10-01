'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  sport: string;
  city: string;
  district: string;
  owner?: {
    id: string;
    username: string;
  };
}

export default function CreateMatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [awayTeams, setAwayTeams] = useState<Team[]>([]);
  const [awayTeamSearchQuery, setAwayTeamSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    sport: '',
    homeTeamId: '',
    awayTeamId: '',
    matchDate: '',
    matchTime: '',
    location: '',
    contactInfo: '',
    message: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // user의 currentSport로 초기화
    setFormData(prev => ({ ...prev, sport: user.currentSport }));
    loadMyTeams();
    loadAwayTeams();
  }, [user]);

  const loadMyTeams = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams?sport=${user.currentSport}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const teams = await response.json();
        // 내가 오너인 팀만 필터링
        const ownerTeams = teams.filter((team: Team) => team.owner?.id === user.id);
        setMyTeams(ownerTeams);
      }
    } catch (error) {
      console.error('내 팀 목록 로드 실패:', error);
    }
  };

  const loadAwayTeams = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      // 전국 모든 팀 로드
      const response = await fetch(`/api/teams?sport=${user.currentSport}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const teams = await response.json();
        setAwayTeams(teams);
      }
    } catch (error) {
      console.error('팀 목록 로드 실패:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.homeTeamId || !formData.awayTeamId) {
      alert('홈팀과 원정팀을 모두 선택해주세요');
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      alert('같은 팀끼리는 경기를 만들 수 없습니다');
      return;
    }

    if (!formData.matchDate) {
      alert('경기 날짜를 선택해주세요');
      return;
    }

    // 과거 날짜 체크
    const selectedDate = new Date(formData.matchDate + (formData.matchTime ? `T${formData.matchTime}` : ''));
    if (selectedDate < new Date()) {
      alert('과거 날짜로는 경기를 만들 수 없습니다');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sport: formData.sport,
          homeTeamId: formData.homeTeamId,
          awayTeamId: formData.awayTeamId,
          matchDate: formData.matchDate,
          matchTime: formData.matchTime || undefined,
          location: formData.location || undefined,
          contactInfo: formData.contactInfo || undefined,
          message: formData.message || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('경기가 성공적으로 생성되었습니다!');
        router.push(`/matches/${data.id}`);
      } else {
        alert(data.error || '경기 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('경기 생성 실패:', error);
      alert('경기 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamDisplayName = (team: Team) => {
    return `${team.name} (${team.city} ${team.district})`;
  };

  // 원정팀 검색 필터링
  const getFilteredAwayTeams = () => {
    let filtered = awayTeams.filter(team => team.id !== formData.homeTeamId);

    if (awayTeamSearchQuery.trim()) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(awayTeamSearchQuery.toLowerCase()) ||
        team.city.toLowerCase().includes(awayTeamSearchQuery.toLowerCase()) ||
        team.district.toLowerCase().includes(awayTeamSearchQuery.toLowerCase())
      );
    }

    return filtered;
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← 시합 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">새 시합 만들기</h1>
          <p className="text-gray-600 mt-2">두 팀 간의 경기를 제안해보세요!</p>
        </div>

        {/* 경기 생성 폼 */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 스포츠 선택 (고정) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종목
              </label>
              <input
                type="text"
                value={formData.sport || user.currentSport}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">회원님의 선호 종목으로 고정됩니다</p>
            </div>

            {/* 팀 선택 */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  홈팀 (내 팀) *
                </label>
                <select
                  value={formData.homeTeamId}
                  onChange={(e) => setFormData(prev => ({ ...prev, homeTeamId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">내 팀을 선택하세요</option>
                  {myTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {getTeamDisplayName(team)}
                    </option>
                  ))}
                </select>
                {myTeams.length === 0 && (
                  <p className="mt-1 text-xs text-red-500">
                    소유한 팀이 없습니다. <Link href="/teams" className="text-blue-600 hover:underline">팀을 만들어보세요</Link>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  원정팀 *
                </label>
                {/* 검색 input */}
                <input
                  type="text"
                  value={awayTeamSearchQuery}
                  onChange={(e) => setAwayTeamSearchQuery(e.target.value)}
                  placeholder="팀 이름 또는 지역으로 검색..."
                  className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={formData.awayTeamId}
                  onChange={(e) => setFormData(prev => ({ ...prev, awayTeamId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  size={5}
                >
                  <option value="">원정팀을 선택하세요</option>
                  {getFilteredAwayTeams().map((team) => (
                    <option key={team.id} value={team.id}>
                      {getTeamDisplayName(team)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {getFilteredAwayTeams().length}개의 팀 검색됨
                </p>
              </div>
            </div>

            {/* 경기 일시 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  경기 날짜 *
                </label>
                <input
                  type="date"
                  value={formData.matchDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, matchDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  경기 시간 (선택사항)
                </label>
                <input
                  type="time"
                  value={formData.matchTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, matchTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 경기 장소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                경기 장소 (선택사항)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="경기가 열릴 장소를 입력하세요"
              />
            </div>

            {/* 연락처 정보 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처 (선택사항)
              </label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="상대팀과 연락할 수 있는 전화번호 또는 카카오톡 ID"
              />
            </div>

            {/* 메시지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상대팀에게 전할 메시지 (선택사항)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="경기 제안과 함께 전달할 메시지를 입력하세요"
              />
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">경기 생성 안내</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>경기를 생성하면 상대팀에게 제안이 전달됩니다</li>
                    <li>상대팀이 수락하면 경기가 확정됩니다</li>
                    <li>확정된 경기에만 결과를 입력할 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/matches"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? '생성 중...' : '경기 생성'}
              </button>
            </div>
          </form>
        </div>

        {/* 추가 팁 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">💡 유용한 팁</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>경기 장소는 구체적으로 적어주세요 (예: "강남구민체육센터 풋살장 A")</li>
                <li>시간을 정확히 명시하면 참가자들이 준비하기 좋습니다</li>
                <li>상대팀과 미리 연락하여 일정을 조율하는 것을 권장합니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}