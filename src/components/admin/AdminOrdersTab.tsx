import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { AdminOrder, useData } from '@/context/DataContext';

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
  const { isHighDemand, highDemandMessage, toggleHighDemand, uploadOrderProofPhoto } = useData();
  const [selectedProofPhoto, setSelectedProofPhoto] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PENDING' | 'COOKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [orderDateRangeFilter, setOrderDateRangeFilter] = useState<'all' | 'today' | '7days' | 'thisMonth'>('all');
  const [demandMsgInput, setDemandMsgInput] = useState(highDemandMessage);
  const [saveDemandSuccess, setSaveDemandSuccess] = useState(false);

  useEffect(() => {
    setDemandMsgInput(highDemandMessage);
  }, [highDemandMessage]);

  const handleSaveHighDemand = (e: React.FormEvent) => {
    e.preventDefault();
    toggleHighDemand(isHighDemand, demandMsgInput.trim());
    setSaveDemandSuccess(true);
    setTimeout(() => setSaveDemandSuccess(false), 2500);
  };

  const realOrders = orderList || [];

  const pendingOrdersCount = realOrders.filter(o => o.status === 'PENDING' || o.status === 'RECEIVED').length;
  const inDeliveryOrdersCount = realOrders.filter(o => o.status === 'COOKING' || o.status === 'READY' || o.status === 'SHIPPING' || o.status === 'DELIVERING').length;
  const completedTodayOrdersCount = realOrders.filter(o => o.status === 'COMPLETED').length;

  const filteredOrders = React.useMemo(() => {
    return realOrders.filter((ord) => {
      if (orderStatusFilter !== 'ALL' && ord.status !== orderStatusFilter) {
        return false;
      }
      if (productSearch.trim()) {
        const query = productSearch.toLowerCase();
        const matchName = ord.customerName?.toLowerCase().includes(query);
        const matchId = ord.id?.toLowerCase().includes(query);
        const matchItem = ord.items?.some(i => i.name.toLowerCase().includes(query));
        if (!matchName && !matchId && !matchItem) return false;
      }
      return true;
    });
  }, [realOrders, orderStatusFilter, productSearch]);

  return (
    <div className="space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#25160e]">Kelola Pesanan Masuk (Orders Desk)</h1>
          <p className="text-xs text-[#4f4540]">Pantau alur status pesanan 5-tahap dan metode pembayaran secara real-time.</p>
        </div>
      </div>

      {/* SEKSI KONTROL PENGUMUMAN RESTO MEMBLUDAK (LONJAKAN PESANAN) */}
      <div className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isHighDemand ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-100 text-stone-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#25160e] flex items-center gap-2 flex-wrap">
                <span>Pengumuman Resto Membludak / Lonjakan Pesanan</span>
                {isHighDemand ? (
                  <span className="px-2.5 py-0.5 bg-amber-600 text-white rounded-full text-[10px] font-bold animate-pulse">
                    🔴 AKTIF DI TAMPILAN USER
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-stone-200 text-stone-700 rounded-full text-[10px] font-bold">
                    ⚪ NON-AKTIF (NORMAL)
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#4f4540] mt-0.5">
                Aktifkan pengumuman ini untuk memberi tahu pelanggan jika antrean resto sedang ramai/melonjak.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleHighDemand(!isHighDemand, demandMsgInput)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0 ${
              isHighDemand
                ? 'bg-amber-700 hover:bg-amber-800 text-white'
                : 'bg-[#25160e] hover:bg-[#3c2a21] text-amber-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{isHighDemand ? 'Matikan Pengumuman' : 'Aktifkan Pengumuman Membludak'}</span>
          </button>
        </div>

        {/* CUSTOM MESSAGE FORM */}
        <form onSubmit={handleSaveHighDemand} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-[#25160e] mb-1">
              Pesan Pengumuman Lonjakan Pesanan untuk Pelanggan:
            </label>
            <textarea
              value={demandMsgInput}
              onChange={(e) => setDemandMsgInput(e.target.value)}
              rows={2}
              placeholder="Ketik pesan pemberitahuan untuk pelanggan saat resto ramai..."
              className="w-full px-4 py-2.5 bg-[#fbf9f5] border border-amber-900/15 rounded-2xl text-xs text-[#25160e] focus:outline-none focus:ring-2 focus:ring-[#934b19]/30"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-[11px] text-[#4f4540] italic">
              *Teks ini akan otomatis tampil di halaman Profil & Tracker Pelanggan jika status pengumuman di atas diaktifkan.
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {saveDemandSuccess && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Pesan Tersimpan!
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow transition-all"
              >
                Simpan Pesan
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 4 TOP KPI BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#4f4540]">Total Order</span>
            <h3 className="font-serif text-2xl font-bold text-[#25160e] mt-1">{realOrders.length} Pesanan</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#25160e] text-white flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5 text-amber-300" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700">Pending & Masuk</span>
            <h3 className="font-serif text-2xl font-bold text-amber-700 mt-1">{pendingOrdersCount} Pesanan</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 text-amber-700" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#934b19]">In Delivery (Proses)</span>
            <h3 className="font-serif text-2xl font-bold text-[#934b19] mt-1">{inDeliveryOrdersCount} Pesanan</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#934b19] text-white flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700">Completed Today</span>
            <h3 className="font-serif text-2xl font-bold text-emerald-700 mt-1">{completedTodayOrdersCount} Selesai</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-[#25160e] flex items-center gap-1.5 shrink-0 pr-2">
            <Filter className="w-4 h-4 text-[#934b19]" />
            <span>Status:</span>
          </span>
          {['ALL', 'PENDING', 'COOKING', 'SHIPPING', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setOrderStatusFilter(st as any)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                orderStatusFilter === st
                  ? 'bg-[#25160e] text-white shadow-md'
                  : 'bg-[#fbf9f5] border border-amber-900/15 text-[#4f4540] hover:bg-stone-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* DATE RANGE PICKER SELECT */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-[#934b19]" />
          <select
            value={orderDateRangeFilter}
            onChange={(e) => setOrderDateRangeFilter(e.target.value as any)}
            className="bg-[#fbf9f5] border border-amber-900/15 rounded-2xl px-4 py-2 text-xs font-bold text-[#25160e] outline-none"
          >
            <option value="all">Rentang Waktu: Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="thisMonth">Bulan Ini</option>
          </select>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-4">
        {filteredOrders.map((ord) => (
          <div key={ord.id} className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#934b19]">ID: #{ord.id}</span>
                  <span className="text-xs text-[#4f4540]">• {ord.date}</span>
                </div>
                <h3 className="font-bold text-sm text-[#25160e]">{ord.customerName} ({ord.phone || '08123456789'})</h3>
                <p className="text-xs text-[#4f4540] font-light truncate max-w-lg">{ord.address}</p>
              </div>
              <div className="text-right">
                <span className="font-serif text-lg font-bold text-[#25160e]">Rp {ord.total.toLocaleString('id-ID')}</span>
                <div className="mt-1 flex items-center gap-1.5 justify-end">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                    {ord.paymentMethod} ({ord.paymentBadge})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto py-1">
              {ord.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#fbf9f5] px-3 py-1.5 rounded-xl border border-amber-900/10 shrink-0">
                  <span className="text-xs font-bold text-[#25160e]">{it.quantity}x</span>
                  <span className="text-xs text-[#4f4540] font-medium">{it.name}</span>
                </div>
              ))}
            </div>

            {/* SEKSI BUKTI FOTO PENERIMAAN UNTUK ADMIN */}
            <div className="p-3.5 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#25160E] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#934B19]" />
                  Bukti Foto Penerimaan Pesanan
                </span>

                {ord.proofPhoto ? (
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Foto Terverifikasi
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-stone-200 text-stone-700 text-[10px] font-medium rounded-full border border-stone-300">
                    Belum Ada Foto
                  </span>
                )}
              </div>

              {ord.proofPhoto ? (
                <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-amber-900/10 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setSelectedProofPhoto(ord.proofPhoto!)}
                      className="w-14 h-14 rounded-xl overflow-hidden border border-amber-900/20 shadow-xs shrink-0 bg-stone-900 cursor-pointer group relative"
                      title="Klik untuk Perbesar Foto"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ord.proofPhoto} alt="Bukti Foto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#25160E] block">Foto Penerimaan #{ord.id}</span>
                      <span className="text-[11px] text-[#4F4540]">Klik foto untuk memperbesar / zoom</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProofPhoto(ord.proofPhoto!)}
                      className="px-3 py-1.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Foto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#4F4540] italic pt-1">
                  <span>Pelanggan belum mengunggah foto bukti penerimaan hidangan.</span>
                  <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[#25160E] font-bold text-[11px] rounded-xl cursor-pointer shrink-0 border border-stone-200 transition-all flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5 text-[#934B19]" />
                    <span>Upload Foto Bukti (Admin)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            uploadOrderProofPhoto(ord.id, reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#25160e]">Status Alur Realtime:</span>
                <span className="px-3 py-1 bg-[#25160e] text-amber-200 text-xs font-bold rounded-full uppercase">
                  {ord.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateOrderStatus(ord.id, 'COOKING')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl"
                >
                  Set Dimasak
                </button>
                <button
                  onClick={() => updateOrderStatus(ord.id, 'DELIVERING')}
                  className="px-3 py-1.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-bold rounded-xl"
                >
                  Set Diantar
                </button>
                <button
                  onClick={() => updateOrderStatus(ord.id, 'COMPLETED')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  Set Selesai
                </button>
                <button
                  onClick={onPrintPDF}
                  className="p-2 bg-stone-100 hover:bg-stone-200 text-[#25160e] rounded-xl"
                  title="Cetak Resi Pesanan"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL ZOOM FULL-SCREEN BUKTI FOTO UNTUK ADMIN */}
      {selectedProofPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" 
          onClick={() => setSelectedProofPhoto(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-[#25160E] rounded-3xl overflow-hidden shadow-2xl border border-amber-900/40" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#1e110a] flex items-center justify-between border-b border-amber-900/30">
              <span className="font-serif text-sm font-bold text-amber-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                Bukti Foto Penerimaan Pesanan Pelanggan (Ukuran Penuh)
              </span>
              <button 
                onClick={() => setSelectedProofPhoto(null)} 
                className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedProofPhoto} 
                alt="Bukti Foto Full Size" 
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg" 
              />
            </div>

            <div className="p-4 bg-[#1e110a] border-t border-amber-900/30 flex justify-between items-center text-xs text-amber-200/80">
              <span>Terverifikasi & Dikonfirmasi oleh Pelanggan</span>
              <a 
                href={selectedProofPhoto} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#934B19] hover:bg-[#783603] text-white font-bold rounded-xl flex items-center gap-1.5 shadow transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Tab Baru</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
