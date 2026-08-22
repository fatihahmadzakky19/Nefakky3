import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  Filter,
  Calendar,
  Printer,
  AlertTriangle,
  Flame,
  Bell,
  Camera,
  Eye,
  UploadCloud,
  X,
  Maximize2,
  ExternalLink,
  Ticket,
  Tag,
  Sparkles,
  Search
} from 'lucide-react';
import { AdminOrder, useData } from '@/context/DataContext';

// ============================================================================
// KOMPONEN: AdminOrdersTab (Manajemen Pesanan Masuk / Kitchen Orders Desk)
// FUNGSI:
// 1. Memantau seluruh pesanan masuk dari pelanggan secara realtime.
// 2. Mengubah status alur pesanan (Pending -> Dimasak -> Diantar -> Selesai).
// 3. Mengunggah bukti foto pengantaran & bukti pembayaran uang tunai COD.
// 4. Mencetak struk belanja / nota thermal kasir resmi.
// ============================================================================

interface AdminOrdersTabProps {
  orderList: AdminOrder[];                                  // Daftar seluruh pesanan dari database
  updateOrderStatus: (orderId: string, newStatus: any) => void; // Fungsi update status alur pesanan
  onPrintPDF: () => void;                                   // Fungsi trigger cetak laporan PDF
}

export default function AdminOrdersTab({
  orderList,
  updateOrderStatus,
  onPrintPDF
}: AdminOrdersTabProps) {
  // --------------------------------------------------------------------------
  // DATA CONTEXT & STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const { isHighDemand, highDemandMessage, toggleHighDemand, uploadOrderProofPhoto, uploadOrderPaymentProofPhoto } = useData();
  const [selectedProofPhoto, setSelectedProofPhoto] = useState<string | null>(null);             // URL foto bukti yang sedang dizoom full-size
  const [uploadTarget, setUploadTarget] = useState<{ orderId: string; type: 'proof' | 'payment' } | null>(null); // Target upload foto admin
  const adminFileInputRef = React.useRef<HTMLInputElement>(null);                                // Referensi input file tersembunyi
  const [productSearch, setProductSearch] = useState('');                                        // Query pencarian pesanan (nama/ID/menu)
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PENDING' | 'COOKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'>('ALL'); // Filter tab status
  const [orderDateRangeFilter, setOrderDateRangeFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'june2026'>('all'); // Filter rentang waktu
  const [demandMsgInput, setDemandMsgInput] = useState(highDemandMessage);                       // Input teks pengumuman resto ramai
  const [saveDemandSuccess, setSaveDemandSuccess] = useState(false);                             // Notifikasi sukses simpan pengumuman
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<AdminOrder | null>(null);     // Pesanan yang dipilih untuk cetak struk kasir

  // --------------------------------------------------------------------------
  // HANDLER: Unggah Foto Bukti dari WhatsApp Kurir Toko
  // --------------------------------------------------------------------------
  const handleAdminFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (uploadTarget.type === 'proof') {
          // Simpan foto bukti serah terima makanan
          uploadOrderProofPhoto(uploadTarget.orderId, base64);
        } else {
          // Simpan foto bukti pembayaran uang tunai COD
          uploadOrderPaymentProofPhoto(uploadTarget.orderId, base64);
        }
        setUploadTarget(null);
        if (adminFileInputRef.current) adminFileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (orderId: string, type: 'proof' | 'payment') => {
    setUploadTarget({ orderId, type });
    setTimeout(() => {
      adminFileInputRef.current?.click();
    }, 50);
  };

  useEffect(() => {
    setDemandMsgInput(highDemandMessage);
  }, [highDemandMessage]);

  const handleSaveHighDemand = (e: React.FormEvent) => {
    e.preventDefault();
    toggleHighDemand(isHighDemand, demandMsgInput.trim());
    setSaveDemandSuccess(true);
    setTimeout(() => setSaveDemandSuccess(false), 2500);
  };

  const realOrders = orderList || [];

  const pendingOrdersCount = realOrders.filter(o => o.status === 'PENDING' || o.status === 'RECEIVED').length;
  const inDeliveryOrdersCount = realOrders.filter(o => o.status === 'COOKING' || o.status === 'READY' || o.status === 'SHIPPING' || o.status === 'DELIVERING').length;
  const completedTodayOrdersCount = realOrders.filter(o => o.status === 'COMPLETED').length;

  const getStatusPriority = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'PENDING':
        return 1; // Prioritas 1: Pesanan baru/pending (Paling Atas)
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

  // Helper untuk mengekstrak timestamp angka akurat dari data pesanan
  const getOrderTimestamp = (ord: AdminOrder): number => {
    if (typeof ord.createdAt === 'number') return ord.createdAt;
    if (ord.createdAt && typeof (ord.createdAt as any).seconds === 'number') {
      return (ord.createdAt as any).seconds * 1000;
    }
    
    if (ord.date) {
      const dStr = ord.date.toLowerCase();
      const now = new Date();
      
      if (dStr.includes('hari ini') || dStr.includes('today')) {
        return now.getTime();
      }
      if (dStr.includes('kemarin') || dStr.includes('yesterday')) {
        return now.getTime() - 86400000;
      }
      
      // Parse tanggal format string "DD/MM/YYYY" atau "DD MMM YYYY"
      const parsed = Date.parse(ord.date.replace(/,/g, ''));
      if (!isNaN(parsed)) return parsed;
    }

    return Date.now();
  };

  const filteredOrders = React.useMemo(() => {
    const list = realOrders.filter((ord) => {
      // 1. Status Filter Matching
      if (orderStatusFilter !== 'ALL') {
        if (orderStatusFilter === 'PENDING') {
          if (ord.status !== 'PENDING' && ord.status !== 'RECEIVED') return false;
        } else if (orderStatusFilter === 'COOKING') {
          if (ord.status !== 'COOKING' && ord.status !== 'READY') return false;
        } else if (orderStatusFilter === 'SHIPPING') {
          if (ord.status !== 'SHIPPING' && ord.status !== 'DELIVERING') return false;
        } else if (ord.status !== orderStatusFilter) {
          return false;
        }
      }

      // 2. Date Range Filter
      if (orderDateRangeFilter !== 'all') {
        const orderTime = getOrderTimestamp(ord);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 86400000;

        if (orderDateRangeFilter === 'today') {
          if (orderTime < startOfToday) return false;
        } else if (orderDateRangeFilter === 'yesterday') {
          if (orderTime < startOfYesterday || orderTime >= startOfToday) return false;
        } else if (orderDateRangeFilter === '7days') {
          const sevenDaysAgo = startOfToday - 6 * 86400000;
          if (orderTime < sevenDaysAgo) return false;
        } else if (orderDateRangeFilter === '30days') {
          const thirtyDaysAgo = startOfToday - 29 * 86400000;
          if (orderTime < thirtyDaysAgo) return false;
        } else if (orderDateRangeFilter === 'thisMonth') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          if (orderTime < startOfMonth) return false;
        } else if (orderDateRangeFilter === 'lastMonth') {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).getTime();
          if (orderTime < startOfLastMonth || orderTime > endOfLastMonth) return false;
        } else if (orderDateRangeFilter === 'june2026') {
          const startOfJune = new Date(2026, 5, 1).getTime();
          const endOfJune = new Date(2026, 5, 30, 23, 59, 59).getTime();
          if (orderTime < startOfJune || orderTime > endOfJune) return false;
        }
      }

      // 3. Search Filter
      if (productSearch.trim()) {
        const query = productSearch.toLowerCase();
        const matchName = ord.customerName?.toLowerCase().includes(query);
        const matchId = ord.id?.toLowerCase().includes(query);
        const matchItem = ord.items?.some(i => i.name.toLowerCase().includes(query));
        if (!matchName && !matchId && !matchItem) return false;
      }
      return true;
    });

    // Urutkan: Pesanan BELUM SELESAI di atas (paling baru -> lama), lalu Pesanan SUDAH SELESAI di bawah (paling baru -> lama)
    return [...list].sort((a, b) => {
      const prioA = getStatusPriority(a.status);
      const prioB = getStatusPriority(b.status);

      if (prioA !== prioB) {
        return prioA - prioB; // Uncompleted (1..4) sebelum Completed (5..6)
      }

      // Urutan sekunder: Tanggal terbaru ke terlama
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return timeB - timeA;
    });
  }, [realOrders, orderStatusFilter, orderDateRangeFilter, productSearch]);

  return (
    <div className="space-y-6">
      {/* Hidden file input for Admin WA proof photo upload */}
      <input 
        type="file" 
        ref={adminFileInputRef} 
        accept="image/*" 
        onChange={handleAdminFileUpload} 
        className="hidden" 
      />

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#25160e]">Kelola Pesanan Masuk (Orders Desk)</h1>
          <p className="text-xs text-[#4f4540]">Pantau alur status pesanan 5-tahap dan kelola bukti pengantaran/COD dari kurir karyawan.</p>
        </div>
      </div>

      {/* SEKSI KONTROL PENGUMUMAN RESTO MEMBLUDAK (LONJAKAN PESANAN) */}
      <div className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isHighDemand ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-100 text-stone-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#25160e] flex items-center gap-2 flex-wrap">
                <span>Pengumuman Resto Membludak / Lonjakan Pesanan</span>
                {isHighDemand ? (
                  <span className="px-2.5 py-0.5 bg-amber-600 text-white rounded-full text-[10px] font-bold animate-pulse">
                    🔴 AKTIF DI TAMPILAN USER
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-stone-200 text-stone-700 rounded-full text-[10px] font-bold">
                    ⚪ NON-AKTIF (NORMAL)
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#4f4540] mt-0.5">
                Aktifkan pengumuman ini untuk memberi tahu pelanggan jika antrean resto sedang ramai/melonjak.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleHighDemand(!isHighDemand, demandMsgInput)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 ${
              isHighDemand
                ? 'bg-amber-700 hover:bg-amber-800 text-white'
                : 'bg-[#25160e] hover:bg-[#3c2a21] text-amber-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{isHighDemand ? 'Matikan Pengumuman' : 'Aktifkan Pengumuman Membludak'}</span>
          </button>
        </div>

        {/* CUSTOM MESSAGE FORM */}
        <form onSubmit={handleSaveHighDemand} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-[#25160e] mb-1">
              Pesan Pengumuman Lonjakan Pesanan untuk Pelanggan:
            </label>
            <textarea
              value={demandMsgInput}
              onChange={(e) => setDemandMsgInput(e.target.value)}
              rows={2}
              placeholder="Ketik pesan pemberitahuan untuk pelanggan saat resto ramai..."
              className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs text-[#25160e] focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-[11px] text-[#4f4540] italic">
              *Teks ini akan otomatis tampil di halaman Profil & Tracker Pelanggan jika status pengumuman di atas diaktifkan.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {saveDemandSuccess && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Pesan Tersimpan!
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                Simpan Pesan
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4 TOP INTERACTIVE KPI BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => setOrderStatusFilter('ALL')}
          className={`rounded-3xl p-5 border shadow-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] ${
            orderStatusFilter === 'ALL' ? 'bg-[#25160e] text-white border-[#25160e] ring-2 ring-[#934b19]' : 'bg-white border-amber-900/10'
          }`}
        >
          <div>
            <span className={`text-[11px] font-bold ${orderStatusFilter === 'ALL' ? 'text-amber-200' : 'text-[#4f4540]'}`}>Total Order</span>
            <h3 className={`font-serif text-2xl font-bold mt-1 ${orderStatusFilter === 'ALL' ? 'text-white' : 'text-[#25160e]'}`}>{realOrders.length} Pesanan</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#934b19] text-white flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5 text-amber-200" />
          </div>
        </div>

        <div
          onClick={() => setOrderStatusFilter('PENDING')}
          className={`rounded-3xl p-5 border shadow-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] ${
            orderStatusFilter === 'PENDING' ? 'bg-amber-800 text-white border-amber-900 ring-2 ring-amber-400' : 'bg-white border-amber-900/10'
          }`}
        >
          <div>
            <span className={`text-[11px] font-bold ${orderStatusFilter === 'PENDING' ? 'text-amber-200' : 'text-amber-700'}`}>Pending & Masuk</span>
            <h3 className={`font-serif text-2xl font-bold mt-1 ${orderStatusFilter === 'PENDING' ? 'text-white' : 'text-amber-700'}`}>{pendingOrdersCount} Pesanan</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
        </div>

        <div
          onClick={() => setOrderStatusFilter('COOKING')}
          className={`rounded-3xl p-5 border shadow-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] ${
            orderStatusFilter === 'COOKING' || orderStatusFilter === 'SHIPPING' ? 'bg-[#934b19] text-white border-[#934b19] ring-2 ring-amber-400' : 'bg-white border-amber-900/10'
          }`}
        >
          <div>
            <span className={`text-[11px] font-bold ${orderStatusFilter === 'COOKING' || orderStatusFilter === 'SHIPPING' ? 'text-amber-200' : 'text-[#934b19]'}`}>In Delivery (Proses)</span>
            <h3 className={`font-serif text-2xl font-bold mt-1 ${orderStatusFilter === 'COOKING' || orderStatusFilter === 'SHIPPING' ? 'text-white' : 'text-[#934b19]'}`}>{inDeliveryOrdersCount} Pesanan</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#934b19] text-white flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setOrderStatusFilter('COMPLETED')}
          className={`rounded-3xl p-5 border shadow-xl flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] ${
            orderStatusFilter === 'COMPLETED' ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-400' : 'bg-white border-amber-900/10'
          }`}
        >
          <div>
            <span className={`text-[11px] font-bold ${orderStatusFilter === 'COMPLETED' ? 'text-emerald-200' : 'text-emerald-700'}`}>Completed Today</span>
            <h3 className={`font-serif text-2xl font-bold mt-1 ${orderStatusFilter === 'COMPLETED' ? 'text-white' : 'text-emerald-700'}`}>{completedTodayOrdersCount} Selesai</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* BANNER NOTIFIKASI REALTIME: KONFIRMASI PENERIMAAN DARI PELANGGAN */}
      {realOrders.some(o => o.customerConfirmed) && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-4 sm:p-5 shadow-lg flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                <span>Notifikasi Realtime Penerimaan Pesanan</span>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px]">Tepat Waktu ⏱️</span>
              </span>
              <p className="text-xs text-emerald-800 font-medium truncate mt-0.5">
                Pesanan <strong>#{realOrders.find(o => o.customerConfirmed)?.id}</strong> telah dikonfirmasi sampai dengan baik oleh <strong>{realOrders.find(o => o.customerConfirmed)?.customerName}</strong> ({realOrders.find(o => o.customerConfirmed)?.confirmedAt || 'Hari ini'}).
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setOrderStatusFilter('COMPLETED');
            }}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer transition-all"
          >
            Lihat Pesanan Selesai
          </button>
        </div>
      )}

      {/* FILTERS BAR & SEARCH CONTROLS */}
      <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xl flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
          <span className="text-xs font-bold text-[#25160e] flex items-center gap-1.5 shrink-0 pr-1">
            <Filter className="w-4 h-4 text-[#934b19]" />
            <span>Status:</span>
          </span>
          {['ALL', 'PENDING', 'COOKING', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setOrderStatusFilter(st as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                orderStatusFilter === st
                  ? 'bg-[#25160e] text-white shadow-md'
                  : 'bg-[#fbf9f5] border border-amber-900/15 text-[#4f4540] hover:bg-stone-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input & Date Range Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:max-w-xl justify-end">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Cari No. Order / Pelanggan / Menu..."
              className="w-full pl-9 pr-4 py-2 bg-[#fbf9f5] border border-amber-900/15 rounded-xl text-xs text-[#25160e] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#934b19]/30 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#fbf9f5] border border-amber-900/15 rounded-xl px-3 py-2 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#934b19] shrink-0" />
            <select
              value={orderDateRangeFilter}
              onChange={(e) => setOrderDateRangeFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#25160e] outline-none cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini (Agustus 2026)</option>
              <option value="lastMonth">Bulan Lalu (Juli 2026)</option>
              <option value="june2026">Juni 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#934b19]">ID: #{ord.id}</span>
                  <span className="text-xs text-[#4f4540]">• {ord.date}</span>
                </div>
                <h3 className="font-bold text-sm text-[#25160e]">{ord.customerName} ({ord.phone || '08123456789'})</h3>
                <p className="text-xs text-[#4f4540] font-light truncate max-w-lg">{ord.address}</p>
              </div>
              <div className="text-right">
                <span className="font-serif text-lg font-bold text-[#25160e]">Rp {ord.total.toLocaleString('id-ID')}</span>
                <div className="mt-1 flex items-center gap-1.5 justify-end flex-wrap">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                    {ord.paymentMethod} ({ord.paymentBadge})
                  </span>

                  {(ord.voucherCode || ord.appliedPromo || (ord.discount && ord.discount > 0)) ? (
                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full border border-amber-300 flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-[#934B19]" />
                      <span>{ord.voucherCode || ord.appliedPromo || 'Promo'} (-Rp {(ord.discount || 0).toLocaleString('id-ID')})</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-medium rounded-full border border-stone-200">
                      Tanpa Promo
                    </span>
                  )}

                  {/* BADGE KONFIRMASI TIBA DARI PELANGGAN */}
                  {ord.customerConfirmed && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Dikonfirmasi Pelanggan (Tepat Waktu • {ord.confirmedAt || 'Hari ini'})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {ord.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#fbf9f5] px-3 py-1.5 rounded-xl border border-amber-900/10 shrink-0">
                  <span className="text-xs font-bold text-[#25160e]">{it.quantity}x</span>
                  <span className="text-xs text-[#4f4540] font-medium">{it.name}</span>
                </div>
              ))}
            </div>

            {/* SEKSI BUKTI FOTO PENERIMAAN UNTUK ADMIN (DARI WA KURIR/KARYAWAN) */}
            <div className="p-4 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-900/10 pb-2.5">
                <div>
                  <span className="text-xs font-bold text-[#25160E] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#934B19]" />
                    Bukti Pengantaran &amp; Pembayaran COD (dari WA Kurir/Karyawan)
                  </span>
                  <p className="text-[10px] text-[#4F4540]">
                    Karyawan mengirim foto serah terima/COD via WhatsApp. Admin mengunggah bukti ke sistem untuk verifikasi resmi.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {ord.proofPhoto && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Foto Makanan Ada
                    </span>
                  )}
                  {ord.paymentProofPhoto && (
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Bukti Uang COD Ada
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. FOTO BUKTI MAKANAN DITERIMA */}
                {ord.proofPhoto ? (
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-900/15 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        onClick={() => setSelectedProofPhoto(ord.proofPhoto!)}
                        className="w-14 h-14 min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px] rounded-xl overflow-hidden border border-amber-900/20 shadow-xs shrink-0 bg-stone-900 cursor-pointer group relative"
                        title="Klik untuk Perbesar Foto Makanan"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ord.proofPhoto} alt="Bukti Makanan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 block" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-[#25160E] block truncate">1. Bukti Makanan #{ord.id}</span>
                        <span className="text-[10px] text-emerald-700 font-semibold block truncate">Tersimpan dari Kurir WA</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedProofPhoto(ord.proofPhoto!)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#25160E] text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                        title="Lihat Foto Full Size"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerUpload(ord.id, 'proof')}
                        className="px-2.5 py-1.5 bg-[#934B19] hover:bg-[#783603] text-white text-[11px] font-bold rounded-lg shadow transition-all flex items-center gap-1"
                        title="Ganti / Upload Ulang Foto dari WA"
                      >
                        <UploadCloud className="w-3 h-3 text-amber-200" />
                        <span>Ganti Foto</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-dashed border-amber-900/30 rounded-xl flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-[#25160E] block">1. Bukti Serah Terima Makanan</span>
                      <span className="text-[10px] text-[#4F4540]">Belum diunggah</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerUpload(ord.id, 'proof')}
                      className="px-3 py-1.5 bg-[#934B19] hover:bg-[#783603] text-white text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-amber-200" />
                      <span>+ Upload Foto (WA)</span>
                    </button>
                  </div>
                )}

                {/* 2. FOTO BUKTI PEMBAYARAN TUNAI COD */}
                {ord.paymentProofPhoto ? (
                  <div className="flex items-center justify-between gap-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-600/25 shadow-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        onClick={() => setSelectedProofPhoto(ord.paymentProofPhoto!)}
                        className="w-14 h-14 min-w-[56px] max-w-[56px] min-h-[56px] max-h-[56px] rounded-xl overflow-hidden border border-emerald-600/30 shadow-xs shrink-0 bg-stone-900 cursor-pointer group relative"
                        title="Klik untuk Perbesar Foto Pembayaran COD"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ord.paymentProofPhoto} alt="Bukti Pembayaran COD" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 block" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-emerald-950 block truncate">2. Bukti Uang Tunai COD</span>
                        <span className="text-[10px] text-emerald-800 font-semibold block truncate">Lunas Rp {ord.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedProofPhoto(ord.paymentProofPhoto!)}
                        className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                        title="Lihat Foto Full Size"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerUpload(ord.id, 'payment')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow transition-all flex items-center gap-1"
                        title="Ganti / Upload Ulang Foto Uang dari WA"
                      >
                        <UploadCloud className="w-3 h-3 text-emerald-200" />
                        <span>Ganti Uang</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-dashed border-stone-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-[#25160E] block">
                        2. {ord.paymentMethod?.toLowerCase().includes('cod') ? 'Bukti Uang Tunai COD' : 'Metode Pembayaran Online'}
                      </span>
                      <span className="text-[10px] text-[#4F4540]">
                        {ord.paymentMethod?.toLowerCase().includes('cod') ? 'Kurir menyerahkan uang via WA' : 'Non-COD (Verifikasi Otomatis)'}
                      </span>
                    </div>
                    {ord.paymentMethod?.toLowerCase().includes('cod') ? (
                      <button
                        type="button"
                        onClick={() => triggerUpload(ord.id, 'payment')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-emerald-200" />
                        <span>+ Upload Uang (WA)</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-[10px] font-bold shrink-0">
                        Online Midtrans
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#25160e]">Status Alur Realtime:</span>
                <span className="px-3 py-1 bg-[#25160e] text-amber-200 text-xs font-bold rounded-full uppercase">
                  {ord.status}
                </span>
                {ord.paymentMethod?.toLowerCase().includes('cod') && (
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${ord.paymentBadge === 'PAID' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                    COD {ord.paymentBadge === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => updateOrderStatus(ord.id, 'COOKING')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all ${ord.status === 'COOKING' ? 'bg-amber-600 text-white ring-2 ring-amber-300' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
                >
                  Set Dimasak
                </button>
                <button
                  onClick={() => updateOrderStatus(ord.id, 'DELIVERING')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 ${ord.status === 'DELIVERING' || ord.status === 'SHIPPING' ? 'bg-[#783603] text-white ring-2 ring-amber-300' : 'bg-[#934b19] hover:bg-[#783603] text-white'}`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Set Diantar (Kurir Meluncur)</span>
                </button>
                <button
                  onClick={() => updateOrderStatus(ord.id, 'DELIVERED')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 ${ord.status === 'DELIVERED' ? 'bg-blue-700 text-white ring-2 ring-blue-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Set Sampai di Lokasi</span>
                </button>
                <button
                  onClick={() => {
                    const isCod = ord.paymentMethod?.toLowerCase().includes('cod') || ord.paymentMethod?.toLowerCase().includes('cash on delivery');
                    updateOrderStatus(ord.id, 'COMPLETED');
                    if (isCod) {
                      alert(`✅ Pesanan #${ord.id} berhasil ditandai SELESAI dan status COD LUNAS!`);
                    }
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 ${ord.status === 'COMPLETED' ? 'bg-emerald-700 text-white ring-2 ring-emerald-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Set Selesai {ord.paymentMethod?.toLowerCase().includes('cod') ? '& Lunas COD' : ''}</span>
                </button>
                <button
                  onClick={() => setSelectedReceiptOrder(ord)}
                  className="p-2 bg-stone-100 hover:bg-amber-100 text-[#934b19] rounded-xl border border-amber-900/10 shadow-xs transition-all"
                  title="Cetak Struk Pembelian / Nota Order"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-amber-900/10 shadow-md space-y-3">
          <div className="w-14 h-14 bg-amber-50 text-[#934b19] rounded-2xl flex items-center justify-center mx-auto text-2xl">
            📅
          </div>
          <h4 className="font-serif font-bold text-base text-[#25160e]">Tidak Ada Pesanan Pada Rentang Waktu Ini</h4>
          <p className="text-xs text-[#4f4540] max-w-sm mx-auto font-light">
            Belum ada transaksi pesanan yang sesuai dengan filter rentang waktu atau status yang dipilih. Silakan ubah pilihan filter tanggal di atas.
          </p>
          <button
            onClick={() => {
              setOrderDateRangeFilter('all');
              setOrderStatusFilter('ALL');
              setProductSearch('');
            }}
            className="px-4 py-2 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow-sm"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
      </div>

      {/* MODAL ZOOM FULL-SCREEN BUKTI FOTO UNTUK ADMIN */}
      {selectedProofPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" 
          onClick={() => setSelectedProofPhoto(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-[#25160E] rounded-3xl overflow-hidden shadow-2xl border border-amber-900/40" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#1e110a] flex items-center justify-between border-b border-amber-900/30">
              <span className="font-serif text-sm font-bold text-amber-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                Bukti Foto Penerimaan Pesanan Pelanggan (Ukuran Penuh)
              </span>
              <button 
                onClick={() => setSelectedProofPhoto(null)} 
                className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedProofPhoto} 
                alt="Bukti Foto Full Size" 
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg" 
              />
            </div>

            <div className="p-4 bg-[#1e110a] border-t border-amber-900/30 flex justify-between items-center text-xs text-amber-200/80">
              <span>Terverifikasi & Dikonfirmasi oleh Pelanggan</span>
              <a 
                href={selectedProofPhoto} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#934B19] hover:bg-[#783603] text-white font-bold rounded-xl flex items-center gap-1.5 shadow transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Tab Baru</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK STRUK ORDERAN INDIVIDUAL */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160e]/60 backdrop-blur-md animate-fade-in print:hidden">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-amber-900/15 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#934b19]" />
                <h3 className="font-serif text-lg font-bold text-[#25160e]">Struk Pembelian Order #{selectedReceiptOrder.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedReceiptOrder(null)} 
                className="text-stone-400 hover:text-[#25160e] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PREVIEW STRUK THERMAL NOTA */}
            <div className="bg-[#fbf9f5] border border-amber-900/15 p-5 rounded-2xl font-mono text-xs text-[#25160e] space-y-3.5 shadow-inner">
              <div className="text-center space-y-1">
                <h4 className="font-serif text-base font-bold text-[#25160e] tracking-wide">NEFAKKY KULINER NUSANTARA</h4>
                <p className="text-[10px] text-[#4f4540]">Resep Warisan Cita Rasa Otentik</p>
                <p className="text-[9.5px] text-stone-500">Jl. Sultan Agung No. 45, Jakarta | WA: 0812-3456-7890</p>
                <div className="border-b border-dashed border-stone-400 my-2" />
              </div>

              <div className="space-y-1 text-[10.5pt]">
                <div className="flex justify-between">
                  <span className="text-stone-500">No. Struk:</span>
                  <span className="font-bold">#{selectedReceiptOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Tanggal:</span>
                  <span>{selectedReceiptOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pelanggan:</span>
                  <span className="font-bold">{selectedReceiptOrder.customerName || 'Pelanggan'}</span>
                </div>
                {selectedReceiptOrder.address && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Alamat:</span>
                    <span className="truncate max-w-[180px] text-right">{selectedReceiptOrder.address}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Metode Bayar:</span>
                  <span className="font-bold text-[#934b19]">{selectedReceiptOrder.paymentMethod || 'Online'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status Promo:</span>
                  {(selectedReceiptOrder.voucherCode || selectedReceiptOrder.appliedPromo || (selectedReceiptOrder.discount && selectedReceiptOrder.discount > 0)) ? (
                    <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">
                      Pakai Promo ({selectedReceiptOrder.voucherCode || selectedReceiptOrder.appliedPromo || 'Voucher'})
                    </span>
                  ) : (
                    <span className="text-stone-500 font-medium">Tanpa Promo (-)</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Status Alur:</span>
                  <span className="font-bold text-emerald-800">{selectedReceiptOrder.status}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-stone-400 my-2" />

              {/* LIST ITEMS DIPESAN */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-stone-500 uppercase">
                  <span>Menu (Qty)</span>
                  <span>Total (Rp)</span>
                </div>
                {(selectedReceiptOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-[#25160e]">{item.name}</span>
                      <span className="text-stone-500 block text-[9.5px]">{item.quantity}x @ Rp {(item.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <span className="font-bold text-[#25160e]">Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-stone-400 my-2" />

              {/* TOTAL BAYAR & SUMMARY */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal Produk:</span>
                  <span>Rp {(selectedReceiptOrder.subtotal || (selectedReceiptOrder.total + (selectedReceiptOrder.discount || 0) - (selectedReceiptOrder.shippingCost || 0))).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Ongkos Kirim:</span>
                  <span>Rp {(selectedReceiptOrder.shippingCost || 0).toLocaleString('id-ID')}</span>
                </div>
                {(selectedReceiptOrder.discount && selectedReceiptOrder.discount > 0) ? (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Diskon Promo ({selectedReceiptOrder.voucherCode || selectedReceiptOrder.appliedPromo || 'Kupon'}):</span>
                    <span>- Rp {selectedReceiptOrder.discount.toLocaleString('id-ID')}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-stone-400">
                    <span>Diskon Promo:</span>
                    <span>Rp 0 (Tanpa Promo)</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#25160e] pt-1.5 border-t border-stone-300">
                  <span>TOTAL BAYAR:</span>
                  <span className="text-[#934b19]">Rp {selectedReceiptOrder.total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-stone-400 my-2" />

              {/* FOOTER STRUK */}
              <div className="text-center text-[10px] text-stone-500 space-y-1">
                <p className="font-bold text-[#25160e]">TERIMA KASIH ATAS PESANAN ANDA!</p>
                <p className="italic">"Selamat Menikmati Kelezatan Kuliner Nefakky"</p>
                {(selectedReceiptOrder.voucherCode || selectedReceiptOrder.appliedPromo) && (
                  <p className="text-[9px] text-[#934B19] font-bold font-mono">
                    *Hemat Rp {(selectedReceiptOrder.discount || 0).toLocaleString('id-ID')} dengan Kupon {selectedReceiptOrder.voucherCode || selectedReceiptOrder.appliedPromo}
                  </p>
                )}
                <p className="text-[9px] text-stone-400 font-mono">Simpan struk ini sebagai bukti pembayaran sah.</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 text-[#4f4540] text-xs font-bold rounded-2xl transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-1/2 py-3 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-amber-200" />
                <span>Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT FOR WINDOW.PRINT */}
      {selectedReceiptOrder && (
        <div className="hidden print:block bg-white text-[#25160E] p-6 max-w-sm mx-auto font-mono text-xs space-y-4">
          <div className="text-center space-y-1">
            <h1 className="font-serif text-lg font-bold tracking-tight text-[#25160E]">NEFAKKY KULINER NUSANTARA</h1>
            <p className="text-[10px] text-stone-600 font-bold uppercase">Resep Warisan Kuliner Asli Indonesia</p>
            <p className="text-[9.5px] text-stone-500">Jl. Sultan Agung No. 45, Jakarta | WA: 0812-3456-7890</p>
            <div className="border-b-2 border-dashed border-black my-2" />
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>NO. STRUK:</span>
              <span className="font-bold">#{selectedReceiptOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span>TANGGAL:</span>
              <span>{selectedReceiptOrder.date}</span>
            </div>
            <div className="flex justify-between">
              <span>PELANGGAN:</span>
              <span className="font-bold">{selectedReceiptOrder.customerName || 'Pelanggan'}</span>
            </div>
            {selectedReceiptOrder.address && (
              <div className="flex justify-between">
                <span>ALAMAT:</span>
                <span className="truncate max-w-[180px]">{selectedReceiptOrder.address}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>PEMBAYARAN:</span>
              <span className="font-bold">{selectedReceiptOrder.paymentMethod || 'Online'}</span>
            </div>
            <div className="flex justify-between">
              <span>STATUS:</span>
              <span className="font-bold">{selectedReceiptOrder.status}</span>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-black my-2" />

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span>QTY &amp; MENU</span>
              <span>TOTAL (RP)</span>
            </div>
            {(selectedReceiptOrder.items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <div>
                  <span className="font-bold">{item.name}</span>
                  <span className="text-stone-600 block text-[9.5px]">{item.quantity}x @ Rp {(item.price || 0).toLocaleString('id-ID')}</span>
                </div>
                <span className="font-bold">Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>

          <div className="border-b-2 border-dashed border-black my-2" />

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>SUBTOTAL PRODUK:</span>
              <span>Rp {selectedReceiptOrder.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>ONGKOS KIRIM:</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-black">
              <span>TOTAL BAYAR:</span>
              <span>Rp {selectedReceiptOrder.total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-black my-2" />

          <div className="text-center text-[10px] text-stone-600 space-y-1">
            <p className="font-bold text-black">TERIMA KASIH ATAS PESANAN ANDA!</p>
            <p className="italic">"Selamat Menikmati Kelezatan Kuliner Nefakky"</p>
            <p className="text-[9px] text-stone-500">Simpan Struk Ini Sebagai Bukti Pembayaran Sah.</p>
          </div>
        </div>
      )}
    </div>
  );
}
