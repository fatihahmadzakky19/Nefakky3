'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminSidebar.tsx (Bilah Samping Command Center Admin)
 * TEMA: Nordic Citrus & Deep Obsidian
 * ============================================================================
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, X, ArrowUpRight, Sparkles } from 'lucide-react';

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
      label: 'Business Overview',
      icon: 'analytics',
      badge: null
    },
    {
      href: '/admin/products',
      label: 'Katalog Produk',
      icon: 'inventory_2',
      badge: null
    },
    {
      href: '/admin/orders',
      label: 'Dapur & Pesanan',
      icon: 'countertops',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null
    },
    {
      href: '/admin/promotions',
      label: 'Kupon & Promosi',
      icon: 'campaign',
      badge: null
    },
    {
      href: '/admin/reviews',
      label: 'Moderasi Ulasan',
      icon: 'reviews',
      badge: null
    },
    {
      href: '/admin/chat',
      label: 'CS Live Desk',
      icon: 'forum',
      badge: unreadChatCount > 0 ? unreadChatCount : null
    },
    {
      href: '/admin/settings',
      label: 'Pengaturan & GPS',
      icon: 'settings',
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-72 bg-[#0B0F19] z-50 flex flex-col pt-7 pb-6 border-r border-slate-800 shadow-2xl print:hidden transition-transform duration-300 ${
        isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Sidebar Brand Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <Link href="/admin" className="flex flex-col group select-none">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-black tracking-wider text-white group-hover:text-[#FF5400] transition-colors uppercase leading-none">
                NEFAKKY
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FF5400] animate-pulse"></span>
            </div>
            <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase mt-1 font-mono">
              Command Studio
            </span>
          </Link>

          {/* Close button for mobile */}
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
            Menu Kontrol
          </p>

          {navItems.map((item) => {
            const active = isNavActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-xs font-bold ${
                  active
                    ? 'bg-[#FF5400] text-white shadow-lg shadow-[#FF5400]/25'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span className="tracking-wide">
                    {item.label}
                  </span>
                </div>

                {item.badge !== null && (
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full font-mono ${
                    item.href === '/admin/chat' 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : active 
                        ? 'bg-white text-[#0B0F19]' 
                        : 'bg-[#FFB703] text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Link */}
        <div className="px-4 pt-4 border-t border-slate-800/80">
          <Link 
            href="/" 
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-bold border border-slate-700/50 group"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-[#FFB703]" />
              <span>Lihat Toko Publik</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </aside>
    </>
  );
}
