'use client';

/**
 * ============================================================================
 * HALAMAN: Laporan Keuangan & Omset (src/app/admin/reports/page.tsx)
 * DESKRIPSI: Dashboard Laporan Finansial & Rekap Penjualan Resmi Toko Nefakky.
 *            Menyajikan:
 *            1. Filter Rentang Waktu Realtime (Semua Waktu, Hari Ini, Minggu Ini, Bulan Ini, Tahun Ini)
 *            2. 4 Kartu KPI Keuangan (Total Omset Kotor, Laba Bersih, Transaksi Sukses, AOV)
 *            3. Distribusi Metode Pembayaran (QRIS, VA BCA, Tunai COD, Kartu Kredit)
 *            4. Ranking Menu Terlaris & Porsi Terjual
 *            5. Buku Besar Lengkap Seluruh Pesanan Pelanggan (Live Ledger)
 *            6. Modal Rincian Struk / Nota Kasir Siap Cetak
 *            7. Tombol Aksi Ekspor Microsoft Excel & Cetak PDF Resmi
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Printer, 
  FileSpreadsheet, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  CreditCard, 
  Receipt, 
  ArrowUpRight, 
  Filter, 
  Sparkles,
  X,
  Store
} from 'lucide-react';
import { useData, AdminOrder } from '@/context/DataContext';
import { exportNefakkyExcelReport } from '@/lib/exportUtils';
import { 
  getDetailedOrderDateTime, 
  isOrderToday, 
  isOrderThisWeek, 
  isOrderThisMonth, 
  isOrderThisYear 
} from '@/lib/orderTimeUtils';

export default function AdminReportsPage() {
  const { orders, products } = useData();

  // State Filter & Search
  const [timeRange, setTimeRange] = useState<'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'ACTIVE' | 'CANCELLED'>('ALL');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<AdminOrder | null>(null);

  const allOrders = orders || [];

  // Helper filter rentang waktu
  const isWithinSelectedRange = (order: AdminOrder): boolean => {
    if (timeRange === 'ALL') return true;
    if (timeRange === 'TODAY') return isOrderToday(order);
    if (timeRange === 'THIS_WEEK') return isOrderThisWeek(order);
    if (timeRange === 'THIS_MONTH') return isOrderThisMonth(order);
    if (timeRange === 'THIS_YEAR') return isOrderThisYear(order);
    return true;
  };

  // Filter orders berdasarkan waktu, status, dan kata kunci
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      // 1. Filter Rentang Waktu
      if (!isWithinSelectedRange(order)) return false;

      // 2. Filter Status
      if (statusFilter === 'COMPLETED' && order.status !== 'COMPLETED') return false;
      if (statusFilter === 'ACTIVE' && (order.status === 'COMPLETED' || order.status === 'CANCELLED')) return false;
      if (statusFilter === 'CANCELLED' && order.status !== 'CANCELLED') return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (order.id || '').toLowerCase().includes(q);
        const matchName = (order.customerName || '').toLowerCase().includes(q);
        const matchAddr = (order.address || '').toLowerCase().includes(q);
        const matchItem = (order.items || []).some(it => (it.name || '').toLowerCase().includes(q));
        if (!matchId && !matchName && !matchAddr && !matchItem) return false;
      }

      return true;
    });
  }, [allOrders, timeRange, statusFilter, searchQuery]);

  // Kalkulasi Metrik Keuangan Eksekutif
  const metrics = useMemo(() => {
    const validOrders = filteredOrders.filter(o => o.status !== 'CANCELLED');
    const totalGrossRevenue = validOrders.reduce((sum, o) => sum + (o.total || o.subtotal || 0), 0);
    const estimatedNetProfit = Math.round(totalGrossRevenue * 0.4167); // Estimasi margin kuliner ~41.67%
    const completedCount = filteredOrders.filter(o => o.status === 'COMPLETED').length;
    const averageOrderValue = validOrders.length > 0 ? Math.round(totalGrossRevenue / validOrders.length) : 0;
    const totalPortionsSold = validOrders.reduce((sum, o) => {
      return sum + (o.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 1), 0);
    }, 0);

    return {
      totalGrossRevenue,
      estimatedNetProfit,
      completedCount,
      averageOrderValue,
      totalPortionsSold,
      totalOrdersCount: filteredOrders.length
    };
  }, [filteredOrders]);

  // Breakdown Berdasarkan Metode Pembayaran
  const paymentBreakdown = useMemo(() => {
    const breakdown: Record<string, { label: string; count: number; total: number; color: string }> = {
      qris: { label: 'QRIS & E-Wallet', count: 0, total: 0, color: 'bg-emerald-500' },
      va: { label: 'Virtual Account (BCA)', count: 0, total: 0, color: 'bg-blue-500' },
      cod: { label: 'Tunai / COD', count: 0, total: 0, color: 'bg-amber-500' },
      cc: { label: 'Kartu Kredit', count: 0, total: 0, color: 'bg-purple-500' },
      other: { label: 'Metode Lainnya', count: 0, total: 0, color: 'bg-stone-500' }
    };

    filteredOrders.forEach(o => {
      if (o.status === 'CANCELLED') return;
      const method = (o.paymentMethod || '').toLowerCase();
      const amount = o.total || o.subtotal || 0;

      if (method.includes('qris') || method.includes('gopay') || method.includes('shopeepay') || method.includes('ewallet')) {
        breakdown.qris.count += 1;
        breakdown.qris.total += amount;
      } else if (method.includes('va') || method.includes('virtual account') || method.includes('bca') || method.includes('transfer')) {
        breakdown.va.count += 1;
        breakdown.va.total += amount;
      } else if (method.includes('cod') || method.includes('tunai') || method.includes('cash')) {
        breakdown.cod.count += 1;
        breakdown.cod.total += amount;
      } else if (method.includes('cc') || method.includes('kredit') || method.includes('credit')) {
        breakdown.cc.count += 1;
        breakdown.cc.total += amount;
      } else {
        breakdown.other.count += 1;
        breakdown.other.total += amount;
      }
    });

    return Object.values(breakdown).filter(b => b.count > 0 || b.total > 0);
  }, [filteredOrders]);

  // Menu Terlaris Ranking
  const topSellingDishes = useMemo(() => {
    const itemMap: Record<string, { name: string; qty: number; revenue: number; image?: string }> = {};

    filteredOrders.forEach(o => {
      if (o.status === 'CANCELLED') return;
      (o.items || []).forEach(it => {
        const key = (it.name || 'Menu').trim();
        if (!itemMap[key]) {
          itemMap[key] = {
            name: key,
            qty: 0,
            revenue: 0,
            image: it.image
          };
        }
        itemMap[key].qty += it.quantity || 1;
        itemMap[key].revenue += (it.price || 0) * (it.quantity || 1);
      });
    });

    return Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [filteredOrders]);

  // Handler: Ekspor ke Excel (.xlsx / .xls)
  const handleExportExcel = () => {
    exportNefakkyExcelReport(allOrders, products || [], {
      selectedMonthLabel: timeRange === 'ALL' ? 'Semua Waktu' : `Periode: ${timeRange}`
    });
  };

  // Handler: Cetak PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-stone-900 font-sans pb-12">
      
      {/* 1. HEADER HALAMAN & KONTROL AKSI */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 font-mono">
              FINANCIAL AUDIT &amp; REPORTING
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-800 font-bold font-mono">Realtime Sync</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Laporan Keuangan &amp; Omset Penjualan
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl font-light">
            Rekapitulasi omset kotor, estimasi laba bersih, saluran pembayaran, serta buku besar seluruh transaksi pelanggan toko.
          </p>
        </div>

        {/* Tombol Ekspor & Cetak */}
        <div className="flex items-center gap-2.5 shrink-0 print:hidden">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Unduh Spreadsheet Laporan Penjualan Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-[#25160E] hover:bg-black text-amber-300 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Cetak Dokumen Laporan via PDF"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER RENTANG WAKTU (TOOLBAR) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs print:hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-mono mr-1.5 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Periode:</span>
          </span>

          {[
            { key: 'ALL' as const, label: 'Semua Waktu' },
            { key: 'TODAY' as const, label: 'Hari Ini' },
            { key: 'THIS_WEEK' as const, label: 'Minggu Ini' },
            { key: 'THIS_MONTH' as const, label: 'Bulan Ini' },
            { key: 'THIS_YEAR' as const, label: 'Tahun Ini' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTimeRange(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                timeRange === tab.key
                  ? 'bg-[#25160E] text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pencarian cepat */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID, pembeli, menu..."
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 rounded-xl text-xs text-stone-900 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C2410C] font-medium"
          />
        </div>
      </div>

      {/* 3. KARTU METRIK KEUANGAN (4-COLUMN KPI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset Kotor */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs hover:-translate-y-0.5 transition-transform flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Total Omset Kotor</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#C2410C] flex items-center justify-center border border-amber-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Rp {metrics.totalGrossRevenue.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-stone-500 font-normal mt-1">
            Dari <strong>{metrics.totalOrdersCount}</strong> transaksi terdata
          </span>
        </div>

        {/* Estimasi Laba Bersih */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs hover:-translate-y-0.5 transition-transform flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Estimasi Laba Bersih</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800">
            Rp {metrics.estimatedNetProfit.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold mt-1">
            Margin keuntungan bersih ~41.67%
          </span>
        </div>

        {/* Transaksi Selesai */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs hover:-translate-y-0.5 transition-transform flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Transaksi Sukses</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-blue-900">
            {metrics.completedCount}
          </div>
          <span className="text-[11px] text-stone-500 font-normal mt-1">
            Pesanan lunas &amp; selesai diantar
          </span>
        </div>

        {/* Rata-rata Nilai Order (AOV) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs hover:-translate-y-0.5 transition-transform flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Rata-rata Order (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-purple-900">
            Rp {metrics.averageOrderValue.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-stone-500 font-normal mt-1">
            Total <strong>{metrics.totalPortionsSold}</strong> porsi hidangan terjual
          </span>
        </div>
      </div>

      {/* 4. DUA KOLOM: SALURAN PEMBAYARAN & MENU TERLARIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom Kiri: Breakdown Metode Pembayaran */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C2410C]" />
              <h3 className="font-bold text-sm text-stone-900">Distribusi Saluran Pembayaran</h3>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Berdasarkan Total Tagihan</span>
          </div>

          <div className="space-y-3">
            {paymentBreakdown.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">Belum ada transaksi pada periode ini.</p>
            ) : (
              paymentBreakdown.map((item, idx) => {
                const percent = metrics.totalGrossRevenue > 0 
                  ? Math.round((item.total / metrics.totalGrossRevenue) * 100) 
                  : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900">Rp {item.total.toLocaleString('id-ID')}</span>
                        <span className="text-[10px] text-stone-500 font-mono">({item.count} order • {percent}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Ranking Menu & Hidangan Terlaris */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-stone-900">Peringkat Menu Paling Laris</h3>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">Top 5 Porsi Terjual</span>
          </div>

          <div className="space-y-3">
            {topSellingDishes.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">Belum ada hidangan terjual pada periode ini.</p>
            ) : (
              topSellingDishes.map((dish, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/80 transition-colors border border-stone-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{dish.name}</h4>
                      <span className="text-[10px] text-stone-500 font-mono">
                        Terjual: <strong>{dish.qty} porsi</strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-stone-900">
                      Rp {dish.revenue.toLocaleString('id-ID')}
                    </span>
                    <span className="block text-[9px] text-emerald-800 font-semibold">
                      Kontribusi Omset
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 5. BUKU BESAR PENJUALAN & TRANSAKSI (LIVE LEDGER TABLE) */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-2xs space-y-4">
        
        {/* Table Header & Status Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
          <div>
            <h3 className="font-bold text-base text-stone-900">Buku Besar Transaksi Toko (Sales Ledger)</h3>
            <p className="text-xs text-stone-500 font-normal">
              Daftar seluruh pesanan pelanggan lengkap dengan rincian biaya, alamat pengiriman, dan status.
            </p>
          </div>

          {/* Filter Status Selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto print:hidden">
            {[
              { key: 'ALL' as const, label: 'Semua Status' },
              { key: 'COMPLETED' as const, label: 'Selesai' },
              { key: 'ACTIVE' as const, label: 'Diproses' },
              { key: 'CANCELLED' as const, label: 'Dibatalkan' }
            ].map(pill => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === pill.key
                    ? 'bg-[#C2410C] text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Data Transaksi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase text-[10px] font-mono tracking-wider bg-stone-50/50">
                <th className="py-3 px-3">No. Order</th>
                <th className="py-3 px-3">Waktu Transaksi</th>
                <th className="py-3 px-3">Pelanggan &amp; Alamat</th>
                <th className="py-3 px-3">Item Pesanan</th>
                <th className="py-3 px-3">Metode Bayar</th>
                <th className="py-3 px-3">Total Tagihan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-500 text-xs">
                    Tidak ditemukan data transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const timeInfo = getDetailedOrderDateTime(order);
                  const isCompleted = order.status === 'COMPLETED';
                  const isCancelled = order.status === 'CANCELLED';
                  const itemsList = order.items || [];

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* ID Order */}
                      <td className="py-3.5 px-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                        #{order.id}
                      </td>

                      {/* Waktu Transaksi */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-stone-900 text-xs">
                          {timeInfo.dayName}, {timeInfo.fullDateStr}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {timeInfo.timeStr}
                        </div>
                      </td>

                      {/* Pelanggan & Alamat */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="font-bold text-stone-900 truncate">
                          {order.customerName || 'Pelanggan'}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate" title={order.address}>
                          {order.address || '—'}
                        </div>
                      </td>

                      {/* Item Pesanan */}
                      <td className="py-3.5 px-3 max-w-[220px]">
                        <div className="text-xs text-stone-800 line-clamp-2">
                          {itemsList.map(it => `${it.name} (x${it.quantity || 1})`).join(', ') || '—'}
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {order.itemCount || itemsList.length} porsi
                        </span>
                      </td>

                      {/* Metode Bayar */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-bold font-mono border border-stone-200">
                          {order.paymentMethod || 'Online'}
                        </span>
                      </td>

                      {/* Total Tagihan */}
                      <td className="py-3.5 px-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                        Rp {(order.total || 0).toLocaleString('id-ID')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isCancelled
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {order.status || 'RECEIVED'}
                        </span>
                      </td>

                      {/* Aksi: Buka Struk */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap print:hidden">
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptOrder(order)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 border border-stone-200 active:scale-95"
                          title="Lihat Rincian Struk / Nota Kasir"
                        >
                          <Receipt className="w-3.5 h-3.5 text-stone-600" />
                          <span>Struk</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 6. MODAL STRUK / NOTA TRANSAKSI KASIR RESMI */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-stone-900 shadow-2xl border border-stone-200 space-y-4 animate-fade-in text-left max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal Struk */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#C2410C]" />
                <span className="font-serif font-bold text-sm tracking-wider uppercase">NOTA TRANSAKSI NEFAKKY</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
                title="Tutup Nota"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rincian Nota Struk */}
            <div className="space-y-3 font-mono text-xs">
              <div className="text-center py-2 border-b border-dashed border-stone-300 space-y-0.5">
                <h4 className="font-bold text-base text-stone-900 font-serif">NEFAKKY ARTISANAL RESTO</h4>
                <p className="text-[10px] text-stone-500 font-sans">Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor</p>
                <p className="text-[10px] text-stone-500">Order ID: #{selectedReceiptOrder.id}</p>
              </div>

              {/* Info Pelanggan & Waktu */}
              <div className="text-[11px] space-y-1 border-b border-dashed border-stone-300 pb-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Pelanggan:</span>
                  <span className="font-bold text-stone-900">{selectedReceiptOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Alamat:</span>
                  <span className="text-stone-700 truncate max-w-[220px]" title={selectedReceiptOrder.address}>
                    {selectedReceiptOrder.address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Metode Bayar:</span>
                  <span className="font-bold text-stone-900">{selectedReceiptOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Waktu:</span>
                  <span className="text-stone-700">{getDetailedOrderDateTime(selectedReceiptOrder).fullReceiptLabel}</span>
                </div>
              </div>

              {/* Rincian Menu */}
              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Rincian Menu:</div>
                {(selectedReceiptOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{item.name} x{item.quantity || 1}</span>
                    <span className="font-bold">Rp {((item.price || 0) * (item.quantity || 1)).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              {/* Perhitungan Biaya */}
              <div className="space-y-1 text-xs border-b border-dashed border-stone-300 pb-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal:</span>
                  <span>Rp {(selectedReceiptOrder.subtotal || 0).toLocaleString('id-ID')}</span>
                </div>
                {Boolean(selectedReceiptOrder.discount && selectedReceiptOrder.discount > 0) && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon Promo:</span>
                    <span>- Rp {(selectedReceiptOrder.discount || 0).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Ongkos Kirim ({selectedReceiptOrder.distance || '4.2 Km'}):</span>
                  <span>Rp {(selectedReceiptOrder.shippingCost || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-200">
                  <span>TOTAL PEMBAYARAN:</span>
                  <span className="text-[#C2410C]">Rp {(selectedReceiptOrder.total || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-stone-500 pt-2 font-sans space-y-0.5">
                <p>Status: <strong>{selectedReceiptOrder.status}</strong> • Lunas</p>
                <p className="italic">Terima kasih telah memesan hidangan di Resto Nefakky!</p>
              </div>
            </div>

            {/* Tombol Cetak Nota */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 bg-stone-900 hover:bg-black text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>Cetak Nota Kasir</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
