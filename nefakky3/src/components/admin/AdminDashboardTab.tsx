'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminDashboardTab (src/components/admin/AdminDashboardTab.tsx)
 * DESKRIPSI: Dashboard Tinjauan Bisnis Eksekutif Nefakky dengan:
 *            - Reaktivitas Total Dropdown Periode (Jun-Dec, Bulan Ini, 7 Hari, 1 Tahun).
 *            - Fitur Edit Data Grafik: Pengguna dapat mengedit nilai omset, laba,
 *              status aktif/mendatang, dan event untuk setiap bulan sesuai keinginan.
 *            - Modal Input Omset Detail: Mencakup status event (Ada/Tidak), nama event,
 *              pilihan bulan, minggu ke berapa, tanggal spesifik, pendapatan kotor/bersih,
 *              jumlah porsi, menu terlaris, dan catatan operasional.
 *            - Analisis Tren Omset: Juni s/d Agustus 2026 aktif, September s/d Desember
 *              sebagai garis penanda bulan mendatang (tanpa bar).
 *            - Popover Detail saat Bar Chart diklik.
 *            - Bintang Kepuasan Pelanggan Solid Emas & Live Ledger Struk Kasir.
 * ============================================================================
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Plus,
  AlertTriangle,
  X,
  Check,
  RotateCcw,
  Filter,
  RefreshCw,
  ChevronDown,
  Sparkles,
  Info,
  DollarSign,
  PartyPopper,
  Store
} from 'lucide-react';
import { ShoppingBag, Flame, Search, BarChart3, Star, Calendar, CalendarClock, Receipt, Printer, FileSpreadsheet, Download, FileText, Eye, Edit3, Sliders } from '@/components/icons/CustomIcons';
import { ProductItem, AdminOrder, useData } from '@/context/DataContext';
import { 
  checkAndTriggerAnnualArchive, 
  getArchivedYearsList, 
  AnnualArchiveRecord 
} from '@/lib/annualArchive';
import { exportNefakkyPDFReport, exportNefakkyExcelReport } from '@/lib/exportUtils';
import { 
  getDetailedOrderDateTime, 
  isOrderToday, 
  isOrderThisWeek, 
  isOrderThisMonth, 
  isOrderThisYear 
} from '@/lib/orderTimeUtils';
import { createBazarCalendarUrl, createOrderCalendarUrl } from '@/lib/googleCalendar';
import { 
  RealtimeCalendarInfo, 
  getRealtimeCalendarNow, 
  syncRealtimeCalendarClock 
} from '@/lib/realtimeCalendarApi';

interface AdminDashboardTabProps {
  productList: ProductItem[];
  orderList: AdminOrder[];
  onOpenCreateVoucher: (name: string, code: string) => void;
  onExportCSV: () => void;
  onPrintPDF: () => void;
}

export interface ChartMonthConfig {
  label: string;
  fullTitle: string;
  grossAmount: string;
  netAmount: string;
  grossRaw: number;
  netRaw: number;
  grossPercent: number;
  netPercent: number;
  isBazar: boolean;
  badge?: string;
  eventName?: string;
  ordersCount: number;
  isUpcoming: boolean;
}

export const getDefaultChartMonths = (currentMonthIdx: number = new Date().getMonth()): ChartMonthConfig[] => {
  return [
    { 
      label: 'Jul', 
      fullTitle: 'Bulan Juli 2026', 
      grossPercent: 73, 
      netPercent: 23, 
      grossAmount: 'Rp 11.0 Jt', 
      netAmount: 'Rp 3.5 Jt', 
      grossRaw: 11000000, 
      netRaw: 3500000, 
      ordersCount: 250, 
      isBazar: true, 
      badge: '4x Bazar + 4x Reguler', 
      isUpcoming: false, 
      eventName: '4x Bazar (Habis) + 4x Reguler (300 Cup Jus Terjual)' 
    },
    { 
      label: 'Agu', 
      fullTitle: 'Bulan Agustus 2026', 
      grossPercent: 80, 
      netPercent: 33, 
      grossAmount: 'Rp 12.0 Jt', 
      netAmount: 'Rp 5.0 Jt', 
      grossRaw: 12000000, 
      netRaw: 5000000, 
      ordersCount: 320, 
      isBazar: true, 
      badge: '3x Bazar Event', 
      isUpcoming: false, 
      eventName: '3x Bazar Event + 1x Jualan Biasa (Margin: 41,67%)' 
    },
    { 
      label: 'Sep', 
      fullTitle: currentMonthIdx === 8 ? 'Bulan September 2026 (Bulan Ini)' : 'Bulan September 2026', 
      grossPercent: 55, 
      netPercent: 24, 
      grossAmount: 'Rp 6.2 Jt', 
      netAmount: 'Rp 2.6 Jt', 
      grossRaw: 6200000, 
      netRaw: 2600000, 
      ordersCount: 165, 
      isBazar: true, 
      badge: currentMonthIdx === 8 ? 'Bulan Berjalan' : '2x Bazar Event', 
      isUpcoming: currentMonthIdx < 8, 
      eventName: 'Penjualan Berjalan September 2026 (Bazar & Pesanan Online Realtime)' 
    },
    { 
      label: 'Okt', 
      fullTitle: currentMonthIdx === 9 ? 'Bulan Oktober 2026 (Bulan Ini)' : 'Bulan Oktober 2026', 
      grossPercent: currentMonthIdx >= 9 ? 35 : 0, 
      netPercent: currentMonthIdx >= 9 ? 15 : 0, 
      grossAmount: currentMonthIdx >= 9 ? 'Rp 4.0 Jt' : 'Rp 0', 
      netAmount: currentMonthIdx >= 9 ? 'Rp 1.6 Jt' : 'Rp 0', 
      grossRaw: currentMonthIdx >= 9 ? 4000000 : 0, 
      netRaw: currentMonthIdx >= 9 ? 1600000 : 0, 
      ordersCount: currentMonthIdx >= 9 ? 90 : 0, 
      isBazar: false, 
      isUpcoming: currentMonthIdx < 9, 
      eventName: currentMonthIdx >= 9 ? 'Penjualan Berjalan Oktober 2026' : 'Belum dimulai' 
    },
    { 
      label: 'Nov', 
      fullTitle: currentMonthIdx === 10 ? 'Bulan November 2026 (Bulan Ini)' : 'Bulan November 2026', 
      grossPercent: currentMonthIdx >= 10 ? 35 : 0, 
      netPercent: currentMonthIdx >= 10 ? 15 : 0, 
      grossAmount: currentMonthIdx >= 10 ? 'Rp 4.0 Jt' : 'Rp 0', 
      netAmount: currentMonthIdx >= 10 ? 'Rp 1.6 Jt' : 'Rp 0', 
      grossRaw: currentMonthIdx >= 10 ? 4000000 : 0, 
      netRaw: currentMonthIdx >= 10 ? 1600000 : 0, 
      ordersCount: currentMonthIdx >= 10 ? 90 : 0, 
      isBazar: false, 
      isUpcoming: currentMonthIdx < 10, 
      eventName: currentMonthIdx >= 10 ? 'Penjualan Berjalan November 2026' : 'Belum dimulai' 
    },
    { 
      label: 'Des', 
      fullTitle: currentMonthIdx === 11 ? 'Bulan Desember 2026 (Bulan Ini)' : 'Bulan Desember 2026', 
      grossPercent: currentMonthIdx >= 11 ? 35 : 0, 
      netPercent: currentMonthIdx >= 11 ? 15 : 0, 
      grossAmount: currentMonthIdx >= 11 ? 'Rp 4.0 Jt' : 'Rp 0', 
      netAmount: currentMonthIdx >= 11 ? 'Rp 1.6 Jt' : 'Rp 0', 
      grossRaw: currentMonthIdx >= 11 ? 4000000 : 0, 
      netRaw: currentMonthIdx >= 11 ? 1600000 : 0, 
      ordersCount: currentMonthIdx >= 11 ? 90 : 0, 
      isBazar: false, 
      isUpcoming: currentMonthIdx < 11, 
      eventName: currentMonthIdx >= 11 ? 'Penjualan Berjalan Desember 2026' : 'Belum dimulai' 
    },
  ];
};

const DEFAULT_CHART_MONTHS = getDefaultChartMonths();

export default function AdminDashboardTab({
  productList,
  orderList,
  onOpenCreateVoucher,
  onExportCSV,
  onPrintPDF
}: AdminDashboardTabProps) {
  const { products, orders } = useData();

  // Realtime Calendar & Clock API Sync (Ticking every second)
  const [liveCalendarInfo, setLiveCalendarInfo] = useState<RealtimeCalendarInfo>(() => getRealtimeCalendarNow());

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const cal = getRealtimeCalendarNow();
    return `Bulan Ini (${cal.shortMonth} ${cal.year})`;
  });
  const [showPeriodDropdown, setShowPeriodDropdown] = useState<boolean>(false);
  const [searchOrderQuery, setSearchOrderQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    // Sinkronkan jam dengan Server Calendar API saat inisialisasi
    syncRealtimeCalendarClock().then(() => {
      const now = getRealtimeCalendarNow();
      setLiveCalendarInfo(now);
    });

    const timer = setInterval(() => {
      setLiveCalendarInfo(getRealtimeCalendarNow());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<AdminOrder | null>(null);

  // Timeframe sinkron dengan selectedPeriod
  const chartTimeframe: '1M' | '6M' | '1Y' = useMemo(() => {
    const lower = selectedPeriod.toLowerCase();
    if (lower.includes('tahun') || lower.includes('1y')) return '1Y';
    if (lower.includes('des') || lower.includes('dec') || lower.includes('semester') || lower.includes('6m') || lower.includes('jul -')) return '6M';
    return '1M';
  }, [selectedPeriod]);

  // Detail Modal ketika Bar Chart diklik
  const [selectedChartDetail, setSelectedChartDetail] = useState<ChartMonthConfig | null>(null);

  // Custom Chart Data State (Bisa Diedit Manual oleh Admin & Otomatis Aktif di Bulan Berjalan)
  const [customChartData, setCustomChartData] = useState<ChartMonthConfig[]>(() => {
    const curIdx = new Date().getMonth();
    const defaults = getDefaultChartMonths(curIdx);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nefakky_custom_chart_data');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = parsed.filter((m: ChartMonthConfig) => m.label !== 'Jun');
            const hasOldDummy = filtered.some((m: ChartMonthConfig) => m.grossRaw > 50000000);
            const sepItem = filtered.find((m: ChartMonthConfig) => m.label === 'Sep');
            // Jika kalender sudah masuk September (curIdx >= 8) dan data Sep masih 0 / upcoming, auto-upgrade ke data September aktif
            const needsSepUpgrade = curIdx >= 8 && (!sepItem || sepItem.grossRaw === 0 || sepItem.isUpcoming);

            if (!hasOldDummy && !needsSepUpgrade && filtered.length > 0) {
              return filtered;
            }
          }
        } catch (e) {}
      }
    }
    return defaults;
  });

  const [showEditChartModal, setShowEditChartModal] = useState<boolean>(false);
  const [editMonthIndex, setEditMonthIndex] = useState<number>(1); // Default edit Agustus (index 1)
  const [editGrossInput, setEditGrossInput] = useState<string>('12000000');
  const [editNetInput, setEditNetInput] = useState<string>('5000000');
  const [editIsBazar, setEditIsBazar] = useState<boolean>(true);
  const [editBadgeText, setEditBadgeText] = useState<string>('3x Bazar + 1x Reguler');
  const [editEventName, setEditEventName] = useState<string>('3x Bazar Event + 1x Jualan Biasa (Margin: 41,67%)');
  const [editIsUpcoming, setEditIsUpcoming] = useState<boolean>(false);

  // Detail Input Omset State (Detail: Event, Bulan, Minggu, Tanggal, Nominal, Multi-Menu Terlaris)
  const [manualOmsetData, setManualOmsetData] = useState<{
    hasEvent: boolean;
    eventName: string;
    month: string;
    week: string;
    date: string;
    revenue: number;
    cleanProfit: number;
    ordersCount: number;
    bestSellers: string[];
    notes?: string;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nefakky_manual_omset');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (parsed) {
            if (!Array.isArray(parsed.bestSellers)) {
              parsed.bestSellers = parsed.bestSeller ? [parsed.bestSeller] : (parsed.bestSellers || ['Ayam Bakar']);
            }
            return parsed;
          }
        } catch (e) {}
      }
    }
    return null;
  });

  const [showInputOmsetModal, setShowInputOmsetModal] = useState<boolean>(false);
  const [inputHasEvent, setInputHasEvent] = useState<boolean>(true);
  const [inputEventName, setInputEventName] = useState<string>('Penjualan Offline Bazar Akbar');
  const [inputMonth, setInputMonth] = useState<string>('Agustus 2026');
  const [inputWeek, setInputWeek] = useState<string>('Minggu 4 (Tgl 22 - 28)');
  const [inputDate, setInputDate] = useState<string>('2026-08-23');
  const [inputRevenue, setInputRevenue] = useState<string>('2500000');
  const [inputProfit, setInputProfit] = useState<string>('1000000');
  const [inputOrdersCount, setInputOrdersCount] = useState<string>('35');
  const [inputBestSellers, setInputBestSellers] = useState<string[]>([
    'Ayam Bakar',
    'Gudeg'
  ]);
  const [inputNotes, setInputNotes] = useState<string>('Ramai pengunjung di akhir pekan.');
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [archiveFeedbackMsg, setArchiveFeedbackMsg] = useState<string>('');

  const realOrders = orderList && orderList.length > 0 ? orderList : orders || [];

  // --------------------------------------------------------------------------
  // LIVE TRANSACTION ANIMATION & MONTHLY ONLINE AGGREGATION
  // --------------------------------------------------------------------------
  const [recentTransactionAlert, setRecentTransactionAlert] = useState<{
    active: boolean;
    amount: number;
    targetMonth?: string;
    orderId?: string;
  } | null>(null);

  const prevOrdersCountRef = useRef(realOrders.length);
  const prevRevenueRef = useRef(0);

  // Helper pemetaan bulan transaksi online berdasarkan timestamp atau tanggal order
  const getOrderMonthLabel = (order: AdminOrder): string => {
    const MONTH_MAP: { [key: number]: string } = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'Mei', 5: 'Jun',
      6: 'Jul', 7: 'Agu', 8: 'Sep', 9: 'Okt', 10: 'Nov', 11: 'Des'
    };

    const detailed = getDetailedOrderDateTime(order);
    if (detailed && detailed.dateObj && !isNaN(detailed.dateObj.getTime())) {
      // monthIndex dihitung dari jam WIB — konsisten dengan label bulan liveCalendarInfo
      // dan agregasi order lain (bug lama: memakai bulan timezone lokal mesin).
      return MONTH_MAP[detailed.monthIndex] || 'Sep';
    }
    return 'Sep';
  };

  // Agregasi seluruh order online ke dalam masing-masing bulan secara otomatis
  const onlineMonthlyStats = useMemo(() => {
    const stats: Record<string, { revenue: number; count: number; profit: number; orders: AdminOrder[] }> = {
      'Jul': { revenue: 0, count: 0, profit: 0, orders: [] },
      'Agu': { revenue: 0, count: 0, profit: 0, orders: [] },
      'Sep': { revenue: 0, count: 0, profit: 0, orders: [] },
      'Okt': { revenue: 0, count: 0, profit: 0, orders: [] },
      'Nov': { revenue: 0, count: 0, profit: 0, orders: [] },
      'Des': { revenue: 0, count: 0, profit: 0, orders: [] },
    };

    realOrders.forEach(order => {
      if (order.status === 'CANCELLED') return;
      const mLabel = getOrderMonthLabel(order);
      const rev = order.total || order.subtotal || 0;
      const prof = Math.round(rev * 0.4167);

      if (!stats[mLabel]) {
        stats[mLabel] = { revenue: 0, count: 0, profit: 0, orders: [] };
      }
      stats[mLabel].revenue += rev;
      stats[mLabel].count += 1;
      stats[mLabel].profit += prof;
      stats[mLabel].orders.push(order);
    });

    return stats;
  }, [realOrders]);

  // Deteksi transaksi baru yang masuk di sistem secara realtime
  useEffect(() => {
    if (prevRevenueRef.current === 0) {
      prevRevenueRef.current = realOrders.reduce((s, o) => s + (o.total || o.subtotal || 0), 0);
      prevOrdersCountRef.current = realOrders.length;
      return;
    }

    const currentRevenue = realOrders.reduce((s, o) => s + (o.total || o.subtotal || 0), 0);
    if (realOrders.length > prevOrdersCountRef.current || currentRevenue > prevRevenueRef.current) {
      const diff = currentRevenue - prevRevenueRef.current;
      const latestOrder = realOrders[0];
      const amount = diff > 0 ? diff : (latestOrder?.total || 35000);
      const targetMonthLabel = latestOrder ? getOrderMonthLabel(latestOrder) : 'Agu';
      
      setRecentTransactionAlert({
        active: true,
        amount,
        targetMonth: targetMonthLabel,
        orderId: latestOrder?.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`
      });

      const timer = setTimeout(() => {
        setRecentTransactionAlert(null);
      }, 4000);

      prevOrdersCountRef.current = realOrders.length;
      prevRevenueRef.current = currentRevenue;

      return () => clearTimeout(timer);
    }
  }, [realOrders]);

  // Simulasi Transaksi Masuk untuk demonstrasi animasi langsung di grafik (Mendukung tes bulan berjalan maupun bulan berikutnya)
  const handleSimulateLiveTransaction = (targetMonthInput?: 'Agu' | 'Sep') => {
    const month = targetMonthInput || (new Date().getMonth() >= 8 ? 'Sep' : 'Agu');
    const randomNominal = [35000, 55000, 70000, 105000, 140000][Math.floor(Math.random() * 5)];
    const simOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    
    setRecentTransactionAlert({
      active: true,
      amount: randomNominal,
      targetMonth: month,
      orderId: simOrderId
    });

    // Perbarui data grafik secara dinamis agar terlihat aktif & naik
    const updated = [...customChartData];
    const targetIdx = updated.findIndex(m => m.label === month);
    if (targetIdx !== -1) {
      const newGross = updated[targetIdx].grossRaw + randomNominal;
      const newNet = updated[targetIdx].netRaw + Math.round(randomNominal * 0.4167);
      const newGrossPct = Math.min(100, Math.round((newGross / 15000000) * 100));
      const newNetPct = Math.min(100, Math.round((newNet / 15000000) * 100));
      
      updated[targetIdx] = {
        ...updated[targetIdx],
        grossRaw: newGross,
        netRaw: newNet,
        grossPercent: newGrossPct,
        netPercent: newNetPct,
        grossAmount: newGross >= 1000000 ? `Rp ${(newGross / 1000000).toFixed(1)} Jt` : `Rp ${(newGross / 1000).toFixed(0)} Rb`,
        netAmount: newNet >= 1000000 ? `Rp ${(newNet / 1000000).toFixed(1)} Jt` : `Rp ${(newNet / 1000).toFixed(0)} Rb`,
        ordersCount: updated[targetIdx].ordersCount + 1,
        isUpcoming: false,
        badge: updated[targetIdx].badge || 'Transaksi Online',
        eventName: updated[targetIdx].eventName || 'Penjualan Online Realtime'
      };
      setCustomChartData(updated);
    }

    setTimeout(() => {
      setRecentTransactionAlert(null);
    }, 4000);
  };

  // Pengecekan Pasif Logika Tutup Buku Tahunan Otomatis (Akan aktif otomatis saat berganti ke 2027)
  useEffect(() => {
    const res = checkAndTriggerAnnualArchive(realOrders, products || [], customChartData);
    if (res && res.message) {
      setArchiveFeedbackMsg(res.message);
    }
  }, [realOrders, products, customChartData]);

  // --------------------------------------------------------------------------
  // 1. DATASET GRAFIK SESUAI TIMEFRAME & AGREGASI TRANSAKSI ONLINE REALTIME
  // --------------------------------------------------------------------------
  const chartDatasets = useMemo(() => {
    const manualRev = manualOmsetData ? manualOmsetData.revenue : 0;
    const manualOrders = manualOmsetData ? manualOmsetData.ordersCount : 0;
    const manualProf = manualOmsetData ? manualOmsetData.cleanProfit : Math.round(manualRev * 0.4167);

    // Bulan saat ini di kalender nyata (6=Jul, 7=Agu, 8=Sep, dst)
    const currentMonthIdx = new Date().getMonth();

    const monthsData = customChartData.map((m, idx) => {
      const online = onlineMonthlyStats[m.label] || { revenue: 0, count: 0, profit: 0, orders: [] };
      const isManualApplicable = m.label === 'Agu' && manualOmsetData;
      
      const additionalRev = online.revenue + (isManualApplicable ? manualRev : 0);
      const additionalNet = online.profit + (isManualApplicable ? manualProf : 0);
      const additionalOrders = online.count + (isManualApplicable ? manualOrders : 0);

      const gross = m.grossRaw + additionalRev;
      const net = m.netRaw + additionalNet;
      const totalOrders = m.ordersCount + additionalOrders;

      // Apakah bulan ini aktif (ada omset, kalender sudah masuk, atau tidak diset upcoming)
      const monthCalendarIdx = idx + 6; // Jul=6, Agu=7, Sep=8, Okt=9, Nov=10, Des=11
      const isMonthActive = gross > 0 || currentMonthIdx >= monthCalendarIdx || !m.isUpcoming;

      const grossPct = Math.min(100, Math.round((gross / 15000000) * 100));
      const netPct = Math.min(100, Math.round((net / 15000000) * 100));

      const formatCurrencyShort = (val: number) => {
        if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
        if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`;
        return `Rp ${val.toLocaleString('id-ID')}`;
      };

      return {
        ...m,
        grossRaw: gross,
        netRaw: net,
        grossAmount: formatCurrencyShort(gross),
        netAmount: formatCurrencyShort(net),
        grossPercent: isMonthActive ? Math.max(10, grossPct) : 0,
        netPercent: isMonthActive ? Math.max(6, netPct) : 0,
        ordersCount: totalOrders,
        isUpcoming: !isMonthActive,
        badge: m.badge || (online.count > 0 ? `${online.count}x Online` : (isMonthActive && m.grossRaw === 0 ? 'Bulan Berjalan' : '')),
        eventName: isManualApplicable && manualOmsetData?.hasEvent 
          ? manualOmsetData.eventName 
          : (m.eventName || (online.count > 0 ? `Penjualan Online Realtime (${online.count} Pesanan Masuk)` : (isMonthActive ? 'Penjualan Toko Online & Reguler' : 'Belum dimulai'))),
        isBazar: isManualApplicable ? manualOmsetData.hasEvent : m.isBazar
      };
    });

    const activeTotalGross = monthsData.filter(m => !m.isUpcoming).reduce((acc, m) => acc + m.grossRaw, 0);
    const activeTotalNet = monthsData.filter(m => !m.isUpcoming).reduce((acc, m) => acc + m.netRaw, 0);
    const activeTotalOrders = monthsData.filter(m => !m.isUpcoming).reduce((acc, m) => acc + m.ordersCount, 0);

    // ------------------------------------------------------------------------
    // 1M: WEEKLY DATASET FOR SELECTED MONTH (Minggu 1 s/d Minggu 4)
    // ------------------------------------------------------------------------
    const pLower = selectedPeriod.toLowerCase();
    const isJulySelected = (pLower.includes('juli') || pLower.includes('jul')) && !pLower.includes('des') && !pLower.includes('dec') && !pLower.includes('-');
    const isAugustSelected = (pLower.includes('agustus') || pLower.includes('agu')) && !pLower.includes('des') && !pLower.includes('dec') && !pLower.includes('-');

    let weekly1MData: ChartMonthConfig[] = [];

    if (isJulySelected) {
      // Minggu 1 s/d 4 Juli 2026
      weekly1MData = [
        {
          label: 'Mgg 1',
          fullTitle: 'Minggu 1 (Bulan Juli 2026)',
          grossPercent: Math.round((2750000 / 4500000) * 100),
          netPercent: Math.round((875000 / 4500000) * 100),
          grossAmount: 'Rp 2.75 Jt',
          netAmount: 'Rp 875 Rb',
          grossRaw: 2750000,
          netRaw: 875000,
          ordersCount: 62,
          isBazar: true,
          badge: 'Bazar 1x + Reguler',
          isUpcoming: false,
          eventName: 'Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb'
        },
        {
          label: 'Mgg 2',
          fullTitle: 'Minggu 2 (Bulan Juli 2026)',
          grossPercent: Math.round((2750000 / 4500000) * 100),
          netPercent: Math.round((875000 / 4500000) * 100),
          grossAmount: 'Rp 2.75 Jt',
          netAmount: 'Rp 875 Rb',
          grossRaw: 2750000,
          netRaw: 875000,
          ordersCount: 62,
          isBazar: true,
          badge: 'Bazar 1x + Reguler',
          isUpcoming: false,
          eventName: 'Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb'
        },
        {
          label: 'Mgg 3',
          fullTitle: 'Minggu 3 (Bulan Juli 2026)',
          grossPercent: Math.round((2750000 / 4500000) * 100),
          netPercent: Math.round((875000 / 4500000) * 100),
          grossAmount: 'Rp 2.75 Jt',
          netAmount: 'Rp 875 Rb',
          grossRaw: 2750000,
          netRaw: 875000,
          ordersCount: 63,
          isBazar: true,
          badge: 'Bazar 1x + Reguler',
          isUpcoming: false,
          eventName: 'Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb'
        },
        {
          label: 'Mgg 4',
          fullTitle: 'Minggu 4 (Bulan Juli 2026)',
          grossPercent: Math.round((2750000 / 4500000) * 100),
          netPercent: Math.round((875000 / 4500000) * 100),
          grossAmount: 'Rp 2.75 Jt',
          netAmount: 'Rp 875 Rb',
          grossRaw: 2750000,
          netRaw: 875000,
          ordersCount: 63,
          isBazar: true,
          badge: 'Bazar 1x + Reguler',
          isUpcoming: false,
          eventName: 'Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb'
        }
      ];
    } else if (isAugustSelected) {
      // Minggu 1 s/d 4 Agustus 2026
      const onlineAguRev = onlineMonthlyStats['Agu']?.revenue || 0;
      const onlineAguProf = onlineMonthlyStats['Agu']?.profit || 0;
      const onlineAguCount = onlineMonthlyStats['Agu']?.count || 0;
      
      const mgg4Gross = 1500000 + onlineAguRev;
      const mgg4Net = 700000 + onlineAguProf;
      const mgg4Orders = 35 + onlineAguCount;

      weekly1MData = [
        {
          label: 'Mgg 1',
          fullTitle: 'Minggu 1 (Bulan Agustus 2026)',
          grossPercent: Math.round((3500000 / 4500000) * 100),
          netPercent: Math.round((1433333 / 4500000) * 100),
          grossAmount: 'Rp 3.5 Jt',
          netAmount: 'Rp 1.4 Jt',
          grossRaw: 3500000,
          netRaw: 1433333,
          ordersCount: 95,
          isBazar: true,
          badge: 'Bazar Event 1',
          isUpcoming: false,
          eventName: 'Bazar Event 1 • Habis Terjual (0% Sisa)'
        },
        {
          label: 'Mgg 2',
          fullTitle: 'Minggu 2 (Bulan Agustus 2026)',
          grossPercent: Math.round((3500000 / 4500000) * 100),
          netPercent: Math.round((1433333 / 4500000) * 100),
          grossAmount: 'Rp 3.5 Jt',
          netAmount: 'Rp 1.4 Jt',
          grossRaw: 3500000,
          netRaw: 1433333,
          ordersCount: 95,
          isBazar: true,
          badge: 'Bazar Event 2',
          isUpcoming: false,
          eventName: 'Bazar Event 2 • Habis Terjual (0% Sisa)'
        },
        {
          label: 'Mgg 3',
          fullTitle: 'Minggu 3 (Bulan Agustus 2026)',
          grossPercent: Math.round((3500000 / 4500000) * 100),
          netPercent: Math.round((1433334 / 4500000) * 100),
          grossAmount: 'Rp 3.5 Jt',
          netAmount: 'Rp 1.4 Jt',
          grossRaw: 3500000,
          netRaw: 1433334,
          ordersCount: 95,
          isBazar: true,
          badge: 'Bazar Event 3',
          isUpcoming: false,
          eventName: 'Bazar Event 3 • Habis Terjual (0% Sisa)'
        },
        {
          label: 'Mgg 4',
          fullTitle: 'Minggu 4 (Bulan Agustus 2026)',
          grossPercent: Math.min(100, Math.round((mgg4Gross / 4500000) * 100)),
          netPercent: Math.min(100, Math.round((mgg4Net / 4500000) * 100)),
          grossAmount: mgg4Gross >= 1000000 ? `Rp ${(mgg4Gross / 1000000).toFixed(1)} Jt` : `Rp ${(mgg4Gross / 1000).toFixed(0)} Rb`,
          netAmount: mgg4Net >= 1000000 ? `Rp ${(mgg4Net / 1000000).toFixed(1)} Jt` : `Rp ${(mgg4Net / 1000).toFixed(0)} Rb`,
          grossRaw: mgg4Gross,
          netRaw: mgg4Net,
          ordersCount: mgg4Orders,
          isBazar: false,
          badge: onlineAguCount > 0 ? `${onlineAguCount}x Online` : 'Jualan Biasa',
          isUpcoming: false,
          eventName: 'Jualan Biasa (Tanpa Bazar) + Pesanan Online Realtime'
        }
      ];
    } else {
      // Default: Bulan Berjalan (September 2026 atau bulan kalender saat ini)
      const curMonthLabel = liveCalendarInfo.shortMonth || 'Sep';
      const curMonthOrders = realOrders.filter(o => o.status !== 'CANCELLED' && getOrderMonthLabel(o) === curMonthLabel);
      
      const sumWeekly = (minDay: number, maxDay: number) => {
        const ords = curMonthOrders.filter(o => {
          const day = getDetailedOrderDateTime(o).dateNum;
          return day >= minDay && day <= maxDay;
        });
        const rev = ords.reduce((sum, o) => sum + (o.total || o.subtotal || 0), 0);
        const count = ords.length;
        const prof = Math.round(rev * 0.4167);
        return { ords, rev, count, prof };
      };

      const w1 = sumWeekly(1, 7);
      const w2 = sumWeekly(8, 14);
      const w3 = sumWeekly(15, 21);
      const w4 = sumWeekly(22, 31);

      // Baseline historical bazaar minggu 1 & 2
      const w1Gross = 2800000 + w1.rev;
      const w1Net = 1150000 + w1.prof;
      const w1Count = 75 + w1.count;

      const w2Gross = 3400000 + w2.rev;
      const w2Net = 1450000 + w2.prof;
      const w2Count = 90 + w2.count;

      const w3Gross = w3.rev;
      const w3Net = w3.prof;
      const w3Count = w3.count;

      const manualRevW4 = manualOmsetData && (!manualOmsetData.week || manualOmsetData.week.includes('4')) ? manualRev : 0;
      const manualProfW4 = manualOmsetData && (!manualOmsetData.week || manualOmsetData.week.includes('4')) ? manualProf : 0;
      const manualOrdersW4 = manualOmsetData && (!manualOmsetData.week || manualOmsetData.week.includes('4')) ? manualOrders : 0;

      const w4Gross = w4.rev + manualRevW4;
      const w4Net = w4.prof + manualProfW4;
      const w4Count = w4.count + manualOrdersW4;

      const currentDay = liveCalendarInfo.dateNum || 22;

      weekly1MData = [
        {
          label: 'Mgg 1',
          fullTitle: 'Minggu 1 (1 - 7 September 2026)',
          grossPercent: Math.min(100, Math.round((w1Gross / 4500000) * 100)),
          netPercent: Math.min(100, Math.round((w1Net / 4500000) * 100)),
          grossAmount: w1Gross >= 1000000 ? `Rp ${(w1Gross / 1000000).toFixed(1)} Jt` : `Rp ${(w1Gross / 1000).toFixed(0)} Rb`,
          netAmount: w1Net >= 1000000 ? `Rp ${(w1Net / 1000000).toFixed(1)} Jt` : `Rp ${(w1Net / 1000).toFixed(0)} Rb`,
          grossRaw: w1Gross,
          netRaw: w1Net,
          ordersCount: w1Count,
          isBazar: true,
          badge: w1.count > 0 ? `${w1.count}x Online` : 'Bazar Akbar 1',
          isUpcoming: false,
          eventName: 'Bazar Akbar Minggu 1 + Pesanan Online'
        },
        {
          label: 'Mgg 2',
          fullTitle: 'Minggu 2 (8 - 14 September 2026)',
          grossPercent: Math.min(100, Math.round((w2Gross / 4500000) * 100)),
          netPercent: Math.min(100, Math.round((w2Net / 4500000) * 100)),
          grossAmount: w2Gross >= 1000000 ? `Rp ${(w2Gross / 1000000).toFixed(1)} Jt` : `Rp ${(w2Gross / 1000).toFixed(0)} Rb`,
          netAmount: w2Net >= 1000000 ? `Rp ${(w2Net / 1000000).toFixed(1)} Jt` : `Rp ${(w2Net / 1000).toFixed(0)} Rb`,
          grossRaw: w2Gross,
          netRaw: w2Net,
          ordersCount: w2Count,
          isBazar: true,
          badge: w2.count > 0 ? `${w2.count}x Online` : 'Bulan Berjalan',
          isUpcoming: false,
          eventName: 'Minggu 2 Berjalan + Pesanan Online Realtime'
        },
        {
          label: 'Mgg 3',
          fullTitle: 'Minggu 3 (15 - 21 September 2026)',
          grossPercent: w3Gross > 0 ? Math.min(100, Math.round((w3Gross / 4500000) * 100)) : 0,
          netPercent: w3Net > 0 ? Math.min(100, Math.round((w3Net / 4500000) * 100)) : 0,
          grossAmount: w3Gross >= 1000000 ? `Rp ${(w3Gross / 1000000).toFixed(1)} Jt` : w3Gross > 0 ? `Rp ${(w3Gross / 1000).toFixed(0)} Rb` : 'Rp 0',
          netAmount: w3Net >= 1000000 ? `Rp ${(w3Net / 1000000).toFixed(1)} Jt` : w3Net > 0 ? `Rp ${(w3Net / 1000).toFixed(0)} Rb` : 'Rp 0',
          grossRaw: w3Gross,
          netRaw: w3Net,
          ordersCount: w3Count,
          isBazar: false,
          badge: w3Count > 0 ? `${w3Count}x Online` : (currentDay >= 15 ? 'Berjalan' : 'Mendatang'),
          isUpcoming: currentDay < 15 && w3Count === 0,
          eventName: w3Count > 0 ? `Penjualan Online Realtime (${w3Count} Pesanan)` : (currentDay >= 15 ? 'Operasional Minggu 3' : 'Minggu ke-3 Belum dimulai')
        },
        {
          label: 'Mgg 4',
          fullTitle: 'Minggu 4 (22 - 30 September 2026 - Berjalan)',
          grossPercent: w4Gross > 0 ? Math.min(100, Math.round((w4Gross / 4500000) * 100)) : (currentDay >= 22 ? 8 : 0),
          netPercent: w4Net > 0 ? Math.min(100, Math.round((w4Net / 4500000) * 100)) : (currentDay >= 22 ? 4 : 0),
          grossAmount: w4Gross >= 1000000 ? `Rp ${(w4Gross / 1000000).toFixed(1)} Jt` : w4Gross > 0 ? `Rp ${(w4Gross / 1000).toFixed(0)} Rb` : 'Rp 0',
          netAmount: w4Net >= 1000000 ? `Rp ${(w4Net / 1000000).toFixed(1)} Jt` : w4Net > 0 ? `Rp ${(w4Net / 1000).toFixed(0)} Rb` : 'Rp 0',
          grossRaw: w4Gross,
          netRaw: w4Net,
          ordersCount: w4Count,
          isBazar: manualOmsetData ? manualOmsetData.hasEvent : false,
          badge: w4Count > 0 ? `${w4Count}x Online` : (currentDay >= 22 ? 'Aktif Hari Ini' : 'Mendatang'),
          isUpcoming: currentDay < 22 && w4Count === 0,
          eventName: w4Count > 0 
            ? `Penjualan Berjalan Minggu 4 (${w4Count} Pesanan Realtime)` 
            : (currentDay >= 22 ? 'Penjualan Berjalan Minggu 4 (Hari Ini)' : 'Minggu ke-4 Belum dimulai')
        }
      ];
    }

    return {
      '1M': weekly1MData,
      '6M': monthsData,
      '1Y': [
        { label: 'Q1', fullTitle: 'Kuartal 1 (Jan - Mar 2026)', grossPercent: 0, netPercent: 0, grossAmount: 'Rp 0', netAmount: 'Rp 0', grossRaw: 0, netRaw: 0, ordersCount: 0, isBazar: false, isUpcoming: true, eventName: 'Sebelum Beroperasi' },
        { label: 'Q2', fullTitle: 'Kuartal 2 (Apr - Jun 2026)', grossPercent: 0, netPercent: 0, grossAmount: 'Rp 0', netAmount: 'Rp 0', grossRaw: 0, netRaw: 0, ordersCount: 0, isBazar: false, isUpcoming: true, eventName: 'Sebelum Beroperasi' },
        { 
          label: 'Q3', 
          fullTitle: `Kuartal 3 (Jul - Sep 2026 - Berjalan)`, 
          grossPercent: Math.min(100, Math.round((activeTotalGross / 35000000) * 100)), 
          netPercent: Math.min(100, Math.round((activeTotalNet / 35000000) * 100)), 
          grossAmount: `Rp ${(activeTotalGross / 1000000).toFixed(1)} Jt`, 
          netAmount: `Rp ${(activeTotalNet / 1000000).toFixed(1)} Jt`, 
          grossRaw: activeTotalGross, 
          netRaw: activeTotalNet, 
          ordersCount: activeTotalOrders, 
          isBazar: true, 
          badge: 'Online & Bazar Aktif', 
          isUpcoming: false, 
          eventName: `Penjualan Konsolidasi Realtime Kuartal 3 (Rp ${(activeTotalGross / 1000000).toFixed(1)} Jt)` 
        },
        { label: 'Q4', fullTitle: 'Kuartal 4 (Okt - Des 2026)', grossPercent: 0, netPercent: 0, grossAmount: 'Rp 0', netAmount: 'Rp 0', grossRaw: 0, netRaw: 0, ordersCount: 0, isBazar: false, isUpcoming: true, eventName: 'Belum dimulai' },
      ]
    };
  }, [customChartData, onlineMonthlyStats, manualOmsetData, selectedPeriod]);

  const activeChartData = chartDatasets[chartTimeframe] || chartDatasets['1M'];

  // --------------------------------------------------------------------------
  // 2. DINAMIS 5 METRIK KPI TERINTEGRASI 100% PERSIS DENGAN GRAFIK
  // --------------------------------------------------------------------------
  const periodKpiMetrics = useMemo(() => {
    let gross = 0;
    let net = 0;
    let totalOrd = 0;
    let grossGrowth = '+14.2%';
    let aovGrowth = '+6.1%';
    let marginText = 'Margin 41,94%';

    const pLower = selectedPeriod.toLowerCase();
    const isTodayOnly = pLower.includes('hari ini') || pLower.includes('today');
    const isJulyOnly = (pLower.includes('juli') || pLower.includes('jul')) && !pLower.includes('des') && !pLower.includes('dec') && !pLower.includes('-');
    const isAugustOnly = (pLower.includes('agustus') || pLower.includes('agu')) && !pLower.includes('des') && !pLower.includes('dec') && !pLower.includes('-');
    const isSemester = pLower.includes('jul -') || pLower.includes('semester') || pLower.includes('6 bulan');
    const isYear = pLower.includes('1 tahun') || pLower.includes('tahun');

    if (isTodayOnly) {
      const todayOrders = realOrders.filter(o => o.status !== 'CANCELLED' && isOrderToday(o));
      gross = todayOrders.reduce((acc, o) => acc + (o.total || o.subtotal || 0), 0);
      net = Math.round(gross * 0.4167);
      totalOrd = todayOrders.length;
      grossGrowth = totalOrd > 0 ? '+100%' : '0%';
      aovGrowth = totalOrd > 0 ? '+0%' : '0%';
      marginText = 'Margin 41,67%';
    } else if (isJulyOnly) {
      gross = 11000000;
      net = 3500000;
      totalOrd = 250;
      grossGrowth = '+100%';
      aovGrowth = '+5.0%';
      marginText = 'Margin 31,82%';
    } else if (isAugustOnly) {
      const agu = chartDatasets['6M'].find(b => b.label === 'Agu') || chartDatasets['6M'][1];
      gross = agu.grossRaw;
      net = agu.netRaw;
      totalOrd = agu.ordersCount;
      grossGrowth = '+9.1%';
      aovGrowth = '+4.8%';
      marginText = 'Margin 41,67%';
    } else if (isSemester) {
      // Sum seluruh bulan aktif di 6M (Juli s/d Bulan berjalan)
      const activeMonths = chartDatasets['6M'].filter(b => !b.isUpcoming);
      gross = activeMonths.reduce((acc, b) => acc + b.grossRaw, 0);
      net = activeMonths.reduce((acc, b) => acc + b.netRaw, 0);
      totalOrd = activeMonths.reduce((acc, b) => acc + b.ordersCount, 0);
      grossGrowth = '+24.6%';
      aovGrowth = '+7.2%';
      marginText = 'Margin 38,50%';
    } else if (isYear) {
      // 1 Tahun Terakhir (Sum seluruh kuartal aktif Q1 s/d Q4)
      const activeQuarters = chartDatasets['1Y'].filter(b => !b.isUpcoming);
      gross = activeQuarters.reduce((acc, b) => acc + b.grossRaw, 0);
      net = activeQuarters.reduce((acc, b) => acc + b.netRaw, 0);
      totalOrd = activeQuarters.reduce((acc, b) => acc + b.ordersCount, 0);
      grossGrowth = '+24.6%';
      aovGrowth = '+7.2%';
      marginText = 'Margin 38,50%';
    } else {
      // Default: Bulan Ini (September 2026 atau bulan kalender saat ini)
      const curShort = liveCalendarInfo.shortMonth; // e.g. "Sep"
      const curMonthData = chartDatasets['6M'].find(b => b.label === curShort) || chartDatasets['6M'].find(b => b.label === 'Sep') || chartDatasets['6M'][2];
      gross = curMonthData.grossRaw;
      net = curMonthData.netRaw;
      totalOrd = curMonthData.ordersCount;
      grossGrowth = '+14.2%';
      aovGrowth = '+6.1%';
      marginText = 'Margin 41,94%';
    }

    const aov = totalOrd > 0 ? Math.round(gross / totalOrd) : 0;
    const isMiliar = gross >= 1000000000;
    const grossText = isMiliar 
      ? `Rp ${(gross / 1000000000).toFixed(2)} Miliar`
      : gross >= 1000000
      ? `Rp ${(gross / 1000000).toFixed(1)} Jt`
      : `Rp ${gross.toLocaleString('id-ID')}`;

    const netText = (net >= 1000000000)
      ? `Rp ${(net / 1000000000).toFixed(2)} Miliar`
      : net >= 1000000
      ? `Rp ${(net / 1000000).toFixed(1)} Jt`
      : `Rp ${net.toLocaleString('id-ID')}`;

    const aovText = aov >= 1000000
      ? `Rp ${(aov / 1000000).toFixed(1)} Jt`
      : aov >= 1000
      ? `Rp ${(aov / 1000).toFixed(0)} Rb`
      : `Rp ${aov.toLocaleString('id-ID')}`;

    return {
      grossRaw: gross,
      netRaw: net,
      ordersRaw: totalOrd,
      grossText,
      netText,
      ordersText: totalOrd.toLocaleString('id-ID'),
      aovText,
      grossGrowth,
      aovGrowth,
      marginText,
      isPositiveGrowth: true
    };
  }, [selectedPeriod, chartDatasets, realOrders, liveCalendarInfo]);

  // --------------------------------------------------------------------------
  // 3. TOP SELLING & ACTION NEEDED TERINTEGRASI 100% DENGAN TRANSAKSI NYATA
  // --------------------------------------------------------------------------
  const bentoSalesData = useMemo(() => {
    // 6 Menu Resmi Toko Nefakky dengan harga dan gambar
    const productCatalog: { [key: string]: { name: string; price: number; image: string } } = {
      'ayam bakar': { name: 'Ayam Bakar', price: 35000, image: '/images/ayam_bakar.jpg' },
      'jus segar (jambu, sirsak, mangga)': { name: 'Jus Segar (Jambu, Sirsak, Mangga)', price: 5000, image: '/images/jus_mangga.jpg' },
      'gudeg': { name: 'Gudeg', price: 20000, image: '/images/gudeg.jpg' },
      'nasi bakar': { name: 'Nasi Bakar', price: 15000, image: '/images/nasi_bakar.jpg' },
      'krecek': { name: 'Krecek', price: 20000, image: '/images/krecek.jpg' },
      'garang asam': { name: 'Garang Asam', price: 10000, image: '/images/garang_asam.jpg' },
    };

    const productSalesMap: {
      [name: string]: {
        name: string;
        price: number;
        image: string;
        quantity: number;
        totalRevenue: number;
      };
    } = {};

    // Inisialisasi 6 menu resmi dengan jumlah porsi 0
    Object.keys(productCatalog).forEach(k => {
      const p = productCatalog[k];
      productSalesMap[k] = {
        name: p.name,
        price: p.price,
        image: p.image,
        quantity: 0,
        totalRevenue: 0
      };
    });

    // Tambahkan pesanan riil database realtime yang valid (tidak dibatalkan)
    realOrders.forEach(order => {
      if (order.status === 'CANCELLED') return;
      (order.items || []).forEach(it => {
        const key = (it.name || '').toLowerCase().trim();
        const targetKey = Object.keys(productCatalog).find(k => key.includes(k) || k.includes(key));
        if (targetKey && productSalesMap[targetKey]) {
          const qty = it.quantity || 1;
          const prc = it.price || productCatalog[targetKey].price;
          productSalesMap[targetKey].quantity += qty;
          productSalesMap[targetKey].totalRevenue += (prc * qty);
        } else {
          const dynamicKey = key || 'menu_lain';
          if (!productSalesMap[dynamicKey]) {
            productSalesMap[dynamicKey] = {
              name: it.name || 'Menu Lain',
              price: it.price || 0,
              image: it.image || '/images/ayam_bakar.jpg',
              quantity: 0,
              totalRevenue: 0
            };
          }
          const qty = it.quantity || 1;
          const prc = it.price || 0;
          productSalesMap[dynamicKey].quantity += qty;
          productSalesMap[dynamicKey].totalRevenue += (prc * qty);
        }
      });
    });

    // Tambahkan penjualan bazar/offline dari manualOmsetData jika ada
    if (manualOmsetData && Array.isArray(manualOmsetData.bestSellers) && manualOmsetData.bestSellers.length > 0) {
      manualOmsetData.bestSellers.forEach(menuName => {
        const key = (menuName || '').toLowerCase().trim();
        const targetKey = Object.keys(productCatalog).find(k => key.includes(k) || k.includes(key));
        if (targetKey && productSalesMap[targetKey]) {
          const bonusQty = Math.round((manualOmsetData.ordersCount || 10) / manualOmsetData.bestSellers.length);
          productSalesMap[targetKey].quantity += bonusQty;
          productSalesMap[targetKey].totalRevenue += (bonusQty * productSalesMap[targetKey].price);
        }
      });
    }

    const salesList = Object.values(productSalesMap);

    // Top Selling: urutkan berdasarkan porsi penjualan terbanyak
    const sortedDesc = [...salesList].sort((a, b) => b.quantity - a.quantity);
    const topSellingWithSales = sortedDesc.filter(item => item.quantity > 0);
    const topSelling = topSellingWithSales.length > 0 
      ? topSellingWithSales.slice(0, 3) 
      : sortedDesc.slice(0, 3);

    // Action Needed: 2 menu dengan penjualan paling sedikit (perlu promo)
    const sortedAsc = [...salesList].sort((a, b) => a.quantity - b.quantity);
    const actionNeeded = sortedAsc.slice(0, 2);

    return {
      topSelling,
      actionNeeded,
      hasSales: topSellingWithSales.length > 0
    };
  }, [realOrders, manualOmsetData]);

  // Filtered Orders for Table
  const filteredOrders = useMemo(() => {
    return realOrders.filter(order => {
      const matchQuery = 
        (order.id || '').toLowerCase().includes(searchOrderQuery.toLowerCase()) ||
        (order.customerName || '').toLowerCase().includes(searchOrderQuery.toLowerCase()) ||
        (order.address || '').toLowerCase().includes(searchOrderQuery.toLowerCase());

      const matchStatus = 
        statusFilter === 'ALL' ||
        order.status === statusFilter ||
        (statusFilter === 'COOKING' && order.status === 'COOKING') ||
        (statusFilter === 'SHIPPING' && (order.status === 'SHIPPING' || order.status === 'DELIVERING')) ||
        (statusFilter === 'COMPLETED' && order.status === 'COMPLETED');

      return matchQuery && matchStatus;
    });
  }, [realOrders, searchOrderQuery, statusFilter]);

  // Fallback Mock Orders jika list kosong
  const displayOrders = filteredOrders.length > 0 ? filteredOrders : [
    {
      id: 'ORD-88219',
      customerName: 'Nizar Azzuhra',
      address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
      avatar: 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=F97316&color=ffffff',
      date: 'Baru saja',
      status: 'DELIVERING' as const,
      total: 102000,
      paymentMethod: 'QRIS / GoPay',
      paymentBadge: 'PAID' as const,
      items: [{ id: 'm1', name: 'Ayam Bakar', price: 35000, quantity: 2, image: '/images/ayam_bakar.jpg' }]
    },
    {
      id: 'ORD-88218',
      customerName: 'Siti Rahmawati',
      address: 'Jl. Sudirman No. 105, Jakarta Selatan',
      avatar: 'https://ui-avatars.com/api/?name=Siti+Rahma&background=10B981&color=ffffff',
      date: '10m lalu',
      status: 'COMPLETED' as const,
      total: 161000,
      paymentMethod: 'Midtrans Credit Card',
      paymentBadge: 'PAID' as const,
      items: [{ id: 'm4', name: 'Gudeg', price: 20000, quantity: 4, image: '/images/gudeg.jpg' }]
    },
    {
      id: 'ORD-88217',
      customerName: 'Budi Santoso',
      address: 'Gedung Cyber 2 Lt. 5, Kuningan, Jakarta',
      avatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=8B5CF6&color=ffffff',
      date: '25m lalu',
      status: 'COOKING' as const,
      total: 104000,
      paymentMethod: 'Transfer Bank BCA',
      paymentBadge: 'PAID' as const,
      items: [{ id: 'm3', name: 'Krecek', price: 20000, quantity: 2, image: '/images/krecek.jpg' }]
    },
    {
      id: 'ORD-88216',
      customerName: 'Dewi Lestari',
      address: 'Jl. Gatot Subroto Kav 22, Jakarta',
      avatar: 'https://ui-avatars.com/api/?name=Dewi+Lestari&background=EC4899&color=ffffff',
      date: '45m lalu',
      status: 'COOKING' as const,
      total: 195000,
      paymentMethod: 'GoPay / QRIS',
      paymentBadge: 'PAID' as const,
      items: [{ id: 'm2', name: 'Nasi Bakar', price: 15000, quantity: 3, image: '/images/nasi_bakar.jpg' }]
    }
  ];

  // --------------------------------------------------------------------------
  // HANDLERS FOR EDIT CHART MODAL
  // --------------------------------------------------------------------------
  const handleOpenEditChart = () => {
    const currentMonth = customChartData[editMonthIndex] || customChartData[2];
    setEditGrossInput(currentMonth.grossRaw.toString());
    setEditNetInput(currentMonth.netRaw.toString());
    setEditIsBazar(currentMonth.isBazar);
    setEditBadgeText(currentMonth.badge || 'Bazar Event');
    setEditEventName(currentMonth.eventName || 'Penjualan Reguler');
    setEditIsUpcoming(currentMonth.isUpcoming);
    setShowEditChartModal(true);
  };

  const handleSelectMonthToEdit = (idx: number) => {
    setEditMonthIndex(idx);
    const target = customChartData[idx];
    if (target) {
      setEditGrossInput(target.grossRaw.toString());
      setEditNetInput(target.netRaw.toString());
      setEditIsBazar(target.isBazar);
      setEditBadgeText(target.badge || 'Bazar Event');
      setEditEventName(target.eventName || 'Penjualan Reguler');
      setEditIsUpcoming(target.isUpcoming);
    }
  };

  const handleSaveEditChart = (e: React.FormEvent) => {
    e.preventDefault();
    const grossNum = parseInt(editGrossInput) || 0;
    const netNum = parseInt(editNetInput) || Math.round(grossNum * 0.4167);
    const grossPct = Math.min(100, Math.round((grossNum / 15000000) * 100));
    const netPct = Math.min(100, Math.round((netNum / 15000000) * 100));

    const updated = [...customChartData];
    updated[editMonthIndex] = {
      ...updated[editMonthIndex],
      grossRaw: grossNum,
      netRaw: netNum,
      grossAmount: editIsUpcoming ? 'Rp 0' : `Rp ${(grossNum / 1000000).toFixed(1)} Jt`,
      netAmount: editIsUpcoming ? 'Rp 0' : `Rp ${(netNum / 1000000).toFixed(1)} Jt`,
      grossPercent: editIsUpcoming ? 0 : grossPct,
      netPercent: editIsUpcoming ? 0 : netPct,
      isBazar: editIsBazar && !editIsUpcoming,
      badge: editBadgeText,
      eventName: editEventName,
      isUpcoming: editIsUpcoming
    };

    setCustomChartData(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nefakky_custom_chart_data', JSON.stringify(updated));
    }
    setShowEditChartModal(false);
  };

  const handleResetChartToDefault = () => {
    if (confirm('Kembalikan seluruh data grafik ke konfigurasi standar (Juli - Agustus aktif)?')) {
      setCustomChartData(DEFAULT_CHART_MONTHS);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nefakky_custom_chart_data');
      }
      setShowEditChartModal(false);
    }
  };

  // 6 Menu Resmi Toko Nefakky
  const OFFICIAL_MENUS = useMemo(() => [
    'Ayam Bakar',
    'Nasi Bakar',
    'Krecek',
    'Gudeg',
    'Garang Asam',
    'Jus Segar (Jambu, Sirsak, Mangga)'
  ], []);

  // Daftar Menu Tersedia untuk Multi-Select (Tepat 6 Menu Resmi)
  const availableMenus = useMemo(() => {
    const allProds = productList && productList.length > 0 ? productList : products || [];
    const names = allProds.map(p => p.name).filter(Boolean);
    if (names.length > 0) {
      return Array.from(new Set(names));
    }
    return OFFICIAL_MENUS;
  }, [productList, products, OFFICIAL_MENUS]);

  // --------------------------------------------------------------------------
  // HANDLERS FOR DETAILED INPUT OMSET
  // --------------------------------------------------------------------------
  const handleSaveManualOmset = (e: React.FormEvent) => {
    e.preventDefault();
    const revNum = parseInt(inputRevenue) || 0;
    const profNum = parseInt(inputProfit) || Math.round(revNum * 0.40);
    const ordNum = parseInt(inputOrdersCount) || 0;

    const dataToSave = {
      hasEvent: inputHasEvent,
      eventName: inputHasEvent ? inputEventName : 'Penjualan Reguler Standar',
      month: inputMonth,
      week: inputWeek,
      date: inputDate,
      revenue: revNum,
      cleanProfit: profNum,
      ordersCount: ordNum,
      bestSellers: inputBestSellers,
      notes: inputNotes
    };

    setManualOmsetData(dataToSave);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nefakky_manual_omset', JSON.stringify(dataToSave));
    }
    setShowInputOmsetModal(false);
  };

  const handleResetManualOmset = () => {
    if (confirm('Reset data omset manual offline ke default?')) {
      setManualOmsetData(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nefakky_manual_omset');
      }
    }
  };

  return (
    <div className="flex flex-col w-full text-stone-900 space-y-6">
      
      {/* 1. EXECUTIVE HEADER TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-1 leading-tight">
            Tinjauan Bisnis Nefakky
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-normal">
            Data analitik performa komersial &amp; tren omset real-time per {liveCalendarInfo.dayName}, {liveCalendarInfo.dateNum} {liveCalendarInfo.monthName} {liveCalendarInfo.year}.
          </p>
        </div>

        {/* Action Controls Toolbar (Structured Hierarchy: Primary, Secondary, Utility) */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          
          {/* Utility: Live Realtime Calendar & Clock Indicator */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono text-[11px] font-semibold shadow-2xs"
            title="Sinkronisasi Kalender & Jam Realtime WIB Otomatis"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="material-symbols-outlined text-[15px] text-emerald-700">schedule</span>
            <span>{liveCalendarInfo.formattedFull}</span>
          </div>

          {/* Utility: Period Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 bg-white hover:bg-stone-50 shadow-2xs border border-stone-300 rounded-xl px-3.5 py-2 cursor-pointer transition-colors text-stone-900 font-semibold text-xs"
            >
              <span className="material-symbols-outlined text-[17px] text-[#C2410C]">calendar_month</span>
              <span className="uppercase tracking-wider text-[11px] text-stone-800 font-mono">
                {selectedPeriod}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
            </button>

            {/* Click Outside Overlay */}
            {showPeriodDropdown && (
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowPeriodDropdown(false)} 
              />
            )}

            {/* Solid Dropdown Menu */}
            {showPeriodDropdown && (
              <div className="absolute left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-fade-in text-xs font-semibold text-stone-900">
                {[
                  { key: `Hari Ini (${liveCalendarInfo.dateNum} ${liveCalendarInfo.shortMonth} ${liveCalendarInfo.year})`, desc: 'Realtime Hari Ini' },
                  { key: `Bulan Ini (${liveCalendarInfo.shortMonth} ${liveCalendarInfo.year})`, desc: '1 Bulan' },
                  { key: `Bulan Lalu (${liveCalendarInfo.shortMonth === 'Sep' ? 'Agu' : 'Jul'} ${liveCalendarInfo.year})`, desc: '1 Bulan' },
                  { key: `Jul - Des ${liveCalendarInfo.year}`, desc: 'Semester 2' },
                  { key: '1 Tahun Terakhir', desc: '1 Tahun' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(item.key);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-stone-50 transition-colors flex items-center justify-between cursor-pointer ${
                      selectedPeriod === item.key ? 'bg-amber-50/60 text-[#C2410C] font-bold' : 'text-stone-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{item.key}</span>
                      <span className="text-[10px] text-stone-400 font-normal">{item.desc}</span>
                    </div>
                    {selectedPeriod === item.key && <Check className="w-4 h-4 text-[#C2410C]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Utility: Reset Action */}
          <button 
            type="button"
            onClick={handleResetManualOmset}
            aria-label="Reset Filter" 
            title="Reset Data Omset Manual"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white hover:bg-stone-50 transition-colors text-stone-600 cursor-pointer border border-stone-300 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>

          {/* Secondary Action: Input Omset Button */}
          <button 
            type="button"
            onClick={() => setShowInputOmsetModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs border border-stone-300 text-stone-800 font-semibold text-xs"
          >
            <span className="material-symbols-outlined text-[17px] text-[#C2410C]">edit_note</span>
            <span className="uppercase text-[11px] tracking-wide">
              Input Omset
            </span>
          </button>

          {/* Secondary Action: Cetak PDF Button */}
          <button 
            type="button"
            onClick={onPrintPDF}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 transition-colors flex items-center gap-1.5 shadow-2xs border border-stone-300 text-stone-800 cursor-pointer font-semibold text-xs"
            title="Cetak Laporan Bisnis PDF"
          >
            <span className="material-symbols-outlined text-[17px] text-stone-700">picture_as_pdf</span>
            <span className="uppercase text-[11px] tracking-wide">
              Cetak PDF
            </span>
          </button>

          {/* Primary Action: Ekspor Data Button */}
          <button 
            type="button"
            onClick={onExportCSV}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs text-white cursor-pointer font-semibold text-xs active:scale-95"
            title="Unduh Lembar Excel / CSV"
          >
            <span className="material-symbols-outlined text-[17px] text-white">file_download</span>
            <span className="uppercase text-[11px] tracking-wide">
              Ekspor Data
            </span>
          </button>

          {/* Secondary Action: Arsip Tahunan & Tutup Buku Otomatis Button */}
          <button 
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors flex items-center gap-1.5 shadow-2xs border border-stone-300/80 cursor-pointer font-semibold text-xs active:scale-95"
            title="Arsip & Sistem Tutup Buku Otomatis"
          >
            <span className="material-symbols-outlined text-[17px] text-stone-700">archive</span>
            <span className="uppercase text-[11px] tracking-wide">
              Arsip Tahunan
            </span>
          </button>
        </div>
      </div>

      {/* 2. 5-COLUMN METRIC CARDS ROW (Consistent Dimensions, Typography & Clear Hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Omset */}
        <div className="bg-white shadow-2xs rounded-2xl p-5 flex flex-col border border-stone-200/80 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stone-500 uppercase text-[11px] font-semibold tracking-wider font-mono">
              Total Omset
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/70 flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-[#C2410C]">trending_up</span>
            </div>
          </div>
          <span className="text-stone-900 font-extrabold text-2xl sm:text-3xl tracking-tight mb-2 font-sans">
            {periodKpiMetrics.grossText}
          </span>
          <div className="flex items-center gap-1.5 mt-auto">
            <span className="text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center">
              {periodKpiMetrics.grossGrowth}
            </span>
            <span className="text-stone-500 text-[11px]">vs periode lalu</span>
          </div>
        </div>

        {/* Card 2: Est. Laba Bersih */}
        <div className="bg-white shadow-2xs rounded-2xl p-5 flex flex-col border border-stone-200/80 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stone-500 uppercase text-[11px] font-semibold tracking-wider font-mono">
              Est. Laba Bersih
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/70 flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-[#C2410C]">receipt_long</span>
            </div>
          </div>
          <span className="text-stone-900 font-extrabold text-2xl sm:text-3xl tracking-tight mb-2 font-sans">
            {periodKpiMetrics.netText}
          </span>
          <div className="flex items-center gap-1 mt-auto">
            <span className="text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded text-[10px] font-bold">
              {periodKpiMetrics.marginText}
            </span>
            <span className="text-stone-500 text-[11px]">margin operasional</span>
          </div>
        </div>

        {/* Card 3: Total Pesanan */}
        <div className="bg-white shadow-2xs rounded-2xl p-5 flex flex-col border border-stone-200/80 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stone-500 uppercase text-[11px] font-semibold tracking-wider font-mono">
              Total Pesanan
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/70 flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-[#C2410C]">shopping_bag</span>
            </div>
          </div>
          <span className="text-stone-900 font-extrabold text-2xl sm:text-3xl tracking-tight mb-2 font-sans">
            {periodKpiMetrics.ordersText}
          </span>
          <div className="flex items-center gap-1.5 mt-auto">
            <span className="text-stone-700 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
              Terverifikasi
            </span>
            <span className="text-stone-500 text-[11px]">transaksi selesai</span>
          </div>
        </div>

        {/* Card 4: Avg Order Value (AOV) */}
        <div className="bg-white shadow-2xs rounded-2xl p-5 flex flex-col border border-stone-200/80 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stone-500 uppercase text-[11px] font-semibold tracking-wider font-mono">
              Avg Order Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-stone-50 border border-stone-200/70 flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-[#C2410C]">bar_chart</span>
            </div>
          </div>
          <span className="text-stone-900 font-extrabold text-2xl sm:text-3xl tracking-tight mb-2 font-sans">
            {periodKpiMetrics.aovText}
          </span>
          <div className="flex items-center gap-1.5 mt-auto">
            <span className="text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded text-[10px] font-bold">
              {periodKpiMetrics.aovGrowth}
            </span>
            <span className="text-stone-500 text-[11px]">vs periode lalu</span>
          </div>
        </div>

        {/* Card 5: Satisfaction (Solid Gold Stars) */}
        <div className="bg-white shadow-2xs rounded-2xl p-5 flex flex-col border border-stone-200/80 hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stone-500 uppercase text-[11px] font-semibold tracking-wider font-mono">
              Satisfaction
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/70 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <span className="text-stone-900 font-extrabold text-2xl sm:text-3xl tracking-tight mb-2 font-sans">
            4.9 <span className="text-sm font-normal text-stone-500">/ 5.0</span>
          </span>
          <div className="flex items-center gap-1 mt-auto">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-[11px] text-stone-500 ml-1 font-medium">Ulasan Pelanggan</span>
          </div>
        </div>

      </div>

      {/* 3. CHARTS & BENTO GRID ROW (12 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Col-span-8: Dual Bar Chart */}
        <div className="lg:col-span-8 bg-white shadow-2xs rounded-2xl p-6 sm:p-7 flex flex-col relative border border-stone-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex flex-col">
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="text-stone-900 font-bold text-base sm:text-lg">
                  {chartTimeframe === '1M' 
                    ? `Analisis Penjualan Mingguan (${selectedPeriod})` 
                    : chartTimeframe === '1Y' 
                    ? `Analisis Kinerja Kuartalan (${liveCalendarInfo.year})` 
                    : `Analisis Tren Omset & Laba Bersih (${liveCalendarInfo.year})`}
                </h2>
                
                {/* Tombol Edit Chart */}
                <button
                  type="button"
                  onClick={handleOpenEditChart}
                  className="px-2.5 py-0.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-[11px] flex items-center gap-1 border border-stone-200 transition-colors cursor-pointer"
                  title="Edit dan Sesuaikan Nilai Grafik"
                >
                  <Edit3 className="w-3 h-3 text-[#C2410C]" />
                  <span>Edit Grafik</span>
                </button>

                <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                  Klik batang untuk detail
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 font-normal">
                {chartTimeframe === '1M'
                  ? `Menampilkan data rincian perolehan jualan per minggu (Minggu 1 s/d Minggu 4) khusus ${selectedPeriod}.`
                  : chartTimeframe === '1Y'
                  ? `Data kinerja penjualan berbasis Kuartal Q1 s/d Q4 Tahun ${liveCalendarInfo.year}.`
                  : `Data terisi aktif sampai ${liveCalendarInfo.monthName} ${liveCalendarInfo.year}. Bulan mendatang belum dimulai.`}
              </p>
            </div>

            {/* Timeframe Selector Pills (Sinkronisasi Dua Arah dengan Dropdown) */}
            <div className="flex bg-stone-100 rounded-xl p-1 self-start sm:self-auto border border-stone-200/80">
              {[
                { tf: '1M', label: '1 Bulan', periodName: `Bulan Ini (${liveCalendarInfo.shortMonth} ${liveCalendarInfo.year})` },
                { tf: '6M', label: '6 Bulan', periodName: `Jul - Des ${liveCalendarInfo.year}` },
                { tf: '1Y', label: '1 Tahun', periodName: '1 Tahun Terakhir' }
              ].map((item) => (
                <button
                  key={item.tf}
                  type="button"
                  onClick={() => setSelectedPeriod(item.periodName)}
                  className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer font-semibold ${
                    chartTimeframe === item.tf
                      ? 'bg-white shadow-2xs text-stone-900 font-bold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Visual Container with Explicit Height and Floating Clearances */}
          <div className="w-full h-64 relative pt-10 pb-4 flex items-end justify-between gap-2 sm:gap-4 border-b border-stone-200">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-4">
              <div className="w-full h-[1px] bg-stone-100"></div>
              <div className="w-full h-[1px] bg-stone-100"></div>
              <div className="w-full h-[1px] bg-stone-100"></div>
              <div className="w-full h-[1px] bg-stone-100"></div>
            </div>

            {/* Bars Rendering */}
            {activeChartData.map((m: any, idx: number) => {
              const isUpcoming = m.isUpcoming === true;
              const isAnimatingMonth = recentTransactionAlert?.active && (
                m.label === recentTransactionAlert.targetMonth ||
                (chartTimeframe === '1M' && m.label === 'Mgg 4') ||
                (!recentTransactionAlert.targetMonth && (m.label === 'Agu' || m.label === 'Q3'))
              );

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedChartDetail(m)}
                  className={`flex-1 h-full flex flex-col justify-end items-center relative z-10 group cursor-pointer transition-transform hover:-translate-y-1 ${
                    isUpcoming ? 'opacity-40 hover:opacity-75' : ''
                  }`}
                  title={isUpcoming ? `${m.fullTitle}: Belum dilewati (Penanda garis)` : `${m.fullTitle}: Omset ${m.grossAmount}, Laba ${m.netAmount}`}
                >
                  {/* Floating Live Transaction Pop Animation */}
                  {isAnimatingMonth && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-stone-900 text-white font-extrabold text-[10px] sm:text-[11px] px-3 py-1 rounded-full shadow-lg border border-stone-700 flex items-center gap-1.5 whitespace-nowrap z-30 animate-float-pop pointer-events-none">
                      {recentTransactionAlert && (
                        <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>+Rp {recentTransactionAlert.amount.toLocaleString('id-ID')} Masuk!</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Event Badge cleanly placed above the column without overlapping */}
                  {m.badge && !isUpcoming && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold text-amber-900 flex items-center gap-1 whitespace-nowrap shadow-2xs z-20 pointer-events-none max-w-[90px] sm:max-w-none truncate">
                      <span className="material-symbols-outlined text-[11px] text-amber-800 shrink-0">qr_code_2</span>
                      <span className="truncate">{m.badge}</span>
                    </div>
                  )}

                  {/* Bars Pair Container */}
                  <div className="w-full h-full flex items-end justify-center gap-1 sm:gap-1.5">
                    {isUpcoming ? (
                      /* Slot Penanda Garis Kosong untuk Bulan yang Belum Dilewati */
                      <div className="w-full max-w-[36px] h-full flex flex-col justify-end items-center pb-1">
                        <div className="w-full h-6 border-b-2 border-dashed border-stone-300 flex items-center justify-center">
                          <span className="text-[9px] text-stone-400 font-mono font-medium">--</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Gross Revenue Bar (Burnt Terracotta #C2410C) */}
                        <div 
                          style={{ height: `${Math.max(12, m.grossPercent)}%` }}
                          className={`w-1/2 max-w-[22px] bg-[#C2410C] rounded-t-sm transition-all duration-700 ease-out relative shadow-2xs ${
                            isAnimatingMonth 
                              ? 'ring-2 ring-amber-400 animate-chart-pulse scale-y-105' 
                              : 'group-hover:brightness-110'
                          }`}
                        >
                          {isAnimatingMonth && (
                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping opacity-90"></span>
                          )}
                        </div>

                        {/* Net Profit Bar (Deep Charcoal Espresso #292524) */}
                        <div 
                          style={{ height: `${Math.max(8, m.netPercent)}%` }}
                          className={`w-1/2 max-w-[22px] bg-[#292524] rounded-t-sm transition-all duration-700 ease-out relative shadow-2xs ${
                            isAnimatingMonth 
                              ? 'ring-2 ring-emerald-400 animate-chart-pulse scale-y-105' 
                              : 'group-hover:brightness-125'
                          }`}
                        >
                          {isAnimatingMonth && (
                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-90"></span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* X-Axis Month Label */}
                  <span className={`font-mono text-xs font-semibold text-center mt-2 ${
                    isUpcoming ? 'text-stone-400 font-normal italic' : 'text-stone-800'
                  }`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Clean Legend */}
          <div className="flex items-center justify-center flex-wrap gap-6 mt-4 text-xs text-stone-600 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-[#C2410C]"></div>
              <span>{chartTimeframe === '1M' ? 'Omset Mingguan' : chartTimeframe === '1Y' ? 'Omset Kuartal' : 'Omset Kotor'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-[#292524]"></div>
              <span>{chartTimeframe === '1M' ? 'Laba Bersih' : 'Laba Bersih (40%)'}</span>
            </div>
            {chartTimeframe !== '1M' && (
              <div className="flex items-center gap-2 text-stone-500">
                <div className="w-3.5 h-0.5 border-b-2 border-dashed border-stone-400"></div>
                <span>{chartTimeframe === '1Y' ? 'Q4 (Mendatang)' : 'Sep - Des (Mendatang)'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Col-span-4: Bento Grids (Top Selling & Action Needed) Realtime Dinamis */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Top Selling Card (Realtime Sesuai Periode yang Dipilih) */}
          <div className="bg-white shadow-2xs rounded-2xl p-5 flex-1 flex flex-col border border-stone-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#C2410C] text-[20px]">local_fire_department</span>
                <h3 className="text-stone-900 font-bold text-sm sm:text-base">
                  Top Selling
                </h3>
              </div>
              <span className="text-[10px] font-bold text-stone-600 uppercase px-2 py-0.5 bg-stone-100 rounded-md border border-stone-200 font-mono">
                {selectedPeriod}
              </span>
            </div>

            <div className="flex flex-col gap-3 flex-1 justify-center">
              {bentoSalesData.topSelling.length === 0 ? (
                <div className="text-center py-6 px-3 bg-stone-50 rounded-xl border border-stone-200">
                  <ShoppingBag className="w-7 h-7 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-stone-700">Belum ada transaksi</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Ketika ada pesanan baru di web, produk terlaris akan otomatis muncul di sini.
                  </p>
                </div>
              ) : (
                bentoSalesData.topSelling.map((prod, pIdx) => (
                  <React.Fragment key={pIdx}>
                    {pIdx > 0 && <div className="w-full h-[1px] bg-stone-100"></div>}
                    <div className="flex items-center gap-3 group hover:bg-stone-50 p-1.5 rounded-xl transition-colors">
                      <img 
                        className="w-11 h-11 rounded-lg object-cover border border-stone-200/80 shrink-0" 
                        alt={prod.name} 
                        src={prod.image} 
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-stone-900 font-semibold text-xs truncate">
                          {prod.name}
                        </span>
                        <span className="text-stone-500 text-[11px] font-normal">
                          {prod.quantity} porsi terjual
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-stone-900 font-bold text-xs block">
                          Rp {Math.round(prod.price / 1000)} Rb
                        </span>
                        <span className="font-mono text-[10px] text-emerald-800 font-semibold block">
                          {prod.totalRevenue >= 1000000 
                            ? `Rp ${(prod.totalRevenue / 1000000).toFixed(1)} Jt` 
                            : `Rp ${Math.round(prod.totalRevenue / 1000)} Rb`}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                ))
              )}
            </div>
          </div>

          {/* Action Needed Card (Realtime Sesuai Periode yang Dipilih) */}
          <div className="bg-white shadow-2xs rounded-2xl p-5 flex-1 flex flex-col border border-stone-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-700 text-[20px]">warning</span>
                <h3 className="text-stone-900 font-bold text-sm sm:text-base">
                  Action Needed
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                Perlu Promo
              </span>
            </div>

            <div className="flex flex-col gap-2.5 flex-1 justify-center">
              {bentoSalesData.actionNeeded.length === 0 ? (
                <div className="text-center py-4 px-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <Sparkles className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-emerald-900">Performa Menu Optimal</p>
                  <p className="text-[11px] text-emerald-700">Semua produk terjual merata.</p>
                </div>
              ) : (
                bentoSalesData.actionNeeded.map((prod, aIdx) => (
                  <div key={aIdx} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                    <div className="flex flex-col min-w-0">
                      <span className="text-stone-900 font-semibold text-xs truncate">
                        {prod.name}
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        {prod.quantity === 0 ? 'Belum ada penjualan' : `${prod.quantity} porsi (kurang laris)`}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => onOpenCreateVoucher(`Promo Spesial ${prod.name}`, `HEMAT${prod.name.slice(0, 3).toUpperCase()}`)}
                      className="px-2.5 py-1 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-[11px] rounded-lg shadow-2xs transition-opacity whitespace-nowrap cursor-pointer active:scale-95"
                    >
                      + Promo
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

            {/* 4. MODAL DETAIL POPUP KETIKA BAR CHART DIKLIK (Clean Spacious Table) */}
      {selectedChartDetail && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white text-stone-900 w-full max-w-3xl lg:max-w-4xl rounded-2xl shadow-xl p-6 sm:p-7 border border-stone-200 text-left animate-fade-in space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-stone-200 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/80 font-mono">
                    Laporan Resmi Pembukuan
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                    Database Verified
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 mt-1.5">
                  {selectedChartDetail.label === 'Jul' 
                    ? 'Laporan Rekap Bulan Juli 2026' 
                    : selectedChartDetail.label === 'Agu' 
                    ? 'Laporan Rekap Bulan Agustus 2026' 
                    : selectedChartDetail.fullTitle}
                </h3>
                <p className="text-stone-500 text-xs mt-0.5">
                  Rincian perolehan omset kotor, laba bersih, dan status operasional makanan per minggu.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedChartDetail(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors"
                aria-label="Tutup laporan rincian"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            {selectedChartDetail.isUpcoming ? (
              <div className="p-8 bg-stone-50 rounded-xl border border-stone-200 text-xs text-center space-y-2">
                <CalendarClock className="w-8 h-8 text-stone-400 mx-auto" />
                <h4 className="font-bold text-stone-800 text-sm">Periode Belum Dilewati</h4>
                <p className="text-stone-500 text-xs leading-relaxed max-w-md mx-auto">
                  Bulan {selectedChartDetail.label} (September - Desember 2026) masih berstatus masa mendatang.
                  Data transaksi akan tercatat secara realtime saat pesanan mulai masuk pada bulan tersebut.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* TABEL RINCIAN MINGGUAN TUNGGAL (Ketika Batang Minggu Diklik di Mode 1 Bulan) */}
                {selectedChartDetail.label.startsWith('Mgg') && (
                  <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-stone-50 text-stone-800 font-bold border-b border-stone-200">
                          <th className="py-2.5 px-3.5 w-32 font-mono text-[11px] uppercase">Periode</th>
                          <th className="py-2.5 px-3.5 w-48 font-mono text-[11px] uppercase">Kategori / Event</th>
                          <th className="py-2.5 px-3.5 w-36 font-mono text-right text-[11px] uppercase">Omset (Kotor)</th>
                          <th className="py-2.5 px-3.5 w-36 font-mono text-right text-[11px] uppercase">Laba Bersih</th>
                          <th className="py-2.5 px-3.5 font-mono text-[11px] uppercase">Status &amp; Rincian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white font-medium text-stone-800">
                        <tr className="hover:bg-stone-50 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-stone-900">{selectedChartDetail.fullTitle}</td>
                          <td className="py-3 px-3.5 text-stone-700">{selectedChartDetail.badge || 'Penjualan Reguler'}</td>
                          <td className="py-3 px-3.5 font-mono text-right font-bold text-stone-900">
                            Rp {(selectedChartDetail.grossRaw || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-right font-bold text-emerald-800">
                            Rp {(selectedChartDetail.netRaw || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3.5 text-stone-600 text-xs">{selectedChartDetail.eventName || 'Operasional Standar'}</td>
                        </tr>
                        <tr className="bg-emerald-50/70 text-emerald-900 font-bold border-t-2 border-emerald-300">
                          <td className="py-3 px-3.5 font-extrabold text-emerald-950 font-mono text-xs">REKAP MINGGUAN</td>
                          <td className="py-3 px-3.5 text-emerald-800">{selectedChartDetail.ordersCount} Transaksi Selesai</td>
                          <td className="py-3 px-3.5 font-mono text-right font-extrabold text-emerald-950">
                            Rp {(selectedChartDetail.grossRaw || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3.5 font-mono text-right font-extrabold text-emerald-800">
                            Rp {(selectedChartDetail.netRaw || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3.5 text-emerald-900 font-semibold text-xs">
                            Margin: {selectedChartDetail.grossRaw > 0 ? `${((selectedChartDetail.netRaw / selectedChartDetail.grossRaw) * 100).toFixed(2).replace('.', ',')}%` : '0%'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* TABEL RINCIAN BULAN JULI */}
                {selectedChartDetail.label === 'Jul' && (
                  <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-stone-50 text-stone-800 font-bold border-b border-stone-200 font-mono text-[11px] uppercase">
                          <th className="py-2.5 px-3.5 w-28">Minggu</th>
                          <th className="py-2.5 px-3.5 w-48">Kategori Penjualan</th>
                          <th className="py-2.5 px-3.5 w-36 font-mono text-right">Omset (Kotor)</th>
                          <th className="py-2.5 px-3.5 w-36 font-mono text-right">Laba Bersih</th>
                          <th className="py-2.5 px-3.5">Rincian Operasional</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 bg-white font-medium text-stone-800">
                        <tr className="hover:bg-stone-50 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold text-stone-900">Minggu 1</td>
                          <td className="py-2.5 px-3.5 text-stone-700">Bazar (1x) + Reguler</td>
                          <td className="py-2.5 px-3.5 font-mono text-right font-bold text-stone-900">Rp2.750.000</td>
                          <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-800">Rp875.000</td>
                          <td className="py-2.5 px-3.5 text-stone-600 text-xs">Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb</td>
                        </tr>
                        <tr className="hover:bg-stone-50 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold text-stone-900">Minggu 2</td>
                          <td className="py-2.5 px-3.5 text-stone-700">Bazar (1x) + Reguler</td>
                          <td className="py-2.5 px-3.5 font-mono text-right font-bold text-stone-900">Rp2.750.000</td>
                          <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-800">Rp875.000</td>
                          <td className="py-2.5 px-3.5 text-stone-600 text-xs">Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb</td>
                        </tr>
                        <tr className="hover:bg-stone-50 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold text-stone-900">Minggu 3</td>
                          <td className="py-2.5 px-3.5 text-stone-700">Bazar (1x) + Reguler</td>
                          <td className="py-2.5 px-3.5 font-mono text-right font-bold text-stone-900">Rp2.750.000</td>
                          <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-800">Rp875.000</td>
                          <td className="py-2.5 px-3.5 text-stone-600 text-xs">Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb</td>
                        </tr>
                        <tr className="hover:bg-stone-50 transition-colors">
                          <td className="py-2.5 px-3.5 font-bold text-stone-900">Minggu 4</td>
                          <td className="py-2.5 px-3.5 text-stone-700">Bazar (1x) + Reguler</td>
                          <td className="py-2.5 px-3.5 font-mono text-right font-bold text-stone-900">Rp2.750.000</td>
                          <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-800">Rp875.000</td>
                          <td className="py-2.5 px-3.5 text-stone-600 text-xs">Bazar 2jt (Habis) | Jus 375rb (75 cup) + Makanan 375rb</td>
                        </tr>
                        <tr className="bg-emerald-50/70 text-emerald-900 font-bold border-t-2 border-emerald-300 font-mono text-xs">
                          <td className="py-3 px-3.5 font-extrabold text-emerald-950">TOTAL JULI</td>
                          <td className="py-3 px-3.5 text-emerald-800">4x Bazar + 4x Reguler</td>
                          <td className="py-3 px-3.5 font-mono text-right font-extrabold text-emerald-950">Rp11.000.000</td>
                          <td className="py-3 px-3.5 font-mono text-right font-extrabold text-emerald-800">Rp3.500.000</td>
                          <td className="py-3 px-3.5 text-emerald-900 font-semibold text-xs font-sans">Total 300 Cup Jus Terjual (@ Rp5.000)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TABEL RINCIAN BULAN AGUSTUS */}
                {selectedChartDetail.label === 'Agu' && (
                  <div className="space-y-3">
                    <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                      <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                          <tr className="bg-stone-50 text-stone-800 font-bold border-b border-stone-200 font-mono text-[11px] uppercase">
                            <th className="py-2.5 px-3.5 w-28">Periode</th>
                            <th className="py-2.5 px-3.5 w-48">Jenis Penjualan</th>
                            <th className="py-2.5 px-3.5 w-36 font-mono text-right">Omset (Kotor)</th>
                            <th className="py-2.5 px-3.5 w-36 font-mono text-right">Laba Bersih</th>
                            <th className="py-2.5 px-3.5">Status Makanan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white font-medium text-stone-800">
                          <tr className="hover:bg-stone-50 transition-colors">
                            <td className="py-2.5 px-3.5 font-bold text-stone-900">Minggu 1</td>
                            <td className="py-2.5 px-3.5 text-stone-700">Bazar Event 1</td>
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold text-stone-900">Rp3.500.000</td>
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-800">Rp1.433.333</td>
                            <td className="py-2.5 px-3.5 text-stone-600 text-xs">Habis Terjual (0% Sisa)</td>
                          </tr>
                          <tr className="hover:bg-stone-50 transition-colors">
                            <td className="py-2.5 px-3.5 font-bold text-stone-900">Minggu 2</td>
                            <td className="py-2.5 px-3.5 text-stone-700">Bazar Event 2</td>
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold text-stone-900">Rp3.500.000</td>
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-800">Rp1.433.333</td>
                            <td className="py-2.5 px-3.5 text-stone-600 text-xs">Habis Terjual (0% Sisa)</td>
                          </tr>
                          <tr className="hover:bg-stone-50 transition-colors">
                            <td className="py-2.5 px-3.5 font-bold text-stone-900">Minggu 3</td>
                            <td className="py-2.5 px-3.5 text-stone-700">Bazar Event 3</td>
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold text-stone-900">Rp3.500.000</td>
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-800">Rp1.433.334</td>
                            <td className="py-2.5 px-3.5 text-stone-600 text-xs">Habis Terjual (0% Sisa)</td>
                          </tr>
                          <tr className="hover:bg-stone-50 transition-colors">
                            <td className="py-2.5 px-3.5 font-bold text-stone-900">Minggu 4</td>
                            <td className="py-2.5 px-3.5 text-stone-700">Jualan Biasa (Tanpa Bazar)</td>
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold text-stone-900">Rp1.500.000</td>
                            <td className="py-2.5 px-3.5 font-mono text-right font-bold text-emerald-800">Rp700.000</td>
                            <td className="py-2.5 px-3.5 text-stone-600 text-xs">Penjualan Toko Reguler</td>
                          </tr>
                          <tr className="bg-emerald-50/70 text-emerald-900 font-bold border-t-2 border-emerald-300 font-mono text-xs">
                            <td className="py-3 px-3.5 font-extrabold text-emerald-950">TOTAL AGUSTUS</td>
                            <td className="py-3 px-3.5 text-emerald-800">3x Bazar + 1x Reguler</td>
                            <td className="py-3 px-3.5 font-mono text-right font-extrabold text-emerald-950">
                              Rp {(selectedChartDetail.grossRaw || 12000000).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-3.5 font-mono text-right font-extrabold text-emerald-800">
                              Rp {(selectedChartDetail.netRaw || 5000000).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-3.5 text-emerald-900 font-semibold text-xs font-sans">
                              Margin: {selectedChartDetail.grossRaw > 0 ? `${((selectedChartDetail.netRaw / selectedChartDetail.grossRaw) * 100).toFixed(2).replace('.', ',')}%` : '41,67%'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Jika ada pesanan online masuk di Agustus */}
                    {onlineMonthlyStats['Agu']?.orders.length > 0 && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-emerald-900">
                          {onlineMonthlyStats['Agu'].count} Transaksi Online Otomatis Masuk:
                        </span>
                        <span className="font-mono font-extrabold text-emerald-800">
                          +Rp {onlineMonthlyStats['Agu'].revenue.toLocaleString('id-ID')} (Laba: +Rp {onlineMonthlyStats['Agu'].profit.toLocaleString('id-ID')})
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* TABEL RINCIAN TRANSAKSI ONLINE BULAN BERJALAN LAINNYA (Sep, Okt, Nov, Des) */}
                {selectedChartDetail.label !== 'Jul' && selectedChartDetail.label !== 'Agu' && (
                  <div className="space-y-3">
                    {onlineMonthlyStats[selectedChartDetail.label]?.orders.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                        <table className="w-full text-left text-xs sm:text-sm border-collapse">
                          <thead>
                            <tr className="bg-stone-50 text-stone-800 font-bold border-b border-stone-200 font-mono text-[11px] uppercase">
                              <th className="py-2.5 px-3.5 w-32">ID Transaksi</th>
                              <th className="py-2.5 px-3.5">Pelanggan &amp; Item</th>
                              <th className="py-2.5 px-3.5 w-36 font-mono text-right">Omset</th>
                              <th className="py-2.5 px-3.5 w-36 font-mono text-right">Est. Laba</th>
                              <th className="py-2.5 px-3.5 w-36 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 bg-white font-medium text-stone-800">
                            {onlineMonthlyStats[selectedChartDetail.label].orders.map((ord, oIdx) => (
                              <tr key={ord.id || oIdx} className="hover:bg-stone-50 transition-colors">
                                <td className="py-3 px-3.5 font-mono font-bold text-[#C2410C]">{ord.id}</td>
                                <td className="py-3 px-3.5">
                                  <div className="font-bold text-stone-900">{ord.customerName}</div>
                                  <div className="text-[11px] text-stone-500 truncate max-w-xs">
                                    {ord.items?.map(i => `${i.name} (${i.quantity}x)`).join(', ') || 'Menu Pesanan'}
                                  </div>
                                </td>
                                <td className="py-3 px-3.5 font-mono text-right font-bold text-stone-900">
                                  Rp {(ord.total || 0).toLocaleString('id-ID')}
                                </td>
                                <td className="py-3 px-3.5 font-mono text-right font-bold text-emerald-800">
                                  Rp {Math.round((ord.total || 0) * 0.4167).toLocaleString('id-ID')}
                                </td>
                                <td className="py-3 px-3.5 text-center">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 font-mono">
                                    {ord.status || 'COMPLETED'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-emerald-50/70 text-emerald-900 font-bold border-t-2 border-emerald-300 font-mono text-xs">
                              <td className="py-3 px-3.5 font-extrabold text-emerald-950">TOTAL {selectedChartDetail.label.toUpperCase()}</td>
                              <td className="py-3 px-3.5 text-emerald-800">
                                {onlineMonthlyStats[selectedChartDetail.label].count} Transaksi Online Masuk
                              </td>
                              <td className="py-3 px-3.5 font-mono text-right font-extrabold text-emerald-950">
                                Rp {onlineMonthlyStats[selectedChartDetail.label].revenue.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-3.5 font-mono text-right font-extrabold text-emerald-800">
                                Rp {onlineMonthlyStats[selectedChartDetail.label].profit.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-3.5 text-center text-emerald-900 font-semibold text-xs font-sans">
                                Margin: 41,67%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-2">
                        <ShoppingBag className="w-7 h-7 text-stone-400 mx-auto" />
                        <h4 className="font-bold text-stone-800 text-sm">Bulan {selectedChartDetail.fullTitle} Aktif</h4>
                        <p className="text-stone-500 text-xs">
                          Setiap pesanan online yang dibuat di bulan {selectedChartDetail.label} akan otomatis tertera di sini secara realtime.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* Modal Footer with Metrics Summary & Close */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-600">
                  Ringkasan:
                </span>
                <span className="px-2.5 py-1 bg-stone-100 rounded-lg text-xs font-bold text-stone-800 border border-stone-200 font-mono">
                  Omset: Rp {(selectedChartDetail.grossRaw || 0).toLocaleString('id-ID')}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 rounded-lg text-xs font-bold text-emerald-800 border border-stone-200 font-mono">
                  Laba: Rp {(selectedChartDetail.netRaw || 0).toLocaleString('id-ID')}
                </span>
                <span className="px-2.5 py-1 bg-amber-50 rounded-lg text-xs font-bold text-[#C2410C] border border-amber-200/80 font-mono">
                  Margin: {selectedChartDetail.grossRaw > 0 ? `${((selectedChartDetail.netRaw / selectedChartDetail.grossRaw) * 100).toFixed(2).replace('.', ',')}%` : '0%'}
                </span>
              </div>

              <button 
                type="button" 
                onClick={() => setSelectedChartDetail(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs cursor-pointer shadow-xs transition-colors active:scale-95"
              >
                Tutup Laporan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. MODAL EDIT DATA GRAFIK (Sesuaikan Chart Sesuai Keinginan) */}
      {showEditChartModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 w-full max-w-xl rounded-2xl shadow-xl p-6 border border-stone-200 text-left animate-fade-in space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 font-mono">
                  Kustomisasi Grafik
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                  Edit Data Tren Omset &amp; Laba
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowEditChartModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors"
                aria-label="Tutup form edit grafik"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditChart} className="space-y-4 text-xs">
              
              {/* Tab Selector Bulan yang Ingin Diedit */}
              <div>
                <label className="block font-bold text-stone-800 mb-1.5">Pilih Bulan yang Ingin Diedit:</label>
                <div className="flex flex-wrap gap-1.5 p-1.5 bg-stone-100 rounded-xl border border-stone-200">
                  {customChartData.map((m, idx) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => handleSelectMonthToEdit(idx)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                        editMonthIndex === idx
                          ? 'bg-[#C2410C] text-white shadow-2xs'
                          : 'bg-white text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {m.label} {m.isUpcoming ? '(Mendatang)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Bulan (Aktif vs Mendatang) */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800">Status Data Bulan:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditIsUpcoming(false)}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        !editIsUpcoming ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      Aktif Terisi
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditIsUpcoming(true)}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        editIsUpcoming ? 'bg-stone-800 text-white shadow-2xs' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      Belum Dilewati (Garis Saja)
                    </button>
                  </div>
                </div>
              </div>

              {!editIsUpcoming && (
                <>
                  {/* Input Gross & Net Profit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Pendapatan Kotor / Omset (Rp)
                      </label>
                      <input 
                        type="number"
                        value={editGrossInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditGrossInput(val);
                          const num = parseInt(val) || 0;
                          setEditNetInput(Math.round(num * 0.40).toString());
                        }}
                        className="w-full px-3.5 py-2 bg-stone-50 rounded-xl border border-stone-300 text-stone-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                        required
                      />
                      <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                        Rp {(parseInt(editGrossInput) || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Est. Laba Bersih (Rp) - 40%
                      </label>
                      <input 
                        type="number"
                        value={editNetInput}
                        onChange={(e) => setEditNetInput(e.target.value)}
                        className="w-full px-3.5 py-2 bg-stone-50 rounded-xl border border-stone-300 text-stone-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                        required
                      />
                      <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                        Rp {(parseInt(editNetInput) || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Status Event / Bazar */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800">Kategori Penjualan:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditIsBazar(true)}
                          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            editIsBazar ? 'bg-amber-600 text-white shadow-2xs' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          Ada Event Bazar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditIsBazar(false)}
                          className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            !editIsBazar ? 'bg-stone-700 text-white shadow-2xs' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          Penjualan Reguler
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Teks Label Badge (Muncul di atas grafik):
                      </label>
                      <input 
                        type="text"
                        value={editBadgeText}
                        onChange={(e) => setEditBadgeText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">
                        Rincian / Keterangan Event:
                      </label>
                      <input 
                        type="text"
                        value={editEventName}
                        onChange={(e) => setEditEventName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white rounded-xl border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleResetChartToDefault}
                  className="px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data Default</span>
                </button>

                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowEditChartModal(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 rounded-xl bg-stone-900 text-white font-bold shadow-xs hover:bg-black cursor-pointer active:scale-95 transition-colors"
                  >
                    Simpan Grafik
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. LIVE LEDGER TABLE (Rekap Pembelian & Transaksi Realtime) */}
      <div className="bg-white shadow-2xs rounded-2xl p-6 sm:p-7 border border-stone-200/80 space-y-4">
        
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
          <div>
            <h2 className="text-stone-900 font-bold text-base sm:text-lg">
              Rekap Pembelian &amp; Transaksi
            </h2>
            <p className="text-xs text-stone-500 font-normal">
              Live ledger transaksi masuk realtime dan status pengiriman pesanan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search order input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
                search
              </span>
              <input 
                type="text"
                value={searchOrderQuery}
                onChange={(e) => setSearchOrderQuery(e.target.value)}
                placeholder="Cari ID / Pembeli..."
                className="pl-9 pr-3 py-1.5 bg-stone-50 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#C2410C] border border-stone-300 w-48 sm:w-60 font-sans"
              />
            </div>

            {/* Status Filter Tabs */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 text-stone-900 text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-300 focus:outline-none cursor-pointer font-sans"
            >
              <option value="ALL">Semua Status</option>
              <option value="COOKING">Sedang Dimasak</option>
              <option value="SHIPPING">Dalam Pengiriman</option>
              <option value="COMPLETED">Selesai</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 uppercase text-[11px] font-mono tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Metode Bayar</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {displayOrders.map((order: any) => {
                const isCompleted = order.status === 'COMPLETED';
                const isShipping = order.status === 'SHIPPING' || order.status === 'DELIVERING';

                return (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-stone-900">
                      #{order.id}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-stone-900">{order.customerName || 'Pelanggan'}</div>
                      <div className="text-[11px] text-stone-500 truncate max-w-[160px]">{order.address || 'Jakarta'}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      {(() => {
                        const timeInfo = getDetailedOrderDateTime(order);
                        return (
                          <div className="flex flex-col gap-0.5">
                            <div className="font-bold text-stone-900 text-xs flex items-center gap-1 font-sans">
                              <span className="text-[#C2410C] font-semibold">{timeInfo.dayName},</span>
                              <span>{timeInfo.fullDateStr}</span>
                              {timeInfo.isToday && (
                                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 text-[9px] font-bold rounded-full border border-emerald-200">
                                  Hari ini
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-stone-400">schedule</span>
                              <span>{timeInfo.timeStr}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-3 text-stone-700 text-xs font-medium">
                      {order.paymentMethod || 'Midtrans QRIS'}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-stone-900">
                      Rp {(order.total || 0).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        isCompleted 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                          : isShipping 
                          ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {order.status || 'COOKING'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button 
                        type="button"
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 rounded-xl text-stone-700 font-semibold text-xs transition-colors cursor-pointer border border-stone-300 inline-flex items-center gap-1 shadow-2xs"
                        title="Lihat Struk Pesanan"
                      >
                        <span className="material-symbols-outlined text-[15px]">receipt</span>
                        <span>Struk</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* 7. MODAL INPUT OMSET DETAIL (Event, Bulan, Minggu, Tanggal, Nominal, Menu) */}
      {showInputOmsetModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 w-full max-w-xl rounded-2xl shadow-xl p-6 border border-stone-200 text-left animate-fade-in space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 font-mono">
                  Pencatatan Penjualan
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                  Input Omset Offline / Event Bazar
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowInputOmsetModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors"
                aria-label="Tutup formulir input omset"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualOmset} className="space-y-4 text-xs">
              
              {/* 1. Status Event (Ada Event vs Reguler) */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <label className="block font-bold text-stone-800">Status Penjualan / Event:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInputHasEvent(true)}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      inputHasEvent 
                        ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-2xs' 
                        : 'bg-white text-stone-600 border border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <PartyPopper className="w-4 h-4 text-amber-700" />
                    <span>Ada Event Bazar / Promo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInputHasEvent(false)}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !inputHasEvent 
                        ? 'bg-stone-800 text-white border-2 border-stone-900 shadow-2xs' 
                        : 'bg-white text-stone-600 border border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <Store className="w-4 h-4 text-stone-400" />
                    <span>Penjualan Reguler Standar</span>
                  </button>
                </div>

                {inputHasEvent && (
                  <div className="pt-2">
                    <label className="block font-semibold text-stone-700 mb-1">Nama Event / Bazar:</label>
                    <input 
                      type="text" 
                      value={inputEventName} 
                      onChange={(e) => setInputEventName(e.target.value)} 
                      placeholder="Contoh: Bazar Akbar Kuliner Nusantara, Festival Kemerdekaan"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                      required={inputHasEvent}
                    />
                  </div>
                )}
              </div>

              {/* 2. Waktu Penjualan (Bulan, Minggu Ke-Berapa, Tanggal) */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <label className="block font-bold text-stone-800">Waktu &amp; Tanggal Transaksi:</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Dropdown Bulan */}
                  <div>
                    <label className="block font-medium text-stone-700 text-[11px] mb-1">Bulan:</label>
                    <select
                      value={inputMonth}
                      onChange={(e) => setInputMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-stone-900 font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                    >
                      {[
                        'Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026',
                        'Mei 2026', 'Juni 2026', 'Juli 2026', 'Agustus 2026',
                        'September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026'
                      ].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Minggu */}
                  <div>
                    <label className="block font-medium text-stone-700 text-[11px] mb-1">Minggu Ke-:</label>
                    <select
                      value={inputWeek}
                      onChange={(e) => setInputWeek(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-stone-900 font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                    >
                      <option value="Minggu 1 (Tgl 1 - 7)">Minggu 1 (Tgl 1 - 7)</option>
                      <option value="Minggu 2 (Tgl 8 - 14)">Minggu 2 (Tgl 8 - 14)</option>
                      <option value="Minggu 3 (Tgl 15 - 21)">Minggu 3 (Tgl 15 - 21)</option>
                      <option value="Minggu 4 (Tgl 22 - 28)">Minggu 4 (Tgl 22 - 28)</option>
                      <option value="Minggu 5 (Tgl 29 - 31)">Minggu 5 (Tgl 29 - 31)</option>
                    </select>
                  </div>

                  {/* Input Tanggal Kalender */}
                  <div>
                    <label className="block font-medium text-stone-700 text-[11px] mb-1">Tanggal Spesifik:</label>
                    <input 
                      type="date" 
                      value={inputDate} 
                      onChange={(e) => setInputDate(e.target.value)} 
                      className="w-full px-3 py-2 bg-white rounded-xl border border-stone-300 text-stone-900 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3. Keuangan & Jumlah Porsi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Pendapatan Kotor (Rp)</label>
                  <input 
                    type="number" 
                    value={inputRevenue} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputRevenue(val);
                      const num = parseInt(val) || 0;
                      setInputProfit(Math.round(num * 0.40).toString());
                    }} 
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-300 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C2410C] font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                    Rp {(parseInt(inputRevenue) || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Est. Laba Bersih (Rp)</label>
                  <input 
                    type="number" 
                    value={inputProfit} 
                    onChange={(e) => setInputProfit(e.target.value)} 
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-300 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C2410C] font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                    Rp {(parseInt(inputProfit) || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Total Porsi / Transaksi</label>
                  <input 
                    type="number" 
                    value={inputOrdersCount} 
                    onChange={(e) => setInputOrdersCount(e.target.value)} 
                    className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-300 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C2410C] font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                    {inputOrdersCount || '0'} porsi terjual
                  </span>
                </div>
              </div>

              {/* 4. Multi-Select Menu Terlaris & Catatan Operasional */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-stone-800">
                      Pilih Menu Terlaris (Multi-Select):
                    </label>
                    <span className="text-[10px] text-stone-500">
                      {inputBestSellers.length} Menu Dipilih
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableMenus.map((menuName) => {
                      const isSelected = inputBestSellers.includes(menuName);
                      return (
                        <button
                          key={menuName}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setInputBestSellers(inputBestSellers.filter(m => m !== menuName));
                            } else {
                              setInputBestSellers([...inputBestSellers, menuName]);
                            }
                          }}
                          className={`text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-amber-50 text-amber-950 font-bold border border-amber-300 shadow-2xs' 
                              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          <span className="truncate mr-2">{menuName}</span>
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-[#C2410C] border-[#C2410C] text-white' : 'border-stone-400 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Catatan Operasional */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Catatan Operasional:</label>
                  <input 
                    type="text"
                    value={inputNotes}
                    onChange={(e) => setInputNotes(e.target.value)}
                    placeholder="Contoh: Penjualan ramai saat jam makan siang, stok gudeg habis jam 14:00"
                    className="w-full px-3 py-2 bg-stone-50 rounded-xl border border-stone-300 text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C2410C]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button 
                  type="button" 
                  onClick={() => setShowInputOmsetModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-stone-900 text-white font-bold shadow-xs hover:bg-black cursor-pointer active:scale-95 transition-colors"
                >
                  Simpan Omset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. THERMAL RECEIPT MODAL (Opaque Solid White) */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-sm rounded-2xl shadow-xl p-6 border border-stone-300 text-left animate-fade-in font-mono text-xs space-y-4">
            <div className="text-center border-b border-dashed border-stone-400 pb-3">
              <h4 className="font-bold text-sm uppercase">NEFAKKY KITCHEN</h4>
              <p className="text-[10px] text-stone-600">Jl. Jendral Sudirman No. 45 Jakarta</p>
              <p className="text-[10px] text-stone-600">Hotline: +62 812-3456-7890</p>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-bold">#{selectedReceiptOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{selectedReceiptOrder.customerName || 'Pelanggan'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Waktu Transaksi:</span>
                <span className="font-semibold text-right text-stone-800">
                  {getDetailedOrderDateTime(selectedReceiptOrder).fullReceiptLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Metode Bayar:</span>
                <span>{selectedReceiptOrder.paymentMethod || 'QRIS'}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-stone-400 py-2 space-y-1 text-[11px]">
              {(selectedReceiptOrder.items || []).map((it: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span>{it.name} x{it.quantity}</span>
                  <span>Rp {((it.price || 0) * (it.quantity || 1)).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px] font-bold">
              <div className="flex justify-between">
                <span>TOTAL:</span>
                <span>Rp {(selectedReceiptOrder.total || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button 
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-semibold cursor-pointer hover:bg-stone-100 transition-colors"
              >
                Tutup
              </button>
              <button 
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL ARSIP TAHUNAN & LOGIKA TUTUP BUKU OTOMATIS */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 w-full max-w-lg rounded-2xl shadow-xl p-6 border border-stone-200 text-left animate-fade-in space-y-4">
            
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Otomatisasi Sistem Aktif</span>
                </span>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                  Arsip &amp; Tutup Buku Tahunan Otomatis
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors"
                aria-label="Tutup modal arsip tahunan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Sparkles className="w-4 h-4 text-[#C2410C]" />
                  <span>Logika Tutup Buku &amp; Ekspor Excel/PDF Otomatis</span>
                </div>
                <p className="text-stone-700 leading-relaxed">
                  Sistem telah dilengkapi sensor otomatisasi tahun kalender. Ketika tahun berganti (misal saat memasuki <strong>1 Januari 2027</strong>), seluruh riwayat omset, pesanan, dan laba tahun <strong>2026</strong> akan langsung disimpan ke dalam arsip permanen dan diekspor otomatis ke file <strong>Excel (.xls)</strong> dan <strong>PDF</strong>.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-stone-500">Status Saat Ini:</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded-md border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Standby (Tahun Aktif 2026 - Berjalan Normal)</span>
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-800 mb-2">Riwayat Arsip Tutup Buku:</h4>
                {getArchivedYearsList().length === 0 ? (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center text-stone-500">
                    <p className="font-medium">Belum ada penutupan tahun sebelumnya.</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Arsip otomatis pertama akan dibuat saat kalender mencapai tahun 2027.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getArchivedYearsList().map((arch) => (
                      <div key={arch.year} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-stone-900">Tahun {arch.year}</span>
                          <span className="text-[11px] text-stone-500 block font-mono">Omset: Rp {(arch.totalGross / 1000000).toFixed(1)} Jt ({arch.totalOrders} Pesanan)</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => exportNefakkyExcelReport(realOrders, products || [], { selectedYear: arch.year })}
                            className="px-2.5 py-1 bg-stone-800 text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-stone-900 transition-colors"
                          >
                            Excel
                          </button>
                          <button
                            type="button"
                            onClick={() => exportNefakkyPDFReport(arch.year, arch.totalGross, arch.totalNet, arch.totalOrders, customChartData.map(c => ({ label: c.label, gross: c.grossRaw, net: c.netRaw, isBazar: c.isBazar, badge: c.eventName || '' })))}
                            className="px-2.5 py-1 bg-[#C2410C] text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-[#9A3412] transition-colors"
                          >
                            PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual Backup Action */}
              <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-center gap-2">
                <span className="text-[11px] text-stone-500 italic">
                  Ingin unduh backup data tahun 2026 saat ini?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    exportNefakkyExcelReport(realOrders, products || [], { selectedYear: '2026', selectedMonthLabel: 'Backup Manual Buku 2026' });
                  }}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Backup 2026 (.xls)</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <button 
                type="button" 
                onClick={() => setShowArchiveModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer transition-colors"
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
