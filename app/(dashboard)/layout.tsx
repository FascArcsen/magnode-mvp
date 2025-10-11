'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Microscope, 
  Plug, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Departments', href: '/departments', icon: Users },
  { name: 'Studio', href: '/studio', icon: Microscope },
  { name: 'Platforms', href: '/platforms', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold">
              M
            </div>
            <span className="text-xl font-bold">MAGNODE</span>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-800">
          <div className="text-xs text-gray-400 mb-1">Organization</div>
          <div className="font-medium">Google Business Unit</div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-gray-800">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4">
            <div className="text-sm font-semibold mb-1">MagNode Pro</div>
            <div className="text-xs text-orange-100 mb-3">
              Aumenta tu capacidad operativa
            </div>
            <button className="w-full bg-white text-orange-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-orange-50 transition-colors">
              Obtener Pro
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-semibold">
                C
              </div>
              <div>
                <div className="text-sm font-medium">Carlos</div>
                <div className="text-xs text-gray-400">COO</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="ml-64">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Overview</span>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search here..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option>Eng (US)</option>
            </select>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}