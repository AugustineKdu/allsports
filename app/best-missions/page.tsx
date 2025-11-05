'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function BestMissionsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">베스트 미션</h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-900 mb-3">⭐ 베스트 미션이란?</h2>
          <p className="text-yellow-800 mb-4">
            인기 미션, 리워드 높은 미션, 이번 주 HOT 미션을 모아서 보여드립니다.
          </p>
          <ul className="text-yellow-700 space-y-2">
            <li>• 많은 사용자가 참여하는 인기 미션</li>
            <li>• 높은 Prism 보상이 있는 미션</li>
            <li>• 이벤트 및 제휴 특별 미션</li>
            <li>• 추후 수익모델로 확장 가능 (광고 슬롯)</li>
          </ul>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔥 이번 주 HOT 미션</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-red-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mb-2">HOT</span>
                  <h3 className="text-lg font-bold text-gray-900">주말 경기 인증 챌린지</h3>
                </div>
                <span className="text-2xl font-bold text-red-600">+1,500P</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                주말에 경기하고 인증하면 1.5배 보상!
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">참여자 1,234명</span>
                <Link href="/missions" className="text-blue-600 text-sm font-medium">참여하기 →</Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border-l-4 border-orange-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mb-2">POPULAR</span>
                  <h3 className="text-lg font-bold text-gray-900">팀원 5명 초대 미션</h3>
                </div>
                <span className="text-2xl font-bold text-orange-600">+2,000P</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                친구 5명을 팀에 초대하면 특별 보상
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">참여자 856명</span>
                <Link href="/missions" className="text-blue-600 text-sm font-medium">참여하기 →</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💎 고수익 미션</h2>
          <div className="bg-white rounded-xl shadow p-6">
            <ul className="space-y-4">
              <li className="flex justify-between items-center pb-4 border-b">
                <div>
                  <h3 className="font-bold text-gray-900">리그 참여 미션</h3>
                  <p className="text-sm text-gray-600">지역 리그에 참여하고 보상 받기</p>
                </div>
                <span className="text-xl font-bold text-purple-600">+3,000P</span>
              </li>
              <li className="flex justify-between items-center pb-4 border-b">
                <div>
                  <h3 className="font-bold text-gray-900">10경기 완주 미션</h3>
                  <p className="text-sm text-gray-600">시즌 동안 10경기 완주 시 보상</p>
                </div>
                <span className="text-xl font-bold text-purple-600">+2,500P</span>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">MVP 획득 미션</h3>
                  <p className="text-sm text-gray-600">경기에서 MVP를 획득하면 추가 보상</p>
                </div>
                <span className="text-xl font-bold text-purple-600">+1,200P</span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">모든 미션 보기</h2>
            <p className="text-purple-100 mb-6">
              더 많은 미션과 보상이 준비되어 있습니다
            </p>
            <Link
              href="/missions"
              className="inline-block bg-white text-purple-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100"
            >
              전체 미션 보기
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
