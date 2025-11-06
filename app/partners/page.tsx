'use client';

import { useState } from 'react';
import { showToast } from '@/components/Toast';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

interface Partner {
  id: string;
  name: string;
  category: string;
  discount: string;
  description: string;
  prismRequired?: number;
  location?: string;
  badge?: string;
}

export default function PartnersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const partners: Partner[] = [
    // 경기장
    {
      id: '1',
      name: '고양시 풋살파크',
      category: '경기장',
      discount: '30%',
      description: '프리미엄 인조잔디 풋살장',
      prismRequired: 50000,
      location: '경기도 고양시',
      badge: 'HOT'
    },
    {
      id: '2',
      name: '서울 축구공원',
      category: '경기장',
      discount: '35%',
      description: '천연잔디 축구장',
      prismRequired: 60000,
      location: '서울 마포구'
    },
    {
      id: '3',
      name: '일산 스포츠센터',
      category: '경기장',
      discount: '30%',
      description: '실내 풋살 코트',
      prismRequired: 45000,
      location: '경기도 일산',
      badge: 'NEW'
    },

    // 카페
    {
      id: '4',
      name: '스포츠카페 킥오프',
      category: '카페',
      discount: '30%',
      description: '경기 관람 가능한 스포츠 카페',
      prismRequired: 10000,
      location: '서울 강남구'
    },
    {
      id: '5',
      name: '카페 골인',
      category: '카페',
      discount: '35%',
      description: '축구 테마 디저트 카페',
      prismRequired: 12000,
      location: '서울 서초구'
    },
    {
      id: '6',
      name: '더킥 커피',
      category: '카페',
      discount: '30%',
      description: '운동 후 단백질 쉐이크 전문점',
      prismRequired: 10000,
      location: '경기도 성남시'
    },

    // 스포츠 용품점
    {
      id: '7',
      name: '올스포츠 용품점',
      category: '용품점',
      discount: '35%',
      description: '축구/풋살 전문 용품점',
      prismRequired: 25000,
      location: '서울 용산구',
      badge: 'BEST'
    },
    {
      id: '8',
      name: '프로키퍼 스토어',
      category: '용품점',
      discount: '30%',
      description: '골키퍼 전문 장비점',
      prismRequired: 20000,
      location: '서울 송파구'
    },
    {
      id: '9',
      name: '스포츠웨어 갤러리',
      category: '용품점',
      discount: '30%',
      description: '유니폼 및 운동복 전문',
      prismRequired: 18000,
      location: '경기도 부천시'
    },

    // 의료/헬스
    {
      id: '10',
      name: '스포츠 재활센터',
      category: '의료',
      discount: '40%',
      description: '스포츠 부상 전문 재활치료',
      prismRequired: 80000,
      location: '서울 강동구',
      badge: 'PREMIUM'
    },
    {
      id: '11',
      name: '운동선수 한의원',
      category: '의료',
      discount: '35%',
      description: '스포츠 한방 치료',
      prismRequired: 70000,
      location: '서울 종로구'
    },
    {
      id: '12',
      name: '피트니스 센터 골',
      category: '헬스',
      discount: '30%',
      description: '축구선수 전문 트레이닝',
      prismRequired: 30000,
      location: '경기도 수원시'
    },

    // 음식점
    {
      id: '13',
      name: '선수촌 삼겹살',
      category: '음식점',
      discount: '30%',
      description: '운동 후 단백질 보충 맛집',
      prismRequired: 15000,
      location: '서울 노원구'
    },
    {
      id: '14',
      name: '스포츠펍 하프타임',
      category: '음식점',
      discount: '35%',
      description: '경기 관람 스포츠펍',
      prismRequired: 18000,
      location: '서울 이태원'
    },
    {
      id: '15',
      name: '에너지볼 레스토랑',
      category: '음식점',
      discount: '30%',
      description: '운동선수 식단 전문점',
      prismRequired: 15000,
      location: '서울 잠실'
    }
  ];

  const categories = ['전체', '경기장', '카페', '용품점', '의료', '헬스', '음식점'];
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredPartners = selectedCategory === '전체'
    ? partners
    : partners.filter(p => p.category === selectedCategory);

  const handleUseDiscount = (partner: Partner) => {
    if (!user) {
      showToast('info', '로그인 후 이용해주세요.');
      router.push('/login');
      return;
    }

    // 실제로는 Prism 포인트 차감 로직이 필요
    showToast('info', `${partner.name}의 할인 쿠폰이 발급되었습니다! (데모)`);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      '경기장': '⚽',
      '카페': '☕',
      '용품점': '🏪',
      '의료': '🏥',
      '헬스': '💪',
      '음식점': '🍖'
    };
    return icons[category] || '🏢';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">제휴 파트너</h1>
          <p className="text-blue-100">
            Prism 포인트로 다양한 혜택을 받아보세요
          </p>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 파트너 목록 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-gray-600 mb-4">
          총 {filteredPartners.length}개의 제휴처
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-5 relative overflow-hidden"
            >
              {/* 배지 */}
              {partner.badge && (
                <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold ${
                  partner.badge === 'HOT' ? 'bg-red-500 text-white' :
                  partner.badge === 'NEW' ? 'bg-green-500 text-white' :
                  partner.badge === 'BEST' ? 'bg-yellow-500 text-white' :
                  'bg-purple-500 text-white'
                }`}>
                  {partner.badge}
                </div>
              )}

              {/* 카테고리 아이콘 */}
              <div className="flex items-start mb-3">
                <span className="text-3xl mr-3">
                  {getCategoryIcon(partner.category)}
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {partner.name}
                  </h3>
                  <p className="text-sm text-gray-500">{partner.category}</p>
                </div>
              </div>

              {/* 설명 */}
              <p className="text-sm text-gray-600 mb-2">
                {partner.description}
              </p>

              {/* 위치 */}
              {partner.location && (
                <p className="text-xs text-gray-500 mb-3 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {partner.location}
                </p>
              )}

              {/* 할인 정보 */}
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      {partner.discount}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">할인</span>
                  </div>
                  {partner.prismRequired && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">필요 포인트</p>
                      <p className="font-semibold">💎 {partner.prismRequired.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleUseDiscount(partner)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  할인 받기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 안내 */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-800 mb-2">
            🎉 더 많은 혜택이 준비중입니다!
          </h3>
          <p className="text-yellow-700 text-sm">
            매주 새로운 제휴처가 추가됩니다. Prism 포인트를 모아서 다양한 혜택을 누려보세요!
          </p>
        </div>

        {/* Prism 안내 */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm">
            💡 Tip: 미션을 완료하여 Prism 포인트를 모으고, 제휴처에서 할인 혜택을 받아보세요!
          </p>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}