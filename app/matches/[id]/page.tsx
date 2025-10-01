'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  city: string;
  district: string;
  contact?: string | null;
}

interface TeamOwner {
  id: string;
  username: string;
  contact?: string | null;
}

interface Team {
  id: string;
  name: string;
  city: string;
  district: string;
  sport: string;
  owner?: TeamOwner;
}

interface MatchDetail {
  id: string;
  sport: string;
  matchDate: string;
  matchTime?: string;
  location?: string;
  contactInfo?: string;
  message?: string;
  status: 'proposed' | 'confirmed' | 'completed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  homeTeam: Team;
  awayTeam: Team;
  creator: User;
  createdAt: string;
  updatedAt: string;
}

export default function MatchDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  useEffect(() => {
    if (id) {
      loadMatchDetail();
    }
  }, [id]);

  const loadMatchDetail = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/matches/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMatch(data);
        if (data.homeScore !== undefined && data.awayScore !== undefined) {
          setHomeScore(data.homeScore.toString());
          setAwayScore(data.awayScore.toString());
        }
      } else {
        console.error('경기 정보 로드 실패');
      }
    } catch (error) {
      console.error('경기 정보 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMatch = async () => {
    if (!user || !match) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/matches/${id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('경기가 확정되었습니다!');
        loadMatchDetail();
      } else {
        const error = await response.json();
        alert(error.error || '경기 확정에 실패했습니다');
      }
    } catch (error) {
      console.error('경기 확정 실패:', error);
      alert('경기 확정 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelMatch = async () => {
    if (!confirm('정말로 경기를 취소하시겠습니까?')) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/matches/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('경기가 취소되었습니다');
        loadMatchDetail();
      } else {
        const error = await response.json();
        alert(error.error || '경기 취소에 실패했습니다');
      }
    } catch (error) {
      console.error('경기 취소 실패:', error);
      alert('경기 취소 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!homeScore.trim() || !awayScore.trim()) {
      alert('양 팀의 점수를 모두 입력해주세요');
      return;
    }

    const homeScoreNum = parseInt(homeScore);
    const awayScoreNum = parseInt(awayScore);

    if (isNaN(homeScoreNum) || isNaN(awayScoreNum) || homeScoreNum < 0 || awayScoreNum < 0) {
      alert('유효한 점수를 입력해주세요');
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/matches/${id}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeScore: homeScoreNum,
          awayScore: awayScoreNum
        })
      });

      if (response.ok) {
        alert('경기 결과가 등록되었습니다!');
        setShowResultModal(false);
        loadMatchDetail();
      } else {
        const error = await response.json();
        alert(error.error || '경기 결과 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('경기 결과 등록 실패:', error);
      alert('경기 결과 등록 중 오류가 발생했습니다');
    } finally {
      setIsUpdating(false);
    }
  };

  const canConfirmMatch = () => {
    if (!user || !match) return false;
    // 시합 제안을 받은 팀(상대방 팀)의 멤버만 확정할 수 있음
    // 홈팀이 제안했다면 원정팀이, 원정팀이 제안했다면 홈팀이 확정
    const isHomeTeamOwner = match.homeTeam.owner?.id === user.id;
    const isAwayTeamOwner = match.awayTeam.owner?.id === user.id;
    const isCreator = match.creator.id === user.id;

    return match.status === 'proposed' && !isCreator && (isHomeTeamOwner || isAwayTeamOwner) || user.isAdmin;
  };

  const canCancelMatch = () => {
    if (!user || !match) return false;
    return (match.status === 'proposed' || match.status === 'confirmed') && (
      user.id === match.creator.id ||
      user.isAdmin
    );
  };

  const canInputResult = () => {
    if (!user || !match) return false;
    return match.status === 'confirmed' && (
      user.id === match.creator.id ||
      user.isAdmin
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'proposed': return '제안됨';
      case 'confirmed': return '확정됨';
      case 'completed': return '완료됨';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">경기를 찾을 수 없습니다</h2>
          <Link href="/matches" className="text-blue-600 hover:text-blue-800">
            경기 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/matches" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← 경기 목록으로 돌아가기
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                  {getStatusText(match.status)}
                </span>
                <span className="text-gray-600">{match.sport}</span>
                <span className="text-gray-600">
                  {new Date(match.matchDate).toLocaleDateString('ko-KR')}
                  {match.matchTime && ` ${match.matchTime}`}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 액션 알림 배너 */}
        {match.status === 'proposed' && canConfirmMatch() && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-r-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-yellow-800">⚡ 시합 요청 대기 중</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    <span className="font-medium">{match.creator.username}</span>님이 시합을 제안했습니다. 수락 또는 거절해주세요.
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 ml-9 md:ml-0">
                <button
                  onClick={handleConfirmMatch}
                  disabled={isUpdating}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {isUpdating ? '처리 중...' : '✅ 수락'}
                </button>
                <button
                  onClick={handleCancelMatch}
                  disabled={isUpdating}
                  className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {isUpdating ? '처리 중...' : '❌ 거절'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 결과 입력 배너 */}
        {match.status === 'confirmed' && canInputResult() && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8 rounded-r-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-blue-800">📝 경기 결과 입력</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    경기가 확정되었습니다. 경기 종료 후 결과를 입력해주세요.
                  </p>
                </div>
              </div>
              <div className="ml-9 md:ml-0">
                <button
                  onClick={() => setShowResultModal(true)}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  결과 입력하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 취소 가능 배너 (제안자인 경우) */}
        {(match.status === 'proposed' || match.status === 'confirmed') && !canConfirmMatch() && canCancelMatch() && (
          <div className="bg-gray-50 border-l-4 border-gray-400 p-6 mb-8 rounded-r-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-gray-800">⏳ {match.status === 'proposed' ? '상대팀 응답 대기 중' : '경기 확정됨'}</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    {match.status === 'proposed'
                      ? '상대팀이 수락하면 경기가 확정됩니다.'
                      : '경기가 진행되면 결과를 입력할 수 있습니다.'}
                  </p>
                </div>
              </div>
              <div className="ml-9 md:ml-0">
                <button
                  onClick={handleCancelMatch}
                  disabled={isUpdating}
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  {isUpdating ? '처리 중...' : '경기 취소하기'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 경기 점수 (완료된 경우) */}
        {match.status === 'completed' && match.homeScore !== undefined && match.awayScore !== undefined && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">최종 결과</h2>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">{match.homeTeam.name}</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{match.homeScore}</p>
              </div>
              <div className="text-3xl font-bold text-gray-400">-</div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">{match.awayTeam.name}</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{match.awayScore}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 경기 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 팀 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">팀 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">홈팀</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">{match.homeTeam.name}</p>
                    <p className="text-sm text-gray-600">{match.homeTeam.city} {match.homeTeam.district}</p>
                    {match.homeTeam.owner && (
                      <div className="text-sm text-gray-600">
                        <p>팀장: {match.homeTeam.owner.username}</p>
                        {match.homeTeam.owner.contact && (match.status === 'confirmed' || match.status === 'completed') && (
                          <p className="text-blue-600">📞 {match.homeTeam.owner.contact}</p>
                        )}
                      </div>
                    )}
                    <Link
                      href={`/teams/${match.homeTeam.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      팀 정보 보기 →
                    </Link>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">원정팀</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">{match.awayTeam.name}</p>
                    <p className="text-sm text-gray-600">{match.awayTeam.city} {match.awayTeam.district}</p>
                    {match.awayTeam.owner && (
                      <div className="text-sm text-gray-600">
                        <p>팀장: {match.awayTeam.owner.username}</p>
                        {match.awayTeam.owner.contact && (match.status === 'confirmed' || match.status === 'completed') && (
                          <p className="text-blue-600">📞 {match.awayTeam.owner.contact}</p>
                        )}
                      </div>
                    )}
                    <Link
                      href={`/teams/${match.awayTeam.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      팀 정보 보기 →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 경기 상세 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">경기 상세</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">일시</span>
                  <span>
                    {new Date(match.matchDate).toLocaleDateString('ko-KR')}
                    {match.matchTime && ` ${match.matchTime}`}
                  </span>
                </div>
                {match.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">장소</span>
                    <span>{match.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">종목</span>
                  <span>{match.sport}</span>
                </div>
                {match.contactInfo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">제안자 연락처</span>
                    <span className="text-blue-600">📞 {match.contactInfo}</span>
                  </div>
                )}
                {match.message && (
                  <div className="pt-3 border-t">
                    <p className="text-gray-500 mb-2">제안자 메시지</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{match.message}</p>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">제안자</span>
                  <span>{match.creator.username}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 패널 */}
          <div className="space-y-6">
            {/* 경기 관리 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">경기 관리</h3>
              <div className="space-y-3">
                {canConfirmMatch() && (
                  <button
                    onClick={handleConfirmMatch}
                    disabled={isUpdating}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isUpdating ? '처리 중...' : '경기 확정'}
                  </button>
                )}

                {canInputResult() && (
                  <button
                    onClick={() => setShowResultModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    경기 결과 입력
                  </button>
                )}

                {canCancelMatch() && (
                  <button
                    onClick={handleCancelMatch}
                    disabled={isUpdating}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isUpdating ? '처리 중...' : '경기 취소'}
                  </button>
                )}
              </div>
            </div>

            {/* 추가 정보 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">추가 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">생성일</span>
                  <span>{new Date(match.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">수정일</span>
                  <span>{new Date(match.updatedAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 입력 모달 */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">경기 결과 입력</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {match.homeTeam.name} (홈팀) 득점
                </label>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="득점을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {match.awayTeam.name} (원정팀) 득점
                </label>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="득점을 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isUpdating}
              >
                취소
              </button>
              <button
                onClick={handleSubmitResult}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? '등록 중...' : '결과 등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}