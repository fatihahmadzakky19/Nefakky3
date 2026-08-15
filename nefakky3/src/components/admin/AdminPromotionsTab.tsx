import React, { useState } from 'react';
import { Plus, X, Trash2, RotateCcw, Tag, AlertTriangle, Calendar, Users, Sparkles, Check, Gift, Edit3, RefreshCw, Clock } from 'lucide-react';
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
  const { softDeleteVoucher, restoreVoucher, forceDeleteVoucher, updateVoucher } = useData();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucher | null>(null);
  
  // State Form Voucher
  const [voucherCode, setVoucherCode] = useState<string>(initialVoucherCode);
  const [voucherName, setVoucherName] = useState<string>(initialVoucherName);
  const [voucherDiscount, setVoucherDiscount] = useState<string>('30');
  const [voucherMinSpend, setVoucherMinSpend] = useState<string>('50000');
  
  // Custom Fields: Event, Hari Berlaku, Auto-Reset Mingguan, Tanggal Kedaluwarsa, & Batas Pengguna
  const [voucherEvent, setVoucherEvent] = useState<string>('Pelanggan Baru');
  const [customEvent, setCustomEvent] = useState<string>('');
  const [validDays, setValidDays] = useState<string>('Semua Hari');
  const [autoResetWeekly, setAutoResetWeekly] = useState<boolean>(true);
  const [expiryType, setExpiryType] = useState<'selamanya' | 'date'>('selamanya');
  const [voucherExpiryDate, setVoucherExpiryDate] = useState<string>('2026-12-31');
  const [limitType, setLimitType] = useState<'unlimited' | 'limited'>('unlimited');
  const [voucherMaxUsers, setVoucherMaxUsers] = useState<string>('500');

  const activeVouchers = (voucherList || []).filter(v => !v.isDeleted);
  const trashedVouchers = (voucherList || []).filter(v => v.isDeleted);
  const displayedVouchers = viewMode === 'active' ? activeVouchers : trashedVouchers;

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
    setShowVoucherModal(true);
  };

  // Open Modal untuk Edit Voucher yang Sudah Ada
  const handleOpenEditModal = (voucher: AdminVoucher) => {
    setEditingVoucher(voucher);
    setVoucherCode(voucher.code);
    setVoucherName(voucher.name);
    setVoucherDiscount(String(voucher.discountPercent));
    setVoucherMinSpend(String(voucher.minSpend));

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

    // Jika Promo Pelanggan Baru atau dipilih Selamanya, maka expiry = 'Selamanya'
    const finalExpiry = (isNewCustomer || expiryType === 'selamanya') 
      ? 'Selamanya' 
      : formatDateIndo(voucherExpiryDate);

    // Kuota & Limit
    const maxLimitNum = parseInt(voucherMaxUsers || '500', 10);
    const existingUsed = editingVoucher?.usedCount || 0;
    const finalRedemptions = (isNewCustomer || limitType === 'unlimited') 
      ? 'Tanpa Batas' 
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
      usedCount: existingUsed
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
          <h1 className="font-serif text-3xl font-bold text-[#25160e]">Kelola Voucher & Promosi</h1>
          <p className="text-xs text-[#4f4540]">Terbitkan & edit kode diskon khusus, kelola hari aktif (weekend/weekdays), reset kuota mingguan, dan tempat sampah voucher.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan Voucher Baru</span>
        </button>
      </div>

      {/* FILTER TAB BAR: ACTIVE VS TRASH */}
      <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-amber-900/10 shadow-md">
        <button
          onClick={() => setViewMode('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'active'
              ? 'bg-[#25160e] text-white shadow-sm'
              : 'text-[#4f4540] hover:bg-stone-100'
          }`}
        >
          <Tag className="w-4 h-4 text-amber-400" />
          <span>Voucher Aktif ({activeVouchers.length})</span>
        </button>

        <button
          onClick={() => setViewMode('trash')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            viewMode === 'trash'
              ? 'bg-rose-950 text-rose-200 border border-rose-800/40 shadow-sm'
              : 'text-[#4f4540] hover:bg-stone-100'
          }`}
        >
          <Trash2 className="w-4 h-4 text-rose-500" />
          <span>Tempat Sampah ({trashedVouchers.length})</span>
        </button>
      </div>

      {viewMode === 'trash' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Voucher di Tempat Sampah tidak dapat dipakai pelanggan. Anda dapat <strong>Pulihkan (Restore)</strong> atau <strong>Hapus Permanen (Force Delete)</strong>.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedVouchers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 font-medium bg-white rounded-3xl border border-amber-900/10 p-8">
            {viewMode === 'trash' ? 'Tempat sampah kosong. Belum ada voucher terhapus.' : 'Belum ada voucher aktif.'}
          </div>
        ) : (
          displayedVouchers.map((v) => {
            const isNewCust = v.event === 'Pelanggan Baru' || v.code?.toUpperCase().includes('NEFAKKY10') || v.name?.toLowerCase().includes('pelanggan baru');
            const isPerpetual = v.expiry === 'Selamanya' || isNewCust;
            const isUnlimited = v.redemptions === 'Tanpa Batas' || isNewCust;
            const daysSetting = v.validDays || (v.event === 'Promo Akhir Pekan' || v.code?.toUpperCase().includes('WEEKEND') ? 'Weekend' : 'Semua Hari');
            const isAutoReset = v.autoResetWeekly ?? (daysSetting === 'Weekend' || v.event === 'Promo Akhir Pekan');

            return (
              <div key={v.id} className={`bg-white rounded-3xl p-6 border shadow-xl space-y-4 transition-all duration-200 hover:shadow-2xl ${v.isDeleted ? 'border-rose-200 bg-stone-50/80' : 'border-amber-900/10'}`}>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-lg font-extrabold text-[#934b19] tracking-wider">{v.code}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border ${
                        isNewCust 
                          ? 'bg-amber-100 text-amber-900 border-amber-300/80' 
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}>
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        {v.event || (isNewCust ? 'Pelanggan Baru' : 'Promo Umum')}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-[#25160e] mt-1">{v.name}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                    v.isDeleted
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : v.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {v.isDeleted ? 'Terhapus' : v.status}
                  </span>
                </div>

                {/* DETAILS VOUCHER CARD */}
                <div className="space-y-2 text-xs text-[#4f4540] bg-[#fbf9f5] p-3.5 rounded-2xl border border-amber-900/10">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 font-medium">Diskon:</span>
                    <strong className="text-[#934b19] font-bold text-sm">{v.discountPercent}%</strong>
                  </div>
                  
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
                        Sabtu & Minggu (Weekend)
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
                    {isUnlimited ? (
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

                <div className="pt-2 border-t border-stone-100 flex justify-between items-center gap-2">
                  {v.isDeleted ? (
                    <>
                      <button
                        onClick={() => {
                          restoreVoucher(v.id);
                          alert(`Voucher "${v.code}" berhasil dipulihkan!`);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`PERINGATAN FORCE DELETE!\nHapus voucher "${v.code}" secara PERMANEN? Data yang dihapus tidak dapat dikembalikan.`)) {
                            forceDeleteVoucher(v.id);
                          }
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Permanen</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
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
                          if (confirm(`Pindahkan voucher "${v.code}" ke Tempat Sampah (Soft Delete)?`)) {
                            softDeleteVoucher(v.id);
                          }
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </>
                  )}
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
                  <option value="Pelanggan Baru">🎁 Promo Pelanggan Baru (Aktif Selamanya & Tanpa Batas)</option>
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
                    Sesuai kebijakan toko, promo khusus pelanggan baru <strong>aktif selamanya</strong> tanpa tanggal kedaluwarsa dan <strong>tanpa batasan pengguna (unlimited)</strong>.
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
                      expiryType === 'selamanya' || voucherEvent === 'Pelanggan Baru'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Aktif Selamanya</div>
                      <div className="text-[10px] text-emerald-700 font-normal">Tanpa kedaluwarsa</div>
                    </div>
                    {(expiryType === 'selamanya' || voucherEvent === 'Pelanggan Baru') && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (voucherEvent === 'Pelanggan Baru') {
                        alert('Promo Pelanggan Baru dikhususkan untuk aktif selamanya.');
                        return;
                      }
                      setExpiryType('date');
                    }}
                    disabled={voucherEvent === 'Pelanggan Baru'}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      voucherEvent === 'Pelanggan Baru'
                        ? 'opacity-50 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400'
                        : expiryType === 'date'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Pilih Tanggal</div>
                      <div className="text-[10px] text-stone-500 font-normal">Set kedaluwarsa</div>
                    </div>
                    {expiryType === 'date' && voucherEvent !== 'Pelanggan Baru' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                </div>

                {expiryType === 'date' && voucherEvent !== 'Pelanggan Baru' && (
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
                      limitType === 'unlimited' || voucherEvent === 'Pelanggan Baru'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Tanpa Batasan</div>
                      <div className="text-[10px] text-emerald-700 font-normal">Unlimited pengguna</div>
                    </div>
                    {(limitType === 'unlimited' || voucherEvent === 'Pelanggan Baru') && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (voucherEvent === 'Pelanggan Baru') {
                        alert('Promo Pelanggan Baru dikhususkan tanpa batasan pengguna.');
                        return;
                      }
                      setLimitType('limited');
                    }}
                    disabled={voucherEvent === 'Pelanggan Baru'}
                    className={`p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      voucherEvent === 'Pelanggan Baru'
                        ? 'opacity-50 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400'
                        : limitType === 'limited'
                        ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold shadow-xs'
                        : 'bg-[#fbf9f5] border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs">Batasi Kuota</div>
                      <div className="text-[10px] text-stone-500 font-normal">Set maksimal klaim</div>
                    </div>
                    {limitType === 'limited' && voucherEvent !== 'Pelanggan Baru' && (
                      <Check className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                </div>

                {limitType === 'limited' && voucherEvent !== 'Pelanggan Baru' && (
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
    </div>
  );
}
