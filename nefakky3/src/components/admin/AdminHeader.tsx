'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminHeader.tsx (Bilah Navigasi Atas Panel Admin Command Center)
 * DESKRIPSI: Bilah header atas tetap (fixed header) untuk dashboard administrator.
 *            Menyediakan breadcrumb navigasi rute aktif, tombol cetak PDF & ekspor CSV/Excel,
 *            notifikasi popover pesan CS Live Chat masuk, serta profil admin & tombol logout.
 * ============================================================================
 */

// Mengimpor React dan hook useState untuk pengelolaan status dropdown popover
import React, { useState } from 'react';
// Mengimpor Link dari Next.js untuk navigasi antar halaman admin
import Link from 'next/link';
// Mengimpor hook navigasi Next.js untuk membaca rute aktif (usePathname) dan redirect (useRouter)
import { useRouter, usePathname } from 'next/navigation';
// Mengimpor hook AuthContext untuk membaca sesi admin dan fungsi logout
import { useAuth } from '@/context/AuthContext';
// Mengimpor ikon-ikon semantik dari Lucide React
import { Menu, LogOut, MessageCircle, ArrowRight, Printer, FileSpreadsheet } from 'lucide-react';
// Mengimpor tipe data pesan chat dari DataContext
import { ChatMessage } from '@/context/DataContext';

/**
 * Interface properti komponen AdminHeader
 */
interface AdminHeaderProps {
  onPrintPDF: () => void; // Handler untuk memicu cetak laporan PDF
  onExportCSV: () => void; // Handler untuk memicu ekspor laporan ke format Excel/CSV
  managerName?: string; // Nama pengelola/admin yang sedang login
  managerRole?: string; // Peran hak akses admin (e.g. "Enterprise Level")
  onToggleMobileSidebar?: () => void; // Handler buka/tutup sidebar pada layar smartphone
  unreadChatCount?: number; // Jumlah total pesan chat yang belum dibaca dari pelanggan
  unreadMessagesList?: ChatMessage[]; // Daftar objek pesan chat pelanggan yang belum dibaca
}

/**
 * Komponen Utama: AdminHeader
 */
export default function AdminHeader({
  onPrintPDF,
  onExportCSV,
  managerName = 'Admin User',
  managerRole = 'Enterprise Level',
  onToggleMobileSidebar,
  unreadChatCount = 0,
  unreadMessagesList = []
}: AdminHeaderProps) {
  // Inisialisasi router navigasi Next.js
  const router = useRouter();
  // Membaca path URL saat ini untuk menentukan judul halaman
  const pathname = usePathname();
  // Mengambil objek user dan fungsi logout dari AuthContext
  const { user, logout } = useAuth();
  // State untuk menampilkan atau menyembunyikan dropdown popover pesan chat
  const [showChatDropdown, setShowChatDropdown] = useState<boolean>(false);

  /**
   * Fungsi Helper: Menentukan judul header halaman berdasarkan path URL saat ini
   */
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Tinjauan Bisnis';
    if (pathname.startsWith('/admin/orders')) return 'Kitchen Desk (Pesanan Masuk)';
    if (pathname.startsWith('/admin/products') || pathname.startsWith('/admin/menu')) return 'Katalog Produk';
    if (pathname.startsWith('/admin/promotions')) return 'Voucher & Promosi';
    if (pathname.startsWith('/admin/reviews')) return 'Moderasi Ulasan';
    if (pathname.startsWith('/admin/chat')) return 'Meja Pelayanan CS Live Chat';
    if (pathname.startsWith('/admin/reports')) return 'Laporan Keuangan & Omset';
    if (pathname.startsWith('/admin/pos')) return 'Point of Sale (POS Bazar)';
    if (pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/store-settings')) return 'Pengaturan Toko & Peta';
    return 'Tinjauan Bisnis';
  };

  /**
   * Handler: Konfirmasi dan eksekusi keluar sesi admin (Logout)
   */
  const handleLogout = async () => {
    // Tampilkan konfirmasi kepada pengguna sebelum mengakhiri sesi
    if (confirm('Apakah Anda yakin ingin keluar (log out) dari panel admin?')) {
      await logout(); // Panggil fungsi logout dari AuthContext
      router.push('/login'); // Arahkan kembali ke halaman login
    }
  };

  return (
    // Header navigasi fixed di bagian atas
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/20 z-40 flex items-center justify-between px-4 sm:px-8 print:hidden">
      
      {/* Sisi Kiri: Tombol Hamburger Mobile & Breadcrumbs Rute Aktif */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Tombol pembuka sidebar drawer pada layar tablet/mobile */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-on-surface hover:bg-surface-container lg:hidden transition-colors cursor-pointer"
          aria-label="Toggle Mobile Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Teks Breadcrumb Navigasi */}
        <div className="flex items-center gap-2 text-xs">
          <Link 
            href="/admin"
            className="text-on-surface-variant font-body-sm uppercase tracking-widest text-[11px] hover:text-[#934B19] hover:font-bold transition-colors"
            title="Kembali ke Dashboard Utama"
          >
            Dashboard
          </Link>
          {/* Ikon pemisah panah kanan */}
          <span className="material-symbols-outlined text-outline text-[16px]">
            chevron_right
          </span>
          {/* Judul halaman yang aktif saat ini */}
          <span className="font-headline-sm text-on-surface text-xs sm:text-sm font-bold truncate">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Sisi Kanan: Tombol Cetak PDF, Ekspor CSV/Excel, Notifikasi Chat, & Profil Admin */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Tombol Cetak Laporan PDF */}
        <button 
          onClick={onPrintPDF}
          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
          title="Cetak Laporan PDF"
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Tombol Unduh Laporan Spreadsheet Excel / CSV */}
        <button 
          onClick={onExportCSV}
          className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors cursor-pointer"
          title="Unduh Laporan Excel / CSV"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>

        {/* Notifikasi CS Live Chat Masuk (Dengan Popover Dropdown) */}
        <div className="relative">
          {/* Tombol pemicu dropdown notifikasi chat */}
          <button 
            onClick={() => setShowChatDropdown(!showChatDropdown)}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors relative cursor-pointer"
            title="Notifikasi CS Live Chat"
          >
            <MessageCircle className="w-4 h-4 text-on-tertiary-fixed-variant" />
            {/* Badge merah berkedip jika ada pesan yang belum dibaca */}
            {unreadChatCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-error text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse border border-white">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Kotak Dropdown Popover Daftar Pesan Chat Terbaru */}
          {showChatDropdown && (
            <div 
              className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 animate-fade-in text-left"
              onClick={() => setShowChatDropdown(false)}
            >
              {/* Header Popover Chat */}
              <div className="p-3.5 bg-primary text-on-primary flex items-center justify-between">
                <span className="text-xs font-bold font-serif text-tertiary-fixed flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-tertiary-fixed" />
                  <span>Notifikasi Chat Pelanggan ({unreadChatCount})</span>
                </span>
              </div>

              {/* Daftar item pesan belum dibaca */}
              <div className="max-h-72 overflow-y-auto divide-y divide-surface-container">
                {unreadMessagesList.length === 0 ? (
                  <p className="text-xs text-on-surface-variant p-4 text-center">Tidak ada pesan belum dibaca.</p>
                ) : (
                  unreadMessagesList.map((m) => (
                    <div 
                      key={m.id}
                      onClick={() => router.push(`/admin/chat?chat=${encodeURIComponent(m.userEmail)}`)}
                      className="p-3 hover:bg-surface-container transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-on-surface truncate">{m.userName || m.userEmail.split('@')[0]}</span>
                        <span className="text-[10px] text-on-surface-variant">{m.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">"{m.text}"</p>
                    </div>
                  ))
                )}
              </div>
              
              {/* Footer Popover: Tombol Buka Meja Chat Lengkap */}
              <div className="p-2.5 bg-surface-container-low border-t border-outline-variant/10 text-center">
                <button
                  onClick={() => router.push('/admin/chat')}
                  className="text-xs font-bold text-on-tertiary-fixed-variant hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Meja Pelayanan CS Live Chat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Profil & Tombol Logout Admin */}
        <div className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-outline-variant/30">
          {/* Label Nama & Role Admin (Terlihat di layar desktop) */}
          <div className="text-right hidden sm:block">
            <p className="font-label-caps text-on-surface leading-none mb-1 text-[11px]">
              {user?.displayName || managerName}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase font-medium">
              {managerRole}
            </p>
          </div>

          {/* Foto Avatar Admin */}
          <Link 
            href="/admin"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs cursor-pointer hover:ring-2 hover:ring-[#934B19]/50 transition-all shadow-sm overflow-hidden"
            title="Dashboard Administrator"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Admin" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            )}
          </Link>

          {/* Tombol Keluar (Logout) */}
          <button
            onClick={handleLogout}
            className="p-1.5 text-error hover:bg-error/10 rounded-xl transition-colors hidden md:flex items-center gap-1 text-xs font-bold cursor-pointer ml-1"
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
