'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { showToast } from '@/components/Toast';

interface ShortcutPost {
  id: string;
  username: string;
  userImage: string;
  sport: string;
  content: string;
  imageUrl: string;
  likes: number;
  comments: number;
  timestamp: string;
  location?: string;
  isLiked: boolean;
}

export default function ShortcutPage() {
  const { user } = useAuth();
  const router = useRouter();

  // 데모 데이터 - 스포츠 관련 이미지 사용
  const [posts] = useState<ShortcutPost[]>([
    {
      id: '1',
      username: 'FC올스포츠',
      userImage: 'https://picsum.photos/40/40?random=1',
      sport: '축구',
      content: '오늘의 연습 경기! 열심히 뛰었습니다 💪',
      imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=600&fit=crop',
      likes: 24,
      comments: 3,
      timestamp: '2시간 전',
      location: '고양시 풋살파크',
      isLiked: false
    },
    {
      id: '2',
      username: '김민수',
      userImage: 'https://picsum.photos/40/40?random=2',
      sport: '풋살',
      content: '주말 풋살 모임 완료! 다음주도 같이 해요~',
      imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&h=600&fit=crop',
      likes: 18,
      comments: 5,
      timestamp: '4시간 전',
      location: '일산 스포츠센터',
      isLiked: true
    },
    {
      id: '3',
      username: '이지은',
      userImage: 'https://picsum.photos/40/40?random=3',
      sport: '축구',
      content: '여자축구팀 신규 멤버 모집중! DM 주세요 😊',
      imageUrl: 'https://images.unsplash.com/photo-1571698140436-036a19f69007?w=600&h=600&fit=crop',
      likes: 45,
      comments: 12,
      timestamp: '1일 전',
      location: '서울 월드컵경기장',
      isLiked: false
    },
    {
      id: '4',
      username: '박준형',
      userImage: 'https://picsum.photos/40/40?random=4',
      sport: '풋살',
      content: '새벽 풋살의 매력! 상쾌한 아침 운동 완료 ✅',
      imageUrl: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=600&h=600&fit=crop',
      likes: 31,
      comments: 7,
      timestamp: '1일 전',
      isLiked: false
    },
    {
      id: '5',
      username: '팀골잡이',
      userImage: 'https://picsum.photos/40/40?random=5',
      sport: '축구',
      content: '동호회 친선경기 대승! 다음엔 더 열심히 👊',
      imageUrl: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=600&h=600&fit=crop',
      likes: 52,
      comments: 9,
      timestamp: '2일 전',
      location: '분당 축구장',
      isLiked: false
    },
    {
      id: '6',
      username: '킥마스터',
      userImage: 'https://picsum.photos/40/40?random=6',
      sport: '풋살',
      content: '오늘의 MVP! 3골 2도움 기록 🏆',
      imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&h=600&fit=crop',
      likes: 67,
      comments: 15,
      timestamp: '3일 전',
      location: '강남 풋살파크',
      isLiked: false
    }
  ]);

  const [selectedPost, setSelectedPost] = useState<ShortcutPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(['2']));

  const handleLike = (postId: string) => {
    if (!user) {
      showToast('info', '로그인 후 이용해주세요.');
      router.push('/login');
      return;
    }

    setLikedPosts(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(postId)) {
        newLiked.delete(postId);
        showToast('info', '좋아요를 취소했습니다.');
      } else {
        newLiked.add(postId);
        showToast('success', '좋아요를 눌렀습니다!');
      }
      return newLiked;
    });
  };

  const handleComment = () => {
    showToast('info', '댓글 기능은 추후 AI 감지 시스템과 함께 업데이트될 예정입니다.');
  };

  const handleUpload = () => {
    showToast('info', '포스트 업로드는 추후 AI 이미지 인증 시스템과 함께 오픈됩니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">숏컷</h1>
          <button
            onClick={handleUpload}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 스토리 섹션 (인스타그램 스타일) */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
            {/* 내 스토리 추가 */}
            <div className="flex-shrink-0 text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-xs mt-1">내 스토리</p>
            </div>

            {/* 다른 사용자 스토리 */}
            {['축구매치', '풋살왕', '골키퍼', '미드필더'].map((name, idx) => (
              <div key={idx} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-white p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-200"></div>
                  </div>
                </div>
                <p className="text-xs mt-1 truncate w-16">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 피드 */}
      <div className="max-w-xl mx-auto py-2">
        {posts.map((post) => (
          <div key={post.id} className="bg-white mb-4 border">
            {/* 포스트 헤더 */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-3">
                <img src={post.userImage} alt={post.username} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-sm">{post.username}</p>
                  {post.location && (
                    <p className="text-xs text-gray-500">{post.location}</p>
                  )}
                </div>
              </div>
              <button className="p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>

            {/* 포스트 이미지 */}
            <div className="aspect-square bg-gray-200 relative">
              <img
                src={post.imageUrl}
                alt={post.content}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://picsum.photos/600/600?random=' + post.id;
                }}
              />
              <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                {post.sport}
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <svg
                      className={`w-6 h-6 ${likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''}`}
                      fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleComment}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button className="hover:opacity-70 transition-opacity">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                    </svg>
                  </button>
                </div>
                <button className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              {/* 좋아요 수 */}
              <p className="font-semibold text-sm mb-1">
                좋아요 {post.likes + (likedPosts.has(post.id) ? 1 : 0)}개
              </p>

              {/* 콘텐츠 */}
              <div className="text-sm">
                <span className="font-semibold mr-2">{post.username}</span>
                {post.content}
              </div>

              {/* 댓글 수 */}
              {post.comments > 0 && (
                <button
                  onClick={handleComment}
                  className="text-sm text-gray-500 mt-1 hover:text-gray-700"
                >
                  댓글 {post.comments}개 모두 보기
                </button>
              )}

              {/* 시간 */}
              <p className="text-xs text-gray-400 mt-1">{post.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 플로팅 업로드 버튼 */}
      <button
        onClick={handleUpload}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

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