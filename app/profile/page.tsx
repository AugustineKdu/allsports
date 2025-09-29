'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';

interface ProfileStats {
  teamCount: number;
  matchCount: number;
  winCount: number;
  mvpCount: number;
}

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    contact: '',
    currentSport: '',
    city: '',
    district: ''
  });

  // 지역별 구/시 매핑
  const districts = {
    '서울': ['강남구', '강동구', '강서구', '관악구', '송파구', '서초구', '마포구', '용산구'],
    '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안양시', '안산시', '화성시']
  };

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        contact: user.contact || '',
        currentSport: user.currentSport,
        city: user.city,
        district: user.district || ''
      });
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">프로필을 보려면 로그인해야 합니다.</p>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData.username.trim()) {
      alert('이름을 입력해주세요');
      return;
    }

    if (!formData.district) {
      alert('구/시를 선택해주세요');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // AuthContext의 user 상태 업데이트
        setUser(updatedUser);
        // 로컬스토리지의 user 정보도 업데이트
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setIsEditing(false);
        alert('프로필이 성공적으로 업데이트되었습니다!');
      } else {
        const error = await response.json();
        alert(error.error || '프로필 업데이트에 실패했습니다');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <p className="text-gray-600 mt-2">개인 정보와 활동 내역을 확인하고 관리하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 정보 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">개인 정보</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isEditing ? '취소' : '수정'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처
                    </label>
                    <input
                      type="tel"
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="010-1234-5678 (선택사항)"
                    />
                    <p className="mt-1 text-xs text-gray-500">시합 확정 시 상대방과 연락을 위해 사용됩니다</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      선호 스포츠
                    </label>
                    <select
                      value={formData.currentSport}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentSport: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="축구">축구</option>
                      <option value="풋살">풋살</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        지역
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value, district: '' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="서울">서울</option>
                        <option value="경기도">경기도</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        구/시
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {districts[formData.city as keyof typeof districts]?.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSaving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">이메일</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">이름</label>
                      <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">연락처</label>
                      <p className="mt-1 text-sm text-gray-900">{user.contact || '등록된 연락처가 없습니다'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">선호 스포츠</label>
                      <p className="mt-1 text-sm text-gray-900">{user.currentSport}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">지역</label>
                      <p className="mt-1 text-sm text-gray-900">{user.city} {user.district}</p>
                    </div>
                  </div>

                  {user.isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">권한</label>
                      <p className="mt-1 text-sm text-blue-600 font-medium">관리자</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 활동 통계 */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">활동 통계</h2>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.teamCount}</div>
                    <div className="text-sm text-gray-500">가입한 팀</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.matchCount}</div>
                    <div className="text-sm text-gray-500">참여한 경기</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.winCount}</div>
                    <div className="text-sm text-gray-500">승리</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.mvpCount}</div>
                    <div className="text-sm text-gray-500">MVP</div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 프로필 요약 */}
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {user.username.charAt(0)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
              <p className="text-sm text-gray-500">{user.city} {user.district}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">{user.currentSport}</p>
            </div>

            {/* 빠른 메뉴 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 메뉴</h3>
              <div className="space-y-2">
                <Link
                  href="/teams"
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  내 팀 관리
                </Link>
                <Link
                  href="/matches"
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  경기 내역
                </Link>
                <Link
                  href="/rankings"
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  랭킹 보기
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    관리자 페이지
                  </Link>
                )}
              </div>
            </div>

            {/* 로그아웃 */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}