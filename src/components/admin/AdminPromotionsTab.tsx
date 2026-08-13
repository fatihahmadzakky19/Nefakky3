'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { AdminVoucher } from '@/context/DataContext';

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
  const [showCreateVoucherModal, setShowCreateVoucherModal] = useState<boolean>(false);
  const [voucherCode, setVoucherCode] = useState<string>(initialVoucherCode);
  const [voucherName, setVoucherName] = useState<string>(initialVoucherName);
  const [voucherDiscount, setVoucherDiscount] = useState<string>('30');
  const [voucherMinSpend, setVoucherMinSpend] = useState<string>('50000');

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
          <p className="text-xs text-[#4f4540]">Terbitkan kode diskon khusus untuk meningkatkan omset pesanan.</p>
        </div>
        <button
          onClick={() => setShowCreateVoucherModal(true)}
          className="px-5 py-3 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan Voucher Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(voucherList || []).map((v) => (
          <div key={v.id} className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-lg font-bold text-[#934b19]">{v.code}</span>
                <h3 className="text-xs font-bold text-[#25160e] mt-0.5">{v.name}</h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
              }`}>
                {v.status}
              </span>
            </div>

            <div className="space-y-1 text-xs text-[#4f4540] font-light">
              <p>Diskon: <strong>{v.discountPercent}%</strong></p>
              <p>Min Spend: <strong>Rp {v.minSpend.toLocaleString('id-ID')}</strong></p>
              <p>Penggunaan: <strong>{v.redemptions || '0/500'}</strong></p>
              <p>Kedaluwarsa: <strong>{v.expiry}</strong></p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
              <button
                onClick={() => toggleVoucherStatus(v.id)}
                className="text-xs font-bold text-[#934b19] hover:underline"
              >
                {v.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button
                onClick={() => deleteVoucher(v.id)}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
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
