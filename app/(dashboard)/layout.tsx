'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Building2,
  Brain,
  Plug,
  Settings,
  ChevronDown,
  LogOut,
  Globe,
  Menu,
  X,
  Briefcase,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lang, setLang] = useState<'ES' | 'EN'>('ES');
  const [collapsed, setCollapsed] = useState(false);
  const [unit, setUnit] = useState('Google Business Unit');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-72'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {!collapsed && (
              <>
                <Image
                  src="/WB_Orange_Logo.png"
                  alt="MagNode Logo"
                  width={46}
                  height={46}
                  className="rounded-sm"
                />
                <span
                  className="font-[600] text-gray-900 text-xl"
                  style={{ fontFamily: 'Syne, sans-serif' }}
                >
                  MagNode
                </span>
              </>
            )}
            {collapsed && (
              <Image
                src="/WB_Orange_Logo.png"
                alt="MagNode Logo"
                width={28}
                height={28}
                className="rounded-sm"
              />
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 text-gray-500 hover:text-orange-600 transition-colors"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Business Unit Selector */}
        {!collapsed && (
          <div className="px-4 mt-4">
            <div className="relative">
              <button
                className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 hover:border-orange-500 transition"
                onClick={() => console.log('open unit selector')}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  <span>{unit}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 mt-2">
          {[
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Departamentos', href: '/departments', icon: Building2 },
            { name: 'Studio', href: '/studio', icon: Brain },
            { name: 'Plataformas', href: '/platforms', icon: Plug },
            { name: 'Configuración', href: '/settings', icon: Settings },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div></div>

          <div className="flex items-center gap-6">
            {/* Language Selector */}
            <div
              className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer hover:text-orange-600"
              onClick={() => setLang(lang === 'ES' ? 'EN' : 'ES')}
            >
              <Globe className="w-4 h-4" />
              <span>{lang}</span>
              <ChevronDown className="w-3 h-3" />
            </div>

            {/* User info */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                C
              </div>
              <div className="text-sm leading-tight">
                <p className="font-medium text-gray-900">Carlos</p>
                <p className="text-xs text-gray-500">COO</p>
              </div>
            </div>

            {/* Logout */}
            <button
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
              onClick={() => console.log('logout')}
            >
              <LogOut className="w-4 h-4" />
              <span>Finalizar sesión</span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
