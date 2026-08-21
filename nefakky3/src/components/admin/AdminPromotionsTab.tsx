import React, { useState } from 'react';
import { Plus, X, Trash2, Tag, Calendar, Users, Sparkles, Check, Gift, Edit3, RefreshCw, Clock, Image as ImageIcon, Upload, Link2, Camera, Receipt, DollarSign, Search } from 'lucide-react';
import { AdminVoucher, useData } from '@/context/DataContext';

interface AdminPromotionsTabProps {
  voucherList: AdminVoucher[];
  addVoucher: (voucher: any) => void;
  deleteVoucher: (id: string) => void;
  toggleVoucherStatus: (id: string) => void;
  initialVoucherCode?: string;
  initialVoucherName?: string;
}

export default function AdminPromotionsTab({
  voucherList,
  addVoucher,
  deleteVoucher,
  toggleVoucherStatus,
  initialVoucherCode = '',
  initialVoucherName = ''
}: AdminPromotionsTabProps) {
  const { updateVoucher, orders } = useData();
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucher | null>(null);
  const [selectedVoucherForUsage, setSelectedVoucherForUsage] = useState<AdminVoucher | null>(null);
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [voucherSearchQuery, setVoucherSearchQuery] = useState<string>('');
  
  // State Form Voucher
  const [voucherCode, setVoucherCode] = useState<string>(initialVoucherCode);
  const [voucherName, setVoucherName] = useState<string>(initialVoucherName);
  const [voucherDiscount, setVoucherDiscount] = useState<string>('30');
  const [voucherMinSpend, setVoucherMinSpend] = useState<string>('50000');
  
  // Custom Fields: Event, Hari Berlaku, Auto-Reset Mingguan, Tanggal Kedaluwarsa, Batas Pengguna & Gambar Banner
  const [voucherEvent, setVoucherEvent] = useState<string>('Pelanggan Baru');
  const [customEvent, setCustomEvent] = useState<string>('');
  const [validDays, setValidDays] = useState<string>('Semua Hari');
  const [autoResetWeekly, setAutoResetWeekly] = useState<boolean>(true);
  const [expiryType, setExpiryType] = useState<'selamanya' | 'date'>('selamanya');
  const [voucherExpiryDate, setVoucherExpiryDate] = useState<string>('2026-12-31');
  const [limitType, setLimitType] = useState<'unlimited' | 'limited'>('unlimited');
  const [voucherMaxUsers, setVoucherMaxUsers] = useState<string>('500');
  const [voucherImageUrl, setVoucherImageUrl] = useState<string>('');
  const [imageInputTab, setImageInputTab] = useState<'upload' | 'url'>('upload');

  const allVouchers = voucherList || [];
  const displayedVouchers = allVouchers.filter((v) => {
    if (voucherSearchQuery.trim()) {
      const q = voucherSearchQuery.toLowerCase();
      const matchCode = v.code.toLowerCase().includes(q);
      const matchName = v.name.toLowerCase().includes(q);
      const matchEvent = (v.event || '').toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchEvent) return false;
    }
    return true;
  });

  // Format Tanggal Indonesia (contoh: 2026-12-31 -> 31 Des 2026)
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return '31 Des 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Open Modal untuk Tambah Voucher Baru
  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setVoucherCode(initialVoucherCode || '');
    setVoucherName(initialVoucherName || '');
    setVoucherDiscount('30');
    setVoucherMinSpend('50000');
    setVoucherEvent('Pelanggan Baru');
    setCustomEvent('');
    setValidDays('Semua Hari');
    setAutoResetWeekly(true);
    setExpiryType('selamanya');
    setVoucherExpiryDate('2026-12-31');
    setLimitType('unlimited');
    setVoucherMaxUsers('500');
    setVoucherImageUrl('');
    setImageInputTab('upload');
    setShowVoucherModal(true);
  };

  // Open Modal untuk Edit Voucher yang Sudah Ada
  const handleOpenEditModal = (voucher: AdminVoucher) => {
    setEditingVoucher(voucher);
    setVoucherCode(voucher.code);
    setVoucherName(voucher.name);
    setVoucherDiscount(String(voucher.discountPercent));
    setVoucherMinSpend(String(voucher.minSpend));
    setVoucherImageUrl(voucher.imageUrl || '');
    setImageInputTab(voucher.imageUrl?.startsWith('http') ? 'url' : 'upload');

    const isNewCust = voucher.event === 'Pelanggan Baru' || voucher.code?.toUpperCase().includes('NEFAKKY10') || voucher.name?.toLowerCase().includes('pelanggan baru');
    const knownEvents = ['Pelanggan Baru', 'Promo Akhir Pekan', 'Flash Sale', 'Tanggal Kembar', 'Hari Raya'];
    
    if (voucher.event && knownEvents.includes(voucher.event)) {
      setVoucherEvent(voucher.event);
      setCustomEvent('');
    } else if (voucher.event) {
      setVoucherEvent('Lainnya');
      setCustomEvent(voucher.event);
    } else {
      setVoucherEvent(isNewCust ? 'Pelanggan Baru' : 'Promo Akhir Pekan');
      setCustomEvent('');
    }

    const days = voucher.validDays || (voucher.event === 'Promo Akhir Pekan' || voucher.code?.toUpperCase().includes('WEEKEND') ? 'Weekend' : 'Semua Hari');
    setValidDays(days);
    setAutoResetWeekly(voucher.autoResetWeekly ?? (days === 'Weekend' || voucher.event === 'Promo Akhir Pekan'));

    const isSelamanya = voucher.expiry === 'Selamanya' || isNewCust;
    setExpiryType(isSelamanya ? 'selamanya' : 'date');

    const isUnlimited = voucher.redemptions === 'Tanpa Batas' || isNewCust;
    setLimitType(isUnlimited ? 'unlimited' : 'limited');

    if (voucher.redemptions && voucher.redemptions.includes('/')) {
      const parts = voucher.redemptions.split('/');
      setVoucherMaxUsers(parts[1] || '500');
    } else {
      setVoucherMaxUsers(String(voucher.totalLimit || 500));
    }

    setShowVoucherModal(true);
  };

  // Upload file gambar dari perangkat (Base64)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran gambar terlalu besar! Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Switch event handler: Jika memilih 'Pelanggan Baru', otomatis set Aktif Selamanya & Tanpa Batas Pengguna
  const handleEventChange = (selectedEvent: string) => {
    setVoucherEvent(selectedEvent);
    if (selectedEvent === 'Pelanggan Baru') {
      setExpiryType('selamanya');
      setLimitType('unlimited');
      setValidDays('Semua Hari');
      setAutoResetWeekly(false);
    } else if (selectedEvent === 'Promo Akhir Pekan') {
      setValidDays('Weekend');
      setAutoResetWeekly(true);
    }
  };

  // Submit Form (Create / Edit)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    const finalEvent = voucherEvent === 'Lainnya' ? (customEvent.trim() || 'Event Khusus') : voucherEvent;
    const isNewCustomer = finalEvent === 'Pelanggan Baru';

    // Expiry date calculation
    const finalExpiry = expiryType === 'selamanya' 
      ? 'Selamanya' 
      : formatDateIndo(voucherExpiryDate);

    // Kuota & Limit
    const maxLimitNum = parseInt(voucherMaxUsers || '500', 10);
    const existingUsed = editingVoucher?.usedCount || 0;
    const finalRedemptions = limitType === 'unlimited' 
      ? (isNewCustomer ? '1x Per Pengguna Baru' : 'Tanpa Batas') 
      : `${existingUsed}/${maxLimitNum}`;

    const isWeekendSched = validDays === 'Weekend' || finalEvent === 'Promo Akhir Pekan';

    const payload = {
      code: voucherCode.trim().toUpperCase(),
      name: voucherName || (isNewCustomer ? 'Voucher Pelanggan Baru' : `Voucher ${voucherDiscount}%`),
      type: 'Percentage',
      discountPercent: parseFloat(voucherDiscount) || 10,
      minSpend: parseFloat(voucherMinSpend) || 0,
      event: finalEvent,
      validDays: validDays,
      autoResetWeekly: isNewCustomer ? false : (autoResetWeekly || isWeekendSched),
      redemptions: finalRedemptions,
      expiry: finalExpiry,
      status: 'Active' as const,
      isActive: true,
      totalLimit: (isNewCustomer || limitType === 'unlimited') ? 999999999 : maxLimitNum,
      usedCount: existingUsed,
      imageUrl: voucherImageUrl.trim()
    };

    if (editingVoucher) {
      updateVoucher(editingVoucher.id, payload);
      alert(`Voucher "${payload.code}" BERHASIL diperbarui!`);
    } else {
      addVoucher(payload);
      alert(`Voucher baru "${payload.code}" BERHASIL diterbitkan!`);
    }

    setShowVoucherModal(false);
    setEditingVoucher(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#25160e]">Kelola Voucher &amp; Promosi</h1>
          <p className="text-xs text-[#4f4540]">Terbitkan &amp; edit kode diskon khusus, kelola hari aktif (weekend/weekdays), dan reset kuota mingguan.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={voucherSearchQuery}
              onChange={(e) => setVoucherSearchQuery(e.target.value)}
              placeholder="Cari kode voucher / event..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-amber-900/15 rounded-2xl text-xs text-[#25160e] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#934b19]/30 font-medium shadow-xs"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Terbitkan Voucher</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedVouchers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 font-medium bg-white rounded-3xl border border-amber-900/10 p-8">
            Belum ada voucher.
          </div>
        ) : (
          displayedVouchers.map((v) => {
            const isNewCust = v.event === 'Pelanggan Baru' || v.code?.toUpperCase().includes('NEFAKKY10') || v.name?.toLowerCase().includes('pelanggan baru');
            const isPerpetual = v.expiry === 'Selamanya' || isNewCust;
            const isUnlimited = (v.redemptions === 'Tanpa Batas' || (v.redemptions && v.redemptions.toLowerCase().includes('tanpa batas'))) && !isNewCust;
            const daysSetting = v.validDays || (v.event === 'Promo Akhir Pekan' || v.code?.toUpperCase().includes('WEEKEND') ? 'Weekend' : 'Semua Hari');
            const isAutoReset = v.autoResetWeekly ?? (daysSetting === 'Weekend' || v.event === 'Promo Akhir Pekan');

            const usedOrders = (orders || []).filter(o => 
              (o.voucherCode && o.voucherCode.toUpperCase().includes(v.code.toUpperCase())) ||
              (o.appliedPromo && o.appliedPromo.toUpperCase().includes(v.code.toUpperCase()))
            );

            return (
              <div key={v.id} className="bg-white rounded-3xl border shadow-xl space-y-0 transition-all duration-200 hover:shadow-2xl overflow-hidden flex flex-col justify-between border-amber-900/10">
                {/* GAMBAR BANNER PROMO HEADER */}
                <div className="relative h-44 w-full bg-gradient-to-br from-[#25160e] via-[#4a2e1b] to-[#934b19] overflow-hidden group">
                  {v.imageUrl ? (
                    <img
                      src={v.imageUrl}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-amber-200/80">
                      <Sparkles className="w-8 h-8 text-amber-400 mb-1 animate-pulse" />
                      <span className="font-mono text-sm font-bold text-amber-300">{v.code}</span>
                      <span className="text-[10px] text-amber-200/70">{v.event || 'Promo Spesial'}</span>
                    </div>
                  )}

                  {/* OVERLAY GRADIENT FOR TEXT LEGIBILITY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#25160e] via-[#25160e]/30 to-transparent"></div>

                  {/* BADGE EVENT (TOP LEFT) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-md backdrop-blur-md border ${
                      isNewCust 
                        ? 'bg-amber-500/90 text-amber-950 border-amber-300' 
                        : 'bg-black/60 text-amber-300 border-amber-400/30'
                    }`}>
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      {v.event || (isNewCust ? 'Pelanggan Baru' : 'Promo Umum')}
                    </span>
                  </div>

                  {/* BADGE STATUS (TOP RIGHT) */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md ${
                      v.status === 'Active' ? 'bg-emerald-600/90 text-white border border-emerald-300' : 'bg-stone-800/90 text-stone-300 border border-stone-600'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  {/* PROMO TITLE & CODE OVERLAY (BOTTOM LEFT) */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="inline-block font-mono text-base font-black text-amber-300 tracking-wider bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs border border-amber-400/30">
                        {v.code}
                      </span>
                      <h3 className="text-xs font-bold text-white mt-1 drop-shadow-md line-clamp-1">{v.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-amber-200 font-semibold block">DISKON</span>
                      <span className="text-xl font-black text-amber-400 drop-shadow-md">{v.discountPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* DETAILS VOUCHER CARD BODY */}
                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-xs text-[#4f4540] bg-[#fbf9f5] p-3.5 rounded-2xl border border-amber-900/10">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 font-medium">Min. Belanja:</span>
                      <strong className="text-[#25160e] font-semibold">Rp {v.minSpend.toLocaleString('id-ID')}</strong>
                    </div>

                    {/* HARI BERLAKU SCHEDULE BADGE */}
                    <div className="flex justify-between items-center pt-1 border-t border-amber-900/5">
                      <span className="text-stone-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Hari Aktif:
                      </span>
                      {daysSetting === 'Weekend' ? (
                        <strong className="text-amber-800 font-bold bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300/70 text-[11px]">
                          Sabtu &amp; Minggu (Weekend)
                        </strong>
                      ) : daysSetting === 'Weekdays' ? (
                        <strong className="text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80 text-[11px]">
                          Senin - Jumat (Hari Kerja)
                        </strong>
                      ) : (
                        <strong className="text-stone-700 font-semibold">Semua Hari</strong>
                      )}
                    </div>

                    {/* PENGGUNAAN & AUTO RESET */}
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        Penggunaan:
                      </span>
                      {isNewCust ? (
                        <strong className="text-amber-900 font-bold bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                          1x Per Pengguna Baru
                        </strong>
                      ) : isUnlimited ? (
                        <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 flex items-center gap-1">
                          Tanpa Batas (∞)
                        </strong>
                      ) : (
                        <div className="text-right">
                          <strong className="text-[#25160e] font-semibold">{v.redemptions || '0/500'}</strong>
                          {isAutoReset && (
                            <div className="text-[9px] text-amber-700 font-bold flex items-center gap-0.5 justify-end">
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>Reset Tiap Minggu</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* MASA BERLAKU */}
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        Masa Berlaku:
                      </span>
                      {isPerpetual ? (
                        <strong className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                          Selamanya (Aktif Terus)
                        </strong>
                      ) : (
                        <strong className="text-[#25160e] font-semibold">{v.expiry}</strong>
                      )}
                    </div>
                  </div>

                  {/* FOOTER ACTIONS & RIWAYAT PENGGUNA */}
                  <div className="pt-3 border-t border-stone-100 space-y-2">
                    {/* TOMBOL LIHAT DAFTAR PENGGUNA PROMO (UNTUK OWNER & ADMIN) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVoucherForUsage(v);
                        setShowUsageModal(true);
                      }}
                      className="w-full py-2 px-3.5 bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-900/10 hover:from-amber-500/20 hover:to-amber-900/20 text-[#25160e] rounded-xl text-xs font-bold transition-all flex items-center justify-between border border-amber-900/15 shadow-xs group cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-xs text-[#934b19]">
                        <Users className="w-3.5 h-3.5 text-[#934b19]" />
                        <span>Lihat Pengguna Promo</span>
                      </span>
                      <span className="bg-[#934b19] text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold group-hover:scale-105 transition-transform">
                        {usedOrders.length} Pesanan
                      </span>
                    </button>

                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        {/* TOMBOL EDIT VOUCHER */}
                        <button
                          onClick={() => handleOpenEditModal(v)}
                          className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200/60 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => toggleVoucherStatus(v.id)}
                          className="text-xs font-bold text-[#934b19] hover:underline"
                        >
                          {v.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus voucher "${v.code}"?`)) {
                            deleteVoucher(v.id);
                          }
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL EDIT / TERBITKAN VOUCHER */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160e]/60 backdrop-blur-md animate-fade-in print:hidden overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-amber-900/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#25160e] flex items-center gap-2">
                  {editingVoucher ? <Edit3 className="w-5 h-5 text-[#934b19]" /> : <Gift className="w-5 h-5 text-[#934b19]" />}
                  <span>{editingVoucher ? `Edit Voucher Promo (${editingVoucher.code})` : 'Terbitkan Voucher Baru'}</span>
                </h3>
                <p className="text-[11px] text-[#4f4540]">
                  {editingVoucher ? 'Ubah parameter diskon, event, hari aktif, & reset kuota mingguan.' : 'Buat kode diskon baru dengan event, jadwal hari, & reset kuota mingguan.'}
                </p>
              </div>
              <button onClick={() => setShowVoucherModal(false)} className="p-1 rounded-full text-stone-400 hover:text-[#25160e] hover:bg-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* 1. KODE VOUCHER */}
              <div>
                <label className="block font-bold text-[#25160e] mb-1">Kode Voucher (Kapital) *</label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="contoh: WEEKENDSERU atau NEFAKKY30"
                  className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-mono font-bold text-xs text-[#934b19] focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                  required
                />
              </div>

              {/* 2. NAMA DESKRIPSI PROMO */}
              <div>
                <label className="block font-bold text-[#25160e] mb-1">Nama Deskripsi Promo</label>
                <input
                  type="text"
                  value={voucherName}
                  onChange={(e) => setVoucherName(e.target.value)}
                  placeholder="contoh: Weekend Promo Diskon 15%"
                  className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                />
              </div>

              {/* 2.5 GAMBAR BANNER PROMO */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#25160e] flex items-center gap-1 text-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-[#934b19]" />
                    <span>Gambar Banner Promo *</span>
                  </label>
                  <span className="text-[10px] text-amber-800 font-medium">Mempercantik Kartu Promo</span>
                </div>

                {/* TAB SELECTION CARA INPUT GAMBAR */}
                <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setImageInputTab('upload')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                      imageInputTab === 'upload'
                        ? 'bg-white text-[#934b19] shadow-xs'
                        : 'text-stone-600 hover:text-[#25160e]'
                    }`}
                  >
                    <Upload className="w-3 h-3 text-blue-600" />
                    <span>Upload Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputTab('url')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                      imageInputTab === 'url'
                        ? 'bg-white text-[#934b19] shadow-xs'
                        : 'text-stone-600 hover:text-[#25160e]'
                    }`}
                  >
                    <Link2 className="w-3 h-3 text-emerald-600" />
                    <span>Input URL</span>
                  </button>
                </div>

                {/* INPUT OPTION 2: UPLOAD FILE */}
                {imageInputTab === 'upload' && (
                  <div className="pt-1">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-amber-900/20 rounded-2xl cursor-pointer bg-[#fbf9f5] hover:bg-amber-50/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Camera className="w-6 h-6 text-[#934b19] mb-1" />
                        <p className="text-[11px] font-bold text-[#25160e]">Klik untuk Pilih Gambar dari Perangkat</p>
                        <p className="text-[9px] text-stone-500">Format PNG, JPG, WEBP (Maks 5MB)</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                    </label>
                  </div>
                )}

                {/* INPUT OPTION 3: URL IMAGE */}
                {imageInputTab === 'url' && (
                  <div className="pt-1">
                    <input
                      type="url"
                      value={voucherImageUrl}
                      onChange={(e) => setVoucherImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                    />
                  </div>
                )}

                {/* LIVE PREVIEW BANNER PROMO */}
                {voucherImageUrl && (
                  <div className="mt-2 relative h-28 rounded-2xl overflow-hidden border border-amber-900/20 shadow-inner group">
                    <img src={voucherImageUrl} alt="Preview Promo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 p-2.5 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 bg-amber-400 text-[#25160e] text-[9px] font-black rounded-md uppercase tracking-wider shadow-xs">
                          Live Preview Banner
                        </span>
                        <button
                          type="button"
                          onClick={() => setVoucherImageUrl('')}
                          className="p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-white">
                        <span className="font-mono text-xs font-bold text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">{voucherCode || 'KODEPROMO'}</span>
                        <h4 className="text-[11px] font-bold line-clamp-1 mt-0.5">{voucherName || 'Nama Promo'}</h4>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. PERSEN DISKON & MIN SPEND */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#25160e] mb-1">Persen Diskon (%) *</label>
                  <input
                    type="number"
                    value={voucherDiscount}
                    onChange={(e) => setVoucherDiscount(e.target.value)}
                    placeholder="15"
                    className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-bold text-[#934b19] focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#25160e] mb-1">Min Pembelian (Rp) *</label>
                  <input
                    type="number"
                    value={voucherMinSpend}
                    onChange={(e) => setVoucherMinSpend(e.target.value)}
                    placeholder="50000"
                    className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                    required
                  />
                </div>
              </div>

              {/* 4. KATEGORI EVENT PROMO */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block font-bold text-[#25160e] mb-1 flex items-center justify-between">
                  <span>Kategori Event Promo</span>
                  <span className="text-[10px] text-amber-800 font-normal">Tipe/Kategori Voucher</span>
                </label>
                <select
                  value={voucherEvent}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-semibold text-[#25160e] focus:outline-none focus:ring-2 focus:ring-[#934b19]/30 cursor-pointer"
                >
                  <option value="Pelanggan Baru">🎁 Promo Pelanggan Baru (Aktif Selamanya & 1x Per Pengguna Baru)</option>
                  <option value="Promo Akhir Pekan">📅 Promo Akhir Pekan (Weekend Seru)</option>
                  <option value="Flash Sale">⚡ Flash Sale</option>
                  <option value="Tanggal Kembar">🏷️ Tanggal Kembar / Harbolnas</option>
                  <option value="Hari Raya">🌙 Hari Raya / Hari Libur</option>
                  <option value="Lainnya">✏️ Event Khusus / Lainnya</option>
                </select>

                {voucherEvent === 'Lainnya' && (
                  <input
                    type="text"
                    value={customEvent}
                    onChange={(e) => setCustomEvent(e.target.value)}
                    placeholder="Masukkan nama event khusus (contoh: Grand Opening)"
                    className="mt-2 w-full px-4 py-2 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                  />
                )}
              </div>

              {/* 5. JADWAL HARI AKTIF (HANYA HARI TERTENTU) */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="block font-bold text-[#25160e] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#934b19]" />
                    <span>Jadwal Hari Aktif Voucher</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-normal">Otomatis Aktif</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setValidDays('Semua Hari')}
                    className={`p-2 rounded-2xl border text-center transition-all ${
                      validDays === 'Semua Hari'
                        ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-xs">Semua Hari</div>
                    <div className="text-[9px] text-stone-500">Senin - Minggu</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidDays('Weekend')}
                    className={`p-2 rounded-2xl border text-center transition-all ${
                      validDays === 'Weekend'
                        ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-900">Weekend Only</div>
                    <div className="text-[9px] text-amber-700">Sabtu & Minggu</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidDays('Weekdays')}
                    className={`p-2 rounded-2xl border text-center transition-all ${
                      validDays === 'Weekdays'
                        ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-xs">Hari Kerja</div>
                    <div className="text-[9px] text-stone-500">Senin - Jumat</div>
                  </button>
                </div>
              </div>

              {/* 6. AUTO-RESET KUOTA MINGGUAN (TETAPKAN KUOTA & RESET TIAP MINGGU) */}
              {voucherEvent !== 'Pelanggan Baru' && (
                <div className="pt-2 border-t border-stone-100">
                  <label className="flex items-start gap-2.5 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl cursor-pointer hover:bg-amber-100/60 transition-all">
                    <input
                      type="checkbox"
                      checked={autoResetWeekly || validDays === 'Weekend' || voucherEvent === 'Promo Akhir Pekan'}
                      onChange={(e) => setAutoResetWeekly(e.target.checked)}
                      className="mt-0.5 rounded border-amber-400 text-[#934b19] focus:ring-[#934b19]"
                    />
                    <div>
                      <span className="font-bold text-[#25160e] flex items-center gap-1 text-xs">
                        <RefreshCw className="w-3.5 h-3.5 text-[#934b19]" />
                        Auto-Reset Kuota Pengguna Setiap Minggu Baru
                      </span>
                      <p className="text-[10px] text-amber-900 font-light mt-0.5 leading-relaxed">
                        Jika kuota penggunaan habis (misal di akhir pekan), kuota voucher akan <strong>otomatis di-reset kembali ke 0</strong> saat minggu/weekend berikutnya dimulai.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* HIGHLIGHT NOTIFIKASI JIKA PELANGGAN BARU */}
              {voucherEvent === 'Pelanggan Baru' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Promo Pelanggan Baru Terpilih!</span>
                  </div>
                  <p className="text-amber-800/90 leading-relaxed font-light">
                    Sesuai kebijakan toko, promo khusus pelanggan baru <strong>aktif selamanya</strong> tanpa tanggal kedaluwarsa dan berlaku <strong>1x penggunaan per akun pengguna baru</strong>.
                  </p>
                </div>
              )}

              {/* 7. TANGGAL KEDALUWARSA / MASA BERLAKU */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="block font-bold text-[#25160e] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#934b19]" />
                  <span>Tanggal / Masa Berlaku Voucher</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExpiryType('selamanya')}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      expiryType === 'selamanya'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Aktif Selamanya</div>
                      <div className="text-[10px] text-emerald-700 font-normal">Tanpa kedaluwarsa</div>
                    </div>
                    {expiryType === 'selamanya' && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setExpiryType('date')}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      expiryType === 'date'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Pilih Tanggal</div>
                      <div className="text-[10px] text-stone-500 font-normal">Set kedaluwarsa</div>
                    </div>
                    {expiryType === 'date' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                </div>

                {expiryType === 'date' && (
                  <div className="pt-1">
                    <input
                      type="date"
                      value={voucherExpiryDate}
                      onChange={(e) => setVoucherExpiryDate(e.target.value)}
                      className="w-full px-4 py-2 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                      required
                    />
                  </div>
                )}
              </div>

              {/* 8. BATAS PENGGUNAAN VOUCHER */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="block font-bold text-[#25160e] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#934b19]" />
                  <span>Batas Pengguna Voucher (Kuota)</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLimitType('unlimited')}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      limitType === 'unlimited'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{voucherEvent === 'Pelanggan Baru' ? '1x Per Pengguna Baru' : 'Tanpa Batasan'}</div>
                      <div className="text-[10px] text-emerald-700 font-normal">{voucherEvent === 'Pelanggan Baru' ? 'Max 1x Per Akun' : 'Unlimited pengguna'}</div>
                    </div>
                    {limitType === 'unlimited' && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLimitType('limited')}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      limitType === 'limited'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Batasi Kuota</div>
                      <div className="text-[10px] text-stone-500 font-normal">Set maksimal klaim</div>
                    </div>
                    {limitType === 'limited' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                </div>

                {limitType === 'limited' && (
                  <div className="pt-1">
                    <input
                      type="number"
                      value={voucherMaxUsers}
                      onChange={(e) => setVoucherMaxUsers(e.target.value)}
                      placeholder="contoh: 500"
                      className="w-full px-4 py-2 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
                      required
                    />
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4f4540] text-xs font-semibold rounded-2xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                >
                  {editingVoucher ? 'PERBARUI VOUCHER' : 'SIMPAN VOUCHER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DAFTAR PENGGUNA VOUCHER PROMO (UNTUK OWNER & ADMIN) */}
      {showUsageModal && selectedVoucherForUsage && (() => {
        const targetVoucherOrders = (orders || []).filter(o => 
          (o.voucherCode && o.voucherCode.toUpperCase().includes(selectedVoucherForUsage.code.toUpperCase())) ||
          (o.appliedPromo && o.appliedPromo.toUpperCase().includes(selectedVoucherForUsage.code.toUpperCase()))
        );

        const totalDiscountGiven = targetVoucherOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
        const totalNetSales = targetVoucherOrders.reduce((sum, o) => sum + (o.total || 0), 0);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160e]/60 backdrop-blur-md animate-fade-in print:hidden overflow-y-auto">
            <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-amber-900/15 max-h-[90vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-start sm:items-center justify-between border-b border-stone-100 pb-4 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                      {selectedVoucherForUsage.code}
                    </span>
                    <span className="text-[10px] font-bold bg-[#934b19] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Diskon {selectedVoucherForUsage.discountPercent}%
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      • {selectedVoucherForUsage.event || 'Promo Spesial'}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#25160e]">
                    Riwayat Pengguna Promo: {selectedVoucherForUsage.name}
                  </h3>
                  <p className="text-xs text-[#4f4540]">
                    Laporan transaksi &amp; daftar pelanggan yang telah mengklaim dan berbelanja menggunakan voucher ini.
                  </p>
                </div>
                <button 
                  onClick={() => setShowUsageModal(false)} 
                  className="text-stone-400 hover:text-[#25160e] p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 3 KPI SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-[#fbf9f5] border border-amber-900/15 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-[#4f4540] uppercase tracking-wider block flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#934b19]" />
                    Total Penggunaan
                  </span>
                  <div className="font-serif text-xl font-bold text-[#25160e]">
                    {targetVoucherOrders.length} Transaksi
                  </div>
                  <span className="text-[10px] text-stone-500 block">Klaim belanja berhasil</span>
                </div>

                <div className="bg-amber-50/80 border border-amber-300/60 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-[#934b19]" />
                    Total Potongan Diberikan
                  </span>
                  <div className="font-serif text-xl font-bold text-[#934b19]">
                    Rp {totalDiscountGiven.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold block">Total subsidi diskon toko</span>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-300/60 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                    Omzet Penjualan Bersih
                  </span>
                  <div className="font-serif text-xl font-bold text-emerald-950">
                    Rp {totalNetSales.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-emerald-800 font-semibold block">Pendapatan masuk toko</span>
                </div>
              </div>

              {/* DAFTAR TRANSAKSI PELANGGAN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#25160e] uppercase tracking-wider flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-[#934b19]" />
                    Rincian Transaksi Pengguna ({targetVoucherOrders.length})
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    *Tercatat realtime dari pesanan pelanggan
                  </span>
                </div>

                {targetVoucherOrders.length === 0 ? (
                  <div className="py-12 px-4 text-center bg-[#fbf9f5] rounded-2xl border border-dashed border-amber-900/20 space-y-2">
                    <Users className="w-10 h-10 text-stone-300 mx-auto" />
                    <h5 className="font-serif font-bold text-sm text-[#25160e]">Belum Ada Pengguna</h5>
                    <p className="text-xs text-[#4f4540] max-w-md mx-auto font-light">
                      Voucher <strong>{selectedVoucherForUsage.code}</strong> belum digunakan oleh pelanggan. Begitu ada pesanan masuk yang menggunakan kode ini, rincian pembeli akan otomatis muncul di sini.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {targetVoucherOrders.map((ord) => (
                      <div 
                        key={ord.id}
                        className="p-4 bg-[#fbf9f5] border border-amber-900/10 rounded-2xl hover:border-amber-900/30 transition-all space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/10 pb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#25160e] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {ord.avatar ? (
                                <img src={ord.avatar} alt={ord.customerName} className="w-full h-full object-cover" />
                              ) : (
                                ord.customerName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#25160e]">{ord.customerName}</span>
                                <span className="font-mono text-[10px] font-bold text-[#934b19] bg-amber-100 px-2 py-0.2 rounded-md">
                                  #{ord.id}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-500">
                                {ord.date || 'Waktu Pesanan'} {ord.customerEmail ? `• ${ord.customerEmail}` : ''} {ord.phone ? `• ${ord.phone}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                            <span className="font-serif text-sm font-bold text-[#25160e]">
                              Rp {ord.total.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              Diskon: -Rp {(ord.discount || 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* Menu Dipesan & Metode Bayar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-stone-500 font-medium">Menu:</span>
                            {(ord.items || []).map((it, idx) => (
                              <span key={idx} className="bg-white border border-stone-200 px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#25160e]">
                                {it.quantity}x {it.name}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] bg-[#25160e] text-amber-200 px-2.5 py-0.5 rounded-full font-bold uppercase">
                              {ord.status}
                            </span>
                            <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-medium">
                              {ord.paymentMethod?.toLowerCase().includes('cod') ? 'COD (Tunai)' : 'Online Midtrans'}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-stone-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUsageModal(false)}
                  className="px-5 py-2.5 bg-[#25160e] hover:bg-[#3c2a21] text-white text-xs font-bold rounded-2xl shadow transition-all cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
