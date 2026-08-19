'use client';

import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Calendar,
  Search,
  Clock,
  Truck,
  CheckCircle2,
  Radio,
  Activity,
  CreditCard,
  Building2,
  QrCode,
  Wallet,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpDown
} from 'lucide-react';
import { ProductItem, AdminOrder, useData } from '@/context/DataContext';
import { exportNefakkyExcelReport, exportNefakkyPDFReport } from '@/lib/exportUtils';
import { fetchLaravelSalesYears, fetchLaravelSalesReportsByYear, saveLaravelSalesReport } from '@/lib/laravelApi';

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
  const [selectedKpiMonth, setSelectedKpiMonth] = useState<string>('ALL');

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
    { label: 'Agustus 2026 (Live)', gross: 13800000, net: 6900000, isBazar: true, badge: '🎪 Event Bazar Merdeka (>10Jt) + Live Realtime Web & Offline' },
    { label: 'September 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: 'Oktober 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: 'November 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
    { label: 'Desember 2026', gross: 0, net: 0, isBazar: false, badge: 'Belum Ada Data (Periode Mendatang)' },
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
  // Yearly Archiving & Selection State
  const [selectedYear, setSelectedYear] = useState<string>(() => new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState<string[]>(['2026']);

  React.useEffect(() => {
    fetchLaravelSalesYears().then(yrs => {
      if (yrs && yrs.length > 0) setAvailableYears(yrs);
    });
  }, []);

  React.useEffect(() => {
    fetchLaravelSalesReportsByYear(selectedYear).then(res => {
      if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        const formatted = res.data.map((m: any) => ({
          label: m.month_year,
          gross: Number(m.gross_revenue),
          net: Number(m.net_profit),
          isBazar: Boolean(m.is_bazar),
          badge: m.event_tag || 'Penjualan Reguler'
        }));
        setCustomChartMonths(formatted);
      }
    });
  }, [selectedYear]);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<AdminOrder | null>(null);

  // Live Current Time state that updates every 10 seconds for truly live ticking relative time
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Helper timestamp ekstraksi akurat
  const getOrderTimestamp = (ord: AdminOrder): number => {
    if (typeof ord.createdAt === 'number' && !isNaN(ord.createdAt) && ord.createdAt > 0) {
      return ord.createdAt;
    }
    if (ord.createdAt && typeof (ord.createdAt as any).seconds === 'number') {
      return (ord.createdAt as any).seconds * 1000;
    }
    if (ord.date) {
      const dStr = ord.date.toLowerCase();
      const now = new Date();
      if (dStr.includes('hari ini') || dStr.includes('today')) {
        const timeMatch = ord.date.match(/(\d{1,2})[:.](\d{2})/);
        if (timeMatch) {
          const t = new Date();
          t.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
          return t.getTime();
        }
        return now.getTime();
      }
      if (dStr.includes('kemarin') || dStr.includes('yesterday')) {
        const timeMatch = ord.date.match(/(\d{1,2})[:.](\d{2})/);
        const t = new Date(now.getTime() - 86400000);
        if (timeMatch) {
          t.setHours(parseInt(timeMatch[1], 10), parseInt(timeMatch[2], 10), 0, 0);
          return t.getTime();
        }
        return t.getTime();
      }
      const parsed = Date.parse(ord.date.replace(/,/g, ''));
      if (!isNaN(parsed)) return parsed;
    }
    return Date.now() - 3600000;
  };

  // Helper memformat tanggal & waktu relatif secara real-time
  const formatRealtimeDate = (ord: AdminOrder) => {
    const timestamp = getOrderTimestamp(ord);
    const diffMs = currentTime - timestamp;
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relativeTime = 'Baru saja';
    let isLive = false;

    if (diffSec < 45) {
      relativeTime = 'Baru saja';
      isLive = true;
    } else if (diffMin < 60) {
      relativeTime = `${diffMin} mnt lalu`;
      if (diffMin <= 15) isLive = true;
    } else if (diffHours < 24) {
      relativeTime = `${diffHours} jam lalu`;
    } else if (diffDays === 1) {
      relativeTime = 'Kemarin';
    } else if (diffDays < 7) {
      relativeTime = `${diffDays} hari lalu`;
    } else {
      relativeTime = `${Math.floor(diffDays / 7)} mgg lalu`;
    }

    // Format jam & tanggal yang presisi
    let formattedDate = ord.date;
    if (timestamp > 0) {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
        const isToday = new Date().toDateString() === d.toDateString();
        const yesterday = new Date(Date.now() - 86400000);
        const isYesterday = yesterday.toDateString() === d.toDateString();

        if (isToday) {
          formattedDate = `Hari ini, ${timeStr}`;
        } else if (isYesterday) {
          formattedDate = `Kemarin, ${timeStr}`;
        } else {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
          formattedDate = `${d.getDate()} ${months[d.getMonth()]}, ${timeStr}`;
        }
      }
    }

    return { formattedDate, relativeTime, isLive };
  };

  // State Filter & Search Rekap Realtime
  const [rekapSearchQuery, setRekapSearchQuery] = useState<string>('');
  const [rekapStatusFilter, setRekapStatusFilter] = useState<'ALL' | 'PENDING' | 'COOKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [rekapDateFilter, setRekapDateFilter] = useState<'all' | 'today' | 'yesterday' | '7days' | 'thisMonth'>('all');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');

  // Live active orders source (from Firestore live DataContext / props)
  const liveActiveOrders = React.useMemo(() => {
    const list = (orders && orders.length > 0) ? orders : (orderList || []);
    return list.filter(o => !o.isDeleted);
  }, [orders, orderList]);

  // Update live sync timestamp
  React.useEffect(() => {
    setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [liveActiveOrders]);

  // Filtered & Sorted Rekap Orders (Paling Baru Selalu Di Paling Atas)
  const filteredRekapOrders = React.useMemo(() => {
    return liveActiveOrders
      .filter((ord) => {
        // Status filter
        if (rekapStatusFilter !== 'ALL') {
          if (rekapStatusFilter === 'PENDING') {
            if (ord.status !== 'PENDING' && ord.status !== 'RECEIVED') return false;
          } else if (rekapStatusFilter === 'COOKING') {
            if (ord.status !== 'COOKING' && ord.status !== 'READY') return false;
          } else if (rekapStatusFilter === 'SHIPPING') {
            if (ord.status !== 'SHIPPING' && ord.status !== 'DELIVERING') return false;
          } else if (ord.status !== rekapStatusFilter) {
            return false;
          }
        }

        // Date range filter
        if (rekapDateFilter !== 'all') {
          const orderTime = getOrderTimestamp(ord);
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const startOfYesterday = startOfToday - 86400000;

          if (rekapDateFilter === 'today') {
            if (orderTime < startOfToday) return false;
          } else if (rekapDateFilter === 'yesterday') {
            if (orderTime < startOfYesterday || orderTime >= startOfToday) return false;
          } else if (rekapDateFilter === '7days') {
            const sevenDaysAgo = startOfToday - 6 * 86400000;
            if (orderTime < sevenDaysAgo) return false;
          } else if (rekapDateFilter === 'thisMonth') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            if (orderTime < startOfMonth) return false;
          }
        }

        // Search query filter
        if (rekapSearchQuery.trim()) {
          const q = rekapSearchQuery.toLowerCase();
          const matchId = (ord.id || '').toLowerCase().includes(q);
          const matchName = (ord.customerName || '').toLowerCase().includes(q);
          const matchAddr = (ord.address || '').toLowerCase().includes(q);
          const matchItems = (ord.items || []).some(i => (i.name || '').toLowerCase().includes(q));
          const matchMethod = (ord.paymentMethod || '').toLowerCase().includes(q);
          if (!matchId && !matchName && !matchAddr && !matchItems && !matchMethod) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = getOrderTimestamp(a);
        const timeB = getOrderTimestamp(b);
        return timeB - timeA;
      });
  }, [liveActiveOrders, rekapStatusFilter, rekapDateFilter, rekapSearchQuery]);

  // Total omset terhitung dari data yang terfilter
  const filteredRekapOmset = React.useMemo(() => {
    return filteredRekapOrders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [filteredRekapOrders]);

  const renderRekapStatusBadge = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>PENDING</span>
          </span>
        );
      case 'COOKING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-800 text-[10px] font-bold rounded-full border border-orange-200/80 shadow-2xs">
            <Flame className="w-3 h-3 text-orange-600 animate-pulse" />
            <span>DIMASAK</span>
          </span>
        );
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-800 text-[10px] font-bold rounded-full border border-sky-200/80 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-sky-600" />
            <span>SIAP</span>
          </span>
        );
      case 'SHIPPING':
      case 'DELIVERING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 text-[10px] font-bold rounded-full border border-blue-200/80 shadow-2xs">
            <Truck className="w-3 h-3 text-blue-600 animate-bounce" />
            <span>DIANTAR</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200/80 shadow-2xs">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>COMPLETED</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 text-[10px] font-bold rounded-full border border-rose-200/80 shadow-2xs">
            <X className="w-3 h-3 text-rose-600" />
            <span>BATAL</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-[#25160e] text-amber-200 text-[10px] font-bold rounded-full uppercase">
            {status}
          </span>
        );
    }
  };

  const renderRekapPaymentBadge = (method: string) => {
    const isMidtrans = method.toLowerCase().includes('midtrans');
    const isQris = method.toLowerCase().includes('qris') || method.toLowerCase().includes('gopay') || method.toLowerCase().includes('shopeepay') || method.toLowerCase().includes('dana') || method.toLowerCase().includes('ovo');
    const isCOD = method.toLowerCase().includes('cod') || method.toLowerCase().includes('tempat');
    const isTransfer = method.toLowerCase().includes('transfer') || method.toLowerCase().includes('bca') || method.toLowerCase().includes('mandiri') || method.toLowerCase().includes('bni') || method.toLowerCase().includes('bri');

    if (isMidtrans) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Midtrans
          </span>
          <span className="text-[9.5px] text-stone-500 font-mono">Payment Gateway</span>
        </div>
      );
    }

    if (isQris) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-800 text-[10px] font-bold rounded-full border border-cyan-200 flex items-center gap-1">
            <QrCode className="w-2.5 h-2.5 text-cyan-600" />
            QRIS
          </span>
          <span className="text-[9.5px] text-stone-500 truncate max-w-[110px]">{method}</span>
        </div>
      );
    }

    if (isCOD) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200 flex items-center gap-1">
            <Wallet className="w-2.5 h-2.5 text-amber-600" />
            COD
          </span>
          <span className="text-[9.5px] text-stone-500">Bayar di Tempat</span>
        </div>
      );
    }

    if (isTransfer) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-800 text-[10px] font-bold rounded-full border border-purple-200 flex items-center gap-1">
            <Building2 className="w-2.5 h-2.5 text-purple-600" />
            Transfer Bank
          </span>
          <span className="text-[9.5px] text-stone-500 truncate max-w-[110px]">{method}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start gap-0.5">
        <span className="px-2.5 py-0.5 bg-stone-100 text-stone-800 text-[10px] font-bold rounded-full border border-stone-200 flex items-center gap-1">
          <CreditCard className="w-2.5 h-2.5 text-stone-600" />
          Online
        </span>
        <span className="text-[9.5px] text-stone-500 truncate max-w-[110px]">{method}</span>
      </div>
    );
  };

  // Computations
  const realOrders = liveActiveOrders;
  const nonCancelledOrders = realOrders.filter(o => o.status !== 'CANCELLED');
  const ordersCount = realOrders.length;
  const totalRevenueIDR = nonCancelledOrders.reduce((acc, ord) => acc + (ord.total || 0), 0);

  const baselineOmsetJuni = 7000000;
  const baselineBersihJuni = 3000000;

  const displayRevenue = manualOmsetData ? manualOmsetData.revenue : (baselineOmsetJuni + totalRevenueIDR);
  const displayCleanProfit = manualOmsetData ? Math.round(manualOmsetData.revenue * 0.4) : (baselineBersihJuni + Math.round(totalRevenueIDR * 0.4));
  const displayOrdersCount = manualOmsetData ? manualOmsetData.ordersCount : (85 + ordersCount);
  const displayAOV = displayOrdersCount > 0 ? Math.round(displayRevenue / displayOrdersCount) : 0;

  // Filter metrics based on selected month
  const filteredMetrics = React.useMemo(() => {
    if (selectedKpiMonth === 'ALL') {
      const sumRevenue = customChartMonths.reduce((acc, m) => acc + (m.gross || 0), 0);
      const sumProfit = customChartMonths.reduce((acc, m) => acc + (m.net || 0), 0);
      const calcOrders = ordersCount > 0 ? (85 + ordersCount) : Math.round(sumRevenue / 50000);
      
      return {
        revenue: sumRevenue || displayRevenue,
        profit: sumProfit || displayCleanProfit,
        orders: calcOrders || displayOrdersCount,
        aov: calcOrders > 0 ? Math.round((sumRevenue || displayRevenue) / calcOrders) : 0,
        label: `Semua Periode (Tahun ${selectedYear})`
      };
    }

    const monthIndexMap: Record<string, string> = {
      '2026-06': 'Juni',
      '2026-07': 'Juli',
      '2026-08': 'Agustus',
      '2026-09': 'September',
      '2026-10': 'Oktober',
      '2026-11': 'November',
      '2026-12': 'Desember',
    };

    const targetMonthName = monthIndexMap[selectedKpiMonth] || '';
    const matchedMonthData = customChartMonths.find(m => m.label.toLowerCase().includes(targetMonthName.toLowerCase()));

    if (matchedMonthData) {
      const isLiveAgustus = selectedKpiMonth === '2026-08';
      const rev = matchedMonthData.gross + (isLiveAgustus ? totalRevenueIDR : 0);
      const profit = matchedMonthData.net + (isLiveAgustus ? Math.round(totalRevenueIDR * 0.4) : 0);
      const cnt = isLiveAgustus ? (52 + ordersCount) : (rev > 0 ? Math.round(rev / 50000) : 0);

      return {
        revenue: rev,
        profit: profit,
        orders: cnt,
        aov: cnt > 0 ? Math.round(rev / cnt) : 0,
        label: matchedMonthData.label
      };
    }

    return {
      revenue: 0,
      profit: 0,
      orders: 0,
      aov: 0,
      label: `Periode ${selectedKpiMonth}`
    };
  }, [selectedKpiMonth, selectedYear, customChartMonths, displayRevenue, displayCleanProfit, displayOrdersCount, displayAOV, totalRevenueIDR, ordersCount]);

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
            onClick={() => exportNefakkyPDFReport(selectedYear, filteredMetrics.revenue, filteredMetrics.profit, filteredMetrics.orders, customChartMonths)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#3c2a21] text-amber-200 hover:bg-[#25160e] transition-all text-xs font-bold shadow-md"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Cetak PDF ({selectedYear})</span>
          </button>
          <button 
            onClick={() => exportNefakkyExcelReport(realOrders, productList, {
              selectedYear: selectedYear,
              selectedMonthLabel: filteredMetrics.label,
              customChartMonths: customChartMonths,
              manualOmsetData: manualOmsetData
            })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#934b19] text-white hover:bg-[#783603] transition-all text-xs font-bold shadow-lg"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-200" />
            <span>Ekspor Excel (CSV)</span>
          </button>
        </div>
      </div>

      {/* FILTER PERIODE BULAN FOR KPI METRICS */}
      <div className="bg-white p-4 rounded-3xl border border-amber-900/10 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#934b19]/10 text-[#934b19] flex items-center justify-center font-bold shrink-0 border border-[#934b19]/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#25160e]">Filter Tinjauan Metrik Per Bulan:</h4>
            <p className="text-[10px] text-[#4f4540]">Pilih bulan tertentu untuk melihat omset, margin 40%, &amp; total pesanan per bulan.</p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          

          {/* Month Filter Dropdown */}
          <select
            value={selectedKpiMonth}
            onChange={(e) => setSelectedKpiMonth(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/20 text-[#25160e] text-xs font-bold rounded-2xl shadow-xs focus:ring-2 focus:ring-[#934b19] outline-none cursor-pointer"
          >
            <option value="ALL">📅 Semua Bulan (Akumulasi Total)</option>
            <option value="2026-06">Juni 2026 (Bazar &amp; Baseline)</option>
            <option value="2026-07">Juli 2026 (Bazar Kuliner)</option>
            <option value="2026-08">Agustus 2026 (Bulan Ini / Live)</option>
            <option value="2026-09">September 2026 (Mendatang)</option>
            <option value="2026-10">Oktober 2026 (Mendatang)</option>
            <option value="2026-11">November 2026 (Mendatang)</option>
            <option value="2026-12">Desember 2026 (Mendatang)</option>
            
          </select>
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
              Rp {filteredMetrics.revenue.toLocaleString('id-ID')}
            </h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md inline-block">
              {filteredMetrics.label}
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
              Rp {filteredMetrics.profit.toLocaleString('id-ID')}
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
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#25160e]">{filteredMetrics.orders} Transaksi</h2>
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
              Rp {filteredMetrics.aov.toLocaleString('id-ID')}
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-[#25160e] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#934b19]" />
              <span>Analisis Tren Omset Penjualan &amp; Laba Bersih</span>
            </h3>
            <p className="text-xs text-[#4f4540] font-light">
              Visualisasi komparatif omset kotor (bruto) vs proyeksi laba bersih 40% berbasis pesanan real-time &amp; event bazar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-[#fbf9f5] p-1.5 rounded-2xl border border-amber-900/15 shadow-xs">
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
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-[#25160e] text-xs font-bold rounded-2xl transition-all border border-stone-200/80 print:hidden flex items-center gap-1.5"
            >
              <span>⚙️ Edit Data Grafik</span>
            </button>
          </div>
        </div>

        {/* VISUAL COLOR LEGENDS */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#4f4540] bg-[#fbf9f5]/80 p-3 rounded-2xl border border-amber-900/10">
          <span className="text-[10px] uppercase tracking-wider text-[#934b19]">Petunjuk Indikator Warna:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-r from-[#934b19] to-amber-500 shadow-xs" />
            <span>Omset Penjualan Kotor (Bruto)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-xs" />
            <span>Laba Bersih (40% Margin)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-[11px] text-[#934b19]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>🎪 Skala Event Bazar &gt; Rp 10 Juta</span>
          </div>
        </div>

        {/* DUAL BAR CHART RENDER WITH GRIDLINES & FLOATING VALUE LABELS */}
        <div className="relative h-80 w-full pt-6 pb-2 overflow-x-auto no-scrollbar">
          
          {/* Y-Axis Background Gridlines */}
          <div className="absolute inset-0 top-6 bottom-10 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-dashed border-stone-400 w-full flex justify-end">
              <span className="text-[9px] text-stone-500 font-mono -mt-3 pr-1">Skala Omset Maksimal</span>
            </div>
            <div className="border-b border-dashed border-stone-300 w-full" />
            <div className="border-b border-dashed border-stone-300 w-full" />
            <div className="border-b border-dashed border-stone-300 w-full" />
            <div className="border-b border-stone-300 w-full" />
          </div>

          <div className="h-full min-w-[550px] sm:min-w-0 w-full flex items-end justify-between gap-3 sm:gap-6 border-b-2 border-stone-300 pb-1 relative z-10">
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
              const grossPct = item.gross === 0 ? 0 : Math.min(100, Math.max(18, (item.gross / maxVal) * 100));
              const netPct = item.net === 0 ? 0 : Math.min(100, Math.max(12, (item.net / maxVal) * 100));

              const formatShortJt = (val: number) => {
                if (val === 0) return '';
                if (val >= 1000000) {
                  return `Rp ${(val / 1000000).toFixed(1)}Jt`;
                }
                return `Rp ${(val / 1000).toFixed(0)}Rb`;
              };

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative cursor-pointer">
                  
                  {/* Floating Value Labels Above Bars */}
                  {item.gross > 0 ? (
                    <div className="flex flex-col items-center gap-0.5 mb-1 z-20 transition-transform group-hover:-translate-y-1">
                      <span className="px-1.5 py-0.5 bg-[#25160e] text-amber-300 text-[9px] font-bold rounded-md shadow-xs whitespace-nowrap">
                        {formatShortJt(item.gross)}
                      </span>
                      <span className="px-1.5 py-0.2 bg-emerald-700 text-white text-[8px] font-bold rounded-md shadow-xs whitespace-nowrap">
                        {formatShortJt(item.net)}
                      </span>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-400 text-[8px] font-medium rounded-md whitespace-nowrap">
                        Mendatang
                      </span>
                    </div>
                  )}

                  {/* Hover Tooltip Box */}
                  <div className="absolute -top-14 z-40 bg-[#25160e] text-white p-2.5 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-amber-900/40 text-[10px] space-y-0.5">
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

                  {/* Dual Bar Container */}
                  <div className="w-full flex items-end justify-center gap-1.5 h-full px-1">
                    {item.gross > 0 ? (
                      <>
                        {/* Omset Bar */}
                        <div 
                          className={`w-1/2 rounded-t-2xl transition-all duration-500 shadow-md ${
                            item.isBazar 
                              ? 'bg-gradient-to-t from-[#934b19] via-amber-600 to-amber-500 group-hover:brightness-125' 
                              : 'bg-gradient-to-t from-[#25160e] to-[#4f4540] group-hover:from-[#934b19] group-hover:to-amber-600'
                          }`}
                          style={{ height: `${grossPct}%` }}
                        />
                        {/* Profit Bar */}
                        <div 
                          className="w-1/2 rounded-t-2xl bg-gradient-to-t from-emerald-700 via-emerald-500 to-emerald-400 transition-all duration-500 shadow-md group-hover:brightness-110"
                          style={{ height: `${netPct}%` }}
                        />
                      </>
                    ) : (
                      <div className="w-full h-8 border-2 border-dashed border-stone-200 rounded-t-xl bg-stone-50/50 flex items-center justify-center">
                        <span className="text-[8px] text-stone-300 font-bold">•</span>
                      </div>
                    )}
                  </div>

                  {/* Month / Period X-Axis Label */}
                  <span className={`text-[10px] font-bold truncate max-w-full mt-1.5 px-1 py-0.5 rounded-md ${
                    item.label.includes('Live') || item.label.includes('Agustus')
                      ? 'bg-amber-100 text-[#934b19] border border-amber-300'
                      : item.gross === 0
                      ? 'text-stone-400 font-normal'
                      : 'text-[#25160e]'
                  }`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BAZAR EXPLANATION FOOTER */}
        <div className="bg-[#fbf9f5] rounded-2xl p-4 border border-amber-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#934b19]" />
            <span className="text-[#25160e] font-bold">Aturan Operasional Omset &amp; Bazar:</span>
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

      {/* REKAP PEMBELIAN OMSET TRANSAKSI REALTIME */}
      <div className="bg-white shadow-xl shadow-amber-950/5 rounded-3xl p-6 sm:p-8 border border-amber-900/10 space-y-6">
        
        {/* Header Rekap Realtime */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-serif text-2xl font-bold text-[#25160e]">Rekap Pembelian &amp; Transaksi Omset</h3>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200/80 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Live Sync Realtime • {lastSyncTime}</span>
              </div>
            </div>
            <p className="text-xs text-[#4f4540]">Rincian riwayat data pembelian transaksi riil dari konsumen web secara langsung dan terurut paling baru.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={onExportCSV}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#25160e] hover:bg-[#3c2a21] text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 print:hidden transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download Rekap CSV</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Mini Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#fbf9f5] rounded-2xl border border-amber-900/10">
            <span className="text-[10px] text-[#4f4540] font-bold uppercase tracking-wider block">Total Transaksi</span>
            <span className="text-base sm:text-lg font-bold font-serif text-[#25160e]">{filteredRekapOrders.length} Pesanan</span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/60">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Omset Terfilter</span>
            <span className="text-base sm:text-lg font-bold font-serif text-emerald-900">Rp {filteredRekapOmset.toLocaleString('id-ID')}</span>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60">
            <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Aktif / Diproses</span>
            <span className="text-base sm:text-lg font-bold font-serif text-amber-900">
              {filteredRekapOrders.filter(o => o.status === 'PENDING' || o.status === 'RECEIVED' || o.status === 'COOKING' || o.status === 'READY' || o.status === 'SHIPPING' || o.status === 'DELIVERING').length} Transaksi
            </span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
            <span className="text-[10px] text-stone-600 font-bold uppercase tracking-wider block">Selesai (Completed)</span>
            <span className="text-base sm:text-lg font-bold font-serif text-stone-800">
              {filteredRekapOrders.filter(o => o.status === 'COMPLETED').length} Transaksi
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#fbf9f5] p-3 rounded-2xl border border-amber-900/10">
          {/* Input Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={rekapSearchQuery}
              onChange={(e) => setRekapSearchQuery(e.target.value)}
              placeholder="Cari ID (#ORD-xxxx), nama pelanggan, menu masakan..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-amber-900/15 rounded-xl text-xs text-[#25160e] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#934b19]/30 font-medium"
            />
            {rekapSearchQuery && (
              <button
                onClick={() => setRekapSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'COOKING', label: 'Dimasak' },
              { id: 'SHIPPING', label: 'Diantar' },
              { id: 'COMPLETED', label: 'Selesai' },
              { id: 'CANCELLED', label: 'Batal' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRekapStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  rekapStatusFilter === tab.id
                    ? 'bg-[#25160e] text-white shadow-xs'
                    : 'bg-white text-[#4f4540] hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#934b19]" />
            <select
              value={rekapDateFilter}
              onChange={(e) => setRekapDateFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-amber-900/15 rounded-xl text-xs font-bold text-[#25160e] focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Realtime */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#fbf9f5] border-b border-stone-200 text-[#4f4540] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[175px]">ID &amp; Tanggal</th>
                <th className="py-3.5 px-4 min-w-[160px]">Pelanggan</th>
                <th className="py-3.5 px-4 min-w-[160px]">Menu Dipesan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Metode Bayar</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Total Omset (Rp)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status Alur</th>
                <th className="py-3.5 px-4 text-right print:hidden whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filteredRekapOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#4f4540]">
                    <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <p className="font-bold text-sm text-[#25160e]">Tidak ada transaksi ditemukan</p>
                    <p className="text-xs text-stone-500">Coba ubah kata kunci pencarian atau sesuaikan filter status.</p>
                  </td>
                </tr>
              ) : (
                filteredRekapOrders.map((ord, idx) => {
                  const { formattedDate, relativeTime, isLive } = formatRealtimeDate(ord);
                  const isVeryRecent = isLive || (idx === 0 && (ord.status === 'PENDING' || ord.status === 'RECEIVED' || ord.status === 'COOKING'));
                  return (
                    <tr 
                      key={ord.id} 
                      className={`hover:bg-[#fbf9f5] transition-colors ${
                        isVeryRecent ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[175px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-[#934b19] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-900/15 text-xs shadow-2xs">
                            #{ord.id}
                          </span>
                          {isLive && (
                            <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black rounded-md tracking-wider animate-pulse flex items-center gap-0.5 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#4f4540] mt-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="font-semibold text-[#25160e]">{formattedDate}</span>
                          <span className="text-stone-300">•</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                            isLive 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}>
                            {relativeTime}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#25160e] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {ord.customerName ? ord.customerName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <strong className="text-[#25160e] block font-bold truncate max-w-[140px] sm:max-w-[180px]">{ord.customerName}</strong>
                            <span className="text-[10px] text-stone-500 truncate max-w-[140px] sm:max-w-[180px] block" title={ord.address}>
                              {ord.address}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {(ord.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center gap-1.5 text-[#25160e] font-medium">
                              <span className="px-1.5 py-0.2 bg-amber-100 text-[#934b19] rounded font-bold text-[10px]">
                                {item.quantity}x
                              </span>
                              <span className="truncate max-w-[160px]">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {renderRekapPaymentBadge(ord.paymentMethod || 'Online')}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#25160e] whitespace-nowrap">
                        Rp {ord.total.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderRekapStatusBadge(ord.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right print:hidden whitespace-nowrap">
                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="p-2 text-[#934b19] hover:bg-amber-100/60 rounded-xl transition-all border border-amber-900/15 shadow-2xs hover:scale-105 active:scale-95"
                          title="Cetak Struk Pembelian / Nota Order"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info rekap */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-[#4f4540] pt-1">
          <span>Menampilkan <strong>{filteredRekapOrders.length}</strong> dari total <strong>{liveActiveOrders.length}</strong> transaksi sistem.</span>
          <span className="text-stone-400">Terhubung ke Realtime Cloud Database • Auto Refresh Otomatis</span>
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
                  onClick={async () => {
                    localStorage.setItem('nefakky_custom_chart_months', JSON.stringify(customChartMonths));
                    for (const m of customChartMonths) {
                      await saveLaravelSalesReport({
                        year: selectedYear,
                        month_year: m.label,
                        gross_revenue: m.gross,
                        net_profit: m.net,
                        total_orders: Math.round(m.gross / 50000),
                        event_tag: m.badge,
                        is_bazar: m.isBazar
                      });
                    }
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
                  <span>Rp {selectedReceiptOrder.total.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Ongkos Kirim:</span>
                  <span>Rp 0</span>
                </div>
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

      {/* ================================================================= */}
      {/* SEKSI DOKUMEN CETAK (HANYA MUNCUL SAAT CETAK / WINDOW.PRINT) */}
      {/* ================================================================= */}
      {selectedReceiptOrder ? (
        /* PRINTABLE THERMAL RECEIPT WHEN AN ORDER IS SELECTED */
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
      ) : (
        /* STANDARD EXECUTIVE BUSINESS PDF REPORT WHEN PRINTING FROM TOP BUTTON */
        <div className="hidden print:block bg-white text-[#25160E] p-6 space-y-6 max-w-4xl mx-auto font-sans leading-relaxed">
        {/* KOP SURAT LAPORAN BISNIS */}
        <div className="flex items-center justify-between border-b-2 border-[#25160E] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#25160E] text-white flex items-center justify-center font-serif font-bold text-2xl rounded-xl">
              N
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#25160E]">Nefakky Cita Rasa Otentik</h1>
              <p className="text-xs text-[#934B19] font-bold uppercase tracking-widest">Command Desk Management &amp; Analytics Report</p>
            </div>
          </div>
          <div className="text-right text-xs text-stone-600">
            <p className="font-bold text-[#25160E]">LAPORAN RINGKASAN BISNIS</p>
            <p>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Diterbitkan Oleh: Fatih Ahmad Zakky (Store Manager)</p>
          </div>
        </div>

        {/* METRIK IKHTISAR BISNIS (5 KPI CARDS) */}
        <div>
          <h2 className="text-xs font-bold text-[#25160E] uppercase tracking-wider mb-2.5 border-l-4 border-[#934B19] pl-2">
            1. Ikhtisar Eksekutif Penjualan &amp; Margin
          </h2>
          <div className="grid grid-cols-5 gap-2.5 text-center">
            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-[9px] text-stone-500 block uppercase font-bold">Total Omset</span>
              <span className="text-xs font-serif font-bold text-[#25160E]">Rp {displayRevenue.toLocaleString('id-ID')}</span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[9px] text-emerald-700 block uppercase font-bold">Margin (40%)</span>
              <span className="text-xs font-serif font-bold text-emerald-800">Rp {Math.round(displayRevenue * 0.4).toLocaleString('id-ID')}</span>
            </div>
            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-[9px] text-stone-500 block uppercase font-bold">Total Pesanan</span>
              <span className="text-xs font-serif font-bold text-[#25160E]">{displayOrdersCount} Transaksi</span>
            </div>
            <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-[9px] text-stone-500 block uppercase font-bold">AOV (Rata-rata)</span>
              <span className="text-xs font-serif font-bold text-[#25160E]">Rp {displayAOV.toLocaleString('id-ID')}</span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[9px] text-amber-800 block uppercase font-bold">Rating Pelanggan</span>
              <span className="text-xs font-serif font-bold text-amber-900">4.9 / 5.0 ⭐</span>
            </div>
          </div>
        </div>

        {/* TABEL REKAP PEMBELIAN PRODUK TERLARIS */}
        <div>
          <h2 className="text-xs font-bold text-[#25160E] uppercase tracking-wider mb-2 border-l-4 border-[#934B19] pl-2">
            2. Rekap Pembelian &amp; Penjualan Produk Terlaris
          </h2>
          <table className="w-full text-left border-collapse border border-stone-200 text-[11px]">
            <thead>
              <tr className="bg-stone-100 text-[#25160E] font-bold">
                <th className="p-1.5 border border-stone-200">No</th>
                <th className="p-1.5 border border-stone-200">Nama Menu Hidangan</th>
                <th className="p-1.5 border border-stone-200">Kategori</th>
                <th className="p-1.5 border border-stone-200 text-center">Jumlah Terjual</th>
                <th className="p-1.5 border border-stone-200 text-right">Total Pendapatan (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(realProductSalesMap).sort((a, b) => b.unitsSold - a.unitsSold).map((p, idx) => (
                <tr key={idx} className="border-b border-stone-200">
                  <td className="p-1.5 border border-stone-200 text-center font-bold">{idx + 1}</td>
                  <td className="p-1.5 border border-stone-200 font-bold">{p.name}</td>
                  <td className="p-1.5 border border-stone-200 text-stone-600">{p.category}</td>
                  <td className="p-1.5 border border-stone-200 text-center font-bold">{p.unitsSold} Porsi</td>
                  <td className="p-1.5 border border-stone-200 text-right font-bold">Rp {p.totalRevenue.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TABEL DETAIL TRANSAKSI OMSET */}
        <div>
          <h2 className="text-xs font-bold text-[#25160E] uppercase tracking-wider mb-2 border-l-4 border-[#934B19] pl-2">
            3. Rincian Transaksi Omset Pesanan Masuk
          </h2>
          <table className="w-full text-left border-collapse border border-stone-200 text-[10px]">
            <thead>
              <tr className="bg-stone-100 text-[#25160E] font-bold">
                <th className="p-1.5 border border-stone-200">ID Pesanan</th>
                <th className="p-1.5 border border-stone-200">Tanggal</th>
                <th className="p-1.5 border border-stone-200">Pelanggan</th>
                <th className="p-1.5 border border-stone-200">Detail Pesanan</th>
                <th className="p-1.5 border border-stone-200">Pembayaran</th>
                <th className="p-1.5 border border-stone-200 text-right">Total Omset</th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((o) => (
                <tr key={o.id} className="border-b border-stone-200">
                  <td className="p-1.5 border border-stone-200 font-bold">#{o.id}</td>
                  <td className="p-1.5 border border-stone-200 text-stone-600">{o.date}</td>
                  <td className="p-1.5 border border-stone-200 font-bold">{o.customerName}</td>
                  <td className="p-1.5 border border-stone-200">
                    {(o.items || []).map(i => `${i.name} (${i.quantity}x)`).join(', ')}
                  </td>
                  <td className="p-1.5 border border-stone-200 text-stone-600">{o.paymentMethod}</td>
                  <td className="p-1.5 border border-stone-200 text-right font-bold">Rp {o.total.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TANDA TANGAN KELAYAKAN RESMI */}
        <div className="pt-6 flex justify-between items-end border-t border-stone-200">
          <div className="text-[10px] text-stone-500">
            <p>Catatan: Dokumen laporan bisnis ini dicetak secara otomatis dari</p>
            <p className="font-bold text-[#25160E]">Nefakky Admin Command Desk System.</p>
          </div>
          <div className="text-center text-xs space-y-10">
            <p className="font-bold text-[#25160E]">Disahkan Oleh Store Manager,</p>
            <div>
              <p className="font-serif font-bold text-[#25160E] underline">Fatih Ahmad Zakky</p>
              <p className="text-[10px] text-stone-500">Nefakky Culinary Management</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
}
