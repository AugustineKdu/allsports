'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const [prismBalance, setPrismBalance] = useState(0);
  const [todayMissions, setTodayMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const token = localStorage.getItem('token');

        // Prism 잔액 조회
        const balanceResponse = await fetch('/api/prism/balance', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setPrismBalance(balanceData.prismBalance);
        }

        // 오늘의 미션 조회
        const missionsResponse = await fetch('/api/missions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (missionsResponse.ok) {
          const missionsData = await missionsResponse.json();
          setTodayMissions(missionsData.missions.slice(0, 6));
        }
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 히어로 섹션 - 정체성 */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            운동하면 보상이 되는<br />스포츠 미션 플랫폼
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-purple-100">
            미션을 수행하고 Prism을 획득,<br />
            팀을 만들고 리그도 참여할 수 있습니다.
          </p>
          {user ? (
            <Link
              href="/missions"
              className="inline-block bg-yellow-400 text-purple-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all"
            >
              오늘의 미션 시작하기
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-block bg-yellow-400 text-purple-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all"
            >
              오늘의 미션 시작하기 (+300 Prism)
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 오늘의 미션 미리보기 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            오늘의 미션
          </h2>
          {user && todayMissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {todayMissions.slice(0, 3).map((mission) => (
                <div
                  key={mission.id}
                  className={`bg-white rounded-xl p-6 border-2 ${
                    mission.isCompleted ? 'border-green-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{mission.title}</h3>
                    <span className="text-xl font-bold text-blue-600">+{mission.reward}P</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{mission.description}</p>
                  {mission.isCompleted ? (
                    <div className="text-green-600 font-medium">✓ 완료</div>
                  ) : (
                    <Link
                      href="/missions"
                      className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      미션 하기
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">미션 1: 좋아하는 스포츠 선택하기</h3>
                  <span className="text-xl font-bold text-blue-600">+300P</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  UI 상 다양한 종목 중 선택 (현재는 풋살만 활성화)
                </p>
                <Link
                  href="/register"
                  className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  시작하기
                </Link>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">미션 2: 팀 만들기 및 팀 참여하기</h3>
                  <span className="text-xl font-bold text-blue-600">+500P</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  팀을 만들거나 기존 팀에 합류하세요
                </p>
                <Link
                  href="/register"
                  className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  시작하기
                </Link>
              </div>
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">미션 3: 경기 인증하기</h3>
                  <span className="text-xl font-bold text-blue-600">+800P</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  경기 후 간단 인증(사진 업로드 등)
                </p>
                <Link
                  href="/register"
                  className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  시작하기
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* 활동 루프 시각화 */}
        <section className="mb-16 bg-white rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            AllSports 활동 루프
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏃</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">① 운동하기</h3>
              <p className="text-sm text-gray-600">팀 활동 및 경기 참여</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">② 미션 완료</h3>
              <p className="text-sm text-gray-600">활동 인증 및 기록</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">③ Prism 획득</h3>
              <p className="text-sm text-gray-600">즉시 포인트 적립</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">④ 리그·제휴 참여</h3>
              <p className="text-sm text-gray-600">성장 및 혜택 확대</p>
            </div>
          </div>
        </section>

        {/* Prism 소개 섹션 */}
        <section className="mb-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            💎 Prism — 당신의 운동이 쌓이는 보상
          </h2>
          <p className="text-center text-gray-700 mb-8">
            모든 스포츠 활동으로 Prism 포인트를 적립하고, 다양한 혜택을 누리세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">Prism 사용처</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 제휴 경기장 할인</li>
                <li>• 스포츠 용품 구매</li>
                <li>• 이벤트 참가</li>
                <li>• 팀 활동 보상</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">적립 방법</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 회원가입: +300P</li>
                <li>• 팀 가입: +500P</li>
                <li>• 경기 등록: +1,000P</li>
                <li>• 매일 출석: +50P</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">향후 계획</h3>
              <p className="text-sm text-gray-600">
                지역 제휴처 연동 예정<br />
                경기장, 카페, 용품점 등<br />
                다양한 파트너십 확대
              </p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/prism"
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700"
            >
              Prism 자세히 알아보기
            </Link>
          </div>
        </section>

        {/* 리그 티저 섹션 */}
        <section className="mb-16 bg-white rounded-2xl p-8 border-2 border-blue-200">
          <div className="text-center">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              COMING SOON
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              2025 고양시 풋살 리그
            </h2>
            <p className="text-gray-600 mb-6">
              지역 최초 공식 풋살 리그가 곧 시작됩니다<br />
              지금 팀을 만들고 리그에 참여하세요
            </p>
            <div className="bg-blue-50 inline-block px-6 py-3 rounded-xl mb-6">
              <p className="text-blue-900 font-bold text-lg">
                현재 대기 팀: <span className="text-2xl">38</span> 팀
              </p>
            </div>
            <div>
              <Link
                href="/register"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 mr-4"
              >
                리그 시작 알림 받기
              </Link>
              <Link
                href="/teams"
                className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50"
              >
                팀 만들기
              </Link>
            </div>
          </div>
        </section>

        {/* 간단한 종목 안내 */}
        <section className="mb-16 bg-gray-100 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            지원 종목
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">⚽</span>
                <div>
                  <h3 className="font-bold text-gray-900">현재 활성 종목</h3>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">BETA</span>
                </div>
              </div>
              <ul className="text-gray-700 space-y-2">
                <li className="font-bold">• 풋살</li>
                <li className="text-sm text-gray-600">- 팀 매칭 및 경기 진행</li>
                <li className="text-sm text-gray-600">- 지역별 랭킹 시스템</li>
                <li className="text-sm text-gray-600">- 미션 및 Prism 적립</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🏀</span>
                <div>
                  <h3 className="font-bold text-gray-900">확장 예정</h3>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">COMING SOON</span>
                </div>
              </div>
              <ul className="text-gray-700 space-y-2">
                <li>• 조기축구</li>
                <li>• 농구</li>
                <li>• 스크린골프</li>
                <li className="text-sm text-gray-600">...그 외 다양한 종목 추가 예정</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        {!user && (
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              지금 시작하고 300 Prism 받으세요
            </h2>
            <p className="text-lg mb-6 text-blue-100">
              회원가입만 해도 즉시 포인트 지급!<br />
              미션을 완료하고 더 많은 보상을 받아보세요.
            </p>
            <Link
              href="/register"
              className="inline-block bg-yellow-400 text-purple-900 px-12 py-4 rounded-xl font-bold text-xl hover:bg-yellow-300 transition-all"
            >
              무료로 시작하기
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
