'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // 로그인하지 않은 사용자는 네비게이션 표시 안함
  if (!user) return null;

  const navItems = [
    { href: '/', label: '홈' },
    { href: '/teams', label: '팀' },
    { href: '/matches', label: '시합' },
    { href: '/rankings', label: '랭킹' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50 font-bold'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}