'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminSidebar.tsx (Bilah Samping Command Center Admin)
 * TEMA: Modern Culinary Business Dashboard — Editorial & Data-Focused
 * ============================================================================
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, X, ArrowUpRight } from 'lucide-react';
import { 
  BarChart3, 
  ShoppingBag, 
  CookingPot, 
  Megaphone, 
  Star, 
  MessageSquare, 
  Settings 
} from '@/components/icons/CustomIcons';

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

  const navGroups = [
    {
      groupTitle: 'OVERVIEW',
      items: [
        {
          href: '/admin',
          label: 'Business Overview',
          Icon: BarChart3,
          badge: null
        }
      ]
    },
    {
      groupTitle: 'OPERATIONS',
      items: [
        {
          href: '/admin/products',
          label: 'Katalog Produk',
          Icon: ShoppingBag,
          badge: null
        },
        {
          href: '/admin/orders',
          label: 'Dapur & Pesanan',
          Icon: CookingPot,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : null
        }
      ]
    },
    {
      groupTitle: 'MARKETING',
      items: [
        {
          href: '/admin/promotions',
          label: 'Kupon & Promosi',
          Icon: Megaphone,
          badge: null
        }
      ]
    },
    {
      groupTitle: 'CUSTOMER',
      items: [
        {
          href: '/admin/reviews',
          label: 'Moderasi Ulasan',
          Icon: Star,
          badge: null
        },
        {
          href: '/admin/chat',
          label: 'CS Live Desk',
          Icon: MessageSquare,
          badge: unreadChatCount > 0 ? unreadChatCount : null
        }
      ]
    },
    {
      groupTitle: 'SYSTEM',
      items: [
        {
          href: '/admin/settings',
          label: 'Pengaturan & GPS',
          Icon: Settings,
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div 
          className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-72 bg-[#0F141C] z-50 flex flex-col pt-6 pb-6 border-r border-stone-800/80 shadow-xl print:hidden transition-transform duration-300 ease-out ${
        isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Sidebar Brand Header */}
        <div className="px-6 mb-6 flex items-center justify-between">
          <Link href="/admin" className="flex flex-col group select-none">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-extrabold tracking-wider text-white group-hover:text-[#C2410C] transition-colors uppercase leading-none">
                NEFAKKY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]"></span>
            </div>
            <span className="text-[10px] tracking-widest text-stone-400 font-semibold uppercase mt-1 font-mono">
              Command Studio
            </span>
          </Link>

          {/* Close button for mobile */}
          <button 
            onClick={onCloseMobile}
            className="w-10 h-10 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/80 flex items-center justify-center lg:hidden cursor-pointer transition-colors"
            aria-label="Tutup Navigasi Admin"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links grouped hierarchically */}
        <nav className="flex-1 px-3 space-y-4 overflow-y-auto no-scrollbar">
          {navGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
                {group.groupTitle}
              </p>

              {group.items.map((item) => {
                const active = isNavActive(item.href);
                const Icon = item.Icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold group ${
                      active
                        ? 'bg-stone-800/90 text-white border-l-2 border-[#C2410C] shadow-2xs'
                        : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? 'text-[#C2410C]' : 'text-stone-500 group-hover:text-stone-300'
                      }`} />
                      <span className="tracking-wide">
                        {item.label}
                      </span>
                    </div>

                    {item.badge !== null && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full font-mono ${
                        item.href === '/admin/chat' 
                          ? 'bg-rose-500/90 text-white animate-pulse' 
                          : active 
                            ? 'bg-[#C2410C] text-white' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Link */}
        <div className="px-4 pt-4 border-t border-stone-800/80">
          <Link 
            href="/" 
            className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 hover:bg-stone-800 text-stone-300 hover:text-white transition-all text-xs font-semibold border border-stone-800 group"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-[#C2410C]" />
              <span>Lihat Toko Publik</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </aside>
    </>
  );
}
