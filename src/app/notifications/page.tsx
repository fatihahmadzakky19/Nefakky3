'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, AdminOrder, isVoucherValidNow } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import { 
  ShoppingBag, 
  Truck, 
  Receipt, 
  Tag, 
  Bell, 
  ArrowLeft,
  X,
  FileText
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { orders, vouchers, updateOrderStatus } = useData();
  const { totalCartCount } = useCart();

  const [activeTab, setActiveTab] = useState<'semua' | 'history-pemesanan' | 'riwayat-pembayaran' | 'promo-makanan'>('semua');
  const [selectedReceipt, setSelectedReceipt] = useState<AdminOrder | null>(null);

  const currentUserEmail = (user?.email || '').toLowerCase();
  const currentUserName = (user?.displayName || '').toLowerCase();

  // Dynamic user avatar or default
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || user?.email || 'User')}&background=F59E3D&color=ffffff&bold=true`;
  const userAvatar = user?.photoURL || defaultAvatar;

  // Filter & sort user's specific orders in real-time (sinkron dengan halaman profile, terbaru di atas)
  const userOrders = React.useMemo(() => {
    if (!user?.email) return [];
    return (orders || [])
      .filter(o => 
        (o.customerEmail && o.customerEmail.toLowerCase() === currentUserEmail) ||
        (o.userId && user.uid && o.userId === user.uid) ||
        (currentUserName && o.customerName?.toLowerCase()?.includes(currentUserName))
      )
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [user, currentUserEmail, currentUserName, orders]);

  // Fallback demo order for preview if user has no placed orders yet
  const displayOrders: AdminOrder[] = userOrders.length > 0 ? userOrders : [
    {
      id: 'ORD-12',
      customerName: user?.displayName || user?.email?.split('@')[0] || 'Nefakky Gourmet User',
      customerEmail: currentUserEmail,
      avatar: userAvatar,
      address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
      items: [
        { id: 'm6', name: 'Jus Segar (Jambu, Sirsak, Mangga)', price: 5100, quantity: 1, image: '/images/jus_mangga.jpg' }
      ],
      itemCount: 1,
      paymentMethod: 'Midtrans Payment Gateway',
      paymentBadge: 'PAID',
      deliveryType: 'Standard Delivery',
      status: 'COOKING',
      subtotal: 5100,
      shippingCost: 0,
      discount: 0,
      total: 5100,
      date: 'Hari ini, 19.30'
    }
  ];

  // Active Vouchers/Promos created by Admin
  const activeVouchers = React.useMemo(() => {
    return (vouchers || []).filter(v => isVoucherValidNow(v).active);
  }, [vouchers]);

  const handleConfirmReceived = (orderId: string) => {
    if (confirm(`Apakah Anda mengonfirmasi bahwa pesanan ${orderId} telah Anda terima dengan baik?`)) {
      updateOrderStatus(orderId, 'COMPLETED');
      alert(`🎉 Terima kasih! Pesanan ${orderId} telah dikonfirmasi diterima.`);
    }
  };

  // Helper step index (1..5)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8E9DE] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#6A3B12] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-600 font-medium">Memuat Notifikasi &amp; History...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8E9DE] text-stone-800 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-[#F2AE72] text-[#6A3B12] rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
            🔔
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Notifikasi Akun</h2>
            <p className="text-xs text-stone-600 font-medium leading-relaxed">
              Silakan masuk atau mendaftar akun terlebih dahulu untuk melihat history pemesanan, riwayat pembayaran, dan notifikasi promo makanan.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 bg-[#6A3B12] hover:bg-[#522D0D] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all block text-center"
            >
              Masuk ke Akun Saya
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 bg-white text-stone-800 hover:bg-stone-50 font-bold text-xs rounded-full border border-stone-200 shadow-xs transition-all block text-center"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8E9DE] text-stone-900 font-sans selection:bg-[#6A3B12]/10 selection:text-[#6A3B12]">
      
      {/* 1. TOP NAVBAR HEADER */}
      <Navbar />

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* Title Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              Pusat Notifikasi &amp; History Pelanggan
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 font-medium">
              Pantau History Pemesanan, Riwayat Pembelian &amp; Pembayaran, serta Promo Spesial Makanan.
            </p>
          </div>

          <Link
            href="/menu"
            className="px-6 py-3 bg-[#824B1B] hover:bg-[#6A3B12] text-white font-medium text-xs rounded-full shadow-md transition-all shrink-0 flex items-center gap-2.5 w-fit"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pesan Makanan Lagi</span>
          </Link>
        </div>

        {/* Tab Filter Pills Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('semua')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'semua'
                ? 'bg-[#824B1B] text-white shadow-md'
                : 'bg-white text-stone-900 border border-stone-200/80 hover:bg-stone-50'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Semua Notifikasi</span>
          </button>

          <button
            onClick={() => setActiveTab('history-pemesanan')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'history-pemesanan'
                ? 'bg-[#824B1B] text-white shadow-md'
                : 'bg-white text-stone-900 border border-stone-200/80 hover:bg-stone-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>History Pemesanan</span>
          </button>

          <button
            onClick={() => setActiveTab('riwayat-pembayaran')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'riwayat-pembayaran'
                ? 'bg-[#824B1B] text-white shadow-md'
                : 'bg-white text-stone-900 border border-stone-200/80 hover:bg-stone-50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Riwayat Pembelian &amp; Pembayaran</span>
          </button>

          <button
            onClick={() => setActiveTab('promo-makanan')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              activeTab === 'promo-makanan'
                ? 'bg-[#824B1B] text-white shadow-md'
                : 'bg-white text-stone-900 border border-stone-200/80 hover:bg-stone-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Notifikasi Promo Product</span>
          </button>
        </div>

        {/* SECTION 1: HISTORY PEMESANAN MAKANAN */}
        {(activeTab === 'semua' || activeTab === 'history-pemesanan') && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              History Pemesanan Makanan
            </h2>

            <div className="space-y-6">
              {displayOrders.map((ord, idx) => {
                const stepIdx = getStepIndex(ord.status);
                const isCompleted = ord.status === 'COMPLETED';

                return (
                  <div key={ord.id} className="bg-white rounded-[28px] p-6 shadow-sm border border-stone-100 space-y-4">
                    {/* Top Order Summary Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ord.avatar || userAvatar}
                          alt="User Avatar"
                          className="w-10 h-10 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                            <span>Orderan Ke {idx + 12}</span>
                            <span className="text-xs text-stone-400 font-normal">• {ord.date}</span>
                          </h3>
                          <p className="text-xs text-stone-500 font-medium">
                            {ord.items && ord.items.length > 0 
                              ? ord.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')
                              : 'Jus Segar (Jambu, Sirsak, Mangga) (1x)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="sm:text-right">
                          <span className="font-bold text-stone-900 text-sm block">
                            Rp {ord.total.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {ord.paymentMethod || 'Midtrans Payment Gateway'} • LUNAS
                          </span>
                        </div>

                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shrink-0 ${
                          isCompleted ? 'bg-[#2ECC71]' : 'bg-[#E5A83B]'
                        }`}>
                          {isCompleted ? 'Selesai' : 'Proses Dahulu'}
                        </span>
                      </div>
                    </div>

                    {/* Inner Live-Tracking RealTime Card */}
                    <div className="bg-[#DCDCDC] rounded-[20px] p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">Live-Tracking RealTime</h4>
                          <p className="font-semibold text-xs text-stone-800 mt-0.5">
                            {isCompleted ? 'Di Terima (Selesai)' : ord.status === 'COOKING' ? 'Di Masak' : ord.status === 'READY' ? 'Siap' : ord.status === 'DELIVERING' ? 'Diantar' : 'Di Terima'}
                          </p>
                          <p className="text-xs text-stone-600 mt-0.5">
                            {isCompleted 
                              ? 'Pesanan telah selesai diterima dan siap dinikmati.' 
                              : 'Pesanan di terima sekarang sedang menunggu antrian'}
                          </p>
                        </div>

                        <span className="px-4 py-1.5 bg-[#2ECC71] text-white text-xs font-bold rounded-full shrink-0 shadow-xs">
                          Estimasi : Tiba ({isCompleted ? '0' : '15'} Menit)
                        </span>
                      </div>

                      {/* 5-Step Green Timeline Bar */}
                      <div className="grid grid-cols-5 gap-2 sm:gap-3 text-center">
                        <div className={`p-2.5 sm:p-3 rounded-xl text-white font-bold text-xs transition-colors ${
                          stepIdx >= 1 ? 'bg-[#2ECC71]' : 'bg-stone-400'
                        }`}>
                          <div>1. DiTerima</div>
                          <div className="text-[10px] font-normal opacity-90">.45m</div>
                        </div>

                        <div className={`p-2.5 sm:p-3 rounded-xl text-white font-bold text-xs transition-colors ${
                          stepIdx >= 2 ? 'bg-[#2ECC71]' : 'bg-stone-400'
                        }`}>
                          <div>2. DiMasak</div>
                          <div className="text-[10px] font-normal opacity-90">.30m</div>
                        </div>

                        <div className={`p-2.5 sm:p-3 rounded-xl text-white font-bold text-xs transition-colors ${
                          stepIdx >= 3 ? 'bg-[#2ECC71]' : 'bg-stone-400'
                        }`}>
                          <div>3. Siap</div>
                          <div className="text-[10px] font-normal opacity-90">.40m</div>
                        </div>

                        <div className={`p-2.5 sm:p-3 rounded-xl text-white font-bold text-xs transition-colors ${
                          stepIdx >= 4 ? 'bg-[#2ECC71]' : 'bg-stone-400'
                        }`}>
                          <div>4. Diantar</div>
                          <div className="text-[10px] font-normal opacity-90">.40m</div>
                        </div>

                        <div className={`p-2.5 sm:p-3 rounded-xl text-white font-bold text-xs transition-colors ${
                          stepIdx >= 5 ? 'bg-[#2ECC71]' : 'bg-stone-400'
                        }`}>
                          <div>5. Selesai</div>
                          <div className="text-[10px] font-normal opacity-90">.5m</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <p className="text-xs text-stone-500">
                        Makanan sudah diantar dan Anda terima? Mohon tekan tombol konfirmasi di samping.
                      </p>

                      <button
                        onClick={() => handleConfirmReceived(ord.id)}
                        className={`px-5 py-2.5 text-white font-bold text-xs rounded-full transition-all shrink-0 ${
                          isCompleted ? 'bg-[#2ECC71] opacity-80 cursor-default' : 'bg-[#2ECC71] hover:bg-[#27ae60] active:scale-95 shadow-sm'
                        }`}
                      >
                        {isCompleted ? 'Pesanan Sudah Diterima ✓' : 'Konfirmasi Pesanan Di Terima'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: RIWAYAT PEMBELIAN & PEMBAYARAN */}
        {(activeTab === 'semua' || activeTab === 'riwayat-pembayaran') && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              Riwayat Pembelian &amp; Pembayaran
            </h2>

            <div className="space-y-3">
              {displayOrders.map((ord, idx) => (
                <div key={`pembayaran-${ord.id}`} className="bg-white rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-stone-100">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xs sm:text-sm text-stone-900">
                      Orderan Ke {idx + 12} <span className="font-normal text-stone-400">• {ord.date}</span>
                    </h3>
                    <p className="text-xs text-stone-600 font-medium">
                      Metode Pembayaran : {ord.paymentMethod || 'Midtrans Payment Gateway'} • LUNAS
                    </p>
                    <p className="text-xs text-stone-500 font-normal">
                      Item : {ord.items && ord.items.length > 0 
                        ? ord.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')
                        : 'Jus Segar (Jambu, Sirsak, Mangga) (1x)'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                    <div className="sm:text-right">
                      <span className="text-[10px] text-stone-500 uppercase block font-medium">Total Bayar</span>
                      <span className="font-bold text-stone-900 text-sm">
                        Rp {ord.total.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedReceipt(ord)}
                      className="px-4 py-2 bg-[#4A4A4A] hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Struck</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: NOTIFIKASI PROMO SPESIAL */}
        {(activeTab === 'semua' || activeTab === 'promo-makanan') && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              Notifikasi Promo Spesial
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeVouchers.length > 0 ? (
                activeVouchers.map((v) => (
                  <div key={v.id} className="bg-[#F2AE72] rounded-[20px] p-5 shadow-sm space-y-2 border border-amber-300/40 text-stone-900">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#6A3B12]">
                        {v.name || 'Ada Promo yang Tersedia'}
                      </h3>
                      <p className="text-xs text-stone-800 font-medium mt-0.5">
                        di dasboard utama • {v.expiry || 'Hari ini, 19.30'}
                      </p>
                    </div>

                    <p className="text-[11px] font-bold text-[#824B1B] uppercase tracking-wide">
                      SEGERA DI AMBIL KESURU HABIS!! (Kode: {v.code})
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-3 py-1 bg-white/70 rounded-lg text-stone-900">
                        Diskon {v.discountPercent}%
                      </span>
                      <Link
                        href="/cart"
                        className="px-4 py-1.5 bg-[#6A3B12] hover:bg-[#522D0D] text-white text-xs font-bold rounded-full transition-all"
                      >
                        Gunakan Promo →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#F2AE72] rounded-[20px] p-5 shadow-sm space-y-1.5 border border-amber-300/40 text-stone-900">
                  <h3 className="font-serif text-lg font-bold text-[#6A3B12]">
                    Ada Promo yang Tersedia
                  </h3>
                  <p className="text-xs text-stone-800 font-medium">
                    di dasboard utama • Hari ini, 19.30
                  </p>
                  <p className="text-[11px] font-bold text-[#824B1B] uppercase tracking-wide">
                    SEGERA DI AMBIL KESURU HABIS!!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* RECEIPT STRUK MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-[#6A3B12] rounded-full flex items-center justify-center text-xl font-bold">
                  🧾
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">Struk Pembayaran</h3>
                  <p className="text-xs text-stone-500 font-mono">No. #{selectedReceipt.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Tanggal</span>
                <span className="font-medium text-stone-900">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Nama Pelanggan</span>
                <span className="font-medium text-stone-900">{selectedReceipt.customerName}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Metode Pembayaran</span>
                <span className="font-bold text-[#6A3B12]">{selectedReceipt.paymentMethod}</span>
              </div>

              <div className="border-t border-b border-stone-100 py-3 space-y-2">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Item Dipesan</span>
                {selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                  selectedReceipt.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-stone-700 font-medium">
                      <span>{item.name} ({item.quantity}x)</span>
                      <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-between text-stone-700 font-medium">
                    <span>Jus Segar (Jambu, Sirsak, Mangga) (1x)</span>
                    <span>Rp 5.100</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal Makanan</span>
                  <span>Rp {(selectedReceipt.subtotal || selectedReceipt.total).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Ongkos Kirim</span>
                  <span>Rp {(selectedReceipt.shippingCost || 0).toLocaleString('id-ID')}</span>
                </div>
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Diskon Promo</span>
                    <span>-Rp {selectedReceipt.discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-900 font-black text-sm pt-2 border-t border-stone-200">
                  <span>TOTAL PEMBAYARAN</span>
                  <span className="text-[#6A3B12]">Rp {selectedReceipt.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-3 bg-[#6A3B12] hover:bg-[#522D0D] text-white font-bold text-xs rounded-2xl transition-all shadow-md"
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
