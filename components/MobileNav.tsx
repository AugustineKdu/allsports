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
    { href: '/', icon: '🏠', label: '홈' },
    { href: '/teams', icon: '👥', label: '팀' },
    { href: '/matches', icon: '⚽', label: '시합' },
    { href: '/rankings', icon: '🏆', label: '랭크' },
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
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}