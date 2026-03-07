'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/assessment', label: 'Assessment' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/recommendations', label: 'Recommendations' },
  { href: '/learning-path', label: 'Learning Path' },
  { href: '/resume', label: 'Resume Builder' },
];

const PageNavigation = () => {
  const pathname = usePathname();

  return (
    <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800/60 p-3">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm transition ${
                isActive
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PageNavigation;
