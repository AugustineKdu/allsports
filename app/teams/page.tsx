'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  sport: string;
  city: string;
  district: string;
  description: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  maxMembers: number;
  owner: {
    id: string;
    username: string;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      username: string;
    };
  }>;
  _count: {
    members: number;
  };
}

export default function TeamsPage() {
  const { user } = useAuth();
  const [districtTeams, setDistrictTeams] = useState<Team[]>([]);
  const [cityTeams, setCityTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'district' | 'city'>('district');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllTeams();
    }
  }, [user]);

  const loadAllTeams = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const sport = user.currentSport;
      const city = user.city;
      const district = user.district;

      // 1. 구/군 팀 로드
      const districtParams = new URLSearchParams({
        sport,
        city,
        district
      });
      const districtResponse = await fetch(`/api/teams?${districtParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 2. 시/도 팀 로드
      const cityParams = new URLSearchParams({
        sport,
        city
      });
      const cityResponse = await fetch(`/api/teams?${cityParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 내 팀 분리 함수
      const separateMyTeams = (teams: Team[]) => {
        const userTeams = teams.filter((team: Team) =>
          team.members.some(member => member.user.id === user.id)
        ).sort((a: Team, b: Team) => {
          const aIsOwner = a.owner.id === user.id;
          const bIsOwner = b.owner.id === user.id;
          if (aIsOwner && !bIsOwner) return -1;
          if (!aIsOwner && bIsOwner) return 1;
          return b.points - a.points;
        });

        const otherTeams = teams.filter((team: Team) =>
          !team.members.some(member => member.user.id === user.id)
        ).sort((a: Team, b: Team) => b.points - a.points);

        return { userTeams, otherTeams };
      };

      if (districtResponse.ok) {
        const teams = await districtResponse.json();
        const { userTeams, otherTeams } = separateMyTeams(teams);
        setMyTeams(userTeams);
        setDistrictTeams(otherTeams);
      }

      if (cityResponse.ok) {
        const teams = await cityResponse.json();
        const { otherTeams } = separateMyTeams(teams);
        // 사용자의 구/시를 우선으로 정렬 (같은 구/시 팀들을 먼저 보여줌)
        const sortedTeams = otherTeams.sort((a: Team, b: Team) => {
          const aIsUserDistrict = a.district === user.district;
          const bIsUserDistrict = b.district === user.district;

          // 같은 구/시 팀을 먼저
          if (aIsUserDistrict && !bIsUserDistrict) return -1;
          if (!aIsUserDistrict && bIsUserDistrict) return 1;

          // 같은 조건이면 포인트순
          return b.points - a.points;
        });
        setCityTeams(sortedTeams);
      }
    } catch (error) {
      console.error('팀 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getCurrentTeams = () => {
    let teams: Team[] = [];
    switch (activeTab) {
      case 'district':
        teams = districtTeams;
        break;
      case 'city':
        teams = cityTeams;
        break;
      default:
        teams = [];
    }

    // 검색어 필터링
    if (searchQuery.trim()) {
      return teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return teams;
  };

  const getCurrentTitle = () => {
    const currentTeams = getCurrentTeams();
    const baseCount = `${currentTeams.length}개`;

    if (searchQuery.trim()) {
      return `검색 결과 (${baseCount})`;
    }

    switch (activeTab) {
      case 'district':
        return `${user?.district || '우리 지역'} 팀들 (${baseCount})`;
      case 'city':
        return `${user?.city || '우리 지역'} 팀들 (${baseCount})`;
      default:
        return `팀들 (${baseCount})`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">팀 관리</h1>
              <p className="text-gray-600 mt-2">{user.currentSport} 팀 찾기</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  📍 {user.city} {user.district}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap self-start md:self-auto"
            >
              새 팀 만들기
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 내 팀 */}
            {myTeams.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">내 팀</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myTeams.map((team) => (
                    <TeamCard key={team.id} team={team} isMyTeam={true} user={user} />
                  ))}
                </div>
              </div>
            )}

            {/* 탭과 검색 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="border-b border-gray-200 flex-1">
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
                  </nav>
                </div>
              </div>

              {/* 검색바 */}
              <div className="max-w-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="팀 이름으로 검색..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        // 엔터키로도 검색 가능 (이미 실시간 검색 중)
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      // 실시간 검색이 이미 작동 중이므로 포커스만 이동
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      input?.focus();
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>검색</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 다른 팀들 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {getCurrentTitle()}
              </h2>
              {getCurrentTeams().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getCurrentTeams().map((team) => (
                    <TeamCard key={team.id} team={team} isMyTeam={false} user={user} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500 mb-4">해당 지역에 팀이 없습니다</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    첫 번째 팀을 만들어보세요!
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* 팀 생성 모달 */}
        {showCreateModal && (
          <CreateTeamModal
            user={user}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadAllTeams();
            }}
          />
        )}
      </div>
    </div>
  );
}

// 팀 카드 컴포넌트
function TeamCard({ team, isMyTeam, user }: { team: Team; isMyTeam: boolean; user: any }) {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRequest = async () => {
    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams/${team.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: `안녕하세요! ${team.name}에 가입하고 싶습니다.`
        })
      });

      if (response.ok) {
        alert('가입 요청을 보냈습니다!');
      } else {
        const error = await response.json();
        alert(error.error || '가입 요청에 실패했습니다');
      }
    } catch (error) {
      alert('가입 요청 중 오류가 발생했습니다');
    } finally {
      setIsJoining(false);
    }
  };

  const myRole = team.members.find(m => m.user.id === user?.id)?.role;
  const isOwner = team.owner.id === user?.id;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
              {isOwner && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  👑 오너
                </span>
              )}
              {isMyTeam && !isOwner && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  내 팀
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{team.city} {team.district}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-blue-600">{team.points}pt</div>
            <div className="text-xs text-gray-500">{team.wins}승 {team.draws}무 {team.losses}패</div>
          </div>
        </div>

        {team.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{team.description}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">{team.owner.username.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{team.owner.username}</p>
              <p className="text-xs text-gray-500">팀장</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {team._count.members}/{team.maxMembers}명
          </div>
        </div>


        <div className="flex justify-between items-center">
          <Link
            href={`/teams/${team.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            자세히 보기 →
          </Link>

          {isMyTeam ? (
            <div className="text-xs text-gray-500">
              {myRole === 'owner' && '팀장'}
              {myRole === 'captain' && '주장'}
              {myRole === 'member' && '멤버'}
            </div>
          ) : (
            <button
              onClick={handleJoinRequest}
              disabled={isJoining || team._count.members >= team.maxMembers}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
            >
              {isJoining ? '요청 중...' : '가입 요청'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 팀 생성 모달 컴포넌트
function CreateTeamModal({ user, onClose, onSuccess }: { user: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    sport: user?.currentSport || '축구',
    city: user?.city || '서울',
    district: user?.district || '',
    description: '',
    maxMembers: 20
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || '팀 생성에 실패했습니다');
      }
    } catch (error) {
      alert('팀 생성 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">새 팀 만들기</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">팀명 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="팀명을 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">스포츠</label>
              <input
                type="text"
                value={formData.sport}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
              <input
                type="number"
                min="5"
                max="50"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
              <input
                type="text"
                value={formData.city}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">구/시</label>
              <input
                type="text"
                value={formData.district}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">팀 소개</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="팀에 대한 간단한 소개를 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '생성 중...' : '팀 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}