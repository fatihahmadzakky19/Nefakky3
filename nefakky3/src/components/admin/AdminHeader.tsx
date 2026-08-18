import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Printer, FileSpreadsheet, Menu, LogOut, MessageCircle, ArrowRight } from 'lucide-react';
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
  managerName = 'Fatih Ahmad Zakky',
  managerRole = 'Store Manager',
  onToggleMobileSidebar,
  unreadChatCount = 0,
  unreadMessagesList = []
}: AdminHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [showChatDropdown, setShowChatDropdown] = useState<boolean>(false);

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar (log out) dari panel admin?')) {
      await logout();
      router.push('/login');
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#fbf9f5]/85 backdrop-blur-xl border-b border-amber-900/10 z-40 flex items-center justify-between px-4 sm:px-8 print:hidden">
      {/* Mobile Toggle Button & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-[#25160e] hover:bg-stone-200/60 lg:hidden transition-colors"
          aria-label="Toggle Mobile Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-serif font-bold text-lg text-[#25160e] lg:hidden">
          Nefakky Admin
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Tombol & Popover Notifikasi Chat Pelanggan */}
        <div className="relative">
          <button 
            onClick={() => setShowChatDropdown(!showChatDropdown)}
            className="p-2 text-[#4f4540] hover:text-[#25160e] hover:bg-stone-100 rounded-full transition-colors relative cursor-pointer"
            title="Notifikasi CS Live Chat"
          >
            <MessageCircle className="w-5 h-5 text-[#934b19]" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse border border-white">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* DROPDOWN POPOVER CS LIVE CHAT */}
          {showChatDropdown && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-amber-900/15 overflow-hidden z-50 animate-fade-in"
              onClick={() => setShowChatDropdown(false)}
            >
              <div className="p-3.5 bg-[#25160e] text-white flex items-center justify-between">
                <span className="text-xs font-bold font-serif text-amber-200 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Notifikasi Chat Pelanggan ({unreadChatCount})</span>
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                {unreadMessagesList.length === 0 ? (
                  <p className="text-xs text-stone-400 p-4 text-center">Tidak ada pesan belum dibaca.</p>
                ) : (
                  unreadMessagesList.map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => router.push(`/admin/settings?chat=${encodeURIComponent(m.userEmail)}`)}
                      className="p-3 hover:bg-stone-50 transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#25160e] truncate">{m.userName || m.userEmail.split('@')[0]}</span>
                        <span className="text-[10px] text-stone-400">{m.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 truncate">"{m.text}"</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-[#fbf9f5] border-t border-stone-100 text-center">
                <button
                  onClick={() => router.push('/admin/settings')}
                  className="text-xs font-bold text-[#934b19] hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Meja Pelayanan CS Live Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={onPrintPDF}
          className="p-2 text-[#4f4540] hover:text-[#25160e] hover:bg-stone-100 rounded-full transition-colors relative"
          title="Cetak Laporan PDF"
        >
          <Printer className="w-5 h-5" />
        </button>
        <button 
          onClick={onExportCSV}
          className="p-2 text-[#4f4540] hover:text-[#25160e] hover:bg-stone-100 rounded-full transition-colors relative"
          title="Unduh Laporan Excel / CSV"
        >
          <FileSpreadsheet className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3 pl-3 sm:pl-4 border-l border-amber-900/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#1b1c1a] leading-none">{managerName}</p>
            <p className="text-[10px] text-[#4f4540] font-medium mt-0.5">{managerRole}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#25160e] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {managerName.charAt(0)}
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 rounded-xl transition-colors flex items-center gap-1 text-xs font-bold"
            title="Keluar / Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}

