'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  contact?: string;
  isAdmin: boolean;
  currentSport: string;
  city: string;
  district?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  prismBalance: number;
  login: (userData: User, userToken: string) => void;
  logout: () => void;
  setUser: (userData: User) => void;
  updatePrismBalance: (balance: number) => void;
  refreshPrismBalance: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [prismBalance, setPrismBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 컴포넌트 마운트 시 로컬스토리지에서 인증 정보 복원 및 최신 정보 가져오기
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);

        // 최신 사용자 정보를 서버에서 가져오기
        fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          })
          .catch(error => {
            console.error('Failed to fetch user info:', error);
          });

        // Prism 잔액도 가져오기
        fetch('/api/prism/balance', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.prismBalance !== undefined) {
              setPrismBalance(data.prismBalance);
            }
          })
          .catch(error => {
            console.error('Failed to fetch prism balance:', error);
          });
      } catch (error) {
        // 파싱 오류 시 로컬스토리지 정리
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updatePrismBalance = (balance: number) => {
    setPrismBalance(balance);
  };

  const refreshPrismBalance = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/prism/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPrismBalance(data.prismBalance);
      }
    } catch (error) {
      console.error('Failed to fetch prism balance:', error);
    }
  };

  const value = {
    user,
    token,
    prismBalance,
    login,
    logout,
    setUser: updateUser,
    updatePrismBalance,
    refreshPrismBalance,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// 인증이 필요한 컴포넌트를 감싸는 HOC
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">이 페이지를 보려면 로그인해야 합니다.</p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              로그인하기
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}