'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminHeader.tsx (Bilah Navigasi Atas Command Center Admin)
 * TEMA: Modern Culinary Business Dashboard — Editorial & Data-Focused
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, ArrowRight, ChevronRight } from 'lucide-react';
import { User, LogOut, MessageCircle, Printer, FileSpreadsheet } from '@/components/icons/CustomIcons';
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
  managerRole = 'Store Manager',
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
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200 z-40 flex items-center justify-between px-4 sm:px-8 print:hidden shadow-2xs">
      
      {/* Sisi Kiri: Tombol Hamburger Mobile & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-700 hover:bg-stone-100 lg:hidden transition-colors cursor-pointer"
          aria-label="Buka Navigasi Admin"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <Link 
            href="/admin"
            className="text-stone-500 uppercase tracking-wider text-[11px] font-bold hover:text-[#C2410C] transition-colors font-mono"
            title="Kembali ke Dashboard Utama"
          >
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 text-xs sm:text-sm font-bold truncate">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Sisi Kanan: Action Controls & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        
        {/* Tombol Cetak PDF */}
        <button 
          type="button"
          onClick={onPrintPDF}
          className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          title="Cetak Laporan PDF"
          aria-label="Cetak Laporan PDF"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Tombol Ekspor Excel */}
        <button 
          type="button"
          onClick={onExportCSV}
          className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          title="Unduh Laporan Excel / CSV"
          aria-label="Unduh Laporan Excel / CSV"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>

        {/* Notifikasi CS Live Chat */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowChatDropdown(!showChatDropdown)}
            className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors relative cursor-pointer"
            title="Notifikasi CS Live Chat"
            aria-label="Notifikasi CS Live Chat"
          >
            <MessageCircle className="w-4 h-4 text-stone-600" />
            {unreadChatCount > 0 && (
              <span className="absolute 1.5 1.5 min-w-[16px] h-4 px-1 bg-[#C2410C] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Kotak Popover Chat */}
          {showChatDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowChatDropdown(false)} 
                aria-hidden="true"
              />
              <div 
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-fade-in text-left"
              >
                <div className="p-3.5 bg-stone-900 text-white flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-[#C2410C]" />
                    <span>Notifikasi Chat Pelanggan ({unreadChatCount})</span>
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                  {unreadMessagesList.length === 0 ? (
                    <p className="text-xs text-stone-500 p-4 text-center font-normal">Tidak ada pesan baru.</p>
                  ) : (
                    unreadMessagesList.map((m) => (
                      <div 
                        key={m.id}
                        onClick={() => {
                          setShowChatDropdown(false);
                          router.push(`/admin/chat?chat=${encodeURIComponent(m.userEmail)}`);
                        }}
                        className="p-3 hover:bg-stone-50 transition-colors cursor-pointer space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 truncate">{m.userName || m.userEmail.split('@')[0]}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{m.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-stone-600 truncate">"{m.text}"</p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChatDropdown(false);
                      router.push('/admin/chat');
                    }}
                    className="text-xs font-bold text-[#C2410C] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Live Chat Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Info Profil & Logout */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-stone-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-stone-900 leading-tight">
              {user?.displayName || managerName}
            </p>
            <p className="text-[10px] text-stone-500 uppercase font-mono font-medium">
              {managerRole}
            </p>
          </div>

          <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs overflow-hidden ring-1 ring-stone-300">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Admin Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-stone-300" />
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="h-8 px-2 text-stone-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors hidden md:flex items-center gap-1 text-xs font-medium cursor-pointer ml-1"
            title="Keluar (Log out)"
            aria-label="Keluar dari panel admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[11px]">Keluar</span>
          </button>
        </div>

      </div>
    </header>
  );
}
