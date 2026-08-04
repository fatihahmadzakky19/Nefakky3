'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, AdminOrder } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import { 
  ShoppingBag, 
  User, 
  Tag, 
  Truck, 
  CheckCircle2, 
  Star, 
  Ticket, 
  Bell, 
  ArrowLeft,
  Receipt,
  Clock,
  ChevronRight,
  Sparkles,
  CreditCard
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { orders, vouchers, updateOrderStatus } = useData();
  const { totalCartCount } = useCart();

  const [activeTab, setActiveTab] = useState<'semua' | 'history-pemesanan' | 'riwayat-pembayaran' | 'promo-makanan'>('semua');
  const [selectedReceipt, setSelectedReceipt] = useState<AdminOrder | null>(null);

  const userEmail = user?.email?.toLowerCase();

  // Filter user's specific orders
  const userOrders = React.useMemo(() => {
    if (!user) return [];
    return (orders || []).filter(o => 
      (userEmail && o.customerEmail?.toLowerCase() === userEmail) || 
      o.customerName?.toLowerCase() === (user.displayName?.toLowerCase() || '')
    );
  }, [user, userEmail, orders]);

  // Active Vouchers/Promos created by Admin
  const activeVouchers = React.useMemo(() => {
    return (vouchers || []).filter(v => v.status === 'Active' && v.isActive !== false);
  }, [vouchers]);

  const handleConfirmReceived = (orderId: string) => {
    if (confirm(`Apakah Anda mengonfirmasi bahwa pesanan #${orderId} telah Anda terima dengan baik?`)) {
      updateOrderStatus(orderId, 'COMPLETED');
      alert(`🎉 Terima kasih! Pesanan #${orderId} telah dikonfirmasi diterima.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5C3D28] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Notifikasi &amp; History...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-[#5C3D28] rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
            🔔
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Notifikasi Akun</h2>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              Silakan masuk atau mendaftar akun terlebih dahulu untuk melihat history pemesanan, riwayat pembayaran, dan notifikasi promo makanan.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 bg-[#7A4B29] hover:bg-[#613A1F] text-white font-medium text-xs rounded-full shadow transition-all block text-center"
            >
              Masuk ke Akun Saya
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 border border-[#7A4B29] text-[#7A4B29] hover:bg-[#7A4B29]/5 font-medium text-xs rounded-full transition-all block text-center"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-[#5C3D28]/10 selection:text-[#5C3D28]">
      
      {/* 1. TOP NAVBAR HEADER */}
      <Navbar />

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Title Header */}
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Pusat Notifikasi &amp; History Pelanggan
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Pantau History Pemesanan, Riwayat Pembelian &amp; Pembayaran, serta Promo Spesial Makanan.
              </p>
            </div>
            <Link
              href="/menu"
              className="px-5 py-2.5 bg-[#7A4B29] hover:bg-[#613A1F] text-white font-bold text-xs rounded-full shadow-sm transition-all shrink-0 flex items-center gap-2 w-fit"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pesan Makanan Lagi</span>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs (History Pemesanan, Riwayat Pembayaran, Notifikasi Promo) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200">
          <button
            onClick={() => setActiveTab('semua')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'semua'
                ? 'bg-[#7A4B29] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Semua Notifikasi ({userOrders.length + activeVouchers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history-pemesanan')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'history-pemesanan'
                ? 'bg-[#7A4B29] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-amber-500" />
            <span>History Pemesanan ({userOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('riwayat-pembayaran')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'riwayat-pembayaran'
                ? 'bg-[#7A4B29] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Riwayat Pembelian &amp; Pembayaran</span>
          </button>

          <button
            onClick={() => setActiveTab('promo-makanan')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'promo-makanan'
                ? 'bg-[#7A4B29] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Notifikasi Promo Makanan ({activeVouchers.length})</span>
          </button>
        </div>

        {/* TAB 1: HISTORY PEMESANAN (ALUR 5-TAHAP PESANAN) */}
        {(activeTab === 'semua' || activeTab === 'history-pemesanan') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📦 History Pemesanan Makanan</span>
                <span className="px-2.5 py-0.5 bg-amber-100 text-orange-800 text-[10px] font-bold rounded-full">
                  ALUR REALTIME 5-TAHAP
                </span>
              </h2>
            </div>

            {userOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200/80 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-amber-50 text-orange-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🛒
                </div>
                <p className="text-xs font-bold text-slate-800">Belum Ada History Pemesanan</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-medium">
                  Anda belum pernah memesan makanan. Jelajahi Katalog Menu Nefakky dan nikmati hidangan lezat hari ini!
                </p>
                <Link
                  href="/menu"
                  className="inline-block px-5 py-2.5 bg-[#7A4B29] text-white font-bold text-xs rounded-full shadow-xs hover:bg-[#613A1F] transition-all"
                >
                  Pesan Sekarang
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((ord) => {
                  const statusStep = 
                    ord.status === 'RECEIVED' || ord.status === 'PENDING' ? 1 :
                    ord.status === 'COOKING' ? 2 :
                    ord.status === 'READY' ? 3 :
                    ord.status === 'SHIPPING' ? 4 : 5;

                  const etaInfo = 
                    ord.status === 'RECEIVED' || ord.status === 'PENDING' 
                      ? { etaText: '~30 - 45 Menit', etaIcon: '⏱️', desc: 'Pesanan telah diterima kasir & diverifikasi.', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' }
                      : ord.status === 'COOKING' 
                      ? { etaText: '~20 - 30 Menit', etaIcon: '🍳', desc: 'Tim dapur sedang memasak & mengolah hidangan segar Anda.', badgeBg: 'bg-orange-100 text-orange-900 border-orange-300' }
                      : ord.status === 'READY' 
                      ? { etaText: '~15 - 20 Menit', etaIcon: '📦', desc: 'Makanan telah selesai dimasak & dikemas rapi, menunggu kurir.', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' }
                      : ord.status === 'SHIPPING' 
                      ? { etaText: '~5 - 15 Menit (Kurir di Jalan)', etaIcon: '🛵', desc: 'Kurir sedang meluncur membawa hidangan hangat ke lokasi Anda!', badgeBg: 'bg-orange-600 text-white border-orange-700 animate-pulse' }
                      : { etaText: 'Tiba (0 Menit)', etaIcon: '🎉', desc: 'Pesanan telah sampai di tujuan. Selamat menikmati!', badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };

                  return (
                    <div key={ord.id} className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5 hover:shadow-md transition-all">
                      {/* Top Header info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-orange-700 flex items-center justify-center font-bold text-xs shrink-0">
                            #{ord.id.slice(-4)}
                          </div>
                          <div>
                            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                              <span>Pesanan #{ord.id}</span>
                              <span className="text-[10px] text-slate-400 font-normal">• {ord.date}</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {ord.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <span className="font-serif text-sm font-black text-slate-900">
                            Rp {ord.total.toLocaleString('id-ID')}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-orange-800'
                          }`}>
                            {ord.status === 'COMPLETED' ? '✅ DITERIMA' : '⏳ PROSES'}
                          </span>
                        </div>
                      </div>

                      {/* 5-Step Order Status Progress Line & ETA Banner */}
                      <div className="space-y-3 bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-stone-200/60">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                              Status Pesanan Realtime (5-Tahap)
                            </span>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              {etaInfo.desc}
                            </p>
                          </div>
                          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 flex items-center gap-1.5 shadow-2xs ${etaInfo.badgeBg}`}>
                            <span>{etaInfo.etaIcon}</span>
                            <span>Estimasi Tiba: <strong>{etaInfo.etaText}</strong></span>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-1.5 text-center pt-1">
                          {/* Step 1: Diterima */}
                          <div className={`p-2 rounded-xl text-[9px] font-bold flex flex-col items-center gap-0.5 ${
                            statusStep >= 1 ? 'bg-amber-500 text-white shadow-xs' : 'bg-stone-100 text-stone-400'
                          }`}>
                            <span>1. Diterima</span>
                            <span className="text-[8px] font-normal opacity-90">~35-45m</span>
                          </div>

                          {/* Step 2: Dimasak */}
                          <div className={`p-2 rounded-xl text-[9px] font-bold flex flex-col items-center gap-0.5 ${
                            statusStep >= 2 ? 'bg-amber-500 text-white shadow-xs' : 'bg-stone-100 text-stone-400'
                          }`}>
                            <span>2. Dimasak</span>
                            <span className="text-[8px] font-normal opacity-90">~20-30m</span>
                          </div>

                          {/* Step 3: Siap */}
                          <div className={`p-2 rounded-xl text-[9px] font-bold flex flex-col items-center gap-0.5 ${
                            statusStep >= 3 ? 'bg-amber-500 text-white shadow-xs' : 'bg-stone-100 text-stone-400'
                          }`}>
                            <span>3. Siap</span>
                            <span className="text-[8px] font-normal opacity-90">~15-20m</span>
                          </div>

                          {/* Step 4: Diantar */}
                          <div className={`p-2 rounded-xl text-[9px] font-bold flex flex-col items-center gap-0.5 ${
                            statusStep >= 4 ? 'bg-orange-600 text-white shadow-xs animate-pulse' : 'bg-stone-100 text-stone-400'
                          }`}>
                            <span>4. Diantar</span>
                            <span className="text-[8px] font-normal opacity-90">~5-15m</span>
                          </div>

                          {/* Step 5: Diterima User */}
                          <div className={`p-2 rounded-xl text-[9px] font-bold flex flex-col items-center gap-0.5 ${
                            statusStep >= 5 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-100 text-stone-400'
                          }`}>
                            <span>5. Selesai</span>
                            <span className="text-[8px] font-normal opacity-90">Tiba</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button: Konfirmasi Pesanan Diterima (Khusus Pengguna) */}
                      {ord.status !== 'COMPLETED' && (
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[11px] text-amber-900 font-medium">
                            💡 Makanan sudah diantar dan sampai? Mohon konfirmasi penerimaan di bawah ini.
                          </p>
                          <button
                            onClick={() => handleConfirmReceived(ord.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>✅ Konfirmasi Pesanan Diterima</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT PEMBELIAN & PEMBAYARAN */}
        {(activeTab === 'semua' || activeTab === 'riwayat-pembayaran') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>💳 Riwayat Pembelian &amp; Pembayaran</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  STRUK &amp; BUKTI TRANSAKSI
                </span>
              </h2>
            </div>

            {userOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200/80 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🧾
                </div>
                <p className="text-xs font-bold text-slate-800">Belum Ada Riwayat Pembayaran</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-medium">
                  Setiap bukti pembayaran dan rincian transaksi belanja Anda akan secara otomatis tersimpan secara rapi di sini.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
                <div className="divide-y divide-stone-100">
                  {userOrders.map((ord) => (
                    <div key={ord.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            #{ord.id}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {ord.date}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            ord.paymentBadge === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.paymentBadge === 'PAID' ? 'LUNAS / VERIFIED' : ord.paymentBadge}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700">
                          Metode Bayar: <strong>{ord.paymentMethod}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 font-light">
                          Item: {ord.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 sm:text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Bayar</span>
                          <span className="font-serif text-base font-black text-[#613A1F]">
                            Rp {ord.total.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedReceipt(ord)}
                          className="px-4 py-2 bg-stone-100 hover:bg-amber-100 text-stone-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5 text-amber-900" />
                          <span>Struk</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTIFIKASI PROMO MAKANAN */}
        {(activeTab === 'semua' || activeTab === 'promo-makanan') && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>🏷️ Notifikasi Promo Spesial Makanan</span>
                <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-full">
                  EVENT &amp; VOUCHER RESTO
                </span>
              </h2>
            </div>

            {activeVouchers.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-stone-200/80 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                  🎁
                </div>
                <p className="text-xs font-bold text-slate-800">Belum Ada Promo Makanan</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-medium">
                  Saat Admin resto menambahkan event promo atau voucher diskon baru, notifikasi eksklusif akan tampil di sini!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeVouchers.map((v) => (
                  <div key={v.id} className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-md space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-white text-orange-600 text-[10px] font-black rounded-full uppercase shadow-xs">
                        VOUCHER DISKON {v.discountPercent}%
                      </span>
                      <span className="text-[10px] text-amber-100 font-medium">
                        s/d {v.expiry}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-serif text-lg font-bold">{v.name}</h3>
                      <p className="text-xs text-amber-100/90 font-light mt-0.5">
                        Minimal belanja Rp {v.minSpend.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/20">
                      <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold tracking-wider">
                        {v.code}
                      </div>

                      <Link
                        href="/menu"
                        className="px-4 py-2 bg-white hover:bg-amber-50 text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                      >
                        🛒 Gunakan Promo →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* RECEIPT DETAIL MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-6">
            <div className="text-center border-b border-stone-100 pb-4 space-y-1">
              <div className="w-12 h-12 bg-amber-100 text-orange-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                🧾
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Struk Pembayaran Nefakky</h3>
              <p className="text-xs text-slate-500 font-mono">No. Transaksi #{selectedReceipt.id}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tanggal</span>
                <span className="font-medium text-slate-900">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Nama Pelanggan</span>
                <span className="font-medium text-slate-900">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Metode Pembayaran</span>
                <span className="font-bold text-amber-900">{selectedReceipt.paymentMethod}</span>
              </div>

              <div className="border-t border-b border-stone-100 py-3 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Item Dipesan</span>
                {selectedReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 font-medium">
                    <span>{item.name} ({item.quantity}x)</span>
                    <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Makanan</span>
                  <span>Rp {(selectedReceipt.subtotal || selectedReceipt.total).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({selectedReceipt.deliveryType})</span>
                  <span>Rp {(selectedReceipt.shippingCost || 12000).toLocaleString('id-ID')}</span>
                </div>
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Diskon Promo</span>
                    <span>-Rp {selectedReceipt.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-stone-200">
                  <span>TOTAL PEMBAYARAN</span>
                  <span className="text-[#613A1F]">Rp {selectedReceipt.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all"
              >
                Tutup Struk
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
