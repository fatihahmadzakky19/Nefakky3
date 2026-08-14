import React, { useState } from 'react';
import { Plus, X, Trash2, RotateCcw, Tag, AlertTriangle } from 'lucide-react';
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
  const { softDeleteVoucher, restoreVoucher, forceDeleteVoucher } = useData();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [showCreateVoucherModal, setShowCreateVoucherModal] = useState<boolean>(false);
  const [voucherCode, setVoucherCode] = useState<string>(initialVoucherCode);
  const [voucherName, setVoucherName] = useState<string>(initialVoucherName);
  const [voucherDiscount, setVoucherDiscount] = useState<string>('30');
  const [voucherMinSpend, setVoucherMinSpend] = useState<string>('50000');

  const activeVouchers = (voucherList || []).filter(v => !v.isDeleted);
  const trashedVouchers = (voucherList || []).filter(v => v.isDeleted);
  const displayedVouchers = viewMode === 'active' ? activeVouchers : trashedVouchers;

  const handleCreateVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    addVoucher({
      code: voucherCode.trim().toUpperCase(),
      name: voucherName || `Voucher ${voucherDiscount}%`,
      type: 'Percentage',
      discountPercent: parseFloat(voucherDiscount) || 30,
      minSpend: parseFloat(voucherMinSpend) || 50000,
      redemptions: '0/500',
      expiry: '31 Des 2026',
      status: 'Active'
    });
    setShowCreateVoucherModal(false);
    setVoucherCode('');
    setVoucherName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#25160e]">Kelola Voucher & Promosi</h1>
          <p className="text-xs text-[#4f4540]">Terbitkan kode diskon khusus, kelola status promo, dan tempat sampah voucher.</p>
        </div>
        <button
          onClick={() => setShowCreateVoucherModal(true)}
          className="px-5 py-3 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2"
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
          displayedVouchers.map((v) => (
            <div key={v.id} className={`bg-white rounded-3xl p-6 border shadow-xl space-y-4 ${v.isDeleted ? 'border-rose-200 bg-stone-50/80' : 'border-amber-900/10'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-lg font-bold text-[#934b19]">{v.code}</span>
                  <h3 className="text-xs font-bold text-[#25160e] mt-0.5">{v.name}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  v.isDeleted
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                }`}>
                  {v.isDeleted ? 'Terhapus' : v.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-[#4f4540] font-light">
                <p>Diskon: <strong>{v.discountPercent}%</strong></p>
                <p>Min Spend: <strong>Rp {v.minSpend.toLocaleString('id-ID')}</strong></p>
                <p>Penggunaan: <strong>{v.redemptions || '0/500'}</strong></p>
                <p>Kedaluwarsa: <strong>{v.expiry}</strong></p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
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
                    <button
                      onClick={() => toggleVoucherStatus(v.id)}
                      className="text-xs font-bold text-[#934b19] hover:underline"
                    >
                      {v.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Pindahkan voucher "${v.code}" ke Tempat Sampah (Soft Delete)?`)) {
                          softDeleteVoucher(v.id);
                        }
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Sementara</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL TERBITKAN VOUCHER */}
      {showCreateVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160e]/60 backdrop-blur-md animate-fade-in print:hidden">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-amber-900/15">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#25160e]">Terbitkan Voucher Baru</h3>
                <p className="text-[11px] text-[#4f4540]">Buat kode diskon promo khusus untuk pelanggan.</p>
              </div>
              <button onClick={() => setShowCreateVoucherModal(false)} className="text-stone-400 hover:text-[#25160e]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucherSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#25160e] mb-1">Kode Voucher (Kapital) *</label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="contoh: NEFAKKY30"
                  className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl font-mono font-bold text-xs text-[#934b19]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#25160e] mb-1">Nama Deskripsi Promo</label>
                <input
                  type="text"
                  value={voucherName}
                  onChange={(e) => setVoucherName(e.target.value)}
                  placeholder="contoh: Promo Diskon 30% Merdeka"
                  className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#25160e] mb-1">Persen Diskon (%)</label>
                  <input
                    type="number"
                    value={voucherDiscount}
                    onChange={(e) => setVoucherDiscount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#25160e] mb-1">Min Pembelian (Rp)</label>
                  <input
                    type="number"
                    value={voucherMinSpend}
                    onChange={(e) => setVoucherMinSpend(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateVoucherModal(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4f4540] text-xs font-semibold rounded-2xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md uppercase tracking-wider"
                >
                  Simpan Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
