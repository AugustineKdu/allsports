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
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('축구');
  const [selectedCity, setSelectedCity] = useState('서울');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [selectedSport, selectedCity, selectedDistrict, user]);

  const loadTeams = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        sport: selectedSport,
        city: selectedCity
      });

      if (selectedDistrict) {
        params.append('district', selectedDistrict);
      }

      const response = await fetch(`/api/teams?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const allTeams = await response.json();

        // 내 팀과 다른 팀 분리 및 정렬
        const userTeams = allTeams.filter((team: Team) =>
          team.members.some(member => member.user.id === user?.id)
        ).sort((a: Team, b: Team) => {
          // 오너인 팀을 맨 위에 표시
          const aIsOwner = a.owner.id === user?.id;
          const bIsOwner = b.owner.id === user?.id;

          if (aIsOwner && !bIsOwner) return -1;
          if (!aIsOwner && bIsOwner) return 1;

          // 같은 권한이면 포인트 순으로 정렬
          return b.points - a.points;
        });

        const otherTeams = allTeams.filter((team: Team) =>
          !team.members.some(member => member.user.id === user?.id)
        ).sort((a: Team, b: Team) => b.points - a.points);

        setMyTeams(userTeams);
        setTeams(otherTeams);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">팀 관리</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            새 팀 만들기
          </button>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                지역
              </label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedDistrict(''); // 지역 변경 시 구 초기화
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="서울">서울</option>
                <option value="경기도">경기도</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구/시
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                {selectedCity === '서울' && (
                  <>
                    <option value="강남구">강남구</option>
                    <option value="강동구">강동구</option>
                    <option value="강서구">강서구</option>
                    <option value="관악구">관악구</option>
                    <option value="송파구">송파구</option>
                    <option value="서초구">서초구</option>
                    <option value="마포구">마포구</option>
                    <option value="용산구">용산구</option>
                  </>
                )}
                {selectedCity === '경기도' && (
                  <>
                    <option value="수원시">수원시</option>
                    <option value="성남시">성남시</option>
                    <option value="고양시">고양시</option>
                    <option value="용인시">용인시</option>
                    <option value="부천시">부천시</option>
                    <option value="안양시">안양시</option>
                    <option value="안산시">안산시</option>
                    <option value="화성시">화성시</option>
                  </>
                )}
              </select>
            </div>
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

            {/* 다른 팀들 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedCity} {selectedSport} 팀들 ({teams.length}개)
              </h2>
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team) => (
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
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadTeams();
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
function CreateTeamModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    sport: '축구',
    city: '서울',
    district: '',
    description: '',
    maxMembers: 20
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const districts = {
    '서울': ['강남구', '강동구', '강서구', '관악구', '송파구', '서초구', '마포구', '용산구'],
    '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안양시', '안산시', '화성시']
  };

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
              <select
                value={formData.sport}
                onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="축구">축구</option>
                <option value="풋살">풋살</option>
              </select>
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
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value, district: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="서울">서울</option>
                <option value="경기도">경기도</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">구/시</label>
              <select
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">선택하세요</option>
                {districts[formData.city as keyof typeof districts]?.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
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