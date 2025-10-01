'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  city: string;
  district: string;
  currentSport: string;
  isAdmin: boolean;
  createdAt: string;
  teamMembers: {
    role: string;
    team: {
      id: string;
      name: string;
    };
  }[];
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isAdmin) {
      router.push('/');
      return;
    }
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentIsAdmin: boolean) => {
    if (!confirm(`정말로 이 사용자의 관리자 권한을 ${currentIsAdmin ? '제거' : '부여'}하시겠습니까?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAdmin: !currentIsAdmin })
      });

      if (response.ok) {
        alert('권한이 성공적으로 변경되었습니다');
        loadUsers();
      } else {
        const error = await response.json();
        alert(error.error || '권한 변경에 실패했습니다');
      }
    } catch (error) {
      console.error('권한 변경 실패:', error);
      alert('권한 변경 중 오류가 발생했습니다');
    }
  };

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← 관리자 대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">👥 사용자 관리</h1>
          <p className="text-gray-600 mt-2">사용자 정보 조회 및 권한 관리</p>
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
              placeholder="이름 또는 이메일로 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={loadUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              검색
            </button>
          </div>
        </div>

        {/* 사용자 목록 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                전체 사용자 ({users.length}명)
              </h2>
            </div>

            {/* 데스크톱 테이블 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      지역
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      스포츠
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      현재 소속팀
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      권한
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {u.username.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{u.username}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{u.city}</div>
                        <div className="text-sm text-gray-500">{u.district}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {u.currentSport}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.teamMembers.length > 0 ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {u.teamMembers[0].team.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {u.teamMembers[0].role === 'owner' ? '오너' :
                               u.teamMembers[0].role === 'member' ? '멤버' :
                               u.teamMembers[0].role}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">소속팀 없음</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.isAdmin ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            관리자
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            일반
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {u.id !== user.id && (
                          <button
                            onClick={() => toggleAdminRole(u.id, u.isAdmin)}
                            className={`${
                              u.isAdmin
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-blue-600 hover:text-blue-900'
                            }`}
                          >
                            {u.isAdmin ? '관리자 제거' : '관리자 부여'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 */}
            <div className="md:hidden">
              {users.map((u) => (
                <div key={u.id} className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {u.username.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{u.username}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                    {u.isAdmin && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        관리자
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">지역: </span>
                      <span className="text-gray-900">{u.city} {u.district}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">스포츠: </span>
                      <span className="text-gray-900">{u.currentSport}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">현재 소속팀: </span>
                      {u.teamMembers.length > 0 ? (
                        <span className="text-gray-900">
                          {u.teamMembers[0].team.name} ({u.teamMembers[0].role === 'owner' ? '오너' : '멤버'})
                        </span>
                      ) : (
                        <span className="text-gray-400">없음</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">가입일: </span>
                      <span className="text-gray-900">
                        {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  {u.id !== user.id && (
                    <button
                      onClick={() => toggleAdminRole(u.id, u.isAdmin)}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                        u.isAdmin
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {u.isAdmin ? '관리자 제거' : '관리자 부여'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
