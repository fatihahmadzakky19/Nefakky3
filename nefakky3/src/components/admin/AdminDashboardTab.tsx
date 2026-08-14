'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  ShoppingBag,
  BarChart3,
  Star,
  Plus,
  Printer,
  FileSpreadsheet,
  Sparkles,
  Flame,
  AlertTriangle,
  Download,
  X,
  Check,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { ProductItem, AdminOrder, useData } from '@/context/DataContext';

interface AdminDashboardTabProps {
  productList: ProductItem[];
  orderList: AdminOrder[];
  onOpenCreateVoucher: (name: string, code: string) => void;
  onExportCSV: () => void;
  onPrintPDF: () => void;
}

export default function AdminDashboardTab({
  productList,
  orderList,
  onOpenCreateVoucher,
  onExportCSV,
  onPrintPDF
}: AdminDashboardTabProps) {
  const { products, vouchers, orders, forceDeleteProduct, forceDeleteVoucher, forceDeleteOrder } = useData();
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '1m' | '6m' | '1y'>('6m');

  const trashedProds = (products || []).filter(p => p.isDeleted);
  const trashedVouches = (vouchers || []).filter(v => v.isDeleted);
  const trashedOrds = (orders || []).filter(o => o.isDeleted);

  // Manual / Offline Omset State
  const [manualOmsetData, setManualOmsetData] = useState<{
    eventName: string;
    revenue: number;
    cleanProfit: number;
    ordersCount: number;
    bestSellers: string[];
    leastSellers: string[];
    itemSales: { name: string; qty: number; price: number }[];
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nefakky_manual_omset');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null;
  });

  const [showInputOmsetModal, setShowInputOmsetModal] = useState<boolean>(false);
  const [inputEventName, setInputEventName] = useState<string>('Penjualan Offline Bazar');
  const [inputRevenue, setInputRevenue] = useState<string>('2000000');
  const [inputProfit, setInputProfit] = useState<string>('1000000');
  const [inputOrdersCount, setInputOrdersCount] = useState<string>('25');
  const [inputBestSellers, setInputBestSellers] = useState<string[]>(['Ayam Bakar']);
  const [inputLeastSellers, setInputLeastSellers] = useState<string[]>(['Garang Asam']);
  const [inputItemSales, setInputItemSales] = useState<{ name: string; qty: number; price: number }[]>([]);

  // Custom Chart Data State
  const default6mMonths = [
    { label: 'Juni 2026', gross: 10500000, net: 4750000, isBazar: true, badge: '🎪 Event Bazar Pembukaan Juni (>10Jt Omset)' },
    { label: 'Juli 2026', gross: 11200000, net: 5100000, isBazar: true, badge: '🎪 Event Bazar Kuliner Juli (>10Jt Omset)' },
    { label: 'Agustus 2026 (Live)', gross: 12000000, net: 6000000, isBazar: true, badge: '🎪 Event Bazar Merdeka (>10Jt) + Live Realtime Web & Offline' },
    { label: 'September 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: 'Oktober 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: 'November 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
  ];

  const [customChartMonths, setCustomChartMonths] = useState<{ label: string; gross: number; net: number; isBazar: boolean; badge: string }[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nefakky_custom_chart_months');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return default6mMonths;
  });

  const [showEditChartModal, setShowEditChartModal] = useState<boolean>(false);

  // Computations
  const realOrders = orderList || [];
  const nonCancelledOrders = realOrders.filter(o => o.status !== 'CANCELLED');
  const ordersCount = realOrders.length;
  const totalRevenueIDR = nonCancelledOrders.reduce((acc, ord) => acc + (ord.total || 0), 0);

  const baselineOmsetJuni = 7000000;
  const baselineBersihJuni = 3000000;

  const displayRevenue = manualOmsetData ? manualOmsetData.revenue : (baselineOmsetJuni + totalRevenueIDR);
  const displayCleanProfit = manualOmsetData ? Math.round(manualOmsetData.revenue * 0.4) : (baselineBersihJuni + Math.round(totalRevenueIDR * 0.4));
  const displayOrdersCount = manualOmsetData ? manualOmsetData.ordersCount : (85 + ordersCount);
  const displayAOV = displayOrdersCount > 0 ? Math.round(displayRevenue / displayOrdersCount) : 0;

  // Real product sales calculation
  const realProductSalesMap = React.useMemo(() => {
    const map: Record<string, { id: string; name: string; category: string; image: string; price: number; stock: number; rating: number; unitsSold: number; totalRevenue: number }> = {};

    (productList || []).forEach((p) => {
      map[p.id || p.name] = {
        id: p.id,
        name: p.name,
        category: p.category || 'Makanan Berat',
        image: p.image || '/images/ayam_bakar.jpg',
        price: p.price || 0,
        stock: p.stock ?? 25,
        rating: p.rating || 4.9,
        unitsSold: 0,
        totalRevenue: 0
      };
    });

    realOrders.forEach((ord) => {
      if (ord.status !== 'CANCELLED') {
        (ord.items || []).forEach((item) => {
          const matchedKey = Object.keys(map).find(
            k => k === item.id || map[k].name.toLowerCase() === item.name.toLowerCase()
          );

          const qty = item.quantity || 1;
          const price = item.price || 0;

          if (matchedKey) {
            map[matchedKey].unitsSold += qty;
            map[matchedKey].totalRevenue += price * qty;
          } else {
            map[item.name] = {
              id: item.id || item.name,
              name: item.name,
              category: 'Makanan Berat',
              image: item.image || '/images/ayam_bakar.jpg',
              price: price,
              stock: 20,
              rating: 4.9,
              unitsSold: qty,
              totalRevenue: price * qty
            };
          }
        });
      }
    });

    return Object.values(map);
  }, [productList, realOrders]);

  const sortedBestSellers = React.useMemo(() => {
    return [...realProductSalesMap].sort((a, b) => b.unitsSold - a.unitsSold);
  }, [realProductSalesMap]);

  const sortedLeastSellers = React.useMemo(() => {
    return [...realProductSalesMap].sort((a, b) => a.unitsSold - b.unitsSold);
  }, [realProductSalesMap]);

  const handleOpenInputOmsetModal = () => {
    const defaultSales = (productList || []).map(p => {
      const existing = inputItemSales.find(i => i.name === p.name);
      return {
        name: p.name,
        qty: existing ? existing.qty : (p.name === 'Ayam Bakar' ? 15 : p.name === 'Nasi Bakar Cakalang' ? 10 : 0),
        price: p.price || 35000
      };
    });
    setInputItemSales(defaultSales);
    setShowInputOmsetModal(true);
  };

  const handleSaveManualOmset = (e: React.FormEvent) => {
    e.preventDefault();
    const rev = parseFloat(inputRevenue) || 0;
    const profit = parseFloat(inputProfit) || Math.round(rev * 0.4);
    const cnt = parseInt(inputOrdersCount) || 0;

    const data = {
      eventName: inputEventName || 'Penjualan Offline Bazar',
      revenue: rev,
      cleanProfit: profit,
      ordersCount: cnt,
      bestSellers: inputBestSellers.length > 0 ? inputBestSellers : [sortedBestSellers[0]?.name || 'Ayam Bakar'],
      leastSellers: inputLeastSellers.length > 0 ? inputLeastSellers : [sortedLeastSellers[0]?.name || 'Garang Asam'],
      itemSales: inputItemSales.filter(i => i.qty > 0)
    };
    setManualOmsetData(data);
    localStorage.setItem('nefakky_manual_omset', JSON.stringify(data));
    setShowInputOmsetModal(false);
  };

  return (
    <>
      {/* TOP HEADER TITLE & ACTION BUTTONS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative mt-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#934b19] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#934b19]">LIVE ANALYTICS REALTIME</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#25160e]">Tinjauan Bisnis Nefakky</h1>
          <p className="text-xs text-[#4f4540] max-w-lg font-light leading-relaxed">
            Total omset, margin 40%, pesanan masuk, AOV, grafik visual tren omset, serta list terlaris & kurang laris.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 print:hidden">
          <button 
            onClick={handleOpenInputOmsetModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-amber-900/15 text-[#1b1c1a] hover:shadow-md transition-all text-xs font-bold"
          >
            <Plus className="w-4 h-4 text-[#934b19]" />
            <span>Input Omset Manual</span>
          </button>
          <button 
            onClick={onPrintPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#3c2a21] text-amber-200 hover:bg-[#25160e] transition-all text-xs font-bold shadow-md"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak PDF</span>
          </button>
          <button 
            onClick={onExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#934b19] text-white hover:bg-[#783603] transition-all text-xs font-bold shadow-lg"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-200" />
            <span>Ekspor Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* 5-COLUMN KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        <div className="bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-5 flex flex-col justify-between h-44 border border-amber-900/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#4f4540]">Total Omset Penjualan</span>
            <TrendingUp className="w-4 h-4 text-[#934b19]" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#25160e]">
              Rp {displayRevenue.toLocaleString('id-ID')}
            </h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md inline-block">
              +14.5% vs kemarin
            </span>
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-5 flex flex-col justify-between h-44 border border-amber-900/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#4f4540]">Estimasi Margin (40%)</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-emerald-700">
              Rp {displayCleanProfit.toLocaleString('id-ID')}
            </h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md inline-block">
              Est. Laba Bersih
            </span>
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-5 flex flex-col justify-between h-44 border border-amber-900/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#4f4540]">Total Pesanan Masuk</span>
            <ShoppingBag className="w-4 h-4 text-[#934b19]" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#25160e]">{displayOrdersCount} Transaksi</h2>
            <div className="mt-2 h-4 w-full flex items-end gap-1 opacity-80">
              <div className="w-1/6 bg-stone-200 rounded-t-sm h-[40%]" />
              <div className="w-1/6 bg-stone-200 rounded-t-sm h-[60%]" />
              <div className="w-1/6 bg-stone-200 rounded-t-sm h-[30%]" />
              <div className="w-1/6 bg-stone-200 rounded-t-sm h-[80%]" />
              <div className="w-1/6 bg-[#934b19] rounded-t-sm h-[100%]" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-5 flex flex-col justify-between h-44 border border-amber-900/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#4f4540]">Rata-Rata Transaksi</span>
            <BarChart3 className="w-4 h-4 text-[#934b19]" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#25160e]">
              Rp {displayAOV.toLocaleString('id-ID')}
            </h2>
            <span className="text-[10px] text-[#4f4540] font-medium block">AOV Per Pesanan</span>
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-5 flex flex-col justify-between h-44 border border-amber-900/10">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#4f4540]">Rating Pelanggan</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#25160e]">4.9 / 5.0</h2>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* GRAFIK TREN OMSET & LABA BERSIH */}
      <div className="bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-6 sm:p-8 border border-amber-900/10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#25160e]">Grafik Omset & Laba Bersih</h3>
            <p className="text-xs text-[#4f4540] font-light">
              Penjualan dimulakan Juni (Baseline ~7Jt Kotor / ~3Jt Bersih) + Pergerakan Event Bazar (&gt;10Jt) &amp; Pesanan Realtime.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5 bg-[#fbf9f5] p-1.5 rounded-2xl border border-amber-900/15">
              <button
                onClick={() => setChartTimeframe('7d')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  chartTimeframe === '7d' ? 'bg-[#25160e] text-white shadow-sm' : 'text-[#4f4540] hover:text-[#25160e]'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setChartTimeframe('1m')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  chartTimeframe === '1m' ? 'bg-[#25160e] text-white shadow-sm' : 'text-[#4f4540] hover:text-[#25160e]'
                }`}
              >
                1 Bulan
              </button>
              <button
                onClick={() => setChartTimeframe('6m')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  chartTimeframe === '6m' ? 'bg-[#25160e] text-white shadow-sm' : 'text-[#4f4540] hover:text-[#25160e]'
                }`}
              >
                6 Bulan
              </button>
              <button
                onClick={() => setChartTimeframe('1y')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  chartTimeframe === '1y' ? 'bg-[#25160e] text-white shadow-sm' : 'text-[#4f4540] hover:text-[#25160e]'
                }`}
              >
                1 Tahun
              </button>
            </div>

            <button
              onClick={() => setShowEditChartModal(true)}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-[#25160e] text-xs font-bold rounded-2xl transition-colors print:hidden"
            >
              ⚙️ Edit Data Grafik
            </button>
          </div>
        </div>

        {/* Dual Bar Chart Render */}
        <div className="h-64 w-full pt-4 overflow-x-auto no-scrollbar">
          <div className="h-full min-w-[500px] sm:min-w-0 w-full flex items-end justify-between gap-2 sm:gap-6 border-b border-stone-200 pb-2">
            {(
              chartTimeframe === '7d'
                ? [
                    { label: 'Senin', gross: 950000, net: 400000, isBazar: false, badge: 'Dapur Regular' },
                    { label: 'Selasa', gross: 1100000, net: 480000, isBazar: false, badge: 'Dapur Regular' },
                    { label: 'Rabu', gross: 850000, net: 370000, isBazar: false, badge: 'Dapur Regular' },
                    { label: 'Kamis', gross: 1400000, net: 600000, isBazar: false, badge: 'Dapur Regular' },
                    { label: 'Jumat', gross: 2200000, net: 1100000, isBazar: true, badge: '🎪 Bazar Weekend (+2Jt Omset / 1Jt Bersih)' },
                    { label: 'Sabtu', gross: 3500000, net: 1750000, isBazar: true, badge: '🎪 Bazar Kuliner (+2Jt Omset / 1Jt Bersih)' },
                    { label: 'Minggu (Live)', gross: 2800000 + totalRevenueIDR, net: 1400000 + Math.round(totalRevenueIDR * 0.4), isBazar: true, badge: '🎪 Live Web + Bazar' },
                  ]
                : chartTimeframe === '1m'
                ? [
                    { label: 'Minggu 1', gross: 1750000, net: 750000, isBazar: false, badge: 'Regular Dapur' },
                    { label: 'Minggu 2', gross: 2100000, net: 900000, isBazar: true, badge: '🎪 Mini Bazar (+2Jt Omset / 1Jt Bersih)' },
                    { label: 'Minggu 3', gross: 1850000, net: 800000, isBazar: false, badge: 'Regular Dapur' },
                    { label: 'Minggu 4 (Live)', gross: 2500000 + totalRevenueIDR, net: 1200000 + Math.round(totalRevenueIDR * 0.4), isBazar: true, badge: '🎪 Live Web + Bazar' },
                  ]
                : customChartMonths.map(m => {
                    const isLive = m.label.includes('Live') || m.label.includes('Agustus');
                    const addRevenue = isLive ? (manualOmsetData ? manualOmsetData.revenue : 0) + totalRevenueIDR : 0;
                    const addProfit = isLive ? (manualOmsetData ? manualOmsetData.cleanProfit : 0) + Math.round(totalRevenueIDR * 0.4) : 0;
                    return {
                      ...m,
                      gross: m.gross > 0 ? m.gross + addRevenue : 0,
                      net: m.net > 0 ? m.net + addProfit : 0
                    };
                  })
            ).map((item, i, arr) => {
              const maxVal = Math.max(...arr.map(a => a.gross)) || 1;
              const grossPct = item.gross === 0 ? 0 : Math.min(100, Math.max(15, (item.gross / maxVal) * 100));
              const netPct = item.net === 0 ? 0 : Math.min(100, Math.max(10, (item.net / maxVal) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative cursor-pointer">
                  
                  {/* Tooltip Box */}
                  <div className="absolute -top-16 z-30 bg-[#25160e] text-white p-2.5 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-amber-900/30 text-[10px] space-y-0.5">
                    <span className="font-bold text-amber-300 block">{item.label}</span>
                    {item.gross > 0 ? (
                      <>
                        <span className="block text-white">Omset Kotor: <strong>Rp {item.gross.toLocaleString('id-ID')}</strong></span>
                        <span className="block text-emerald-400">Laba Bersih: <strong>Rp {item.net.toLocaleString('id-ID')}</strong></span>
                      </>
                    ) : (
                      <span className="block text-stone-300 italic">Periode Mendatang (Belum Ada Data)</span>
                    )}
                    <span className="block text-amber-200/80 text-[9px] font-mono">{item.badge}</span>
                  </div>

                  {/* Dual Bar */}
                  <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                    <div 
                      className={`w-1/2 rounded-t-xl transition-all duration-500 shadow-sm ${
                        item.gross === 0
                          ? 'bg-transparent border-b-2 border-stone-200'
                          : item.isBazar 
                          ? 'bg-gradient-to-t from-[#934b19] to-amber-500 group-hover:brightness-125' 
                          : 'bg-[#3c2a21] group-hover:bg-[#934b19]'
                      }`}
                      style={{ height: item.gross === 0 ? '2px' : `${grossPct}%` }}
                    />
                    <div 
                      className={`w-1/2 rounded-t-xl transition-all duration-500 shadow-sm opacity-90 ${
                        item.net === 0
                          ? 'bg-transparent border-b-2 border-stone-200'
                          : 'bg-emerald-500 group-hover:bg-emerald-400'
                      }`}
                      style={{ height: item.net === 0 ? '2px' : `${netPct}%` }}
                    />
                  </div>

                  <span className="text-[10px] font-bold text-[#4f4540] truncate max-w-full mt-1">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bazar Explanation Footer */}
        <div className="bg-[#fbf9f5] rounded-2xl p-4 border border-amber-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#934b19]" />
            <span className="text-[#25160e] font-bold">Aturan Operasional Omset & Bazar:</span>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-[#4f4540]">
            <span>• Baseline Juni: <strong>Rp 7Jt Kotor / 3Jt Bersih</strong></span>
            <span>• Setiap Event Bazar: <strong>Omset &gt; Rp 10Jt</strong></span>
            <span>• Skala Bazar (+2Jt Omset): <strong>+Rp 1Jt Bersih</strong></span>
          </div>
        </div>
      </div>

      {/* BENTO GRID: LIST PALING LARIS & KURANG LARIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-6 sm:p-8 border border-amber-900/10 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#25160e] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#934b19]" />
                <span>List Makanan Paling Laris</span>
              </h3>
              <p className="text-xs text-[#4f4540]">Peringkat menu dengan volume penjualan tertinggi.</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {sortedBestSellers.slice(0, 4).map((item, rank) => (
              <div key={item.id} className="flex items-center gap-3.5 p-3.5 bg-[#fbf9f5] rounded-2xl border border-amber-900/10">
                <span className="w-7 h-7 rounded-full bg-[#25160e] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  #{rank + 1}
                </span>
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#25160e] shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-[#25160e] truncate">{item.name}</h4>
                  <p className="text-[10px] text-[#4f4540]">Terjual: <strong>{item.unitsSold || 24} porsi</strong></p>
                </div>
                <span className="text-xs font-bold text-[#934b19]">Rp {item.price.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-6 sm:p-8 border border-amber-900/10 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#25160e] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>List Makanan Kurang Laris</span>
              </h3>
              <p className="text-xs text-[#4f4540]">Menu pergerakan lambat yang membutuhkan promosi.</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {sortedLeastSellers.slice(0, 4).map((item, rank) => (
              <div key={item.id} className="flex items-center justify-between gap-3.5 p-3.5 bg-[#fbf9f5] rounded-2xl border border-amber-900/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#3c2a21] shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-[#25160e] truncate">{item.name}</h4>
                    <p className="text-[10px] text-rose-600 font-bold">Stok Menumpuk: {item.stock} Pcs</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onOpenCreateVoucher(
                      `Promo Spesial ${item.name}`,
                      `DISCOUNT-${item.name.slice(0, 3).toUpperCase()}`
                    );
                  }}
                  className="px-3 py-2 bg-[#934b19] hover:bg-[#783603] text-white text-[10px] font-bold rounded-xl shadow-sm whitespace-nowrap"
                >
                  + Buat Promo
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WIDGET KELOLA TEMPAT SAMPAH & FORCE DELETE */}
      <div className="bg-[#25160e] text-white shadow-2xl rounded-3xl p-6 sm:p-8 border border-amber-900/40 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/30 pb-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Trash2 className="w-4 h-4" />
              <span>MANAJEMEN TEMPAT SAMPAH (RECYCLE BIN)</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-white mt-1">Ringkasan Tempat Sampah &amp; Force Delete</h3>
            <p className="text-xs text-amber-200/70 font-light">Pantau item yang terhapus sementara (Soft Delete) dan lakukan hapus permanen dari sistem.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {manualOmsetData && (
              <button
                onClick={() => {
                  if (confirm('Reset / Hapus data input omset manual offline? Data omset akan kembali ke baseline otomatis.')) {
                    setManualOmsetData(null);
                    localStorage.removeItem('nefakky_manual_omset');
                  }
                }}
                className="px-3.5 py-2 bg-rose-900/80 hover:bg-rose-900 text-rose-200 text-xs font-bold rounded-xl border border-rose-700/50 transition-all"
              >
                Reset Omset Manual
              </button>
            )}
            {(trashedProds.length > 0 || trashedVouches.length > 0 || trashedOrds.length > 0) && (
              <button
                onClick={() => {
                  if (confirm(`PERINGATAN FORCE DELETE ALL!\nApakah Anda yakin ingin MENGOSONGKAN Tempat Sampah?\n\n- ${trashedProds.length} Produk\n- ${trashedVouches.length} Voucher\n- ${trashedOrds.length} Pesanan\n\nSemua data ini akan dihapus PERMANEN dari sistem!`)) {
                    trashedProds.forEach(p => forceDeleteProduct(p.id));
                    trashedVouches.forEach(v => forceDeleteVoucher(v.id));
                    trashedOrds.forEach(o => forceDeleteOrder(o.id));
                    alert('Tempat sampah telah dikosongkan secara permanen!');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan Sampah ({trashedProds.length + trashedVouches.length + trashedOrds.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Product Trash Stat Card */}
          <div className="bg-[#3c2a21]/90 rounded-2xl p-4 border border-amber-900/30 flex justify-between items-center">
            <div>
              <span className="text-stone-400 font-bold block">Produk Terhapus</span>
              <span className="text-xl font-bold text-rose-400">{trashedProds.length} Item</span>
            </div>
            <span className="text-[10px] text-amber-200/80 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800/40">
              {trashedProds.length > 0 ? 'Dapat Dipulihkan' : 'Kosong'}
            </span>
          </div>

          {/* Voucher Trash Stat Card */}
          <div className="bg-[#3c2a21]/90 rounded-2xl p-4 border border-amber-900/30 flex justify-between items-center">
            <div>
              <span className="text-stone-400 font-bold block">Voucher Terhapus</span>
              <span className="text-xl font-bold text-rose-400">{trashedVouches.length} Kode</span>
            </div>
            <span className="text-[10px] text-amber-200/80 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800/40">
              {trashedVouches.length > 0 ? 'Dapat Dipulihkan' : 'Kosong'}
            </span>
          </div>

          {/* Orders Trash Stat Card */}
          <div className="bg-[#3c2a21]/90 rounded-2xl p-4 border border-amber-900/30 flex justify-between items-center">
            <div>
              <span className="text-stone-400 font-bold block">Pesanan Terhapus</span>
              <span className="text-xl font-bold text-rose-400">{trashedOrds.length} Trx</span>
            </div>
            <span className="text-[10px] text-amber-200/80 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-800/40">
              {trashedOrds.length > 0 ? 'Dapat Dipulihkan' : 'Kosong'}
            </span>
          </div>
        </div>
      </div>

      {/* REKAP PEMBELIAN OMSET TRANSAKSI */}
      <div className="bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-6 sm:p-8 border border-amber-900/10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#25160e]">Rekap Pembelian & Transaksi Omset</h3>
            <p className="text-xs text-[#4f4540]">Rincian riwayat data pembelian transaksi riil dari konsumen web.</p>
          </div>
          <button
            onClick={onExportCSV}
            className="px-4 py-2.5 bg-[#25160e] hover:bg-[#3c2a21] text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-2 print:hidden"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Download Rekap CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[#4f4540] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">ID & Tanggal</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Menu Dipesan</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4">Total Omset (Rp)</th>
                <th className="py-3.5 px-4">Status Alur</th>
                <th className="py-3.5 px-4 text-right print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {realOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#fbf9f5]">
                  <td className="py-3.5 px-4 font-mono">
                    <strong className="text-[#934b19] block">#{ord.id}</strong>
                    <span className="text-[10px] text-[#4f4540]">{ord.date}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <strong className="text-[#25160e] block">{ord.customerName}</strong>
                    <span className="text-[10px] text-[#4f4540] truncate max-w-xs block">{ord.address}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-[#25160e]">
                      {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#25160e]">
                    Rp {ord.total.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-[#25160e] text-amber-200 text-[10px] font-bold rounded-full uppercase">
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right print:hidden">
                    <button
                      onClick={onPrintPDF}
                      className="p-2 text-[#25160e] hover:bg-stone-100 rounded-xl transition-colors"
                      title="Cetak Resi Individual"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT OMSET MANUAL */}
      {showInputOmsetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160e]/60 backdrop-blur-md animate-fade-in print:hidden">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-amber-900/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#25160e]">Input Omset Penjualan Manual</h3>
                <p className="text-[11px] text-[#4f4540]">Digunakan untuk pencatatan transaksi offline, kasir langsung, atau event bazar.</p>
              </div>
              <button onClick={() => setShowInputOmsetModal(false)} className="text-stone-400 hover:text-[#25160e]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualOmset} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#25160e] mb-1">Catatan / Nama Event Penjualan</label>
                <input
                  type="text"
                  value={inputEventName}
                  onChange={(e) => setInputEventName(e.target.value)}
                  placeholder="contoh: Penjualan Offline Bazar Lapangan Banteng"
                  className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                  required
                />
              </div>

              <div className="space-y-2 border border-amber-900/10 p-3.5 rounded-2xl bg-[#fbf9f5]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#25160e] block">Rincian Porsi Hidangan Yang Terjual Offline:</span>
                  <span className="text-[10px] text-[#934b19] font-bold">({productList.length} Menu Produk)</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(inputItemSales.length > 0 ? inputItemSales : productList.map(p => ({ name: p.name, qty: 0, price: p.price }))).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                      <span className="font-bold text-[#25160e] min-w-0 truncate">{item.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0;
                            const updated = [...(inputItemSales.length > 0 ? inputItemSales : productList.map(p => ({ name: p.name, qty: 0, price: p.price })))];
                            updated[idx].qty = newQty;
                            setInputItemSales(updated);
                            const newRev = updated.reduce((s, it) => s + (it.qty * it.price), 0);
                            setInputRevenue(newRev.toString());
                            setInputProfit((newRev * 0.4).toString());
                            setInputOrdersCount(updated.reduce((s, it) => s + it.qty, 0).toString());
                          }}
                          className="w-16 px-2 py-1 bg-[#fbf9f5] border border-stone-300 rounded-lg text-center font-bold text-xs"
                          placeholder="0"
                        />
                        <span className="text-[10px] text-stone-500 font-mono">@Rp {item.price.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#25160e] mb-1">Total Omset Kotor (Rp)</label>
                  <input
                    type="number"
                    value={inputRevenue}
                    onChange={(e) => {
                      setInputRevenue(e.target.value);
                      const rev = parseFloat(e.target.value) || 0;
                      setInputProfit((rev * 0.4).toString());
                    }}
                    placeholder="contoh: 2000000"
                    className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-mono font-bold text-[#25160e]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Estimasi Laba Bersih (Rp)</label>
                  <input
                    type="number"
                    value={inputProfit}
                    onChange={(e) => setInputProfit(e.target.value)}
                    placeholder="contoh: 1000000"
                    className="w-full px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-mono font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#25160e] mb-1">Total Porsi Penjualan (Pcs)</label>
                <input
                  type="number"
                  value={inputOrdersCount}
                  onChange={(e) => setInputOrdersCount(e.target.value)}
                  placeholder="contoh: 25"
                  className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs text-[#1b1c1a]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInputOmsetModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4f4540] text-xs font-semibold rounded-2xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md uppercase tracking-wider"
                >
                  Simpan Transaksi Offline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT GRAFIK CHART */}
      {showEditChartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160e]/60 backdrop-blur-md animate-fade-in print:hidden">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-amber-900/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#25160e]">Edit Data Grafik Penjualan</h3>
                <p className="text-[11px] text-[#4f4540]">Ubah angka omset kotor, laba bersih, status bazar, dan keterangan per bulan.</p>
              </div>
              <button onClick={() => setShowEditChartModal(false)} className="text-stone-400 hover:text-[#25160e]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {customChartMonths.map((m, idx) => (
                <div key={idx} className="p-3.5 bg-[#fbf9f5] border border-amber-900/10 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-[#25160e]">{m.label}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#934b19]">
                      <input
                        type="checkbox"
                        checked={m.isBazar}
                        onChange={(e) => {
                          const updated = [...customChartMonths];
                          updated[idx].isBazar = e.target.checked;
                          setCustomChartMonths(updated);
                        }}
                        className="rounded border-amber-900/30 text-[#934b19] focus:ring-[#934b19]"
                      />
                      <span>🎪 Status Event Bazar</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#25160e] mb-1">Omset Kotor (Rp)</label>
                      <input
                        type="number"
                        value={m.gross}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = [...customChartMonths];
                          updated[idx].gross = val;
                          setCustomChartMonths(updated);
                        }}
                        className="w-full px-3 py-2 bg-white border border-amber-900/15 rounded-xl text-xs font-mono font-bold text-[#25160e]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-800 mb-1">Laba Bersih (Rp)</label>
                      <input
                        type="number"
                        value={m.net}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const updated = [...customChartMonths];
                          updated[idx].net = val;
                          setCustomChartMonths(updated);
                        }}
                        className="w-full px-3 py-2 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4f4540] mb-1">Catatan / Status Badge Tooltip</label>
                    <input
                      type="text"
                      value={m.badge}
                      onChange={(e) => {
                        const updated = [...customChartMonths];
                        updated[idx].badge = e.target.value;
                        setCustomChartMonths(updated);
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-[#1b1c1a]"
                      placeholder="contoh: 🎪 Event Bazar Merdeka (>10Jt)"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setCustomChartMonths(default6mMonths);
                  localStorage.removeItem('nefakky_custom_chart_months');
                }}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-xl"
              >
                Reset ke Default
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditChartModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4f4540] text-xs font-semibold rounded-2xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('nefakky_custom_chart_months', JSON.stringify(customChartMonths));
                    setShowEditChartModal(false);
                  }}
                  className="px-6 py-2.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md uppercase tracking-wider"
                >
                  Simpan Perubahan Grafik
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
