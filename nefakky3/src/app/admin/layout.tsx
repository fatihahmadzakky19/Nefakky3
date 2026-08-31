'use client';

/**
 * ============================================================================
 * LAYOUT: AdminLayout (src/app/admin/layout.tsx)
 * DESKRIPSI: Kerangka tata letak terpadu untuk seluruh sub-halaman panel Admin Command Center.
 *            Menyediakan:
 *            1. Bilah samping (AdminSidebar) dengan penghitung pesanan & pesan belum dibaca
 *            2. Bilah atas (AdminHeader) dengan kontrol cetak PDF, ekspor CSV, dan CS Live Chat
 *            3. Audio chime synthesizer & floating toast notification otomatis saat ada pesan masuk
 *            4. Proteksi layar loading autentikasi
 * ============================================================================
 */

// Mengimpor React dan hooks state, effect, ref, dan memo
import React, { useState, useEffect, useRef, useMemo } from 'react';
// Mengimpor hook useRouter Next.js untuk navigasi dinamis
import { useRouter } from 'next/navigation';
// Mengimpor AuthContext untuk membaca sesi admin yang sedang login
import { useAuth } from '@/context/AuthContext';
// Mengimpor DataContext untuk membaca pesanan, produk, dan pesan chat
import { useData, ChatMessage } from '@/context/DataContext';
// Mengimpor modul utilitas pembuat file spreadsheet laporan keuangan
import { exportNefakkyExcelReport } from '@/lib/exportUtils';
// Mengimpor komponen sidebar admin
import AdminSidebar from '@/components/admin/AdminSidebar';
// Mengimpor komponen header admin
import AdminHeader from '@/components/admin/AdminHeader';
// Mengimpor ikon-ikon semantik dari Lucide React
import { MessageCircle, X, ArrowRight } from 'lucide-react';

/**
 * Komponen Utama: AdminLayout
 */
export default function AdminLayout({
  children // Komponen anak (halaman rute admin aktif yang sedang dirender)
}: {
  children: React.ReactNode;
}) {
  // Inisialisasi hook router Next.js
  const router = useRouter();
  // Mengambil state sesi pengguna dan status loading dari AuthContext
  const { user, loading } = useAuth();
  // Mengambil data pesanan, produk, dan pesan chat dari DataContext
  const { orders, products, chatMessages } = useData();

  // State untuk mengontrol visibilitas drawer sidebar pada layar smartphone
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // State untuk menyimpan data pesan chat terbaru yang memicu floating toast
  const [latestChatNotification, setLatestChatNotification] = useState<ChatMessage | null>(null);

  // Ref untuk melacak jumlah pesan sebelumnya guna mendeteksi pesan baru secara realtime
  const prevChatCountRef = useRef<number>((chatMessages || []).length);

  /**
   * Memoize: Menyaring seluruh pesan pelanggan yang belum dibaca oleh admin
   */
  const unreadMessagesList = useMemo(() => {
    return (chatMessages || []).filter(
      m => m.sender === 'user' && m.readByAdmin === false
    );
  }, [chatMessages]);

  // Menghitung total jumlah pesan belum dibaca
  const unreadChatCount = unreadMessagesList.length;

  /**
   * Fungsi: Memainkan audio synth chime secara instan saat pesan baru masuk tanpa file audio eksternal
   */
  const playNotificationSound = () => {
    try {
      // Inisialisasi Web Audio API Context
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator(); // Buat osilator suara
      const gain = audioCtx.createGain(); // Buat pengontrol volume

      osc.type = 'sine'; // Gelombang sinus murni yang lembut
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // Nada D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // Nada A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime); // Volume awal
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3); // Fade out lembut

      osc.connect(gain); // Sambungkan osilator ke node gain
      gain.connect(audioCtx.destination); // Sambungkan ke output speaker

      osc.start(); // Mulai suara
      osc.stop(audioCtx.currentTime + 0.3); // Hentikan suara setelah 300ms
    } catch (e) {
      // Tangani jika browser memblokir audio sebelum interaksi
    }
  };

  /**
   * Effect Realtime: Memantau pesan masuk baru dan memicu toast mengambang serta audio notifikasi
   */
  useEffect(() => {
    if (!chatMessages) return;
    // Saring pesan yang dikirim oleh pelanggan dan belum dibaca admin
    const currentUnreadUserMsgs = chatMessages.filter(m => m.sender === 'user' && m.readByAdmin === false);

    if (currentUnreadUserMsgs.length > 0) {
      const newestMsg = currentUnreadUserMsgs[currentUnreadUserMsgs.length - 1];
      // Jika jumlah pesan bertambah dari sebelumnya, aktifkan notifikasi
      if (chatMessages.length > prevChatCountRef.current) {
        setLatestChatNotification(newestMsg);
        playNotificationSound();
      }
    }
    // Perbarui referensi jumlah pesan
    prevChatCountRef.current = chatMessages.length;
  }, [chatMessages]);

  // Menghitung jumlah pesanan yang masih pending atau baru diterima
  const pendingOrdersCount = (orders || []).filter(
    o => o.status === 'PENDING' || o.status === 'RECEIVED'
  ).length;

  /**
   * Handler: Ekspor data pesanan dan katalog ke file Microsoft Excel
   */
  const handleExportCSV = () => {
    exportNefakkyExcelReport(orders || [], products || []);
  };

  /**
   * Handler: Cetak laporan admin via printer PDF
   */
  const handlePrintPDFReport = () => {
    window.print();
  };

  // Tampilkan layar spinner loading jika status autentikasi masih diverifikasi
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160e] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#4f4540] font-medium tracking-wide">Memuat Panel Administrator...</p>
      </div>
    );
  }

  return (
    // Kontainer utama seluruh layout panel admin
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans selection:bg-[#934b19]/10 selection:text-[#934b19] relative">
      
      {/* 1. SIDEBAR NAVIGASI ADMIN */}
      <AdminSidebar 
        pendingOrdersCount={pendingOrdersCount} 
        unreadChatCount={unreadChatCount}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. AREA KONTEN UTAMA DENGAN OFFSET SIDEBAR */}
      <div className="pl-0 lg:pl-72 print:pl-0 transition-all duration-300">
        
        {/* HEADER ATAS DENGAN KONTROL & BREADCRUMB */}
        <AdminHeader
          onPrintPDF={handlePrintPDFReport}
          onExportCSV={handleExportCSV}
          managerName={user?.displayName || 'Fatih Ahmad Zakky'}
          managerRole="Store Manager"
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          unreadChatCount={unreadChatCount}
          unreadMessagesList={unreadMessagesList}
        />

        {/* AREA BODY UNTUK HALAMAN SUB-ROUTE */}
        <main className="pt-20 px-4 sm:px-8 pb-24 max-w-[1280px] mx-auto space-y-8 print:pt-4 print:px-4">
          {children}
        </main>
      </div>

      {/* 3. FLOATING TOAST NOTIFIKASI PESAN MASUK REALTIME */}
      {latestChatNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#25160E] text-white rounded-3xl p-4 shadow-2xl border-2 border-amber-500/40 animate-fade-in">
          {/* Baris Header Notifikasi */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#934B19] text-white flex items-center justify-center font-bold text-sm shrink-0">
                <MessageCircle className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    💬 Pesan Baru CS
                  </span>
                  <span className="text-[10px] text-stone-400">{latestChatNotification.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-amber-100 mt-1">
                  {latestChatNotification.userName || latestChatNotification.userEmail.split('@')[0]}
                </h4>
              </div>
            </div>
            {/* Tombol Tutup Notifikasi */}
            <button 
              onClick={() => setLatestChatNotification(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuplikan Teks Pesan Chat */}
          <p className="text-xs text-stone-300 font-light mt-2 line-clamp-2 bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
            "{latestChatNotification.text}"
          </p>

          {/* Tombol Aksi: Buka Meja Chat */}
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                setLatestChatNotification(null);
                router.push(`/admin/chat?chat=${encodeURIComponent(latestChatNotification.userEmail)}`);
              }}
              className="px-4 py-2 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Balas Chat Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
