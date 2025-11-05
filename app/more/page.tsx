'use client';

import Link from 'next/link';

export default function MorePage() {
  const menuItems = [
    { href: '/teams', label: '팀', icon: '👥' },
    { href: '/matches', label: '경기', icon: '⚽' },
    { href: '/rankings', label: '랭킹', icon: '🏆' },
    { href: '/profile', label: '프로필 설정', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">더보기</h1>
        
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h2 className="font-bold mb-3">앱 정보</h2>
          <p className="text-sm text-gray-600 mb-2">AllSports v1.0.0</p>
          <p className="text-sm text-gray-600">운동하면 보상이 되는 스포츠 미션 플랫폼</p>
        </div>
      </div>
    </div>
  );
}
