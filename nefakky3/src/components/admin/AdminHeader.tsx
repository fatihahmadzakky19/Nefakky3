'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminHeader.tsx (Bilah Navigasi Atas Command Center Admin)
 * TEMA: Nordic Citrus & Deep Navy
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, LogOut, MessageCircle, ArrowRight, Printer, FileSpreadsheet, Sparkles, ChevronRight, User } from 'lucide-react';
import { ChatMessage } from '@/context/DataContext';

interface AdminHeaderProps {
  onPrintPDF: () => void;
  onExportCSV: () => void;
  managerName?: string;
  managerRole?: string;
  onToggleMobileSidebar?: () => void;
  unreadChatCount?: number;
  unreadMessagesList?: ChatMessage[];
}

export default function AdminHeader({
  onPrintPDF,
  onExportCSV,
  managerName = 'Admin User',
  managerRole = 'Enterprise Manager',
  onToggleMobileSidebar,
  unreadChatCount = 0,
  unreadMessagesList = []
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showChatDropdown, setShowChatDropdown] = useState<boolean>(false);

  const getPageTitle = () => {
    if (pathname === '/admin') return 'Business Overview';
    if (pathname.startsWith('/admin/orders')) return 'Kitchen Desk (Pesanan Masuk)';
    if (pathname.startsWith('/admin/products') || pathname.startsWith('/admin/menu')) return 'Katalog Produk';
    if (pathname.startsWith('/admin/promotions')) return 'Voucher & Promosi';
    if (pathname.startsWith('/admin/reviews')) return 'Moderasi Ulasan';
    if (pathname.startsWith('/admin/chat')) return 'Meja Pelayanan CS Live Chat';
    if (pathname.startsWith('/admin/reports')) return 'Laporan Keuangan & Omset';
    if (pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/store-settings')) return 'Pengaturan Toko & GPS';
    return 'Business Overview';
  };

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar (log out) dari panel admin?')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 z-40 flex items-center justify-between px-4 sm:px-8 print:hidden shadow-2xs">
      
      {/* Sisi Kiri: Tombol Hamburger Mobile & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-[#0F172A] hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle Mobile Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <Link 
            href="/admin"
            className="text-slate-500 uppercase tracking-wider text-[11px] font-bold hover:text-[#FF5400] transition-colors font-mono"
            title="Kembali ke Dashboard Utama"
          >
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#0F172A] text-xs sm:text-sm font-bold truncate">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Sisi Kanan: Action Controls & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Tombol Cetak PDF */}
        <button 
          onClick={onPrintPDF}
          className="p-2 text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Cetak Laporan PDF"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Tombol Ekspor Excel */}
        <button 
          onClick={onExportCSV}
          className="p-2 text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Unduh Laporan Excel / CSV"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>

        {/* Notifikasi CS Live Chat */}
        <div className="relative">
          <button 
            onClick={() => setShowChatDropdown(!showChatDropdown)}
            className="p-2 text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
            title="Notifikasi CS Live Chat"
          >
            <MessageCircle className="w-4 h-4 text-[#FF5400]" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-[#FF5400] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-xs">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Kotak Popover Chat */}
          {showChatDropdown && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in text-left"
              onClick={() => setShowChatDropdown(false)}
            >
              <div className="p-3.5 bg-[#0F172A] text-white flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#FFB703]" />
                  <span>Notifikasi Chat Pelanggan ({unreadChatCount})</span>
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {unreadMessagesList.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center font-light">Tidak ada pesan baru.</p>
                ) : (
                  unreadMessagesList.map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => router.push(`/admin/chat?chat=${encodeURIComponent(m.userEmail)}`)}
                      className="p-3 hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A] truncate">{m.userName || m.userEmail.split('@')[0]}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">"{m.text}"</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => router.push('/admin/chat')}
                  className="text-xs font-bold text-[#FF5400] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Live Chat Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Profil & Logout */}
        <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#0F172A] leading-tight">
              {user?.displayName || managerName}
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
              {managerRole}
            </p>
          </div>

          <div className="w-8 h-8 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-bold text-xs shadow-sm overflow-hidden ring-2 ring-[#FF5400]/20">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-[#FFB703]" />
            )}
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors hidden md:flex items-center gap-1 text-xs font-bold cursor-pointer ml-1"
            title="Keluar (Log out)"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Keluar</span>
          </button>
        </div>

      </div>
    </header>
  );
}
