'use client';

import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

export default function ShortcutPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">숏컷 (Shortcut)</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-3">📹 숏컷이란?</h2>
          <p className="text-blue-800 mb-4">
            미션 수행 과정을 짧은 영상/이미지 클립으로 기록하고 공유하는 기능입니다.
          </p>
          <ul className="text-blue-700 space-y-2">
            <li>• 경기 하이라이트 영상 공유</li>
            <li>• 팀 활동 사진 기록</li>
            <li>• 댓글/좋아요/팔로우로 커뮤니티 활성화</li>
            <li>• Prism 보상 루프와 자연 연결 (조회·참여로 추가 보상)</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            숏컷 기능은 곧 출시될 예정입니다.<br />
            스포츠 활동을 더 재미있게 공유할 수 있도록 준비하고 있습니다.
          </p>
          <Link
            href="/missions"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            미션 보러 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
