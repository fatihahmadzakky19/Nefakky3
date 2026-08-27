'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, X } from 'lucide-react';

interface AdminSidebarProps {
  pendingOrdersCount?: number;
  unreadChatCount?: number;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  pendingOrdersCount = 0,
  unreadChatCount = 0,
  isOpenOnMobile = false,
  onCloseMobile
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isNavActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      href: '/admin',
      label: 'Business Overview (Dashboard)',
      icon: 'analytics',
      badge: null
    },
    {
      href: '/admin/products',
      label: 'Product Catalog',
      icon: 'inventory_2',
      badge: null
    },
    {
      href: '/admin/orders',
      label: 'Kitchen Desk',
      icon: 'countertops',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null
    },
    {
      href: '/admin/promotions',
      label: 'Promotions',
      icon: 'campaign',
      badge: null
    },
    {
      href: '/admin/reviews',
      label: 'Reviews',
      icon: 'reviews',
      badge: null
    },
    {
      href: '/admin/chat',
      label: 'CS Live Chat',
      icon: 'forum',
      badge: unreadChatCount > 0 ? unreadChatCount : null
    },
    {
      href: '/admin/settings',
      label: 'Store & Maps',
      icon: 'settings',
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div 
          className="fixed inset-0 z-50 bg-[#25160e]/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-72 bg-[#25160E] z-50 flex flex-col pt-8 pb-8 border-r border-white/10 shadow-2xl print:hidden transition-transform duration-300 ${
        isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Sidebar Brand Header */}
        <div className="px-8 mb-10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold font-serif text-xl border border-white/15 shadow-sm group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="font-['Playfair_Display'] text-[22px] font-bold tracking-tight text-white uppercase block">
              Nefakky Admin
            </span>
          </Link>

          {/* Close button for mobile */}
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-white/70 hover:bg-white/10 lg:hidden cursor-pointer"
            aria-label="Close Admin Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto" data-active-classes="bg-white/10 text-white font-bold">
          {navItems.map((item) => {
            const active = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-xs font-semibold ${
                  active
                    ? 'bg-white/10 text-white font-bold shadow-xs'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span className="font-label-caps uppercase tracking-wider text-[11px]">
                    {item.label}
                  </span>
                </div>

                {item.badge !== null && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    item.href === '/admin/chat' ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 text-black'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Link */}
        <div className="px-6 pt-5 border-t border-white/10">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span className="font-label-caps uppercase tracking-wider text-[11px]">Kembali ke Toko</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

