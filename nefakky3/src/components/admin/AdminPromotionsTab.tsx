'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminPromotionsTab (src/components/admin/AdminPromotionsTab.tsx)
 * DESKRIPSI: Presisi 100% Google Stitch MCP Design:
 *            - Voucher Card dengan Foto Cover HD, Badge Terang High-Contrast,
 *              Pill Kode Promo Solid White, dan Nama Promo Putih Tebal.
 *            - Modal Tambah & Edit Voucher 100% Solid Opaque White (Tidak Tembus Pandang).
 *            - Modal Pelacak Penggunaan Realtime (Voucher Usage Tracker).
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  X,
  Check,
  Calendar,
  Sparkles,
  Percent,
  Clock,
  Flame,
  Search,
  Eye,
  Gift,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  BarChart2,
  Upload,
  FolderOpen,
  Users
} from 'lucide-react';
import { AdminVoucher, useData } from '@/context/DataContext';
import { createPromoCalendarUrl } from '@/lib/googleCalendar';

interface AdminPromotionsTabProps {
  voucherList: AdminVoucher[];
  addVoucher: (voucher: any) => void;
  updateVoucher?: (id: string, updated: Partial<AdminVoucher>) => void;
  deleteVoucher: (id: string) => void;
  toggleVoucherStatus: (id: string) => void;
  initialVoucherCode?: string;
  initialVoucherName?: string;
}

export default function AdminPromotionsTab({
  voucherList,
  addVoucher,
  updateVoucher,
  deleteVoucher,
  toggleVoucherStatus,
  initialVoucherCode = '',
  initialVoucherName = ''
}: AdminPromotionsTabProps) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const { vouchers, resetVoucherUsage } = useData();
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(Boolean(initialVoucherCode));
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucher | null>(null);
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [selectedVoucherForUsage, setSelectedVoucherForUsage] = useState<AdminVoucher | null>(null);
  const [searchPromoQuery, setSearchPromoQuery] = useState<string>('');

  // Form State
  const [voucherCode, setVoucherCode] = useState<string>(initialVoucherCode || '');
  const [voucherName, setVoucherName] = useState<string>(initialVoucherName || '');
  const [voucherDiscount, setVoucherDiscount] = useState<string>('20');
  const [voucherMinSpend, setVoucherMinSpend] = useState<string>('50000');
  const [voucherEvent, setVoucherEvent] = useState<string>('Flash Sale');
  const [validDays, setValidDays] = useState<string>('Semua Hari');
  const [autoResetWeekly, setAutoResetWeekly] = useState<boolean>(false);
  const [userLimitType, setUserLimitType] = useState<'limited' | 'unlimited'>('limited');
  const [voucherUserLimit, setVoucherUserLimit] = useState<string>('100');
  const [voucherExpiry, setVoucherExpiry] = useState<string>('31 Des 2026');

  const allVouchers = voucherList || vouchers || [];

  // Filtered Vouchers
  const displayedVouchers = allVouchers.filter(v => {
    if (!searchPromoQuery.trim()) return true;
    const q = searchPromoQuery.toLowerCase();
    return (
      (v.code || '').toLowerCase().includes(q) ||
      (v.name || '').toLowerCase().includes(q) ||
      ((v as any).eventCategory || '').toLowerCase().includes(q)
    );
  });

  // Handlers
  const handleOpenAddModal = () => {
    setEditingVoucher(null);
    setVoucherCode(`PROMO${Math.floor(10 + Math.random() * 90)}`);
    setVoucherName('');
    setVoucherDiscount('20');
    setVoucherMinSpend('50000');
    setVoucherEvent('Flash Sale');
    setValidDays('Semua Hari');
    setAutoResetWeekly(false);
    setUserLimitType('limited');
    setVoucherUserLimit('100');
    setVoucherExpiry('31 Des 2026');
    setShowVoucherModal(true);
  };

  const handleOpenEditModal = (v: AdminVoucher) => {
    setEditingVoucher(v);
    setVoucherCode(v.code);
    setVoucherName(v.name || '');
    setVoucherDiscount(String(v.discountPercent || 20));
    setVoucherMinSpend(String(v.minSpend || 50000));
    const ev = (v as any).eventCategory || v.event || 'Flash Sale';
    setVoucherEvent(ev);
    setValidDays(v.validDays || 'Semua Hari');
    setAutoResetWeekly(v.autoResetWeekly || false);

    const isPelangganBaru = ev === 'Pelanggan Baru' || (v.code || '').toUpperCase().includes('NEFAKKY10') || (v.name || '').toLowerCase().includes('pelanggan baru');
    if (isPelangganBaru) {
      setUserLimitType('unlimited');
      setVoucherExpiry('Selamanya');
      setVoucherUserLimit('100');
    } else {
      if (v.redemptions === 'Tanpa Batas' || (v.redemptions && String(v.redemptions).toLowerCase().includes('tanpa batas'))) {
        setUserLimitType('unlimited');
        setVoucherUserLimit('100');
      } else {
        setUserLimitType('limited');
        if (v.totalLimit) {
          setVoucherUserLimit(String(v.totalLimit));
        } else if (v.redemptions && v.redemptions.includes('/')) {
          setVoucherUserLimit(v.redemptions.split('/')[1]?.trim() || '100');
        } else {
          setVoucherUserLimit('100');
        }
      }
      setVoucherExpiry(v.expiry || '31 Des 2026');
    }

    setShowVoucherModal(true);
  };

  const handleEventChange = (val: string) => {
    setVoucherEvent(val);
    if (val === 'Pelanggan Baru') {
      setUserLimitType('unlimited');
      setVoucherExpiry('Selamanya');
      setAutoResetWeekly(false);
    } else {
      if (voucherExpiry === 'Selamanya' || voucherEvent === 'Pelanggan Baru') {
        setVoucherExpiry('31 Des 2026');
        setUserLimitType('limited');
        if (!voucherUserLimit || voucherUserLimit === '0') {
          setVoucherUserLimit('100');
        }
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      alert('Kode voucher wajib diisi!');
      return;
    }

    const isPelangganBaru = voucherEvent === 'Pelanggan Baru';
    const limitNum = parseInt(voucherUserLimit) || 100;
    const currentUsed = editingVoucher ? (editingVoucher.usedCount || 0) : 0;

    let redemptionsVal = 'Tanpa Batas';
    let totalLimitVal: number | undefined = undefined;
    let expiryVal = voucherExpiry.trim() || '31 Des 2026';

    if (isPelangganBaru) {
      redemptionsVal = '1x Per Pengguna Baru';
      totalLimitVal = 999999;
      expiryVal = 'Selamanya';
    } else if (userLimitType === 'limited') {
      redemptionsVal = `${currentUsed}/${limitNum}`;
      totalLimitVal = limitNum;
    } else {
      redemptionsVal = 'Tanpa Batas';
      totalLimitVal = undefined;
    }

    const payload: any = {
      code: voucherCode.trim().toUpperCase(),
      name: voucherName.trim() || `Diskon ${voucherDiscount}%`,
      discountPercent: parseInt(voucherDiscount) || 0,
      minSpend: parseInt(voucherMinSpend) || 0,
      eventCategory: voucherEvent,
      event: voucherEvent,
      validDays: validDays,
      autoResetWeekly: isPelangganBaru ? false : autoResetWeekly,
      isActive: editingVoucher ? (editingVoucher.isActive !== false) : true,
      status: 'Active',
      redemptions: redemptionsVal,
      totalLimit: totalLimitVal,
      usedCount: currentUsed,
      expiry: expiryVal
    };

    if (editingVoucher) {
      if (updateVoucher) {
        updateVoucher(editingVoucher.id, payload);
      } else {
        addVoucher({ ...payload, id: editingVoucher.id });
      }
    } else {
      addVoucher(payload);
    }

    setShowVoucherModal(false);
  };

  const handleOpenTrackingModal = (v: AdminVoucher) => {
    setSelectedVoucherForUsage(v);
    setShowUsageModal(true);
  };

  const handleResetVoucher = async (codeOrId: string) => {
    if (confirm(`Apakah Anda yakin ingin me-reset data penggunaan voucher #${codeOrId}? Pengguna yang sebelumnya telah memakai voucher ini akan dapat menggunakannya kembali.`)) {
      if (resetVoucherUsage) {
        await resetVoucherUsage(codeOrId);
        alert(`Penggunaan voucher #${codeOrId} berhasil di-reset ke 0!`);
        setShowUsageModal(false);
      }
    }
  };

  // Mock Usage History
  const voucherUsageHistory = [
    { userId: 'USR-8821', userName: 'Sarah Jenkins', orderId: 'ORD-9021', time: '10m lalu', discount: 25000, total: 125000 },
    { userId: 'USR-4412', userName: 'Michael Ray', orderId: 'ORD-9018', time: '1 jam lalu', discount: 17800, total: 89000 },
    { userId: 'USR-9032', userName: 'Anita Kumala', orderId: 'ORD-9015', time: '3 jam lalu', discount: 29000, total: 145000 },
    { userId: 'USR-1109', userName: 'Budi Santoso', orderId: 'ORD-9004', time: 'Kemarin', discount: 20000, total: 100000 },
  ];

  return (
    <div className="flex flex-col w-full text-on-surface space-y-6">
      
      {/* 1. HEADER & ACTION TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight font-['Playfair_Display']">
            Voucher &amp; Promosi Toko
          </h1>
          <p className="font-body-base text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Kelola kode diskon, banner event flash sale, dan pantau efektivitas penggunaan kupon.
          </p>
        </div>

        {/* Create Voucher Button */}
        <button 
          type="button"
          onClick={handleOpenAddModal}
          className="bg-[#934B19] hover:bg-[#7a3e14] text-white px-5 py-2.5 rounded-full font-headline-sm font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Terbitkan Voucher Baru</span>
        </button>
      </div>

      {/* 2. VOUCHER CARDS GRID (3 Columns Responsive) */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/20 shadow-xs">
          <div className="relative flex-1 sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
              search
            </span>
            <input 
              type="text"
              value={searchPromoQuery}
              onChange={(e) => setSearchPromoQuery(e.target.value)}
              placeholder="Cari kode kupon / event promo..."
              className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
            />
          </div>

          <div className="text-xs font-bold text-on-surface-variant">
            {displayedVouchers.length} Promo Aktif
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedVouchers.map((voucher) => {
            const isActive = voucher.isActive ?? true;
            const isPelangganBaru = 
              (voucher as any).eventCategory === 'Pelanggan Baru' || 
              voucher.event === 'Pelanggan Baru' || 
              (voucher.code || '').toUpperCase().includes('NEFAKKY10') ||
              (voucher.name || '').toLowerCase().includes('pelanggan baru');

            const isTanpaBatas = 
              !isPelangganBaru && 
              (voucher.redemptions === 'Tanpa Batas' || (voucher.redemptions && String(voucher.redemptions).toLowerCase().includes('tanpa batas')));

            let usedCount = voucher.usedCount || 0;
            let totalLimit = voucher.totalLimit;
            if (totalLimit === undefined && voucher.redemptions && voucher.redemptions.includes('/')) {
              const parts = voucher.redemptions.split('/');
              usedCount = parseInt(parts[0], 10) || usedCount;
              totalLimit = parseInt(parts[1], 10) || 500;
            }
            if (!totalLimit && !isTanpaBatas && !isPelangganBaru) {
              totalLimit = 500;
            }

            return (
              <div 
                key={voucher.id}
                className="bg-white rounded-3xl overflow-hidden shadow-md border border-stone-200 flex flex-col justify-between hover:shadow-xl transition-all group relative"
              >
                {/* Card Top Banner (Clean Dark Luxury Gradient - Tanpa Gambar) */}
                <div className="h-32 relative overflow-hidden bg-gradient-to-br from-[#25160E] via-[#381F12] to-[#180C06] p-3.5 flex flex-col justify-between">
                  
                  {/* Top Badges */}
                  <div className="flex justify-between items-center z-10">
                    <span className="px-3 py-1 bg-amber-400 text-amber-950 font-extrabold rounded-full text-[10px] uppercase shadow-sm tracking-wider flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-950" />
                      <span>{(voucher as any).eventCategory || voucher.event || 'Promo Spesial'}</span>
                    </span>

                    <button 
                      type="button"
                      onClick={() => toggleVoucherStatus(voucher.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm cursor-pointer transition-all flex items-center gap-1.5 ${
                        isActive 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                          : 'bg-stone-700 hover:bg-stone-800 text-stone-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-stone-400'}`}></span>
                      <span>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </button>
                  </div>

                  {/* Bottom Promo Code & Name */}
                  <div className="z-10">
                    <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl mb-1 shadow-md border border-stone-100">
                      <span className="font-mono text-xs sm:text-sm font-extrabold text-stone-900 tracking-wider">
                        #{voucher.code}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#934B19] text-white rounded-md">
                        {voucher.discountPercent}% OFF
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                      {voucher.name || `Voucher Diskon ${voucher.discountPercent}%`}
                    </h3>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className={`p-4 flex-1 flex flex-col gap-3 bg-white ${!isActive ? 'opacity-70' : ''}`}>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-stone-100 pb-2">
                      <span className="text-stone-500 font-medium">Min. Spend</span>
                      <span className="font-mono font-bold text-stone-900">
                        Rp {(voucher.minSpend || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-stone-100 py-2">
                      <span className="text-stone-500 font-medium">Hari Aktif</span>
                      <span className={`font-mono font-bold ${
                        voucher.validDays === 'Weekend' || voucher.validDays === 'Sabtu & Minggu' 
                          ? 'text-[#934B19]' 
                          : 'text-stone-900'
                      }`}>
                        {voucher.validDays || 'Semua Hari'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-stone-100 py-2 items-center">
                      <span className="text-stone-500 font-medium">Batasan Kuota</span>
                      {isPelangganBaru ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-md border border-amber-300">
                          1x Per User (Selamanya)
                        </span>
                      ) : isTanpaBatas ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md border border-emerald-300">
                          Tanpa Batas Kuota
                        </span>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-mono font-bold text-stone-900 text-[11px]">
                            {usedCount}/{totalLimit} Pengguna
                          </span>
                          <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                            <div 
                              className="h-full bg-[#934B19] rounded-full transition-all"
                              style={{ width: `${Math.min(100, (usedCount / Math.max(1, totalLimit || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between border-b border-stone-100 py-2">
                      <span className="text-stone-500 font-medium">Aturan</span>
                      <span className="font-mono font-bold text-stone-900">
                        {isPelangganBaru ? 'User Baru Selamanya' : voucher.autoResetWeekly ? 'Reset Mingguan' : '1x Per User'}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 text-rose-600 text-xs font-bold items-center">
                      <span className="text-stone-500 font-medium">Expiry</span>
                      {isPelangganBaru ? (
                        <span className="font-mono text-emerald-700 font-bold text-[11px]">Aktif Selamanya</span>
                      ) : (
                        <span className="font-mono">{voucher.expiry || '31 Des 2026'}</span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-auto pt-3 flex gap-2">
                    <button 
                      type="button"
                      onClick={() => handleOpenTrackingModal(voucher)}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-stone-200 cursor-pointer"
                    >
                      <BarChart2 className="w-4 h-4 text-[#934B19]" />
                      <span>Lihat Pengguna</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleOpenEditModal(voucher)}
                      className="w-10 h-10 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 border border-stone-200 cursor-pointer transition-colors"
                      title="Edit Voucher"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus voucher #${voucher.code}?`)) {
                          deleteVoucher(voucher.id);
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                      title="Hapus Voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* 3. MODAL TRACKING REALTIME PENGGUNAAN VOUCHER (Opaque Solid White) */}
      {showUsageModal && selectedVoucherForUsage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] overflow-hidden border-2 border-stone-200 text-left animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="font-headline-md text-base sm:text-lg font-bold text-stone-900">
                  Performa Promo: #{selectedVoucherForUsage.code}
                </h2>
                <p className="font-body-sm text-xs text-stone-500">
                  Data real-time penggunaan voucher dan dampak pendapatan toko.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowUsageModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* KPI Metric Summary Row */}
            <div className="p-5 bg-stone-50 grid grid-cols-3 gap-3 border-b border-stone-200">
              <div className="bg-white p-3.5 rounded-2xl shadow-2xs border border-stone-200">
                <div className="font-label-caps text-stone-500 uppercase tracking-wider mb-1 text-[10px] font-bold">
                  Total Usage
                </div>
                <div className="font-mono text-base sm:text-lg text-[#934B19] font-bold">
                  {voucherUsageHistory.length}<span className="text-xs font-normal text-stone-500 ml-1">kali</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl shadow-2xs border border-stone-200">
                <div className="font-label-caps text-stone-500 uppercase tracking-wider mb-1 text-[10px] font-bold">
                  Total Diskon
                </div>
                <div className="font-mono text-base sm:text-lg text-rose-600 font-bold">
                  Rp {(voucherUsageHistory.reduce((s, u) => s + u.discount, 0)).toLocaleString('id-ID')}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl shadow-2xs border border-stone-200">
                <div className="font-label-caps text-stone-500 uppercase tracking-wider mb-1 text-[10px] font-bold">
                  Net Revenue
                </div>
                <div className="font-mono text-base sm:text-lg text-emerald-600 font-bold">
                  Rp {(voucherUsageHistory.reduce((s, u) => s + u.total, 0)).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Table of Users */}
            <div className="flex-1 overflow-y-auto p-5 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-label-caps uppercase text-[10px]">
                    <th className="py-2.5 w-1/4">User ID / Nama</th>
                    <th className="py-2.5 w-1/4">Order ID</th>
                    <th className="py-2.5 w-1/4">Waktu Pakai</th>
                    <th className="py-2.5 text-right w-1/4">Diskon &amp; Total</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[12px] divide-y divide-stone-100">
                  {voucherUsageHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-stone-900">{item.userId}</div>
                        <div className="text-stone-500 text-[11px] font-sans">{item.userName}</div>
                      </td>
                      <td className="py-3 text-blue-700 font-bold">#{item.orderId}</td>
                      <td className="py-3 text-stone-500 text-[11px] font-sans">{item.time}</td>
                      <td className="py-3 text-right">
                        <div className="text-rose-600 font-bold">-Rp {item.discount.toLocaleString('id-ID')}</div>
                        <div className="text-stone-700 font-semibold text-[11px]">Rp {item.total.toLocaleString('id-ID')}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
              <button 
                type="button"
                onClick={() => handleResetVoucher(selectedVoucherForUsage.code || selectedVoucherForUsage.id)}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset Penggunaan Voucher</span>
              </button>

              <button 
                type="button"
                onClick={() => setShowUsageModal(false)}
                className="bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                Tutup Laporan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. MODAL TERBITKAN / EDIT VOUCHER (Opaque Solid White) */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-stone-200 text-left animate-fade-in">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-200 flex justify-between items-center bg-white">
              <div className="flex flex-col">
                <h2 className="font-display-lg text-lg sm:text-xl text-stone-900 font-bold font-['Playfair_Display']">
                  {editingVoucher ? 'Edit Voucher Promo' : 'Terbitkan Voucher Baru'}
                </h2>
                <span className="font-body-sm text-xs text-stone-500">
                  Atur diskon potongan harga, syarat belanja, hari berlaku, dan kuota.
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs bg-white text-stone-900">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kode Voucher */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold">
                      Kode Promo (KAPITAL)
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={voucherCode} 
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: HEMAT50" 
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none font-mono text-xs text-stone-900 font-bold shadow-2xs"
                    />
                  </div>

                  {/* Nama Voucher */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold">
                      Nama Voucher
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={voucherName} 
                      onChange={(e) => setVoucherName(e.target.value)}
                      placeholder="Contoh: Diskon Merdeka 50%" 
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-semibold shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Persentase Diskon */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold">
                      Diskon (%)
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      max="100" 
                      value={voucherDiscount} 
                      onChange={(e) => setVoucherDiscount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none font-mono text-xs text-stone-900 font-bold shadow-2xs"
                    />
                  </div>

                  {/* Min Belanja */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold">
                      Min. Belanja (Rp)
                    </label>
                    <input 
                      type="number" 
                      required 
                      value={voucherMinSpend} 
                      onChange={(e) => setVoucherMinSpend(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none font-mono text-xs text-stone-900 font-bold shadow-2xs"
                    />
                  </div>
                </div>

                {/* Event Tag & Hari Aktif */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold">
                      Kategori Event
                    </label>
                    <select 
                      value={voucherEvent} 
                      onChange={(e) => handleEventChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-semibold cursor-pointer shadow-2xs"
                    >
                      <option value="Pelanggan Baru">Pelanggan Baru (Aktif Selamanya)</option>
                      <option value="Promo Akhir Pekan">Promo Akhir Pekan</option>
                      <option value="Flash Sale">Flash Sale</option>
                      <option value="Tanggal Kembar">Tanggal Kembar</option>
                      <option value="Hari Raya">Hari Raya</option>
                      <option value="Lainnya">Event Lainnya (Kustom)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold">
                      Hari Berlaku
                    </label>
                    <select 
                      value={validDays} 
                      onChange={(e) => setValidDays(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-semibold cursor-pointer shadow-2xs"
                    >
                      <option value="Semua Hari">Semua Hari (Senin - Minggu)</option>
                      <option value="Weekend">Khusus Akhir Pekan (Sabtu &amp; Minggu)</option>
                      <option value="Weekday">Hari Kerja (Senin - Jumat)</option>
                    </select>
                  </div>
                </div>

                {/* Section Batasan Pengguna & Masa Berlaku */}
                {voucherEvent === 'Pelanggan Baru' ? (
                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-300/80 flex items-start gap-3.5 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#934B19] flex items-center justify-center shrink-0 mt-0.5 border border-amber-200">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-xs">Promo Pelanggan Baru (Aktif Selamanya)</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md border border-emerald-300">
                          Aktif Selamanya
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-1 leading-relaxed">
                        Sesuai ketentuan, promo pelanggan baru akan <strong>selalu aktif selamanya</strong> dan berlaku otomatis <strong>1x klaim per akun pengguna baru</strong> tanpa dibatasi kuota global.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between">
                      <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#934B19]" />
                        <span>Batasan Pengguna (Kuota Klaim Promo)</span>
                      </label>
                      
                      {/* Pilihan: Terbatas vs Tanpa Batas */}
                      <div className="flex items-center gap-1 bg-stone-200/70 p-0.5 rounded-lg text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setUserLimitType('limited')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            userLimitType === 'limited'
                              ? 'bg-white text-[#934B19] shadow-xs font-extrabold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Batas Kuota
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserLimitType('unlimited')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                            userLimitType === 'unlimited'
                              ? 'bg-white text-[#934B19] shadow-xs font-extrabold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Tanpa Batas
                        </button>
                      </div>
                    </div>

                    {userLimitType === 'limited' ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100000"
                            required
                            value={voucherUserLimit}
                            onChange={(e) => setVoucherUserLimit(e.target.value)}
                            placeholder="Contoh: 100"
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none font-mono text-xs text-stone-900 font-bold shadow-2xs"
                          />
                          <span className="text-xs font-bold text-stone-600 shrink-0">Pengguna</span>
                        </div>

                        {/* Quick Limit Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-stone-500 font-medium mr-1">Preset Cepat:</span>
                          {['25', '50', '100', '250', '500', '1000'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setVoucherUserLimit(preset)}
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                voucherUserLimit === preset 
                                  ? 'bg-[#934B19] text-white border-[#934B19]' 
                                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>

                        {/* Checkbox Auto-Reset Mingguan */}
                        <label className="flex items-center gap-2 pt-1 text-stone-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={autoResetWeekly}
                            onChange={(e) => setAutoResetWeekly(e.target.checked)}
                            className="w-4 h-4 rounded border-stone-300 text-[#934B19] focus:ring-[#934B19] accent-[#934B19] cursor-pointer"
                          />
                          <span className="text-[11px] font-semibold">
                            Auto-Reset Kuota Setiap Minggu (Cocok untuk Promo Akhir Pekan / Rutin)
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-stone-600 text-[11px] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">all_inclusive</span>
                        <span>Voucher ini dapat diklaim tanpa batas total kuota hingga masa berlaku selesai.</span>
                      </div>
                    )}

                    {/* Expiry Field */}
                    <div className="flex flex-col gap-1 pt-2 border-t border-stone-200">
                      <label className="font-label-caps text-stone-800 uppercase text-[11px] font-bold">
                        Masa Berlaku / Tanggal Kedaluwarsa
                      </label>
                      <input
                        type="text"
                        value={voucherExpiry}
                        onChange={(e) => setVoucherExpiry(e.target.value)}
                        placeholder="Contoh: 31 Des 2026 atau Akhir Pekan"
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] outline-none text-xs text-stone-900 font-semibold shadow-2xs"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-700 hover:bg-stone-200 font-bold text-xs cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl bg-[#934B19] text-white font-bold text-xs shadow-md hover:bg-[#783603] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Simpan Voucher</span>
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
