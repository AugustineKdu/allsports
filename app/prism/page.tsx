'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function PrismPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6 animate-bounce">💎</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 break-keep">
            Prism 포인트
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-purple-100 break-keep">
            경기하고, 활동하고, 혜택 받으세요!
          </p>
          <p className="text-lg text-purple-200 max-w-3xl mx-auto mb-8 break-keep">
            AllSports와 함께하는 모든 순간이 가치있습니다.<br />
            팀 활동, 경기 참여, 친구 초대 등 모든 활동으로 Prism 포인트를 적립하고,<br />
            경기장 예약부터 스포츠 용품 구매까지 다양한 혜택을 누리세요.
          </p>
          {user ? (
            <Link
              href="/missions"
              className="inline-block bg-yellow-400 text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg"
            >
              내 미션 보기 →
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-block bg-yellow-400 text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg"
            >
              가입하고 300P 받기 →
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Prism이란? */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              💎 Prism 포인트란?
            </h2>
            <p className="text-lg text-gray-700 text-center mb-8 break-keep">
              AllSports에서 활동하며 적립하는 포인트입니다.<br />
              단순히 경기만 하는 것이 아니라, 여러분의 모든 스포츠 활동에 실질적인 가치를 더합니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">쉽게 적립</h3>
                <p className="text-gray-600 break-keep">
                  팀 활동, 경기 참여, 로그인만 해도 포인트 적립
                </p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">다양한 혜택</h3>
                <p className="text-gray-600 break-keep">
                  경기장 할인부터 용품 구매까지 실질적인 혜택
                </p>
              </div>
              <div className="text-center p-6 bg-indigo-50 rounded-xl">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">계속 성장</h3>
                <p className="text-gray-600 break-keep">
                  활동할수록 더 많은 혜택과 보상
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 포인트 적립 방법 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            포인트 적립 방법
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🎉</span>
                  <h3 className="text-xl font-bold text-gray-900">회원가입</h3>
                </div>
                <span className="text-2xl font-bold text-green-600">+300P</span>
              </div>
              <p className="text-gray-600 mb-2">AllSports에 처음 가입하면 즉시 지급!</p>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">1회 지급</span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">👥</span>
                  <h3 className="text-xl font-bold text-gray-900">팀 만들기/가입</h3>
                </div>
                <span className="text-2xl font-bold text-blue-600">+500P</span>
              </div>
              <p className="text-gray-600 mb-2">팀을 만들거나 기존 팀에 가입하면 보상</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">1회 지급</span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📨</span>
                  <h3 className="text-xl font-bold text-gray-900">팀원 초대</h3>
                </div>
                <span className="text-2xl font-bold text-purple-600">+200P</span>
              </div>
              <p className="text-gray-600 mb-2">친구를 초대하고 승인할 때마다 적립</p>
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">반복 가능</span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-orange-500">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📸</span>
                  <h3 className="text-xl font-bold text-gray-900">경기 인증</h3>
                </div>
                <span className="text-2xl font-bold text-orange-600">+800P</span>
              </div>
              <p className="text-gray-600 mb-2">경기 후 사진 등으로 인증하면 보상</p>
              <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">반복 가능</span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-yellow-500">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">✅</span>
                  <h3 className="text-xl font-bold text-gray-900">매일 출석</h3>
                </div>
                <span className="text-2xl font-bold text-yellow-600">+50P</span>
              </div>
              <p className="text-gray-600 mb-2">매일 로그인만 해도 자동 적립</p>
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">일 1회</span>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-red-500">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">⚽</span>
                  <h3 className="text-xl font-bold text-gray-900">경기 등록</h3>
                </div>
                <span className="text-2xl font-bold text-red-600">+1,000P</span>
              </div>
              <p className="text-gray-600 mb-2">다른 팀과 경기를 등록하면 보상</p>
              <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">반복 가능</span>
            </div>
          </div>
        </section>

        {/* 포인트 사용처 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            포인트 사용처
          </h2>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-6">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 break-keep">
                모은 Prism 포인트는 스포츠 활동에 필요한 모든 곳에서 사용할 수 있습니다.<br />
                실제 비용을 절감하고 더 많은 경기를 즐기세요!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl mb-4">🏟️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">경기장 예약 할인</h3>
                <p className="text-gray-600 mb-4 break-keep">
                  제휴 풋살장, 축구장 예약 시 포인트로 할인받으세요
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">예시:</p>
                  <p className="text-xs text-blue-700">10,000P = 10,000원 할인</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl mb-4">⚽</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">스포츠 용품 구매</h3>
                <p className="text-gray-600 mb-4 break-keep">
                  제휴 스포츠 용품점에서 축구화, 유니폼 등을 할인가에
                </p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">예시:</p>
                  <p className="text-xs text-green-700">5,000P = 5,000원 할인</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">경품 교환</h3>
                <p className="text-gray-600 mb-4 break-keep">
                  스포츠 용품, 기프티콘 등 다양한 경품으로 교환
                </p>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium">예시:</p>
                  <p className="text-xs text-purple-700">20,000P = 스타벅스 기프티콘</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl mb-4">👕</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">팀 유니폼 제작</h3>
                <p className="text-gray-600 mb-4 break-keep">
                  팀 유니폼 단체 제작 시 포인트로 할인
                </p>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-800 font-medium">예시:</p>
                  <p className="text-xs text-orange-700">15,000P = 15,000원 할인</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl mb-4">🏃</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">스포츠 이벤트</h3>
                <p className="text-gray-600 mb-4 break-keep">
                  대회 참가비, 워크샵 등 이벤트 비용 할인
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">예시:</p>
                  <p className="text-xs text-yellow-700">30,000P = 대회 참가비 할인</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">추가 혜택 (준비중)</h3>
                <p className="text-gray-600 mb-4 break-keep">
                  더 많은 제휴처와 혜택이 추가될 예정입니다
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-800 font-medium">Coming Soon</p>
                  <p className="text-xs text-gray-700">계속 업데이트됩니다</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-xl shadow-md p-6 group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                <span>💎 Prism 포인트는 어떻게 적립하나요?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 break-keep">
                회원가입, 팀 가입, 경기 참여, 친구 초대, 매일 출석 등 AllSports에서의 모든 활동으로 자동 적립됩니다.
                각 활동마다 정해진 포인트가 즉시 지급되며, 미션 페이지에서 현재 진행 상황을 확인할 수 있습니다.
              </p>
            </details>

            <details className="bg-white rounded-xl shadow-md p-6 group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                <span>💰 포인트는 언제 사용할 수 있나요?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 break-keep">
                적립된 포인트는 즉시 사용 가능합니다. 제휴 경기장 예약, 용품 구매, 경품 교환 등에서
                1포인트 = 1원으로 환산되어 사용할 수 있습니다. 정식 서비스 출시 시 더 많은 사용처가 추가될 예정입니다.
              </p>
            </details>

            <details className="bg-white rounded-xl shadow-md p-6 group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                <span>📅 포인트에 유효기간이 있나요?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 break-keep">
                현재 베타 서비스 기간 동안 포인트에 유효기간은 없습니다.
                정식 서비스 전환 시 유효기간 정책이 수립될 예정이며, 사전에 충분히 공지해드릴 예정입니다.
              </p>
            </details>

            <details className="bg-white rounded-xl shadow-md p-6 group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                <span>🎁 현금으로 환전할 수 있나요?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 break-keep">
                Prism 포인트는 AllSports 플랫폼 내에서만 사용 가능하며, 현금 환전은 지원하지 않습니다.
                대신 경기장 할인, 용품 구매, 경품 교환 등 실질적인 혜택으로 사용하실 수 있습니다.
              </p>
            </details>

            <details className="bg-white rounded-xl shadow-md p-6 group">
              <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex justify-between items-center">
                <span>🤝 제휴 경기장은 어디서 확인하나요?</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-gray-600 break-keep">
                현재 베타 서비스 기간으로 제휴처를 확대하고 있습니다.
                제휴 경기장 목록은 정식 서비스 출시 시 별도 페이지에서 확인하실 수 있으며,
                계속해서 제휴처를 늘려갈 예정입니다.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-10 text-white">
          <h2 className="text-3xl font-bold mb-4 break-keep">
            지금 시작하고 포인트 받으세요!
          </h2>
          <p className="text-lg mb-6 text-purple-100 break-keep">
            회원가입만 해도 즉시 300P 지급!<br />
            팀을 만들고 경기하면서 더 많은 포인트를 적립하세요.
          </p>
          {user ? (
            <Link
              href="/missions"
              className="inline-block bg-yellow-400 text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg"
            >
              내 미션 확인하기 →
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-block bg-yellow-400 text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg"
              >
                회원가입하고 300P 받기 →
              </Link>
              <Link
                href="/login"
                className="inline-block bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all hover:scale-105 border-2 border-white"
              >
                로그인
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
