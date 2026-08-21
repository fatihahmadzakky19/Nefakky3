'use client';

/**
 * ============================================================================
 * HALAMAN: Realtime Lacak Status Pesanan 5-Tahap (src/app/notifications/page.tsx)
 * DESKRIPSI: Presisi 100% sesuai Google Stitch AI Design System & HTML Layout
 *            (Espresso #25160E, Terracotta #934B19, Warm Cream #FBF9F5).
 * FITUR: Stepper Alur 5-Tahap (Diterima -> Dimasak -> Siap -> Diantar -> Selesai),
 *        Penghitung Waktu Estimasi Live, & Informasi Kurir Pengantar.
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, AdminOrder, isVoucherValidNow } from '@/context/DataContext';
import { rtdb } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import Navbar from '@/components/Navbar';
import { 
  ShoppingBag, 
  Truck, 
  Receipt, 
  Tag, 
  Bell, 
  ArrowLeft, 
  ArrowRight, 
  X, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Utensils, 
  Check, 
  CreditCard 
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { orders, vouchers, updateOrderStatus } = useData();
  const { totalCartCount } = useCart();

  const [selectedReceipt, setSelectedReceipt] = useState<AdminOrder | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(1499);

  const currentUserEmail = (user?.email || '').toLowerCase();
  const currentUserName = (user?.displayName || '').toLowerCase();

  const getStatusPriority = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'PENDING':
        return 1; // Prioritas 1: Pesanan baru/pending (Paling Depan)
      case 'COOKING':
        return 2; // Prioritas 2: Sedang dimasak
      case 'READY':
        return 3; // Prioritas 3: Siap dijemput kurir
      case 'SHIPPING':
      case 'DELIVERING':
        return 4; // Prioritas 4: Dalam pengiriman
      case 'COMPLETED':
        return 5; // Prioritas 5: Selesai
      case 'CANCELLED':
        return 6; // Prioritas 6: Dibatalkan
      default:
        return 1;
    }
  };

  const userOrders = React.useMemo(() => {
    if (!user?.email) return [];
    const list = (orders || [])
      .filter(o => 
        (o.customerEmail && o.customerEmail.toLowerCase() === currentUserEmail) ||
        (o.userId && user.uid && o.userId === user.uid)
      );

    return list.sort((a, b) => {
      const prioA = getStatusPriority(a.status);
      const prioB = getStatusPriority(b.status);

      if (prioA !== prioB) {
        return prioA - prioB; // Uncompleted/Aktif (1..4) di depan Completed (5..6)
      }

      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return timeB - timeA; // Dalam grup status yang sama, urutkan dari terbaru ke terlama
    });
  }, [user, currentUserEmail, orders]);

  const displayOrdersList = userOrders;

  const activeOrder: AdminOrder | undefined = displayOrdersList.find(o => o.id === selectedOrderId) || displayOrdersList[0];

  const [liveRtdbStatus, setLiveRtdbStatus] = useState<string | null>(null);

  // Subscribe to Realtime Database for active order status
  React.useEffect(() => {
    if (!activeOrder?.id) return;
    const orderRef = ref(rtdb, `live_orders/${activeOrder.id}`);
    const unsub = onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val?.status) {
          setLiveRtdbStatus(val.status);
        }
      }
    });
    return () => unsub();
  }, [activeOrder?.id]);

  const currentStatus = liveRtdbStatus || activeOrder?.status || 'PENDING';

  // Real-time Countdown Timer Logic
  React.useEffect(() => {
    if (!activeOrder || currentStatus === 'COMPLETED') return;

    const createdTime = activeOrder.createdAt || Date.now();
    const now = Date.now();
    const elapsedSec = Math.floor((now - createdTime) / 1000);
    const totalSec = 1500; // 25 minutes target
    const remainingSec = Math.max(0, totalSec - (elapsedSec % totalSec));

    setSecondsLeft(remainingSec);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrder?.id, currentStatus, activeOrder?.createdAt]);

  const formatCountdown = (totalSec: number) => {
    if (currentStatus === 'COMPLETED') return 'PESANAN TIBA';
    if (totalSec <= 0) return '00:00 Mins';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const mm = String(mins).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return `${mm}:${ss} Mins`;
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'PENDING':
        return 1;
      case 'COOKING':
        return 2;
      case 'READY':
        return 3;
      case 'SHIPPING':
      case 'DELIVERING':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 2;
    }
  };

  const activeStepIndex = getStepIndex(currentStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160E] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#4F4540] font-medium">Memuat Status Lacak Pesanan...</p>
      </div>
    );
  }

  if (!user || displayOrdersList.length === 0 || !activeOrder) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans selection:bg-[#934B19]/10 selection:text-[#934B19] pb-28 lg:pb-12">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 bg-white border border-amber-900/10 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-amber-950/5">
            <Truck className="w-10 h-10 text-[#934B19] stroke-[1.5]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#25160E]">Belum Ada Status Pesanan</h1>
            <p className="text-xs text-[#4F4540] font-light leading-relaxed">
              Anda belum melakukan transaksi pemesanan makanan. Silakan pesan hidangan favorit Anda melalui katalog menu untuk memantau status pengiriman 5-tahap secara realtime!
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/menu"
              className="px-6 py-3.5 bg-[#25160E] hover:bg-[#3C2A21] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <span>Jelajahi Katalog Menu</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </Link>
            <Link
              href="/profile"
              className="px-6 py-3.5 bg-white text-[#25160E] hover:bg-stone-50 font-bold text-xs rounded-2xl border border-amber-900/15 shadow-sm transition-all inline-flex items-center gap-2 active:scale-95"
            >
              <span>Lihat Profil Saya</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans selection:bg-[#934B19]/10 selection:text-[#934B19] pb-28 lg:pb-12">
      
      {/* 1. BILAH NAVIGASI UTAMA */}
      <Navbar />

      {/* 2. KONTEN TRACKER UTAMA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-8">
        
        {/* Header Judul Live Tracker */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 w-full border-b border-amber-900/10 pb-5 sm:pb-6">
          <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#934B19]">LIVE TRACKING STATUS</span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#25160E]">Pesanan Kuliner Anda</h1>
            <p className="text-xs text-[#4F4540] font-medium flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Receipt className="w-4 h-4 text-[#934B19]" />
              <span>Order ID: <strong className="font-mono text-[#25160E]">#{activeOrder.id}</strong></span>
            </p>
          </div>

          {/* Countdown & Live Pulse */}
          <div className="flex items-center justify-between sm:justify-end gap-4 bg-white px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl border border-amber-900/10 shadow-xl w-full sm:w-auto">
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[10px] text-[#4F4540] font-medium">
                {currentStatus === 'COMPLETED' ? 'Status Pengiriman' : 'Estimasi Waktu Tiba'}
              </span>
              <span className={`font-mono text-lg sm:text-xl font-bold ${currentStatus === 'COMPLETED' ? 'text-emerald-600' : 'text-[#25160E]'}`}>
                {formatCountdown(secondsLeft)}
              </span>
            </div>
            <div className="relative flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStatus === 'COMPLETED' ? 'bg-emerald-500' : 'bg-[#934B19]'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${currentStatus === 'COMPLETED' ? 'bg-emerald-600' : 'bg-[#934B19]'}`}></span>
            </div>
          </div>
        </div>

        {/* MULTI-ORDER SELECTOR PILL TABS */}
        {displayOrdersList.length > 1 && (
          <div className="bg-white p-5 rounded-3xl border border-amber-900/10 shadow-lg space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#25160E] uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#934B19]" />
                <span>Daftar Pesanan Aktif Anda ({displayOrdersList.length} Transaksi):</span>
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {displayOrdersList.map((ord) => {
                const isActive = ord.id === activeOrder.id;
                return (
                  <button
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                      isActive
                        ? 'bg-[#25160E] text-white border-[#25160E] shadow-md ring-2 ring-[#934B19]/30'
                        : 'bg-[#FBF9F5] text-[#1B1C1A] border-amber-900/15 hover:border-[#934B19]'
                    }`}
                  >
                    <span>#{ord.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                      ord.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'COOKING'
                        ? 'bg-amber-100 text-[#934B19]'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ord.status === 'COOKING' ? 'Dimasak' : ord.status === 'COMPLETED' ? 'Selesai' : ord.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stepper & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: STATUS STEPPER 5-TAHAP */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Status Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6 relative overflow-hidden">
              <div className="space-y-1">
                <h2 className="font-serif text-2xl font-bold text-[#25160E]">
                  {activeStepIndex === 1 && 'Pesanan Diterima'}
                  {activeStepIndex === 2 && 'Sedang Dimasak Dapur'}
                  {activeStepIndex === 3 && 'Siap Diambil Kurir'}
                  {activeStepIndex === 4 && 'Dalam Perjalanan Pengiriman'}
                  {activeStepIndex === 5 && 'Pesanan Selesai Terkirim'}
                </h2>
                <p className="text-xs text-[#4F4540] font-light leading-relaxed">
                  Chef dan tim kurir kami memastikan rasa otentik sampai hangat di tempat Anda.
                </p>
              </div>

              {/* Vertical Stepper 5-Tahap (Google Stitch Design Specification) */}
              <div className="space-y-0 relative z-10 pt-2">
                
                {/* Stage 1: Diterima */}
                <div className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                      activeStepIndex >= 1 ? 'bg-[#25160E]' : 'bg-stone-200 text-stone-500'
                    }`}>
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className={`w-0.5 h-10 ${activeStepIndex > 1 ? 'bg-[#25160E]' : 'bg-stone-200'} my-1`} />
                  </div>
                  <div className="pt-1 pb-4">
                    <h3 className="text-xs font-bold text-[#25160E]">1. Pesanan Diterima</h3>
                    <p className="text-[11px] text-[#4F4540] font-light">Pembayaran terverifikasi via Midtrans Snap</p>
                  </div>
                </div>

                {/* Stage 2: Dimasak */}
                <div className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                      activeStepIndex >= 2 ? 'bg-[#934B19] ring-4 ring-[#934B19]/20' : 'bg-stone-200 text-stone-500'
                    }`}>
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div className={`w-0.5 h-10 ${activeStepIndex > 2 ? 'bg-[#25160E]' : 'bg-stone-200'} my-1`} />
                  </div>
                  <div className="pt-1 pb-4">
                    <h3 className="text-xs font-bold text-[#934B19] flex items-center gap-2">
                      <span>2. Sedang Dimasak</span>
                      {activeStepIndex === 2 && <span className="w-2 h-2 rounded-full bg-[#934B19] animate-pulse" />}
                    </h3>
                    <p className="text-[11px] text-[#4F4540] font-light">Chef racik bahan alami pilihan di kuali tradisional</p>
                  </div>
                </div>

                {/* Stage 3: Siap */}
                <div className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                      activeStepIndex >= 3 ? 'bg-[#25160E]' : 'bg-stone-200 text-stone-500'
                    }`}>
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className={`w-0.5 h-10 ${activeStepIndex > 3 ? 'bg-[#25160E]' : 'bg-stone-200'} my-1`} />
                  </div>
                  <div className="pt-1 pb-4">
                    <h3 className="text-xs font-bold text-[#25160E]">3. Siap Diambil Kurir</h3>
                    <p className="text-[11px] text-[#4F4540] font-light">Dikemas rapi dalam kemasan eco-friendly</p>
                  </div>
                </div>

                {/* Stage 4: Diantar */}
                <div className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                      activeStepIndex >= 4 ? 'bg-[#25160E]' : 'bg-stone-200 text-stone-500'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className={`w-0.5 h-10 ${activeStepIndex > 4 ? 'bg-[#25160E]' : 'bg-stone-200'} my-1`} />
                  </div>
                  <div className="pt-1 pb-4">
                    <h3 className="text-xs font-bold text-[#25160E]">4. Dalam Perjalanan</h3>
                    <p className="text-[11px] text-[#4F4540] font-light">Kurir menuju lokasi pengiriman Anda</p>
                  </div>
                </div>

                {/* Stage 5: Selesai */}
                <div className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                      activeStepIndex >= 5 ? 'bg-emerald-600' : 'bg-stone-200 text-stone-500'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-xs font-bold text-[#25160E]">5. Pesanan Selesai</h3>
                    <p className="text-[11px] text-[#4F4540] font-light">Diserahterimakan kepada penerima</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Order Summary Detail Box */}
            <div className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#25160E]">Item Makanan Yang Dipesan</h3>
              <div className="divide-y divide-stone-100">
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#25160E] overflow-hidden shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#25160E]">{it.name}</h4>
                        <span className="text-[10px] text-[#4F4540]">{it.quantity} Porsi</span>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[#25160E]">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-xs">
                <span className="text-[#4F4540]">Total Bayar:</span>
                <span className="font-serif text-lg font-bold text-[#25160E]">Rp {activeOrder.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN: BUKTI FOTO PENERIMAAN & DETAIL ALAMAT */}
          <div className="lg:col-span-7 space-y-6">

            {/* INFORMASI PENGANTARAN & STATUS PEMBAYARAN */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#25160E] flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#934B19]" />
                    <span>Informasi Pengantaran &amp; Pembayaran</span>
                  </h3>
                  <p className="text-xs text-[#4F4540] font-light mt-0.5">
                    Pesanan Anda diantar langsung oleh staf/kurir resmi toko kami.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
                    currentStatus === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {currentStatus === 'COMPLETED' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pesanan Selesai &amp; Diterima</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                        <span>Sedang Diproses Kurir Toko</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* INFO COD JIKA METODE COD */}
              {activeOrder.paymentMethod?.toLowerCase().includes('cod') && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  activeOrder.paymentBadge === 'PAID' || currentStatus === 'COMPLETED'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <CreditCard className={`w-5 h-5 shrink-0 mt-0.5 ${
                    activeOrder.paymentBadge === 'PAID' || currentStatus === 'COMPLETED'
                      ? 'text-emerald-700'
                      : 'text-[#934B19]'
                  }`} />
                  <div className="space-y-1">
                    <span className={`text-xs font-bold uppercase tracking-wider block ${
                      activeOrder.paymentBadge === 'PAID' || currentStatus === 'COMPLETED'
                        ? 'text-emerald-900'
                        : 'text-[#934B19]'
                    }`}>
                      {activeOrder.paymentBadge === 'PAID' || currentStatus === 'COMPLETED'
                        ? '✅ PEMBAYARAN TUNAI COD: LUNAS'
                        : '💵 PESANAN COD (BAYAR DI TEMPAT)'}
                    </span>
                    <p className="text-xs text-[#25160E] leading-relaxed font-normal">
                      {activeOrder.paymentBadge === 'PAID' || currentStatus === 'COMPLETED'
                        ? `Pembayaran tunai sebesar Rp ${activeOrder.total.toLocaleString('id-ID')} telah diterima & diverifikasi oleh kurir.`
                        : `Siapkan uang pas tunai sebesar Rp ${activeOrder.total.toLocaleString('id-ID')} saat kurir toko tiba. Dokumentasi serah terima & bukti pembayaran dicatat langsung oleh kurir.`}
                    </p>
                  </div>
                </div>
              )}

              {/* PREVIEW DOKUMENTASI DARI KURIR TOKO (JIKA SUDAH DIUNGGAH OLEH ADMIN) */}
              {(activeOrder.proofPhoto || activeOrder.paymentProofPhoto) && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-[#25160E] block">
                    Dokumentasi Resmi Pengantaran (Diverifikasi Toko):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeOrder.proofPhoto && (
                      <div className="space-y-2">
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-amber-900/15 shadow-sm bg-stone-900 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={activeOrder.proofPhoto} 
                            alt="Bukti Makanan Diterima" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white">
                            <span className="text-[11px] font-bold">📸 Foto Serah Terima Makanan</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeOrder.paymentProofPhoto && (
                      <div className="space-y-2">
                        <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-emerald-600/25 shadow-sm bg-stone-900 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={activeOrder.paymentProofPhoto} 
                            alt="Bukti Pembayaran COD" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 text-white">
                            <span className="text-[11px] font-bold">💵 Bukti Pembayaran Tunai COD (Lunas)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LOKASI ALAMAT PENGIRIMAN */}
              <div className="space-y-1.5 pt-3 border-t border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#934B19]">Lokasi Alamat Antar</span>
                <p className="text-xs font-bold text-[#25160E]">{activeOrder.customerName}</p>
                <p className="text-xs text-[#4F4540] font-light leading-relaxed">{activeOrder.address}</p>
              </div>

              {/* STATUS AKHIR & CETAK STRUK */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[#4F4540] font-light">
                  {currentStatus === 'COMPLETED'
                    ? 'Pesanan telah selesai. Terima kasih telah memesan hidangan otentik Nefakky!'
                    : 'Kurir kami sedang menuju lokasi Anda. Mohon pastikan nomor telepon aktif.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(activeOrder)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#25160E] hover:bg-[#3C2A21] text-amber-300 text-xs font-bold rounded-2xl shadow transition-all flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4 text-amber-300" />
                  <span>Lihat Struk Pembelian</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* ================================================================= */}
        {/* SEKSI: RIWAYAT PEMESANAN & STRUK PEMBAYARAN MIDTRANS */}
        {/* ================================================================= */}
        <section className="pt-8 border-t border-amber-900/10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#934B19]">TRANSACTION HISTORY</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#25160E]">Riwayat Pemesanan & Struk Transaksi</h2>
            </div>
            <p className="text-xs text-[#4F4540]">Seluruh transaksi tersimpan aman di database Firestore Real-time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayOrdersList.map((ord) => (
              <div 
                key={ord.id}
                className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-4 flex flex-col justify-between hover:shadow-2xl transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-[#934B19]">#{ord.id}</span>
                      <p className="text-[11px] text-[#4F4540]">{ord.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      ord.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : ord.status === 'COOKING'
                        ? 'bg-amber-100 text-[#934B19] border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {ord.status === 'COOKING' ? 'Sedang Dimasak' : ord.status === 'COMPLETED' ? 'Selesai & Diterima' : ord.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-[#25160E]">
                        <span className="truncate max-w-[220px] font-medium">• {it.name} x{it.quantity}</span>
                        <span className="font-bold">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
                    <span className="text-[#4F4540]">Total Pembayaran:</span>
                    <span className="font-serif text-base font-bold text-[#25160E]">Rp {ord.total.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="flex-1 py-2.5 bg-[#FBF9F5] border border-amber-900/15 hover:bg-[#25160E] hover:text-white text-[#25160E] text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Lacak Pesanan Ini</span>
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(ord)}
                    className="flex-1 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-200" />
                    <span>Lihat Struk PDF</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </section>

      </main>

      {/* MODAL STRUK PEMBAYARAN OFFICIAL RESMI */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-900/10 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-2 bg-[#FBF9F5] hover:bg-stone-200 text-[#25160E] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Receipt Content Area */}
            <div id="printable-receipt" className="space-y-6 text-[#1B1C1A]">
              
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-stone-300 pb-4 space-y-1">
                <div className="w-12 h-12 bg-[#25160E] text-white rounded-2xl flex items-center justify-center font-serif text-2xl font-bold mx-auto mb-2 shadow-md">
                  N
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#25160E]">Nefakky Artisanal Kitchen</h2>
                <p className="text-[11px] text-[#4F4540]">Jl. Pemuda No. 45, Kebayoran, Jakarta Selatan</p>
                <p className="text-[10px] text-stone-400 font-mono">STRUK RESMI BUKTI PEMBAYARAN MIDTRANS</p>
              </div>

              {/* Order Meta */}
              <div className="bg-[#FBF9F5] p-4 rounded-2xl border border-amber-900/10 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#4F4540]">No. Transaksi:</span>
                  <span className="font-bold text-[#934B19]">#{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4F4540]">Tanggal & Waktu:</span>
                  <span className="font-semibold">{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4F4540]">Pelanggan:</span>
                  <span className="font-semibold">{selectedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4F4540]">Metode Pembayaran:</span>
                  <span className="font-bold text-emerald-700">{selectedReceipt.paymentMethod || 'Midtrans Snap Engine'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 border-b border-dashed border-stone-300 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#934B19]">Rincian Item Makanan</span>
                <div className="space-y-2">
                  {selectedReceipt.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#25160E]">{it.name}</p>
                        <p className="text-[10px] text-[#4F4540]">{it.quantity} Porsi x Rp {it.price.toLocaleString('id-ID')}</p>
                      </div>
                      <span className="font-bold text-[#25160E]">Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Calculations Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#4F4540]">
                  <span>Subtotal Makanan:</span>
                  <span>Rp {(selectedReceipt.subtotal || selectedReceipt.total - (selectedReceipt.shippingCost || 15000)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[#4F4540]">
                  <span>Ongkos Kirim:</span>
                  <span>Rp {(selectedReceipt.shippingCost || 15000).toLocaleString('id-ID')}</span>
                </div>
                {selectedReceipt.discount && selectedReceipt.discount > 0 ? (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Diskon Promo:</span>
                    <span>-Rp {selectedReceipt.discount.toLocaleString('id-ID')}</span>
                  </div>
                ) : null}
                <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm">
                  <span className="font-bold text-[#25160E]">TOTAL LUNAS:</span>
                  <span className="font-serif text-xl font-bold text-[#934B19]">Rp {selectedReceipt.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>TERVERIFIKASI LUNAS REAL-TIME</span>
              </div>

            </div>

            {/* Print Action Button */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-[#25160E] hover:bg-[#3C2A21] text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>Cetak Struk (PDF)</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
