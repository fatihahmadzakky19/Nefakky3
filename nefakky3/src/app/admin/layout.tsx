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
import { useData, ChatMessage, AdminOrder } from '@/context/DataContext';
// Mengimpor modul utilitas pembuat file spreadsheet laporan keuangan
import { exportNefakkyExcelReport } from '@/lib/exportUtils';
// Mengimpor komponen sidebar admin
import AdminSidebar from '@/components/admin/AdminSidebar';
// Mengimpor komponen header admin
import AdminHeader from '@/components/admin/AdminHeader';
import { X, ArrowRight, ShoppingBag } from 'lucide-react';
import { MessageCircle } from '@/components/icons/CustomIcons';

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
  const [latestOrderNotification, setLatestOrderNotification] = useState<AdminOrder | null>(null);

  // Ref untuk melacak jumlah pesan dan pesanan sebelumnya guna mendeteksi item baru secara realtime
  const prevChatCountRef = useRef<number>((chatMessages || []).length);
  const prevOrdersCountRef = useRef<number>((orders || []).length);

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
   * Fungsi: Memainkan audio bell lonceng dapur instan saat ada pesanan baru masuk
   */
  const playOrderChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.24); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.36); // C6

      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {}
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

  /**
   * Effect Realtime: Memantau pesanan baru masuk secara instan ke Kitchen Desk
   */
  useEffect(() => {
    if (!orders) return;
    if (orders.length > prevOrdersCountRef.current && prevOrdersCountRef.current > 0) {
      const newestOrder = orders[0];
      if (newestOrder && (newestOrder.status === 'RECEIVED' || newestOrder.status === 'PENDING')) {
        setLatestOrderNotification(newestOrder);
        playOrderChime();
      }
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders]);

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
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900 font-sans selection:bg-[#C2410C]/10 selection:text-[#C2410C] relative">
      
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
          managerName={user?.displayName || 'Store Manager'}
          managerRole="Store Manager"
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          unreadChatCount={unreadChatCount}
          unreadMessagesList={unreadMessagesList}
        />

        {/* AREA BODY UNTUK HALAMAN SUB-ROUTE */}
        <main className="pt-20 px-4 sm:px-8 pb-20 max-w-[1360px] mx-auto space-y-6 print:pt-4 print:px-4">
          {children}
        </main>
      </div>

      {/* 3. FLOATING TOAST NOTIFIKASI PESAN MASUK REALTIME */}
      {latestChatNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-stone-900 text-white rounded-2xl p-4 shadow-xl border border-stone-700/90 animate-fade-in">
          {/* Baris Header Notifikasi */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C2410C] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30 font-mono">
                    Pesan Baru CS
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">{latestChatNotification.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-1">
                  {latestChatNotification.userName || latestChatNotification.userEmail.split('@')[0]}
                </h4>
              </div>
            </div>
            {/* Tombol Tutup Notifikasi */}
            <button 
              onClick={() => setLatestChatNotification(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup notifikasi chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuplikan Teks Pesan Chat */}
          <p className="text-xs text-stone-300 font-normal mt-2 line-clamp-2 bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
            "{latestChatNotification.text}"
          </p>

          {/* Tombol Aksi: Buka Meja Chat */}
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                setLatestChatNotification(null);
                router.push(`/admin/chat?chat=${encodeURIComponent(latestChatNotification.userEmail)}`);
              }}
              className="px-3.5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Balas Chat Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. FLOATING TOAST NOTIFIKASI PESANAN MASUK REALTIME (KITCHEN DESK ALERT) */}
      {latestOrderNotification && (
        <div 
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-stone-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-4.5 backdrop-blur-xl animate-bounce-in"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ShoppingBag className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ⚡ Pesanan Baru Diterima
                </span>
                <h4 className="text-xs font-bold text-white mt-1">
                  {latestOrderNotification.customerName} ({latestOrderNotification.id})
                </h4>
              </div>
            </div>
            <button 
              onClick={() => setLatestOrderNotification(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup notifikasi pesanan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-stone-300 font-normal mt-2 bg-stone-950/70 p-2.5 rounded-xl border border-stone-800 flex justify-between items-center">
            <span>{latestOrderNotification.itemCount || (latestOrderNotification.items?.length || 1)} menu • {latestOrderNotification.paymentMethod}</span>
            <span className="font-bold text-emerald-400 font-mono-data">Rp {(latestOrderNotification.total || 0).toLocaleString('id-ID')}</span>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                setLatestOrderNotification(null);
                router.push('/admin/orders');
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Buka Kitchen Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
