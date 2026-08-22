'use client';

/**
 * ============================================================================
 * HALAMAN: Pesanan & Live Tracking Status (src/app/notifications/page.tsx)
 * DESKRIPSI: Dikonversikan secara presisi 100% dari ekspor Stitch MCP HTML/Tailwind
 *            (Fixed Header, Live Tracking Header dengan Pulsing Countdown Timer,
 *            5-Stage Status Stepper Card dengan active line transition,
 *            Visual Rute Pengiriman, Rincian Pesanan & Pembayaran COD/QRIS,
 *            Grid Riwayat Pesanan Terakhir 3-Kolom, dan Modal Struk/Nota).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, AdminOrder } from '@/context/DataContext';
import { 
  Search, 
  Bell, 
  ShoppingBag, 
  User, 
  Receipt, 
  CookingPot, 
  ShoppingBag as BagIcon, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  FileText, 
  ArrowRight, 
  X, 
  Printer, 
  CreditCard,
  Utensils,
  Store,
  Navigation,
  Bike,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { orders, customerConfirmOrder } = useData();
  const { totalCartCount } = useCart();

  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<AdminOrder | null>(null);
  const [showDeliveryMapModal, setShowDeliveryMapModal] = useState<boolean>(false);
  const [countdownMinutes, setCountdownMinutes] = useState<number>(18);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(45);

  // Timer countdown realtime untuk live tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prevSec) => {
        if (prevSec > 0) return prevSec - 1;
        setCountdownMinutes((prevMin) => (prevMin > 0 ? prevMin - 1 : 0));
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentUserEmail = (user?.email || '').toLowerCase().trim();
  const currentUserId = user?.uid || '';
  const currentUserName = (user?.displayName || '').toLowerCase().trim();

  // Saring pesanan murni milik user yang sedang login secara realtime
  const myOrders = (orders || []).filter(order => {
    if (!user) return false;
    const orderEmail = (order.customerEmail || '').toLowerCase().trim();
    const orderUserId = order.userId || '';
    const orderName = (order.customerName || '').toLowerCase().trim();

    return (
      (orderUserId && orderUserId === currentUserId) ||
      (currentUserEmail && orderEmail === currentUserEmail) ||
      (currentUserEmail && orderEmail.includes(currentUserEmail)) ||
      (currentUserName && orderName === currentUserName)
    );
  });

  // Helper timestamp parser untuk mengurutkan pesanan dari yang paling baru ke yang lama
  const getOrderTimestamp = (ord: AdminOrder): number => {
    if (typeof ord.createdAt === 'number' && ord.createdAt > 0) return ord.createdAt;
    if ((ord.createdAt as any)?.seconds) return (ord.createdAt as any).seconds * 1000;
    if ((ord.createdAt as any)?.toDate) return (ord.createdAt as any).toDate().getTime();
    
    // Parse order ID jika numerik (misal NFK-987654 atau ORD-88218)
    const numFromId = parseInt((ord.id || '').replace(/\D/g, ''), 10);
    if (!isNaN(numFromId) && numFromId > 0) {
      return numFromId;
    }
    
    return 0;
  };

  // Urutkan pesanan dari yang paling baru ke yang lama (Newest First)
  const sortedMyOrders = [...myOrders].sort((a, b) => {
    const timeA = getOrderTimestamp(a);
    const timeB = getOrderTimestamp(b);
    if (timeA !== timeB) return timeB - timeA;
    return (b.id || '').localeCompare(a.id || '');
  });

  const hasOrders = sortedMyOrders.length > 0;

  // Temukan pesanan aktif
  const activeOrder = hasOrders 
    ? (sortedMyOrders.find(o => o.id === selectedOrderId) || sortedMyOrders[0])
    : null;

  // Helper untuk menentukan status tahap 1-5
  const getStageIndex = (status?: string, isConfirmed?: boolean) => {
    if (isConfirmed || status === 'COMPLETED' || status === 'DELIVERED') return 5;
    switch (status) {
      case 'RECEIVED':
      case 'PENDING':
        return 1;
      case 'COOKING':
        return 2;
      case 'READY':
        return 3;
      case 'DELIVERING':
      case 'ON_DELIVERY':
      case 'SHIPPING':
        return 4;
      default:
        return 2;
    }
  };

  const currentStage = activeOrder ? getStageIndex(activeOrder.status, activeOrder.customerConfirmed) : 1;
  const activeLineHeightPercent = currentStage === 1 ? '0%' : currentStage === 2 ? '33%' : currentStage === 3 ? '58%' : currentStage === 4 ? '80%' : '100%';
  const isOrderCompleted = activeOrder ? (activeOrder.status === 'COMPLETED' || activeOrder.customerConfirmed || currentStage === 5) : false;

  const userAvatar = user?.photoURL || (user?.displayName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=25160E&color=ffffff&bold=true` : (user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=25160E&color=ffffff&bold=true` : null));

  return (
    <div className="bg-[#fcf8fa] font-sans text-[#1b1b1d] min-h-screen selection:bg-stone-900 selection:text-white flex flex-col justify-between">
      
      <div>
        {/* 1. FIXED HEADER SESUAI STITCH MCP */}
        <header className="fixed top-0 w-full z-50 bg-[#fcf8fa]/90 backdrop-blur-xl border-b border-stone-200 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
            
            {/* Brand Wordmark (Left) */}
            <div className="flex-1 flex items-center font-serif text-2xl tracking-widest text-black font-bold">
              <Link href="/">NEFAKKY</Link>
            </div>

            {/* Desktop Navigation (Centered) */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link href="/" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Beranda
              </Link>
              <Link href="/menu" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Menu
              </Link>
              <Link href="/comments" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Ulasan Rasa
              </Link>
              <Link href="/notifications" className="text-black font-bold text-sm transition-colors">
                Pesanan
              </Link>
            </nav>

            {/* Right Action Icons & Profile (Right) */}
            <div className="flex-1 flex items-center justify-end gap-6">
              <div className="relative flex items-center">
                <Link href="/cart" className="text-stone-600 hover:text-black transition-colors" title="Keranjang">
                  <ShoppingBag className="w-5 h-5" />
                </Link>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 bg-black text-white text-[10px] font-bold rounded-full">
                    {totalCartCount}
                  </span>
                )}
              </div>

              <Link 
                href={user ? "/profile" : "/login"}
                className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:bg-neutral-800 transition-colors overflow-hidden cursor-pointer"
              >
                {userAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </Link>
            </div>

          </div>
        </header>

        {/* 2. MAIN TRACKING CONTENT ATAU EMPTY STATE */}
        <main className="w-full pt-20">
          <div className="flex flex-col w-full bg-[#fcf8fa] text-[#1b1b1d]">
            
            {!hasOrders || !activeOrder ? (
              /* EMPTY STATE: Muncul jika akun belum melakukan pembelian / uji coba checkout */
              <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400 border border-stone-200 shadow-2xs">
                  <ShoppingBag className="w-8 h-8 text-stone-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900">
                    Belum Ada Pesanan Aktif
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 font-light max-w-md mx-auto leading-relaxed">
                    {user
                      ? 'Akun Anda belum memiliki transaksi pembelian. Silakan lakukan pemesanan hidangan di katalog menu untuk melacak status pesanan secara realtime di sini.'
                      : 'Silakan masuk ke akun Anda terlebih dahulu untuk melihat dan melacak pesanan realtime.'}
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  {user ? (
                    <Link
                      href="/menu"
                      className="bg-[#25160E] hover:bg-black text-white text-xs font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <span>Eksplorasi Menu Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="bg-[#25160E] hover:bg-black text-white text-xs font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* REALTIME ORDER TRACKING DASHBOARD */
              <>
                {/* 1. TOP HEADER: ESTIMATED ARRIVAL & TITLE */}
                <div className="max-w-7xl mx-auto px-6 w-full pt-8 pb-4 text-left">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-stone-200 pb-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {isOrderCompleted ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold tracking-wider uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>PESANAN SELESAI • TIBA DI TUJUAN TEPAT WAKTU</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold tracking-wider uppercase">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                            <span className="font-mono text-xs">{String(countdownMinutes).padStart(2, '0')}:{String(countdownSeconds).padStart(2, '0')}</span>
                            <span>ESTIMATED ARRIVAL</span>
                          </div>
                        )}
                      </div>
                      <h1 className="font-serif text-3xl sm:text-4xl text-black font-bold tracking-tight">
                        Pesanan Kuliner Anda <span className="font-mono text-xl sm:text-2xl text-stone-500 font-normal">#{activeOrder.id}</span>
                      </h1>
                    </div>

                    {/* Order Switcher Pills jika akun memiliki lebih dari 1 transaksi */}
                    {sortedMyOrders.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                        <span className="text-[11px] font-semibold text-stone-500 shrink-0">Pilih Pesanan:</span>
                        {sortedMyOrders.map((ord) => (
                          <button
                            key={ord.id}
                            onClick={() => setSelectedOrderId(ord.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                              activeOrder?.id === ord.id
                                ? 'bg-[#25160E] text-amber-300 shadow-xs'
                                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            <span>#{ord.id}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full uppercase ${
                              ord.customerConfirmed ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                            }`}>
                              {ord.customerConfirmed ? 'SELESAI' : ord.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. GRID 2-KOLOM (KIRI: STATUS PESANAN, KANAN: PETA, RINCIAN, PEMBAYARAN) */}
                <div className="max-w-7xl mx-auto px-6 w-full py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Kolom Kiri: Live Tracking Status & Stepper 5-Tahap */}
                  <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                    
                    {/* Main Status Tracker Card */}
                    <div className="bg-white shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden border border-stone-200">
                      
                      {/* Subtle Radar SVG Graphic */}
                      <svg className="absolute top-0 right-0 w-64 h-64 text-stone-100 opacity-60 -translate-y-1/4 translate-x-1/4 pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="2"></circle>
                        <circle cx="50" cy="50" fill="none" r="30" stroke="currentColor" strokeDasharray="4 4" strokeWidth="2"></circle>
                        <path d="M50 10 L50 90 M10 50 L90 50" opacity="0.5" stroke="currentColor" strokeWidth="1"></path>
                      </svg>

                      <div className="relative z-10">
                        <h2 className="font-serif text-xl sm:text-2xl font-bold text-black mb-6">
                          Status Pesanan
                        </h2>

                        <div className="flex flex-col gap-6 relative">
                          {/* Vertical Background Line */}
                          <div className="absolute left-[19px] top-[24px] bottom-[24px] w-[2px] bg-stone-200 z-0"></div>
                          
                          {/* Active Vertical Line Transition */}
                          <div 
                            className="absolute left-[19px] top-[24px] w-[2px] bg-black z-0 transition-all duration-700 ease-in-out"
                            style={{ height: activeLineHeightPercent }}
                          ></div>

                          {/* Stage 1: Receipt */}
                          <div className={`flex gap-4 items-start relative z-10 ${currentStage < 1 ? 'opacity-40' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${currentStage >= 1 ? 'bg-black text-white' : 'bg-stone-100 text-stone-400 border border-stone-200'}`}>
                              <Receipt className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5 pt-0.5">
                              <span className="font-bold text-sm text-black">Pesanan Diterima</span>
                              <span className="text-xs text-stone-500 font-light">Restoran sedang memeriksa dan mengonfirmasi pesanan Anda.</span>
                              <span className="font-mono text-[11px] text-stone-400 mt-0.5">12:30 PM</span>
                            </div>
                          </div>

                          {/* Stage 2: Cooking */}
                          <div className={`flex gap-4 items-start relative z-10 ${currentStage < 2 ? 'opacity-40' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${currentStage >= 2 ? 'bg-black text-white' : 'bg-stone-100 text-stone-400 border border-stone-200'}`}>
                              <CookingPot className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5 pt-0.5">
                              <span className="font-bold text-sm text-black">Sedang Dimasak</span>
                              <span className="text-xs text-stone-500 font-light">Koki sedang menyiapkan hidangan Anda dengan sepenuh hati di dapur.</span>
                              <span className="font-mono text-[11px] text-stone-400 mt-0.5">12:35 PM</span>
                            </div>
                          </div>

                          {/* Stage 3: Ready */}
                          <div className={`flex gap-4 items-start relative z-10 ${currentStage < 3 ? 'opacity-40' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              currentStage === 3
                                ? 'bg-white border-2 border-black text-black'
                                : currentStage > 3
                                ? 'bg-black text-white'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            }`}>
                              <BagIcon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5 pt-0.5">
                              <span className="font-bold text-sm text-black">Menunggu Kurir</span>
                              <span className="text-xs text-stone-500 font-light">Pesanan telah dibungkus rapi, menunggu kurir mengambil paket.</span>
                            </div>
                          </div>

                          {/* Stage 4: On Delivery */}
                          <div className={`flex gap-4 items-start relative z-10 ${currentStage < 4 ? 'opacity-40' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              currentStage === 4
                                ? 'bg-white border-2 border-black text-black'
                                : currentStage > 4
                                ? 'bg-black text-white'
                                : 'bg-stone-100 text-stone-400 border border-stone-200'
                            }`}>
                              <Truck className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5 pt-0.5">
                              <span className="font-bold text-sm text-black">Dalam Perjalanan</span>
                              <span className="text-xs text-stone-500 font-light">Kurir sedang meluncur menuju ke lokasi alamat tujuan Anda.</span>
                            </div>
                          </div>

                          {/* Stage 5: Completed */}
                          <div className={`flex gap-4 items-start relative z-10 ${currentStage < 5 ? 'opacity-40' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${currentStage === 5 ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400 border border-stone-200'}`}>
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col gap-0.5 pt-0.5">
                              <span className="font-bold text-sm text-black">Pesanan Selesai</span>
                              <span className="text-xs text-stone-500 font-light">Selamat menikmati hidangan lezat dan hangat dari Nefakky!</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* KOTAK INTERAKTIF: WAJIB KONFIRMASI PENERIMAAN OLEH PENGGUNA */}
                    {activeOrder && !activeOrder.customerConfirmed && (activeOrder.status === 'DELIVERING' || activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'SHIPPING' || activeOrder.status === 'READY') && (
                      <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/80 border-2 border-amber-400/80 rounded-2xl shadow-sm flex flex-col gap-3.5 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Truck className="w-5 h-5 animate-bounce" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded-full uppercase tracking-wider">
                              Konfirmasi Penerimaan
                            </span>
                            <h3 className="font-serif text-base font-bold text-neutral-900">
                              Pesanan Telah Tiba di Lokasi Anda?
                            </h3>
                            <p className="text-xs text-stone-600 font-light leading-relaxed">
                              Karyawan Nefakky telah mengantarkan pesanan ke alamat Anda. Silakan klik tombol di bawah untuk mengonfirmasi bahwa hidangan telah Anda terima dengan baik & tepat waktu.
                            </p>
                          </div>
                        </div>

                        {activeOrder.paymentMethod?.toLowerCase().includes('cod') && activeOrder.paymentBadge !== 'PAID' && (
                          <div className="p-2.5 bg-amber-100/90 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center gap-2">
                            <span>💵 <strong>Pembayaran COD:</strong> Pastikan Anda telah menyerahkan uang pas sebesar <strong>Rp {(activeOrder.total || 0).toLocaleString('id-ID')}</strong> kepada kurir.</span>
                          </div>
                        )}

                        <button
                          onClick={() => customerConfirmOrder(activeOrder.id)}
                          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Konfirmasi Pesanan Telah Sampai (Tiba Tepat Waktu)</span>
                        </button>
                      </div>
                    )}

                    {/* BANNER STATUS PESANAN SELESAI */}
                    {(isOrderCompleted || activeOrder?.customerConfirmed) && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl shadow-xs flex items-center gap-3 animate-fade-in">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <h4 className="font-serif text-sm font-bold text-emerald-950">
                            Pesanan Selesai • Diterima Tepat Waktu
                          </h4>
                          <p className="text-xs text-emerald-800 font-light">
                            Dikonfirmasi diterima oleh Anda ({activeOrder?.confirmedAt || 'Hari ini'}). Selamat menikmati hidangan otentik Nefakky!
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Kolom Kanan: Peta Rute, Rincian Pesanan & Info Pembayaran */}
                  <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                    
                    {/* 1. Visual Rute Pengiriman (Interaktif: Sesuai Tema Web Nefakky) */}
                    <div 
                      onClick={() => setShowDeliveryMapModal(true)}
                      className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm flex flex-col justify-between gap-4 cursor-pointer group hover:shadow-md transition-all"
                      title="Klik untuk melihat animasi rute kurir pengiriman"
                    >
                      {/* Header Kartu Rute */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-[#934B19] uppercase tracking-wider block">
                            RUTE PENGIRIMAN
                          </span>
                          <h4 className="font-serif text-sm sm:text-base font-bold text-neutral-900 line-clamp-1 mt-0.5 group-hover:text-[#934B19] transition-colors">
                            {activeOrder.address || 'Puri Bojong Lestari 1 -> Alamat Anda'}
                          </h4>
                        </div>

                        {isOrderCompleted ? (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Pesanan Selesai</span>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>Live Delivery</span>
                          </div>
                        )}
                      </div>

                      {/* Mini Map Canvas Animasi yang Selaras dengan Web */}
                      <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-stone-200/90 bg-[#FDFBF7] shadow-inner">
                        <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Warm Street Grid */}
                          <rect width="500" height="200" fill="#FAF7F2" />
                          <path d="M0,40 H500 M0,80 H500 M0,120 H500 M0,160 H500" stroke="#EFE9E0" strokeWidth="1" strokeDasharray="4 4" />
                          <path d="M50,0 V200 M125,0 V200 M200,0 V200 M275,0 V200 M350,0 V200 M425,0 V200" stroke="#EFE9E0" strokeWidth="1" strokeDasharray="4 4" />

                          {/* Route Road Canvas */}
                          <path d="M 60,150 C 130,80 180,160 260,80 C 330,10 390,130 440,60" stroke="#E8D8C8" strokeWidth="10" strokeLinecap="round" />
                          <path d="M 60,150 C 130,80 180,160 260,80 C 330,10 390,130 440,60" stroke="#934B19" strokeWidth="4" strokeLinecap="round" />
                          <path d="M 60,150 C 130,80 180,160 260,80 C 330,10 390,130 440,60" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" />

                          {/* Start Node: Dapur Utama */}
                          <g transform="translate(60, 150)">
                            <circle r="16" fill="#934B19" fillOpacity="0.2" className={isOrderCompleted ? '' : 'animate-ping'} />
                            <circle r="12" fill="#25160E" stroke="#F59E0B" strokeWidth="2" />
                            <text y="3" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">Dapur</text>
                          </g>
                          <text x="60" y="180" textAnchor="middle" fill="#25160E" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Dapur Utama</text>

                          {/* End Node: Customer Destination */}
                          <g transform="translate(440, 60)">
                            <circle r="16" fill="#10B981" fillOpacity="0.2" className={isOrderCompleted ? '' : 'animate-ping'} />
                            <circle r="12" fill="#064E3B" stroke="#34D399" strokeWidth="2" />
                            <text y="3" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">Tujuan</text>
                          </g>
                          <text x="440" y="88" textAnchor="middle" fill="#064E3B" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Alamat Anda</text>

                          {/* Courier Icon: Bergerak saat proses, Diam di tujuan saat selesai */}
                          {isOrderCompleted ? (
                            <g transform="translate(440, 60)">
                              <circle r="18" fill="#10B981" fillOpacity="0.25" />
                              <circle r="13" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                              <g transform="translate(-6, -6) scale(0.5)">
                                <path d="M20 6L9 17l-5-5" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </g>
                            </g>
                          ) : (
                            <g>
                              <animateMotion 
                                dur="6s" 
                                repeatCount="indefinite" 
                                rotate="auto"
                                path="M 60,150 C 130,80 180,160 260,80 C 330,10 390,130 440,60" 
                              />
                              <circle r="14" fill="#F59E0B" fillOpacity="0.3" className="animate-ping" />
                              <circle r="10" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                              <g transform="translate(-5, -5) scale(0.45)">
                                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h1" fill="none" stroke="#1A1816" strokeWidth="3" strokeLinecap="round" />
                                <circle cx="7" cy="17" r="3.5" fill="#1A1816" />
                                <circle cx="17" cy="17" r="3.5" fill="#1A1816" />
                              </g>
                            </g>
                          )}
                        </svg>

                        {/* Floating live speed / Completed status */}
                        {isOrderCompleted ? (
                          <div className="absolute bottom-2.5 left-2.5 bg-emerald-50/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Pesanan Telah Tiba & Diterima</span>
                          </div>
                        ) : (
                          <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-200/80 flex items-center gap-1.5 text-[10px] font-semibold text-neutral-700 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#934B19] animate-pulse" />
                            <span>Kurir OTW (~35 km/j)</span>
                          </div>
                        )}
                      </div>

                      {/* Footer Kartu Rute */}
                      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                        <span className="text-xs text-stone-500 font-light flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{isOrderCompleted ? 'Pengantaran Telah Selesai' : 'Estimasi ~15-20 Menit (4.2 Km)'}</span>
                        </span>

                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowDeliveryMapModal(true); }}
                          className="px-3.5 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-semibold text-xs transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-300" />
                          <span>Lihat Peta Penuh</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. Rincian Pesanan (Item Summary) */}
                    <div className="bg-white shadow-sm rounded-2xl p-6 flex flex-col gap-4 border border-stone-200">
                      <h3 className="font-semibold text-xs text-black uppercase tracking-wider mb-1">
                        Rincian Pesanan
                      </h3>

                      {activeOrder.items && activeOrder.items.map((item: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                                  src={item.image || '/images/ayam_bakar.jpg'} 
                                  alt={item.name} 
                                />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs sm:text-sm text-black">{item.name}</span>
                                <span className="text-[11px] text-stone-500 font-light">
                                  {item.notes || 'Pilihan kuliner otentik Nefakky.'}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end text-right shrink-0">
                              <span className="font-mono font-bold text-xs text-black">
                                Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}
                              </span>
                              <span className="font-mono text-stone-400 text-[11px]">x{item.quantity || 1}</span>
                            </div>
                          </div>

                          {idx < activeOrder.items.length - 1 && (
                            <div className="w-full h-[1px] bg-stone-100 my-2"></div>
                          )}
                        </div>
                      ))}

                      {/* Rincian Rinci: Subtotal, Ongkir, Diskon */}
                      <div className="w-full h-[1px] bg-stone-200 my-1"></div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-stone-500 font-light">
                          <span>Subtotal Menu</span>
                          <span className="font-mono font-medium text-neutral-800">
                            Rp {(activeOrder.subtotal || activeOrder.items?.reduce((a: number, c: any) => a + ((c.price || 0) * (c.quantity || 1)), 0) || 0).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex justify-between text-stone-500 font-light">
                          <span>Ongkos Kirim ({activeOrder.distance || 'Jarak <10 Km'})</span>
                          <span className="font-mono font-medium text-neutral-800">
                            Rp {(activeOrder.shippingCost || 10000).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {activeOrder.discount && activeOrder.discount > 0 ? (
                          <div className="flex justify-between text-emerald-700 font-medium">
                            <span>Diskon Promo {activeOrder.voucherCode ? `(${activeOrder.voucherCode})` : ''}</span>
                            <span className="font-mono font-bold">-Rp {activeOrder.discount.toLocaleString('id-ID')}</span>
                          </div>
                        ) : null}
                      </div>

                      <div className="w-full h-[1px] bg-stone-200 my-1"></div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="font-semibold text-xs sm:text-sm text-black">Total Pembayaran</span>
                        <span className="font-serif text-lg sm:text-xl font-bold text-[#934B19]">
                          Rp {(activeOrder.total || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* 3. Delivery & Payment Info Box */}
                    <div className="bg-[#131b2e] text-white p-6 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden">
                      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                        <CreditCard className="w-28 h-28" />
                      </div>
                      
                      <div className="flex flex-col gap-0.5 z-10">
                        <span className="font-mono text-[11px] text-amber-300 uppercase tracking-widest">
                          Metode Pembayaran
                        </span>
                        <span className="font-serif text-lg font-bold text-white">
                          {activeOrder.paymentMethod || 'Tunai (COD)'}
                        </span>
                      </div>

                      <div className="bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-sm z-10">
                        <span className="font-semibold text-[10px] text-amber-200 uppercase tracking-wider">
                          {activeOrder.paymentBadge === 'PAID' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
                        </span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 3. GRID RIWAYAT PESANAN TERAKHIR (HISTORY GRID) */}
                <div className="w-full bg-[#f6f3f5] py-12 border-t border-stone-200 mt-8">
                  <div className="max-w-7xl mx-auto px-6 flex flex-col gap-6 text-left">
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-black">
                          Riwayat Pesanan Terakhir
                        </h2>
                        <p className="text-xs text-stone-500 font-light mt-1">Daftar transaksi kuliner yang telah Anda lakukan sebelumnya.</p>
                      </div>
                    </div>

                    {/* Grid 3-Kolom History Card (Urut dari Terbaru ke Terlama) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedMyOrders.map((histOrder: any) => (
                        <div 
                          key={histOrder.id}
                          onClick={() => {
                            setSelectedOrderId(histOrder.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`bg-white rounded-2xl p-6 shadow-sm border transition-all cursor-pointer flex flex-col justify-between gap-4 group hover:shadow-md ${
                            activeOrder?.id === histOrder.id ? 'border-[#934B19] ring-2 ring-[#934B19]/20 shadow-md' : 'border-stone-200 hover:border-stone-300'
                          }`}
                          title="Klik untuk memantau status pesanan ini di Live Tracker"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <span className="font-mono font-bold text-xs text-black group-hover:text-[#934B19] transition-colors">
                                #{histOrder.id}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                histOrder.status === 'COMPLETED' || histOrder.status === 'DELIVERED' || histOrder.customerConfirmed
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : histOrder.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {histOrder.customerConfirmed || histOrder.status === 'COMPLETED' || histOrder.status === 'DELIVERED' ? 'COMPLETED' : histOrder.status}
                              </span>
                            </div>

                            <span className="font-mono text-[11px] text-stone-400 font-light">
                              {histOrder.date || 'Hari ini'}
                            </span>

                            <div className="flex flex-col gap-1">
                              {histOrder.items && histOrder.items.map((it: any, i: number) => (
                                <span key={i} className="text-xs text-stone-600 line-clamp-1">
                                  {it.quantity}x {it.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Footer: Price & PDF Invoice Button */}
                          <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                            <span className="font-mono font-bold text-xs text-black group-hover:text-[#934B19] transition-colors">
                              Rp {(histOrder.total || histOrder.subtotal || 0).toLocaleString('id-ID')}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReceipt(histOrder);
                              }}
                              className="text-black hover:bg-stone-100 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                              title="Lihat Struk PDF"
                            >
                              <FileText className="w-4 h-4 text-stone-700" />
                              <span>Struk</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      {/* 5. MODAL STRUK NOTA INVOICE DIGITAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left animate-fade-in border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-black">Struk Resmi Nefakky</h3>
                <p className="text-[11px] text-stone-400 font-mono">Invoice #{selectedReceipt.id}</p>
              </div>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-full text-stone-400 hover:text-black hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1.5 font-light text-stone-600">
              <p><strong>Pelanggan:</strong> {selectedReceipt.customerName}</p>
              <p><strong>Alamat:</strong> {selectedReceipt.address}</p>
              <p><strong>Waktu:</strong> {selectedReceipt.date || 'Hari ini'}</p>
              <p><strong>Metode Pembayaran:</strong> {selectedReceipt.paymentMethod || 'Tunai (COD)'}</p>
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-2">
              <span className="font-semibold text-xs text-black block">Menu Dipesan:</span>
              {selectedReceipt.items && selectedReceipt.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-mono font-medium">Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            {/* Rincian Rinci Struk */}
            <div className="border-t border-stone-200 pt-3 space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal Menu:</span>
                <span className="font-mono">Rp {(selectedReceipt.subtotal || selectedReceipt.items?.reduce((a: number, c: any) => a + ((c.price || 0) * (c.quantity || 1)), 0) || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim:</span>
                <span className="font-mono">Rp {(selectedReceipt.shippingCost || 0).toLocaleString('id-ID')}</span>
              </div>
              {selectedReceipt.discount && selectedReceipt.discount > 0 ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Diskon Promo:</span>
                  <span className="font-mono">-Rp {selectedReceipt.discount.toLocaleString('id-ID')}</span>
                </div>
              ) : null}
            </div>

            <div className="border-t border-dashed border-stone-300 pt-3 flex justify-between items-center text-sm font-bold text-black">
              <span>Total Bayar:</span>
              <span className="font-serif text-base text-[#934B19]">
                Rp {(selectedReceipt.total || 0).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-black text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Nota</span>
              </button>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="px-4 bg-stone-100 text-black text-xs font-semibold py-2.5 rounded-xl hover:bg-stone-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL ANIMASI RUTE PENGIRIMAN REALTIME (SESUAI TEMA WEB NEFAKKY) */}
      {showDeliveryMapModal && activeOrder && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCF8FA] text-neutral-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-stone-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-2xl bg-amber-100/90 border border-amber-200 flex items-center justify-center text-[#934B19]">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-neutral-900">
                    Live Tracking Rute Kurir
                  </h3>
                  <p className="text-xs text-stone-500 font-mono">
                    Pesanan #{activeOrder.id} • Estimasi ~15 Menit (4.2 Km)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeliveryMapModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Canvas Animasi SVG Rute Perjalanan Kurir yang Terang & Elegan */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-stone-200 bg-[#FDFBF7] shadow-inner">
              <svg className="w-full h-72 sm:h-80" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Street Grid Background */}
                <rect width="600" height="300" fill="#FAF7F2" />
                <path d="M0,50 H600 M0,100 H600 M0,150 H600 M0,200 H600 M0,250 H600" stroke="#EFE9E0" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M50,0 V300 M150,0 V300 M250,0 V300 M350,0 V300 M450,0 V300 M550,0 V300" stroke="#EFE9E0" strokeWidth="1" strokeDasharray="4 4" />

                {/* Highway Road Base */}
                <path d="M 80,220 C 160,140 220,240 320,130 C 400,40 480,180 520,80" stroke="#E8D8C8" strokeWidth="14" strokeLinecap="round" />
                <path d="M 80,220 C 160,140 220,240 320,130 C 400,40 480,180 520,80" stroke="#934B19" strokeWidth="6" strokeLinecap="round" />
                <path d="M 80,220 C 160,140 220,240 320,130 C 400,40 480,180 520,80" stroke="#FDE68A" strokeWidth="2" strokeDasharray="8 6" strokeLinecap="round" />

                {/* Start Node: Dapur Utama */}
                <g transform="translate(80, 220)">
                  <circle r="22" fill="#934B19" fillOpacity="0.2" className="animate-ping" />
                  <circle r="16" fill="#25160E" stroke="#F59E0B" strokeWidth="2.5" />
                  <text y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">Dapur</text>
                </g>
                <text x="80" y="260" textAnchor="middle" fill="#25160E" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Dapur Utama Nefakky</text>
                <text x="80" y="275" textAnchor="middle" fill="#78716C" fontSize="9" fontFamily="sans-serif">Puri Bojong Lestari 1</text>

                {/* End Node: Customer Destination */}
                <g transform="translate(520, 80)">
                  <circle r="22" fill="#10B981" fillOpacity="0.2" className="animate-ping" />
                  <circle r="16" fill="#064E3B" stroke="#34D399" strokeWidth="2.5" />
                  <text y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">Tujuan</text>
                </g>
                <text x="520" y="118" textAnchor="middle" fill="#064E3B" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Alamat Anda</text>
                <text x="520" y="132" textAnchor="middle" fill="#78716C" fontSize="9" fontFamily="sans-serif">{activeOrder.address ? activeOrder.address.slice(0, 22) + '...' : 'Lokasi Pengiriman'}</text>

                          {/* Animated Courier / Delivery Driver Moving Along Route ATAU Selesai di Tujuan */}
                          {isOrderCompleted ? (
                            <g transform="translate(520, 80)">
                              <circle r="24" fill="#10B981" fillOpacity="0.25" />
                              <circle r="17" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
                              <g transform="translate(-8, -8) scale(0.65)">
                                <path d="M20 6L9 17l-5-5" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              </g>
                            </g>
                          ) : (
                            <g>
                              <animateMotion 
                                dur="7s" 
                                repeatCount="indefinite" 
                                rotate="auto"
                                path="M 80,220 C 160,140 220,240 320,130 C 400,40 480,180 520,80" 
                              />
                              <circle r="20" fill="#F59E0B" fillOpacity="0.3" className="animate-ping" />
                              <circle r="14" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                              <g transform="translate(-7, -7) scale(0.6)">
                                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h1" fill="none" stroke="#1A1816" strokeWidth="3" strokeLinecap="round" />
                                <circle cx="7" cy="17" r="3.5" fill="#1A1816" />
                                <circle cx="17" cy="17" r="3.5" fill="#1A1816" />
                              </g>
                            </g>
                          )}
                        </svg>

                        {/* Floating Live Telemetry Badge */}
                        {isOrderCompleted ? (
                          <div className="absolute top-3 left-3 bg-emerald-50/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-2 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[11px] font-semibold text-emerald-800">
                              Status: Pesanan Telah Sampai di Alamat Tujuan
                            </span>
                          </div>
                        ) : (
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200 flex items-center gap-2 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-[#934B19] animate-pulse" />
                            <span className="text-[11px] font-semibold text-neutral-800">
                              Kurir Meluncur: Kecepatan ~35 km/jam
                            </span>
                          </div>
                        )}
                      </div>

            {/* Courier & Telemetry Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#934B19]">Titik Keberangkatan:</span>
                <p className="text-xs font-semibold text-neutral-900">Dapur Utama Nefakky</p>
                <p className="text-[11px] text-stone-500 font-light leading-relaxed">Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Bojong Gede, Bogor</p>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Alamat Tujuan Pengantaran:</span>
                <p className="text-xs font-semibold text-neutral-900">{activeOrder.customerName || 'Pelanggan'}</p>
                <p className="text-[11px] text-stone-500 font-light leading-relaxed">{activeOrder.address || 'Alamat Lengkap Pengiriman Pelanggan'}</p>
              </div>
            </div>

            {/* Driver Profile & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-stone-200">
              <div className="flex items-center gap-3 w-full sm:w-auto text-left">
                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-[#934B19] font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Karyawan Nefakky</h4>
                  <span className="text-[11px] text-stone-500">Pengantaran Langsung dari Dapur Resto</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=Puri+Bojong+Lestari+1+Blok+AF+41+Bojong+Gede+Bogor&destination=${encodeURIComponent(activeOrder.address || 'Bogor')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none py-2.5 px-4 bg-[#934B19] hover:bg-[#7a3e14] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Buka Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <button
                  onClick={() => setShowDeliveryMapModal(false)}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-neutral-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
