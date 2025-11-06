'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showToast } from '@/components/Toast';

interface Mission {
  id: string;
  type: string;
  title: string;
  description: string;
  reward: number;
  isRepeatable: boolean;
  isCompleted: boolean;
  completedAt: Date | null;
  count: number;
  order: number;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [prismBalance, setPrismBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rewardAnimation, setRewardAnimation] = useState<{ show: boolean; amount: number }>({ show: false, amount: 0 });
  const { user, refreshPrismBalance } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadMissions();
  }, [user, router]);

  const loadMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/missions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMissions(data.missions);
        setPrismBalance(data.prismBalance);
      }
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeMission = async (missionType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ missionType })
      });

      if (response.ok) {
        const data = await response.json();

        // 데모 모드 미션인 경우
        if (data.isDemo) {
          showToast('info', data.message || '추후 인증 시스템 도입 후 포인트가 지급될 예정입니다.');
        } else {
          // 실제 포인트 지급된 경우
          // 애니메이션 표시
          setRewardAnimation({ show: true, amount: data.earnedPrism });
          setTimeout(() => setRewardAnimation({ show: false, amount: 0 }), 3000);

          // 데이터 리로드
          loadMissions();

          // 네비게이션 바의 포인트도 업데이트
          refreshPrismBalance();

          // MATCH_VERIFY의 경우 특별한 메시지 표시
          if (missionType === 'MATCH_VERIFY') {
            showToast('info', '경기 인증이 접수되었습니다. 추후 AI 감지 시스템을 통해 자동으로 처리될 예정입니다.');
          } else {
            showToast('success', '미션을 완료했습니다!');
          }
        }
      } else {
        const error = await response.json();

        // 친화적인 오류 메시지로 변환
        let userMessage = '미션을 완료할 수 없습니다.';
        if (error.error) {
          if (error.error.includes('Already checked in today')) {
            userMessage = '오늘은 이미 출석 체크를 완료했습니다. 내일 다시 시도해주세요!';
          } else if (error.error.includes('팀에 먼저 가입')) {
            userMessage = '팀에 먼저 가입해주세요!';
          } else if (error.error.includes('팀원을 초대')) {
            userMessage = '팀원을 초대한 후 완료할 수 있습니다.';
          } else if (error.error.includes('경기를 먼저')) {
            userMessage = '경기를 등록한 후 완료할 수 있습니다.';
          } else if (error.error.includes('already completed')) {
            userMessage = '이미 완료한 미션입니다.';
          } else if (error.error.includes('Mission condition not met')) {
            userMessage = '아직 미션 조건을 충족하지 못했습니다.';
          }
        }
        showToast('info', userMessage);
      }
    } catch (error) {
      console.error('Failed to complete mission:', error);
      showToast('error', '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const getMissionIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'SPORT_SELECT': '⚽',
      'TEAM_JOIN': '👥',
      'INVITE_MEMBER': '📨',
      'MATCH_VERIFY': '📸',
      'DAILY_CHECK_IN': '✅',
      'TEAM_MATCH': '🏆'
    };
    return icons[type] || '🎯';
  };

  const getMissionGuide = (type: string) => {
    const guides: { [key: string]: { action: string; link?: string } } = {
      'SPORT_SELECT': { action: '회원가입 시 자동 완료' },
      'TEAM_JOIN': { action: '팀에 가입하면 완료', link: '/teams' },
      'INVITE_MEMBER': { action: '팀원을 초대하면 완료' },
      'MATCH_VERIFY': { action: '경기 후 간단한 인증으로 완료' },
      'DAILY_CHECK_IN': { action: '매일 로그인 시 완료 가능' },
      'TEAM_MATCH': { action: '경기를 등록하면 완료', link: '/matches' }
    };
    return guides[type] || { action: '조건 달성 시 완료' };
  };

  const canCompleteMission = (mission: Mission) => {
    // 이미 완료된 반복 불가능한 미션
    if (mission.isCompleted && !mission.isRepeatable) {
      return false;
    }

    // 미션별 완료 가능 여부 체크
    switch (mission.type) {
      case 'SPORT_SELECT':
        // 이미 스포츠를 선택한 경우 (회원가입 시 선택함)
        return !mission.isCompleted;
      case 'DAILY_CHECK_IN':
        // 출석체크는 항상 시도 가능 (서버에서 중복 체크)
        return true;
      default:
        return true;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading missions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 포인트 적립 애니메이션 */}
      {rewardAnimation.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-bounce">
            <div className="text-6xl mb-4">💎</div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              +{rewardAnimation.amount.toLocaleString()} Prism
            </div>
            <div className="text-gray-600">포인트가 적립되었습니다!</div>
          </div>
        </div>
      )}

      {/* 헤더 - Prism 잔액 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Missions</h1>
          <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">My Prism Balance</p>
                <p className="text-3xl font-bold mt-1 animate-pulse">
                  💎 {prismBalance.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Coming Soon</p>
                <p className="text-sm font-medium">경기장 예매에 사용</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 미션 목록 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`bg-white rounded-xl shadow-md p-5 border-2 transition-all ${
                mission.isCompleted && !mission.isRepeatable
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getMissionIcon(mission.type)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {mission.title}
                      </h3>
                      {mission.isRepeatable && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full mt-1">
                          반복 가능
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-2 ml-12">
                    {mission.description}
                  </p>

                  {/* 미션 완료 가이드 */}
                  {!mission.isCompleted && (
                    <div className="ml-12 mb-3">
                      <p className="text-xs text-blue-600 font-medium">
                        💡 {getMissionGuide(mission.type).action}
                      </p>
                      {getMissionGuide(mission.type).link && (
                        <Link
                          href={getMissionGuide(mission.type).link!}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          → 바로가기
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between ml-12">
                    <div className="flex items-center gap-4">
                      <span className="text-blue-600 font-bold text-lg">
                        💎 +{mission.reward.toLocaleString()}
                      </span>
                      {mission.isRepeatable && mission.count > 0 && (
                        <span className="text-sm text-gray-500">
                          완료 {mission.count}회
                        </span>
                      )}
                    </div>

                    {mission.isCompleted && !mission.isRepeatable ? (
                      <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium">
                        ✓ 완료
                      </span>
                    ) : canCompleteMission(mission) ? (
                      <button
                        onClick={() => completeMission(mission.type)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        미션 완료하기
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed">
                        완료 불가
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-blue-800 mb-2">💡 Prism 포인트란?</h4>
          <p className="text-blue-700 text-sm">
            미션을 완료하면 Prism 포인트를 획득할 수 있습니다.
            모은 포인트로 추후 경기장 예매 비용을 할인받거나 무료로 이용할 수 있습니다.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
}
