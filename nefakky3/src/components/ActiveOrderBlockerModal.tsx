'use client';

/**
 * ============================================================================
 * KOMPONEN: Modal Peringatan Pesanan Masih Berjalan (ActiveOrderBlockerModal.tsx)
 * DESKRIPSI: Modal pop-up editorial mewah yang memberi tahu pengguna bahwa mereka
 *            masih memiliki pesanan aktif yang sedang diproses/dikirim.
 *            Pembelian baru diblokir sampai pesanan aktif saat ini selesai.
 * ============================================================================
 */

// Mengimpor React
import React from 'react';
// Mengimpor hook navigasi Next.js
import { useRouter } from 'next/navigation';
// Mengimpor ikon-ikon modern dan relevan dari Lucide React
import { 
  Clock, 
  CookingPot, 
  Truck, 
  ArrowRight, 
  X, 
  CheckCircle2
} from 'lucide-react';
// Mengimpor tipe data pesanan AdminOrder dari DataContext
import { AdminOrder } from '@/context/DataContext';

/**
 * Interface properti untuk komponen ActiveOrderBlockerModal
 */
interface ActiveOrderBlockerModalProps {
  isOpen: boolean; // Menandakan apakah modal sedang terbuka
  onClose: () => void; // Fungsi untuk menutup modal
  activeOrder: AdminOrder | null; // Objek data pesanan aktif milik pengguna
  customTitle?: string; // Judul kustom (opsional)
  customMessage?: string; // Pesan deskripsi kustom (opsional)
}

/**
 * Komponen Utama ActiveOrderBlockerModal
 */
export default function ActiveOrderBlockerModal({
  isOpen,
  onClose,
  activeOrder,
  customTitle,
  customMessage
}: ActiveOrderBlockerModalProps) {
  // Inisialisasi router navigasi Next.js
  const router = useRouter();

  // Jika modal ditutup atau tidak ada pesanan aktif, jangan render apapun
  if (!isOpen || !activeOrder) return null;

  /**
   * Fungsi Helper: Memetakan status pesanan ke label teks, ikon, dan palet warna
   */
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'CONFIRMED':
        return {
          label: 'Pesanan Diterima & Dikonfirmasi',
          icon: Clock,
          color: 'text-amber-700 bg-amber-100 border-amber-200'
        };
      case 'COOKING':
      case 'ON_PROCESS':
        return {
          label: 'Sedang Dimasak di Dapur',
          icon: CookingPot,
          color: 'text-orange-700 bg-orange-100 border-orange-200'
        };
      case 'READY':
        return {
          label: 'Hidangan Siap Diantar',
          icon: CheckCircle2,
          color: 'text-blue-700 bg-blue-100 border-blue-200'
        };
      case 'DELIVERING':
      case 'ON_DELIVERY':
      case 'SHIPPING':
        return {
          label: 'Kurir Sedang Mengantar ke Lokasi',
          icon: Truck,
          color: 'text-emerald-700 bg-emerald-100 border-emerald-200'
        };
      default:
        return {
          label: 'Dalam Pemrosesan',
          icon: Clock,
          color: 'text-stone-700 bg-stone-100 border-stone-200'
        };
    }
  };

  // Mengambil informasi status dari pesanan aktif
  const statusInfo = getStatusInfo(activeOrder.status);
  const StatusIcon = statusInfo.icon;

  return (
    // Backdrop overlay gelap dengan efek blur
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      {/* Kontainer modal */}
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 text-left space-y-6 relative overflow-hidden">
        
        {/* Garis aksen dekoratif atas */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#25160E] to-amber-600" />

        {/* Baris Atas: Ikon Jam Berkedip + Tombol Tutup Silang */}
        <div className="flex items-start justify-between">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 shadow-xs">
            <Clock className="w-7 h-7 animate-pulse" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-black hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Judul & Penjelasan Aturan Pesanan Aktif */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md inline-block">
            PESANAN MASIH DALAM PROSES
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
            {customTitle || 'Selesaikan Pesanan Aktif Anda Terlebih Dahulu'}
          </h3>
          <p className="text-xs text-stone-600 font-light leading-relaxed">
            {customMessage || (
              <>
                Akun Anda saat ini masih memiliki transaksi pesanan yang sedang berjalan (<strong>#{activeOrder.id}</strong>). 
                Demi memastikan kualitas hidangan dan pengantaran tetap optimal, Anda baru dapat melakukan transaksi baru setelah pesanan saat ini sampai dan dikonfirmasi selesai.
              </>
            )}
          </p>
        </div>

        {/* Kartu Ringkasan Pesanan yang Sedang Aktif */}
        <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-xs text-[#25160E]">
              #{activeOrder.id}
            </span>
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${statusInfo.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusInfo.label}</span>
            </div>
          </div>

          {/* Ringkasan Item Menu yang Dipesan */}
          {activeOrder.items && activeOrder.items.length > 0 && (
            <div className="text-xs text-stone-600 border-t border-stone-200/70 pt-2.5 space-y-1">
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">Menu Dipesan:</span>
              <p className="font-medium text-stone-800 line-clamp-2 text-xs">
                {activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(' • ')}
              </p>
            </div>
          )}

          {/* Ringkasan Total Biaya Transaksi */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/70 text-stone-500">
            <span>Total Transaksi:</span>
            <span className="font-serif font-bold text-sm text-[#25160E]">
              Rp {(activeOrder.total || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Tombol Aksi Pelacakan & Tutup */}
        <div className="space-y-2.5 pt-1">
          {/* Tombol Utama: Arahkan ke Halaman Pelacakan & Notifikasi */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/notifications');
            }}
            className="w-full py-3.5 px-6 bg-[#25160E] hover:bg-black text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99]"
          >
            <span>Lacak & Selesaikan Pesanan Ini</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          {/* Tombol Sekunder: Tutup Modal */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-6 bg-transparent border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-medium text-xs transition-colors cursor-pointer"
          >
            Kembali Nanti
          </button>
        </div>

      </div>
    </div>
  );
}
