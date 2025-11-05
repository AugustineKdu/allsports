'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function PartnersPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">제휴</h1>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-green-900 mb-3">🤝 제휴란?</h2>
          <p className="text-green-800 mb-4">
            지역 상점, 카페, 편의점, 운동시설 등과 연동된 제휴 미션 및 혜택입니다.
          </p>
          <ul className="text-green-700 space-y-2">
            <li>• 제휴 경기장 할인 (Prism 포인트 사용)</li>
            <li>• 지역 카페 및 음식점 할인</li>
            <li>• 스포츠 용품점 특가</li>
            <li>• 제휴처 방문 미션으로 추가 Prism 적립</li>
          </ul>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🏟️ 경기장 제휴</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">고양 종합 풋살장</h3>
                  <p className="text-sm text-gray-600">경기도 고양시 일산동구</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">제휴</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li>• Prism 10,000P = 10,000원 할인</li>
                <li>• 평일 예약 시 5% 추가 할인</li>
                <li>• 경기 후 인증 시 +200P 적립</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700" disabled>
                예약하기 (준비중)
              </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">일산 스포츠타운</h3>
                  <p className="text-sm text-gray-600">경기도 고양시 일산서구</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">제휴</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li>• Prism 15,000P = 15,000원 할인</li>
                <li>• 주말 2시간 이상 예약 시 10% 할인</li>
                <li>• 첫 방문 시 +300P 적립</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700" disabled>
                예약하기 (준비중)
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⚽ 스포츠 용품 제휴</h2>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">제휴 스포츠 용품점</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center pb-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">축구화 / 풋살화</p>
                  <p className="text-sm text-gray-600">Prism 5,000P로 5,000원 할인</p>
                </div>
                <span className="text-blue-600 text-sm font-medium">준비중</span>
              </li>
              <li className="flex justify-between items-center pb-3 border-b">
                <div>
                  <p className="font-medium text-gray-900">유니폼 / 운동복</p>
                  <p className="text-sm text-gray-600">Prism 3,000P로 3,000원 할인</p>
                </div>
                <span className="text-blue-600 text-sm font-medium">준비중</span>
              </li>
              <li className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">스포츠 악세서리</p>
                  <p className="text-sm text-gray-600">Prism 2,000P로 2,000원 할인</p>
                </div>
                <span className="text-blue-600 text-sm font-medium">준비중</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">☕ 지역 카페 / 음식점</h2>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🏪</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">제휴처 확대 중</h3>
              <p className="text-gray-600 mb-6">
                경기 전후 이용할 수 있는 지역 카페 및 음식점과<br />
                제휴를 준비하고 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">제휴 문의</h2>
            <p className="text-green-100 mb-6">
              AllSports와 함께 성장할 제휴 파트너를 찾고 있습니다.<br />
              경기장, 용품점, 지역 상점 등 제휴 문의는 아래로 연락주세요.
            </p>
            <a
              href="mailto:contact@allsports.com"
              className="inline-block bg-white text-green-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100"
            >
              제휴 문의하기
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
