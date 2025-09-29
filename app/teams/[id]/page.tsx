'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

interface TeamMember {
  id: string;
  role: string;
  status: string;
  message?: string;
  requestedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    city: string;
    district: string;
    currentSport: string;
    contact?: string;
  };
}

interface Match {
  id: string;
  sport: string;
  matchDate: string;
  matchTime?: string;
  location?: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  isHome: boolean;
  homeTeam?: { id: string; name: string; };
  awayTeam?: { id: string; name: string; };
}

interface TeamDetail {
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
    email: string;
    city: string;
    district: string;
  };
  members: TeamMember[];
  recentMatches: Match[];
  _count: {
    members: number;
    joinRequests: number;
  };
}

export default function TeamDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinRequests, setJoinRequests] = useState<TeamMember[]>([]);
  const [showJoinRequests, setShowJoinRequests] = useState(false);

  // 사용자 역할 계산
  const isMyTeam = team?.members.some(member => member.user.id === user?.id);
  const myRole = team?.members.find(member => member.user.id === user?.id)?.role;

  useEffect(() => {
    if (id) {
      loadTeamDetail();
    }
  }, [id]);

  useEffect(() => {
    if (team && user && (myRole === 'owner' || myRole === 'admin')) {
      loadJoinRequests();
    }
  }, [team, user, myRole]);

  const loadTeamDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      } else {
        console.error('팀 정보 로드 실패');
      }
    } catch (error) {
      console.error('팀 정보 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/teams/${id}/join-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJoinRequests(data);
      }
    } catch (error) {
      console.error('가입 신청 조회 실패:', error);
    }
  };

  const handleJoinRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/teams/${id}/join-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        loadJoinRequests();
        loadTeamDetail(); // 팀 정보도 다시 로드
      } else {
        const errorData = await response.json();
        alert(errorData.error || '처리 실패');
      }
    } catch (error) {
      console.error('가입 신청 처리 실패:', error);
      alert('처리 중 오류가 발생했습니다');
    }
  };

  const handleJoinTeam = async () => {
    if (!user) {
      alert('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('인증 토큰이 없습니다. 다시 로그인해주세요.');
      router.push('/login');
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/teams/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: joinMessage })
      });

      const data = await response.json();

      if (response.ok) {
        alert('가입 요청이 전송되었습니다!');
        setShowJoinModal(false);
        setJoinMessage('');
        loadTeamDetail(); // 팀 정보 다시 로드
      } else {
        if (response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        } else {
          alert(data.error || '가입 요청 실패');
        }
      }
    } catch (error) {
      console.error('가입 요청 실패:', error);
      alert('가입 요청 중 오류가 발생했습니다');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">팀을 찾을 수 없습니다</h2>
          <Link href="/teams" className="text-blue-600 hover:text-blue-800">
            팀 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/teams" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← 팀 목록으로 돌아가기
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-gray-600 mt-2">{team.city} {team.district} • {team.sport}</p>
            </div>
            <div className="flex gap-2">
              {!isMyTeam && user && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  팀 가입 신청
                </button>
              )}
              {(myRole === 'owner' || myRole === 'admin') && (
                <button
                  onClick={() => setShowJoinRequests(!showJoinRequests)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors relative"
                >
                  가입 신청 관리
                  {joinRequests.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {joinRequests.length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 가입 신청 관리 섹션 */}
        {showJoinRequests && (myRole === 'owner' || myRole === 'admin') && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">가입 신청 관리</h2>
            {joinRequests.length === 0 ? (
              <p className="text-gray-500">대기 중인 가입 신청이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.user.username}</h3>
                          <p className="text-sm text-gray-500">{request.user.email}</p>
                          <p className="text-sm text-gray-500">
                            {request.user.city} {request.user.district} • {request.user.currentSport}
                          </p>
                          {request.user.contact && (
                            <p className="text-sm text-blue-600">📞 {request.user.contact}</p>
                          )}
                        </div>
                      </div>
                      {request.message && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">신청 메시지:</span> {request.message}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        신청일: {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinRequestAction(request.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleJoinRequestAction(request.id, 'reject')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 팀 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 팀 소개 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">팀 소개</h2>
              <p className="text-gray-700">{team.description || '팀 소개가 없습니다.'}</p>
            </div>

            {/* 팀 성과 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">팀 성과</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{team.points}</div>
                  <div className="text-sm text-gray-500">포인트</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{team.wins}</div>
                  <div className="text-sm text-gray-500">승리</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{team.draws}</div>
                  <div className="text-sm text-gray-500">무승부</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{team.losses}</div>
                  <div className="text-sm text-gray-500">패배</div>
                </div>
              </div>
            </div>

            {/* 최근 경기 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">최근 경기</h2>
              {team.recentMatches && team.recentMatches.length > 0 ? (
                <div className="space-y-3">
                  {team.recentMatches.map((match) => (
                    <div key={match.id} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {match.isHome
                              ? `${team.name} vs ${match.awayTeam?.name}`
                              : `${match.homeTeam?.name} vs ${team.name}`
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(match.matchDate).toLocaleDateString('ko-KR')}
                            {match.matchTime && ` ${match.matchTime}`}
                          </p>
                          {match.location && (
                            <p className="text-sm text-gray-500">{match.location}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {match.status === 'completed' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                            <div className="text-lg font-bold">
                              {match.homeScore} - {match.awayScore}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {match.status === 'proposed' && '제안됨'}
                              {match.status === 'confirmed' && '확정됨'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">최근 경기가 없습니다</p>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 팀장 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">팀장</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{team.owner.username.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{team.owner.username}</p>
                  <p className="text-sm text-gray-500">{team.owner.city} {team.owner.district}</p>
                </div>
              </div>
            </div>

            {/* 팀 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">팀 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">활동 지역</span>
                  <span>{team.city} {team.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">종목</span>
                  <span>{team.sport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">팀원 수</span>
                  <span>{team._count.members}/{team.maxMembers}명</span>
                </div>
                {team._count.joinRequests > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">가입 대기</span>
                    <span className="text-orange-600">{team._count.joinRequests}명</span>
                  </div>
                )}
              </div>
            </div>

            {/* 팀원 목록 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">팀원 ({team.members.length}명)</h3>
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">{member.user.username.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{member.user.username}</span>
                          <span className="text-xs text-gray-500">
                            {member.role === 'owner' && '팀장'}
                            {member.role === 'captain' && '주장'}
                            {member.role === 'member' && '멤버'}
                          </span>
                        </div>
                        {(myRole === 'owner' || myRole === 'admin') && member.user.contact && (
                          <div className="text-xs text-blue-600 mt-1">
                            📞 {member.user.contact}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          {member.user.city} {member.user.district} • {member.user.currentSport}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 가입 신청 모달 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">팀 가입 신청</h3>
            <p className="text-gray-600 mb-4">
              {team.name}에 가입하시겠습니까?
            </p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="가입 사유나 자기소개를 입력해주세요 (선택사항)"
              className="w-full p-3 border border-gray-300 rounded-md resize-none"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isJoining}
              >
                취소
              </button>
              <button
                onClick={handleJoinTeam}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isJoining}
              >
                {isJoining ? '신청 중...' : '가입 신청'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}