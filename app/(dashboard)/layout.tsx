'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Beaker,
  Plug,
  BarChart2,
  Settings,
  LogOut,
} from 'lucide-react';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Departamentos', href: '/departments', icon: Users },
    { name: 'Studio', href: '/studio', icon: Beaker },
    { name: 'Plataformas', href: '/platforms', icon: Plug },
    { name: 'Insights Historicos', href: '/insights', icon: BarChart2 },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <html lang="es">
      <body className="m-0 p-0 bg-gray-50 text-gray-900">
        <div className="flex h-screen w-full overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white">
                M
              </div>
              <span className="font-bold text-lg text-gray-900">MagNode</span>
            </div>

            {/* Organization Selector */}
            <div className="px-6 mb-4">
              <select className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none">
                <option>Google Business Unit</option>
              </select>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all ${
                      isActive
                        ? 'bg-gray-100 text-gray-900 font-semibold'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-orange-500' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* MagNode Pro Banner */}
            <div className="mx-3 mb-6 p-3 bg-orange-500 rounded-xl text-center shadow-md">
              <div className="text-white text-sm font-semibold mb-1">
                MagNode Pro
              </div>
              <div className="text-white text-xs mb-2 opacity-90">
                Aumenta tu capacidad operativa
              </div>
              <button className="w-full bg-white text-orange-500 text-xs py-1.5 rounded-lg font-semibold hover:bg-gray-50">
                Obtener Pro
              </button>
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                  C
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Carlos</div>
                  <div className="text-xs text-gray-500">COO</div>
                </div>
              </div>
              <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-900 transition-colors">
                <LogOut className="w-3 h-3" />
                Finalizar sesión
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gray-50 relative z-10 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
