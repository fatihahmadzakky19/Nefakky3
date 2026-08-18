'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Box,
  Ticket,
  Star,
  Settings,
  Store,
  X
} from 'lucide-react';

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

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenOnMobile && (
        <div 
          className="fixed inset-0 z-50 bg-[#25160e]/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-72 bg-[#f5f3ef] z-50 flex flex-col pt-8 border-r border-amber-900/10 shadow-xl print:hidden transition-transform duration-300 ${
        isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Sidebar Brand Header */}
        <div className="px-6 sm:px-8 flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25160e] text-white flex items-center justify-center font-bold font-serif text-xl shadow-md">
              N
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#25160e] block leading-none">Nefakky</span>
              <span className="text-[10px] text-[#934b19] font-bold uppercase tracking-widest block mt-1">Admin Command Desk</span>
            </div>
          </div>

          {/* Close button for mobile */}
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-[#4f4540] hover:bg-[#eae8e4] lg:hidden"
            aria-label="Close Admin Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <Link
            href="/admin"
            onClick={onCloseMobile}
            className={`w-full flex items-center px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              isNavActive('/admin')
                ? 'bg-[#3c2a21] text-amber-200 shadow-md'
                : 'text-[#4f4540] hover:bg-[#eae8e4] hover:text-[#25160e]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mr-3.5 shrink-0" />
            <span>Ringkasan Bisnis</span>
          </Link>

          <Link
            href="/admin/orders"
            onClick={onCloseMobile}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              isNavActive('/admin/orders')
                ? 'bg-[#3c2a21] text-amber-200 shadow-md'
                : 'text-[#4f4540] hover:bg-[#eae8e4] hover:text-[#25160e]'
            }`}
          >
            <div className="flex items-center">
              <ShoppingBag className="w-4 h-4 mr-3.5 shrink-0" />
              <span>Pesanan Masuk</span>
            </div>
            {pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 bg-[#934b19] text-white text-[10px] rounded-full font-bold">
                {pendingOrdersCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/products"
            onClick={onCloseMobile}
            className={`w-full flex items-center px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              isNavActive('/admin/products')
                ? 'bg-[#3c2a21] text-amber-200 shadow-md'
                : 'text-[#4f4540] hover:bg-[#eae8e4] hover:text-[#25160e]'
            }`}
          >
            <Box className="w-4 h-4 mr-3.5 shrink-0" />
            <span>Katalog Produk</span>
          </Link>

          <Link
            href="/admin/promotions"
            onClick={onCloseMobile}
            className={`w-full flex items-center px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              isNavActive('/admin/promotions')
                ? 'bg-[#3c2a21] text-amber-200 shadow-md'
                : 'text-[#4f4540] hover:bg-[#eae8e4] hover:text-[#25160e]'
            }`}
          >
            <Ticket className="w-4 h-4 mr-3.5 shrink-0" />
            <span>Voucher &amp; Promo</span>
          </Link>

          <Link
            href="/admin/reviews"
            onClick={onCloseMobile}
            className={`w-full flex items-center px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              isNavActive('/admin/reviews')
                ? 'bg-[#3c2a21] text-amber-200 shadow-md'
                : 'text-[#4f4540] hover:bg-[#eae8e4] hover:text-[#25160e]'
            }`}
          >
            <Star className="w-4 h-4 mr-3.5 shrink-0" />
            <span>Moderasi Ulasan</span>
          </Link>

          <Link
            href="/admin/settings"
            onClick={onCloseMobile}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
              isNavActive('/admin/settings')
                ? 'bg-[#3c2a21] text-amber-200 shadow-md'
                : 'text-[#4f4540] hover:bg-[#eae8e4] hover:text-[#25160e]'
            }`}
          >
            <div className="flex items-center">
              <Settings className="w-4 h-4 mr-3.5 shrink-0" />
              <span>Pengaturan &amp; CS Chat</span>
            </div>
            {unreadChatCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] rounded-full font-bold animate-pulse shadow-sm">
                {unreadChatCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Sidebar Footer Link */}
        <div className="p-5 border-t border-amber-900/10">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-bold text-[#934b19] hover:underline"
          >
            <Store className="w-4 h-4" />
            <span>Kembali ke Toko</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

