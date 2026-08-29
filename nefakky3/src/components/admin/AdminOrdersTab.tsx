'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminOrdersTab (src/components/admin/AdminOrdersTab.tsx)
 * DESKRIPSI: Konversi 100% presisi dari Stitch MCP HTML/Tailwind
 *            (Kitchen Desk - Kelola Pesanan Masuk, Live Alert Konfirmasi User,
 *            High Demand Banner High-Contrast, 4 KPI Cards, Toolbar Filter,
 *            Card 3-Kolom, Bukti Foto Kurir WA/COD, & Cetak Nota).
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Search,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AdminOrder, useData } from '@/context/DataContext';
import { getDetailedOrderDateTime } from '@/lib/orderTimeUtils';
import { createOrderCalendarUrl } from '@/lib/googleCalendar';
import { 
  RealtimeCalendarInfo, 
  getRealtimeCalendarNow, 
  syncRealtimeCalendarClock 
} from '@/lib/realtimeCalendarApi';

interface AdminOrdersTabProps {
  orderList: AdminOrder[];
  updateOrderStatus: (orderId: string, newStatus: any) => void;
  onPrintPDF: () => void;
}

export default function AdminOrdersTab({
  orderList,
  updateOrderStatus,
  onPrintPDF
}: AdminOrdersTabProps) {
  // --------------------------------------------------------------------------
  // DATA CONTEXT & STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const { 
    isHighDemand, 
    highDemandMessage, 
    toggleHighDemand, 
    uploadOrderProofPhoto, 
    uploadOrderPaymentProofPhoto 
  } = useData();

  const [selectedProofPhoto, setSelectedProofPhoto] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<{ orderId: string; type: 'proof' | 'payment' } | null>(null);
  const adminFileInputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PENDING' | 'PREPARING' | 'READY' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'>('ALL');

  // Live Realtime Calendar & Clock Ticker
  const [liveCalendarInfo, setLiveCalendarInfo] = useState<RealtimeCalendarInfo>(() => getRealtimeCalendarNow());

  useEffect(() => {
    syncRealtimeCalendarClock().then(() => {
      setLiveCalendarInfo(getRealtimeCalendarNow());
    });
    const timer = setInterval(() => {
      setLiveCalendarInfo(getRealtimeCalendarNow());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [demandMsgInput, setDemandMsgInput] = useState<string>(highDemandMessage || 'Mohon maaf, waktu tunggu saat ini mencapai 45-60 menit karena lonjakan pesanan.');
  const [saveDemandSuccess, setSaveDemandSuccess] = useState<boolean>(false);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<AdminOrder | null>(null);

  // --------------------------------------------------------------------------
  // FILE UPLOAD HANDLER
  // --------------------------------------------------------------------------
  const handleAdminFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadTarget) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (uploadTarget.type === 'proof') {
          uploadOrderProofPhoto(uploadTarget.orderId, base64);
        } else {
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
    if (highDemandMessage) {
      setDemandMsgInput(highDemandMessage);
    }
  }, [highDemandMessage]);

  const handleSaveHighDemand = () => {
    toggleHighDemand(isHighDemand, demandMsgInput.trim());
    setSaveDemandSuccess(true);
    setTimeout(() => setSaveDemandSuccess(false), 2500);
  };

  const realOrders = orderList || [];

  // Timestamp extraction helper
  const getOrderTimestamp = (ord: AdminOrder): number => {
    if (typeof ord.createdAt === 'number') return ord.createdAt;
    if (ord.createdAt && typeof (ord.createdAt as any).seconds === 'number') {
      return (ord.createdAt as any).seconds * 1000;
    }
    if (ord.date) {
      const dStr = ord.date.toLowerCase();
      const now = new Date();
      if (dStr.includes('baru saja') || dStr.includes('just now')) return now.getTime();
      const minsMatch = dStr.match(/(\d+)\s*(m|mnt|menit)\s*lalu/i);
      if (minsMatch) return now.getTime() - parseInt(minsMatch[1], 10) * 60 * 1000;
      const hoursMatch = dStr.match(/(\d+)\s*(jam|h|hour)\s*lalu/i);
      if (hoursMatch) return now.getTime() - parseInt(hoursMatch[1], 10) * 3600 * 1000;
      const parsed = Date.parse(ord.date);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  };

  // Sort orders newest-first
  const sortedOrders = useMemo(() => {
    return [...realOrders].sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
  }, [realOrders]);

  // Last confirmed order by user
  const lastConfirmedOrder = useMemo(() => {
    return sortedOrders.find(o => o.customerConfirmed === true);
  }, [sortedOrders]);

  // KPI Metrics Calculation (100% Realtime dari Database)
  const totalOrdersCount = sortedOrders.length;
  const pendingOrdersCount = sortedOrders.filter(o => o.status === 'PENDING' || o.status === 'RECEIVED').length;
  const preparingOrdersCount = sortedOrders.filter(o => o.status === 'PREPARING' || o.status === 'COOKING').length;
  const inDeliveryCount = sortedOrders.filter(o => o.status === 'SHIPPING' || o.status === 'DELIVERING' || o.status === 'ON_DELIVERY' || o.status === 'READY' || o.status === 'DELIVERED').length;
  const completedTodayCount = sortedOrders.filter(o => o.status === 'COMPLETED').length;
  const confirmedOrdersCount = sortedOrders.filter(o => o.customerConfirmed === true).length;

  // Helper filter rentang waktu
  const isWithinTimeRange = (order: AdminOrder, filter: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'): boolean => {
    if (filter === 'ALL') return true;

    const ts = getOrderTimestamp(order);
    const dateStr = (order.date || '').toLowerCase();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - (7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    if (filter === 'TODAY') {
      if (dateStr.includes('hari ini') || dateStr.includes('today') || dateStr.includes('baru saja') || dateStr.includes('lalu')) {
        return true;
      }
      return ts >= startOfToday;
    }

    if (filter === 'THIS_WEEK') {
      if (dateStr.includes('hari ini') || dateStr.includes('kemarin') || dateStr.includes('lalu')) {
        return true;
      }
      return ts >= startOfWeek;
    }

    if (filter === 'THIS_MONTH') {
      if (dateStr.includes('agt') || dateStr.includes('agustus') || dateStr.includes('hari ini') || dateStr.includes('kemarin') || dateStr.includes('lalu')) {
        return true;
      }
      return ts >= startOfMonth;
    }

    return true;
  };

  // Filtered Orders (Hanya dari pesanan riil database)
  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      // 1. Filter Status
      if (orderStatusFilter === 'PENDING' && order.status !== 'PENDING' && order.status !== 'RECEIVED') return false;
      if (orderStatusFilter === 'PREPARING' && order.status !== 'PREPARING' && order.status !== 'COOKING') return false;
      if (orderStatusFilter === 'READY' && order.status !== 'READY') return false;
      if (orderStatusFilter === 'SHIPPING' && order.status !== 'SHIPPING' && order.status !== 'DELIVERING' && order.status !== 'ON_DELIVERY' && order.status !== 'DELIVERED') return false;
      if (orderStatusFilter === 'COMPLETED' && order.status !== 'COMPLETED') return false;
      if (orderStatusFilter === 'CANCELLED' && order.status !== 'CANCELLED') return false;

      // 2. Filter Rentang Waktu (Terbaru, Hari Ini, Minggu Ini, Bulan Ini)
      if (!isWithinTimeRange(order, timeFilter)) return false;

      // 3. Filter Search Query
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchId = (order.id || '').toLowerCase().includes(q);
        const matchCust = (order.customerName || '').toLowerCase().includes(q);
        const matchAddr = (order.address || '').toLowerCase().includes(q);
        const matchItems = (order.items || []).some(it => (it.name || '').toLowerCase().includes(q));
        if (!matchId && !matchCust && !matchAddr && !matchItems) return false;
      }

      return true;
    });
  }, [sortedOrders, orderStatusFilter, timeFilter, productSearch]);

  const displayOrders = filteredOrders;

  return (
    <div className="flex flex-col w-full text-on-surface space-y-6">
      {/* Hidden File Input for Courier WhatsApp Proof Photos */}
      <input 
        type="file" 
        ref={adminFileInputRef} 
        accept="image/*" 
        onChange={handleAdminFileUpload} 
        className="hidden" 
      />

      {/* 1. HEADER & LIVE ALERT */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight font-['Playfair_Display']">
            Kelola Pesanan Masuk (Kitchen Desk)
          </h1>
          <p className="font-body-base text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Pantau alur status pesanan 5-tahap dan kelola bukti pengantaran/COD dari kurir karyawan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Live Realtime Calendar & Clock Indicator */}
          <div 
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-300 font-mono text-xs font-bold shadow-xs"
            title="Sinkronisasi Kalender & Jam Realtime WIB Otomatis"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="material-symbols-outlined text-[16px] text-emerald-700">schedule</span>
            <span>{liveCalendarInfo.formattedFull}</span>
          </div>

          {/* Live Customer Confirmation Alert */}
          <div className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-sm animate-pulse border border-white/10">
            <span className="material-symbols-outlined text-[20px] text-amber-300">
              notifications_active
            </span>
            <span className="font-body-base text-xs sm:text-sm font-semibold">
              {confirmedOrdersCount} Pesanan Siap / Diterima
            </span>
          </div>
        </div>
      </div>

      {/* 2. HIGH DEMAND BANNER (Pengumuman Resto Membludak - High Contrast) */}
      <div className="flex flex-col bg-rose-50 rounded-3xl shadow-xs overflow-hidden border-2 border-rose-200 p-5 gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-900 font-bold text-sm sm:text-base">
            <span className="material-symbols-outlined text-[24px] text-rose-600">warning</span>
            <span>Pengumuman Resto Membludak / Lonjakan Pesanan</span>
          </div>

          {/* Toggle Switch with Clear Label */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700">
              {isHighDemand ? 'AKTIF' : 'NON-AKTIF'}
            </span>
            <label className="flex items-center cursor-pointer relative">
              <input 
                type="checkbox"
                checked={isHighDemand}
                onChange={() => toggleHighDemand(!isHighDemand, demandMsgInput)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-stone-300 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 shadow-sm border border-stone-300"></div>
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2.5 flex-1 bg-white p-2.5 rounded-xl border border-rose-200 shadow-2xs">
            <span className="material-symbols-outlined text-stone-400 text-[20px]">edit_note</span>
            <input 
              type="text"
              value={demandMsgInput}
              onChange={(e) => setDemandMsgInput(e.target.value)}
              placeholder="Tulis pesan estimasi waktu antrean..."
              className="flex-1 bg-transparent text-stone-900 font-body-base text-xs outline-none font-medium"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveHighDemand}
            className="px-5 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
          >
            {saveDemandSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <span>Simpan Pengumuman</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. KPI METRIC CARDS (4-Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Order */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-5 shadow-xs gap-2 border border-outline-variant/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-caps uppercase text-[11px] font-bold">Total Order</span>
            <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
          </div>
          <div className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface">
            {totalOrdersCount}
          </div>
          <span className="text-[11px] text-on-surface-variant">Semua pesanan masuk</span>
        </div>

        {/* Pending & Masuk */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-5 shadow-xs gap-2 border border-outline-variant/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between text-amber-800">
            <span className="font-label-caps uppercase text-[11px] font-bold">Pesanan Masuk</span>
            <span className="material-symbols-outlined text-[20px] text-amber-600">hourglass_empty</span>
          </div>
          <div className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface">
            {pendingOrdersCount}
          </div>
          <span className="text-[11px] text-amber-800 font-semibold">Menunggu konfirmasi dapur</span>
        </div>

        {/* Sedang Disiapkan / Dimasak */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-5 shadow-xs gap-2 border border-outline-variant/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between text-orange-800">
            <span className="font-label-caps uppercase text-[11px] font-bold">Disiapkan / Dimasak</span>
            <span className="material-symbols-outlined text-[20px] text-orange-600">skillet</span>
          </div>
          <div className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface">
            {preparingOrdersCount}
          </div>
          <span className="text-[11px] text-orange-800 font-semibold">Dapur sedang menyiapkan menu</span>
        </div>

        {/* Completed Today */}
        <div className="flex flex-col bg-surface-container-lowest rounded-2xl p-5 shadow-xs gap-2 border border-outline-variant/20 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="font-label-caps uppercase text-[11px] font-bold">Completed</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          </div>
          <div className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface">
            {completedTodayCount}
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold">Pesanan sukses &amp; lunas</span>
        </div>
      </div>

      {/* 4. TOOLBAR FILTERS & SEARCH */}
      <div className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-xs">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { key: 'ALL' as const, label: 'Semua Pesanan', count: totalOrdersCount },
              { key: 'PENDING' as const, label: 'Pesanan Masuk', count: pendingOrdersCount },
              { key: 'PREPARING' as const, label: 'Disiapkan / Dimasak', count: preparingOrdersCount },
              { key: 'READY' as const, label: 'Pesanan Siap', count: sortedOrders.filter(o => o.status === 'READY').length },
              { key: 'SHIPPING' as const, label: 'Pengiriman', count: inDeliveryCount },
              { key: 'COMPLETED' as const, label: 'Selesai', count: completedTodayCount },
              { key: 'CANCELLED' as const, label: 'Dibatalkan', count: sortedOrders.filter(o => o.status === 'CANCELLED').length },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setOrderStatusFilter(st.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  orderStatusFilter === st.key
                    ? 'bg-[#25160E] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>{st.label}</span>
                {st.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    orderStatusFilter === st.key ? 'bg-amber-400 text-black' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {st.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1 sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input 
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Cari ID, Pembeli, Menu..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 font-medium"
            />
          </div>
        </div>

        {/* Baris Urutan Waktu: Terbaru, Hari Ini, Minggu Ini, Bulan Ini */}
        <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/15 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#934B19]">schedule</span>
            <span>Urutan Waktu:</span>
          </span>

          {[
            { key: 'ALL' as const, label: 'Terbaru', icon: 'history' },
            { key: 'TODAY' as const, label: 'Hari Ini', icon: 'today' },
            { key: 'THIS_WEEK' as const, label: 'Minggu Ini', icon: 'date_range' },
            { key: 'THIS_MONTH' as const, label: 'Bulan Ini', icon: 'calendar_month' },
          ].map((tf) => (
            <button
              key={tf.key}
              type="button"
              onClick={() => setTimeFilter(tf.key)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                timeFilter === tf.key
                  ? 'bg-[#25160E] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {tf.icon}
              </span>
              <span>{tf.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* 5. ORDER CARDS GRID (3 Columns Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayOrders.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white rounded-3xl border border-dashed border-stone-300 flex flex-col items-center justify-center gap-3.5 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-[#934B19] flex items-center justify-center border border-amber-200">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline-md text-base font-bold text-stone-900">
                Belum Ada Pesanan Masuk (Realtime)
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Data terhubung 100% secara realtime dengan database toko. Saat pelanggan membuat pesanan baru di web, tiket pesanan dapur akan langsung muncul di sini tanpa perlu refresh.
              </p>
            </div>
          </div>
        ) : (
          displayOrders.map((order: any) => {
            const isPending = order.status === 'PENDING' || order.status === 'RECEIVED';
            const isPreparing = order.status === 'PREPARING';
            const isCooking = order.status === 'COOKING';
            const isReady = order.status === 'READY';
            const isDelivering = order.status === 'DELIVERING' || order.status === 'SHIPPING' || order.status === 'ON_DELIVERY';
            const isDelivered = order.status === 'DELIVERED';
            const isCompleted = order.status === 'COMPLETED';
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div 
                key={order.id}
                className={`bg-surface-container-lowest rounded-2xl p-5 shadow-xs border flex flex-col justify-between transition-all ${
                  order.customerConfirmed 
                    ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' 
                    : isCancelled
                    ? 'border-rose-300/50 bg-rose-50/20'
                    : 'border-outline-variant/20 hover:border-outline-variant/50'
                }`}
              >
                <div>
                  {/* Card Header: Order ID, Time, & Status Selector */}
                  <div className="flex items-start justify-between border-b border-outline-variant/20 pb-3 mb-3">
                    <div>
                      <div className="font-mono-data font-bold text-sm text-on-surface flex items-center gap-2">
                        <span>#{order.id}</span>
                        {isPending && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        )}
                      </div>
                      {(() => {
                        const timeInfo = getDetailedOrderDateTime(order);
                        return (
                          <div className="font-body-sm text-[11px] text-on-surface-variant flex flex-col gap-0.5 mt-0.5">
                            <span className="font-bold text-stone-900 flex items-center gap-1">
                              <span className="text-[#934B19]">{timeInfo.dayName},</span>
                              <span>{timeInfo.fullDateStr}</span>
                            </span>
                            <span className="font-mono text-stone-500 text-[10px] flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-stone-400" />
                              <span>{timeInfo.timeStr}</span>
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* Status Selector Settings (Dropdown Langsung Pengaturan Status) */}
                      <div className="relative group">
                        <select
                          value={order.status || 'RECEIVED'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          title="Klik untuk mengatur / mengubah status pesanan"
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold uppercase cursor-pointer outline-none border transition-all appearance-none pr-6 shadow-2xs font-mono ${
                            isCompleted 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                              : isDelivered 
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-300 hover:bg-cyan-100' 
                              : isDelivering 
                              ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100' 
                              : isReady
                              ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
                              : isPreparing || isCooking 
                              ? 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100' 
                              : isCancelled
                              ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          <option value="RECEIVED">📥 RECEIVED (Pesanan Diterima)</option>
                          <option value="PREPARING">🍳 PREPARING (Pesanan Disiapkan)</option>
                          <option value="COOKING">🔥 COOKING (Sedang Dimasak)</option>
                          <option value="READY">📦 READY (Pesanan Siap)</option>
                          <option value="DELIVERING">🛵 DELIVERING (Sedang Diantar)</option>
                          <option value="DELIVERED">📍 DELIVERED (Tiba di Lokasi)</option>
                          <option value="COMPLETED">✅ COMPLETED (Selesai & Lunas)</option>
                          <option value="CANCELLED">❌ CANCELLED (Dibatalkan)</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[14px] text-stone-600">
                          expand_more
                        </span>
                      </div>

                      {order.customerConfirmed && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded text-[9px] font-bold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-emerald-700" />
                          <span>Dikonfirmasi Pembeli</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-1 text-xs mb-3">
                    <div className="font-bold text-on-surface text-xs sm:text-sm">
                      {order.customerName || 'Pelanggan'}
                    </div>
                    <div className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                      {order.address || 'Alamat Pengiriman'}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-surface-container-low p-3 rounded-xl space-y-2 mb-3 border border-outline-variant/10 text-xs">
                    {(order.items || []).map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-semibold text-on-surface truncate pr-2">
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-mono-data text-[11px] text-on-surface-variant shrink-0">
                          Rp {((it.price || 0) * (it.quantity || 1)).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center font-bold text-xs">
                      <span>Total Bayar:</span>
                      <span className="font-mono-data text-primary">
                        Rp {(order.total || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Payment & Courier Info */}
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-4 px-1">
                    <span className="font-semibold text-on-surface">{order.paymentMethod || 'COD'}</span>
                    <span className="font-mono-data">{order.courierName || 'Karyawan Nefakky'}</span>
                  </div>

                  {/* Photo Proof Slots (WhatsApp Kurir & COD) */}
                  {(() => {
                    const isCod = (order.paymentMethod || '').toUpperCase().includes('COD') || 
                                  (order.paymentMethod || '').toUpperCase().includes('TUNAI') ||
                                  (order.paymentMethod || '').toUpperCase().includes('CASH') ||
                                  (order.paymentMethod || '').toUpperCase().includes('BAYAR DI TEMPAT');

                    return (
                      <div className={`grid ${isCod ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4`}>
                        {/* Proof Photo 1: Serah Terima */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase">Bukti Makanan</span>
                          {order.proofPhoto ? (
                            <div 
                              onClick={() => setSelectedProofPhoto(order.proofPhoto)}
                              className="h-16 rounded-xl overflow-hidden bg-surface-container relative group cursor-pointer border border-outline-variant/20"
                            >
                              <img src={order.proofPhoto} alt="Bukti Makanan" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Maximize2 className="w-4 h-4" />
                              </div>
                            </div>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => triggerUpload(order.id, 'proof')}
                              className="h-16 rounded-xl border-2 border-dashed border-outline-variant/40 hover:border-primary flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-[10px] font-semibold bg-surface-container-low"
                            >
                              <Camera className="w-4 h-4" />
                              <span>+ Upload WA</span>
                            </button>
                          )}
                        </div>

                        {/* Proof Photo 2: Uang COD (Hanya untuk pembayaran COD/Tunai) */}
                        {isCod && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-on-surface-variant font-bold uppercase">Bukti Tunai COD</span>
                            {order.paymentProofPhoto ? (
                              <div 
                                onClick={() => setSelectedProofPhoto(order.paymentProofPhoto)}
                                className="h-16 rounded-xl overflow-hidden bg-surface-container relative group cursor-pointer border border-outline-variant/20"
                              >
                                <img src={order.paymentProofPhoto} alt="Bukti Uang COD" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                  <Maximize2 className="w-4 h-4" />
                                </div>
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => triggerUpload(order.id, 'payment')}
                                className="h-16 rounded-xl border-2 border-dashed border-outline-variant/40 hover:border-primary flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer text-[10px] font-semibold bg-surface-container-low"
                              >
                                <UploadCloud className="w-4 h-4" />
                                <span>+ Foto Uang</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Card Actions & Sequential Flow */}
                <div className="mt-auto pt-3 border-t border-outline-variant/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1 border border-outline-variant/30 cursor-pointer transition-colors"
                      title="Cetak Struk Thermal"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Nota</span>
                    </button>

                    {/* Step-by-Step Status Progression Action Buttons */}
                    {(order.status === 'RECEIVED' || order.status === 'PENDING') && (
                      <button 
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="flex-1 py-2 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                      >
                        <span>🍳 Siapkan Pesanan</span>
                      </button>
                    )}

                    {(isPreparing || isCooking) && (
                      <button 
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'READY')}
                        className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                      >
                        <span>📦 Pesanan Siap</span>
                      </button>
                    )}

                    {isReady && (
                      <button 
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'DELIVERING')}
                        className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                      >
                        <span>🛵 Berangkat Antar</span>
                      </button>
                    )}

                    {isDelivering && (
                      <button 
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        className="flex-1 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                      >
                        <span>📍 Tiba di Lokasi</span>
                      </button>
                    )}

                    {isDelivered && (
                      <button 
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                        className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                      >
                        <span>✅ Selesai &amp; Lunas</span>
                      </button>
                    )}

                    {isCompleted && (
                      <div className="flex-1 py-2 bg-emerald-50 text-emerald-900 border border-emerald-300 text-center font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Selesai &amp; Lunas</span>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="flex-1 py-2 bg-rose-50 text-rose-900 border border-rose-300 text-center font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                        <X className="w-3.5 h-3.5 text-rose-700" />
                        <span>Pesanan Dibatalkan</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 6. MODAL ZOOM FOTO BUKTI (Solid Opaque White) */}
      {selectedProofPhoto && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white text-stone-900 rounded-3xl p-5 shadow-2xl border border-stone-200 animate-fade-in space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200">
              <span className="font-bold text-sm text-stone-900">Foto Bukti Pengantaran / COD</span>
              <button 
                type="button"
                onClick={() => setSelectedProofPhoto(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2 flex items-center justify-center max-h-[70vh] overflow-hidden rounded-2xl bg-stone-100">
              <img 
                src={selectedProofPhoto} 
                alt="Foto Bukti Zoom" 
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-sm"
              />
            </div>
            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button 
                type="button"
                onClick={() => setSelectedProofPhoto(null)}
                className="px-5 py-2 bg-[#25160E] text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-black"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL CETAK STRUK THERMAL DIGITAL (Solid Opaque White) */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left border border-stone-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200">
              <span className="font-serif font-bold text-base text-[#25160E]">Struk Nota Kasir Digital</span>
              <button 
                type="button"
                onClick={() => setSelectedReceiptOrder(null)} 
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-3 font-mono text-stone-900">
              <div className="text-center pb-2 border-b border-stone-300 border-dashed">
                <span className="font-serif font-bold text-sm text-[#25160E] block">NEFAKKY RESTO</span>
                <span className="text-[10px] text-stone-500 block">Puri Bojong Lestari AF No 41, Bojong Gede</span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-stone-500">Order ID:</span>
                  <span className="font-bold text-[#25160E]">#{selectedReceiptOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pelanggan:</span>
                  <span>{selectedReceiptOrder.customerName || 'Pelanggan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Metode Bayar:</span>
                  <span>{selectedReceiptOrder.paymentMethod || 'Tunai (COD)'}</span>
                </div>
              </div>

              <div className="py-2 border-t border-b border-stone-300 border-dashed space-y-1.5">
                {selectedReceiptOrder.items && selectedReceiptOrder.items.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span>{it.quantity}x {it.name}</span>
                    <span>Rp {((it.price || 0) * (it.quantity || 1)).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal:</span>
                  <span>Rp {(selectedReceiptOrder.subtotal || selectedReceiptOrder.total || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Ongkos Kirim:</span>
                  <span>Rp {(selectedReceiptOrder.shippingCost || 0).toLocaleString('id-ID')}</span>
                </div>
                {selectedReceiptOrder.discount ? (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Diskon Promo:</span>
                    <span>-Rp {(selectedReceiptOrder.discount).toLocaleString('id-ID')}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-stone-300 text-[#25160E]">
                  <span>TOTAL:</span>
                  <span>Rp {(selectedReceiptOrder.total || selectedReceiptOrder.subtotal || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 bg-[#25160E] hover:bg-black text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Nota Thermal</span>
              </button>
              <button 
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl cursor-pointer"
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
