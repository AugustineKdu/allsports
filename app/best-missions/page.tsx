'use client';

import { useState } from 'react';

export default function BestMissionsPage() {
  const [activeTab, setActiveTab] = useState('missions');

  const popularMissions = [
    { title: '리그 경기 참가하기', reward: 1000, participants: 342, category: 'MATCH' },
    { title: '풋살경기 인증하기', reward: 800, participants: 567, category: 'MATCH' },
    { title: '팀 미션을 완료하기', reward: 600, participants: 892, category: 'TEAM' },
  ];

  const partnerBenefits = [
    {
      type: '카페',
      benefit: '10% 할인',
      description: '제휴 카페에서 프리즘으로 할인 받기',
      icon: '☕'
    },
    {
      type: '풋살장 대여료',
      benefit: '3,000 프리즘 차감',
      description: '풋살장 이용시 프리즘으로 할인',
      icon: '⚽'
    },
    {
      type: '제휴미션 강화',
      benefit: '보상배수 증가',
      description: '제휴 매장 이용시 추가 보상',
      icon: '✨'
    },
    {
      type: '프리즘 페이',
      benefit: '이용 가능 매장',
      description: '프리즘으로 결제 가능한 매장',
      icon: '💳'
    },
  ];

  const partnerStores = [
    {
      name: '카페 피그',
      item: '아메리카노',
      prism: 3000,
      description: '현장 확인 후 결제완료',
      location: '강남구',
      icon: '☕'
    },
    {
      name: '일산 풋살장',
      item: '1인 참가권',
      prism: 20000,
      description: '예약연동',
      location: '일산',
      icon: '⚽'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">베스트 미션</h1>
          <p className="text-xl text-gray-700 font-medium">
            지금 인기있는 스포츠 미션에 도전해 보세요!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full shadow-md p-1 flex gap-2">
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'missions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              인기 미션
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'benefits'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              제휴 사용처
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === 'stores'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              제휴 스토어
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'missions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">🔥</span>
                지금 인기있는 스포츠 미션
              </h2>
              <div className="space-y-4">
                {popularMissions.map((mission, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                          <h3 className="font-bold text-xl text-gray-800">{mission.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">👥 {mission.participants}명 참여중</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {mission.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                          +{mission.reward.toLocaleString()}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">프리즘</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">💎</span>
                프리즘 사용처
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {partnerBenefits.map((benefit, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{benefit.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{benefit.type}</h3>
                        <p className="text-2xl font-bold text-purple-600 mb-2">{benefit.benefit}</p>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">🏪</span>
                제휴 스토어
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {partnerStores.map((store, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{store.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-800 mb-1">{store.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">📍 {store.location}</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium text-gray-700 mb-2">{store.item}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-blue-600">
                              {store.prism.toLocaleString()} 프리즘
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 font-medium">{store.description}</p>
                        </div>
                        <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors">
                          바로 사용하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}