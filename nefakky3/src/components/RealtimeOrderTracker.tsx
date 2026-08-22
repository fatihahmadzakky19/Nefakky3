'use client';

/**
 * ============================================================================
 * KOMPONEN: RealtimeOrderTracker.tsx (Widget Pelacak Pengiriman 5-Tahap Live)
 * DESKRIPSI: Widget pelacak pesanan makanan realtime dengan visualisasi progres
 *            5 tahap (Diterima -> Dimasak -> Siap -> Diantar -> Selesai),
 *            perhitungan estimasi durasi waktu, deteksi jam sibuk (High Demand),
 *            serta integrasi kamera live bukti foto penerimaan hidangan.
 * ============================================================================
 */

// Mengimpor React dan hooks
import React, { useState, useEffect } from 'react';
// Mengimpor ikon-ikon modern dari Lucide React
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  PackageCheck, 
  Bike, 
  Check, 
  AlertTriangle,
  Sparkles,
  Flame,
  Truck
} from 'lucide-react';
// Mengimpor tipe data pesanan dari DataContext
import { AdminOrder } from '@/context/DataContext';

/** Interface Properti Komponen Pelacak Pesanan Realtime */
interface RealtimeOrderTrackerProps {
  order: AdminOrder; // Objek data transaksi pesanan yang dilacak
  onConfirmReceived?: (id: string, proofPhotoUrl?: string) => void; // Callback konfirmasi penerimaan pesanan (opsional)
  isHighDemand?: boolean; // Indikator jam sibuk pesanan tinggi
}

// Komponen Utama Realtime Order Tracker
export default function RealtimeOrderTracker({
  order,
  onConfirmReceived,
  isHighDemand = false
}: RealtimeOrderTrackerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0); // State timer durasi detik berjalan
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja'); // Teks waktu sinkronisasi terakhir

  // Effect: Timer durasi berjalan setiap detik
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    // Update teks timestamp sinkronisasi saat status pesanan berubah
    setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    return () => clearInterval(interval);
  }, [order.status]);

  // Fungsi mengonversi status teks menjadi indeks numerik 1 sampai 5
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'RECEIVED':
      case 'PENDING':
        return 1;
      case 'COOKING':
        return 2;
      case 'READY':
        return 3;
      case 'SHIPPING':
      case 'DELIVERING':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = getStepIndex(order.status);
  const isCompleted = order.status === 'COMPLETED';

  // Format elapsed time (MM:SS)
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate ETA & Status Details
  const getEtaDetails = () => {
    if (isCompleted) {
      return {
        etaText: 'Tiba (0 Menit)',
        title: 'Pesanan Telah Tiba & Selesai',
        desc: 'Pesanan telah berhasil sampai di lokasi Anda. Selamat menikmati hidangan otentik Nefakky!',
        badgeBg: 'bg-emerald-600 text-white border-emerald-700',
        percentage: 100
      };
    }

    if (isHighDemand) {
      switch (currentStep) {
        case 1:
          return {
            etaText: '~60 - 90 Menit',
            title: 'Diterima • Resto Membludak (Lonjakan Pesanan)',
            desc: 'Dapur dalam antrean tinggi. Pesanan Anda berada dalam antrean masak utama.',
            badgeBg: 'bg-[#934B19] text-white border-amber-900',
            percentage: 20
          };
        case 2:
          return {
            etaText: '~45 - 60 Menit',
            title: 'Sedang Dimasak oleh Koki Dapur',
            desc: 'Bumbu rempah otentik sedang meresap ke dalam olahan sajian segar Anda.',
            badgeBg: 'bg-[#934B19] text-white border-amber-900',
            percentage: 40
          };
        case 3:
          return {
            etaText: '~25 - 45 Menit',
            title: 'Selesai Dimasak & Dikemas',
            desc: 'Hidangan selesai dimasak dan dikemas rapi, menunggu penjemputan oleh kurir.',
            badgeBg: 'bg-[#3C2A21] text-amber-200 border-amber-900/30',
            percentage: 60
          };
        case 4:
          return {
            etaText: '~10 - 25 Menit',
            title: 'Kurir Sedang Meluncur ke Lokasi Anda',
            desc: 'Kurir dalam perjalanan mengantarkan hidangan hangat ke alamat pengiriman.',
            badgeBg: 'bg-[#934B19] text-white border-amber-900 animate-pulse',
            percentage: 80
          };
        default:
          return {
            etaText: '0 Menit',
            title: 'Pesanan Selesai',
            desc: 'Pesanan telah diterima.',
            badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            percentage: 100
          };
      }
    } else {
      switch (currentStep) {
        case 1:
          return {
            etaText: '~45 - 60 Menit',
            title: 'Pesanan Diterima Dapur',
            desc: 'Pesanan sudah masuk dan diverifikasi oleh tim resto Nefakky.',
            badgeBg: 'bg-[#3C2A21] text-amber-200 border-amber-900/20',
            percentage: 20
          };
        case 2:
          return {
            etaText: '~30 - 45 Menit',
            title: 'Sedang Dimasak oleh Koki Dapur',
            desc: 'Tim dapur sedang mengolah hidangan segar Anda dengan bumbu rempah pilihan.',
            badgeBg: 'bg-[#934B19] text-white border-amber-900',
            percentage: 40
          };
        case 3:
          return {
            etaText: '~15 - 30 Menit',
            title: 'Pesanan Siap & Dikemas',
            desc: 'Makanan telah selesai dimasak & dikemas rapi higienis siap diantar.',
            badgeBg: 'bg-[#3C2A21] text-amber-200 border-amber-900/20',
            percentage: 60
          };
        case 4:
          return {
            etaText: '~5 - 15 Menit',
            title: 'Kurir Sedang Di Jalan',
            desc: 'Kurir kami sedang meluncur membawa hidangan hangat ke alamat Anda!',
            badgeBg: 'bg-[#934B19] text-white border-amber-900 animate-pulse',
            percentage: 80
          };
        default:
          return {
            etaText: 'Tiba (0 Menit)',
            title: 'Pesanan Selesai',
            desc: 'Pesanan telah sampai di tujuan. Selamat menikmati!',
            badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            percentage: 100
          };
      }
    }
  };

  const eta = getEtaDetails();

  const STEPS = [
    { num: 1, label: 'Diterima', sub: isHighDemand ? '~60m' : '~45m', icon: Clock },
    { num: 2, label: 'Dimasak', sub: isHighDemand ? '~45m' : '~30m', icon: ChefHat },
    { num: 3, label: 'Siap', sub: isHighDemand ? '~25m' : '~15m', icon: PackageCheck },
    { num: 4, label: 'Diantar', sub: isHighDemand ? '~10m' : '~5m', icon: Bike },
    { num: 5, label: 'Selesai', sub: 'Tiba', icon: CheckCircle2 }
  ];

  return (
    <div className="space-y-4 text-left">
      {/* 1. STATUS HEADER WITH METADATA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm text-neutral-900">
              ID Pesanan: #{order.id.slice(-6).toUpperCase()}
            </span>
            <span className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
              {order.paymentMethod?.toUpperCase() || 'QRIS'}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-light block mt-0.5">
            Dipesan: {order.date || 'Hari ini'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isCompleted 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-[#934B19] text-white border border-amber-900 animate-pulse'
          }`}>
            {isCompleted ? 'SELESAI' : 'PROSES DAHULU'}
          </span>
        </div>
      </div>

      {/* 2. REALTIME MONITOR BANNER WITH LIVE PULSE */}
      <div className="space-y-3 bg-[#FBF9F5] p-3.5 sm:p-5 rounded-2xl border border-amber-900/10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/10 pb-3">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-[#934B19]'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCompleted ? 'bg-emerald-500' : 'bg-[#934B19]'}`} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F4540]">
                LIVE TRACKING REALTIME • Update: {lastSyncTime}
              </span>
            </div>

            <h4 className="font-bold text-xs text-[#25160E] flex items-center gap-1.5">
              <span>{eta.title}</span>
            </h4>
            <p className="text-[11px] text-[#4F4540] font-light leading-relaxed">
              {eta.desc}
            </p>
          </div>

          <div className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold border shrink-0 flex flex-col items-start sm:items-end gap-0.5 shadow-sm ${eta.badgeBg}`}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-current shrink-0" />
              <span>Estimasi: <strong>{eta.etaText}</strong></span>
            </div>
            {!isCompleted && (
              <span className="text-[9px] font-mono opacity-90">
                Durasi: +{timeFormatted}
              </span>
            )}
          </div>
        </div>

        {/* 3. DYNAMIC STEPPER GRAPHIC PROGRESS BAR */}
        <div className="space-y-2 pt-1">
          
          {/* Progress track */}
          <div className="relative h-2 sm:h-2.5 bg-stone-200/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#3C2A21] via-[#934B19] to-emerald-600 transition-all duration-700 ease-out"
              style={{ width: `${eta.percentage}%` }}
            />
            {/* Glowing animated cursor dot */}
            {!isCompleted && (
              <div 
                className="absolute top-0 bottom-0 w-3 bg-white rounded-full shadow-md animate-ping"
                style={{ left: `calc(${eta.percentage}% - 6px)` }}
              />
            )}
          </div>

          {/* 5 Step Badges Grid */}
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 text-center pt-2">
            {STEPS.map((st) => {
              const isCurrent = currentStep === st.num;
              const isPassed = currentStep > st.num;

              let styleClasses = 'bg-[#FBF9F5] text-stone-400 border-amber-900/10';
              if (isCurrent) {
                styleClasses = isCompleted 
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                  : 'bg-[#934B19] text-white border-amber-900 shadow-md ring-2 ring-amber-300 animate-pulse';
              } else if (isPassed) {
                styleClasses = 'bg-emerald-600 text-white border-emerald-700';
              }

              const Icon = st.icon;

              return (
                <div 
                  key={st.num}
                  className={`p-1.5 sm:p-2 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-bold flex flex-col items-center gap-0.5 sm:gap-1 border transition-all ${styleClasses}`}
                >
                  <div className="flex items-center gap-0.5 whitespace-nowrap">
                    {isPassed ? (
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3] shrink-0" />
                    ) : (
                      <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                    )}
                    <span className="hidden xs:inline sm:inline">{st.num}.</span>
                    <span>{st.label}</span>
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-normal opacity-90">{st.sub}</span>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 4. INFORMASI PENGANTARAN & DOKUMENTASI RESMI */}
      {order.proofPhoto && (
        <div className="p-3.5 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-900/20 shadow-sm shrink-0 bg-stone-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.proofPhoto} alt="Bukti Foto" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#25160E] flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#934B19]" />
                Dokumentasi Serah Terima Kurir Toko
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">Tersimpan Resmi &amp; Terverifikasi</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-300">
            Terverifikasi
          </span>
        </div>
      )}

      {!isCompleted && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <p className="text-[11px] text-[#4F4540] font-medium">
            <span className="text-[#934B19] font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#934B19] shrink-0" />
              <span>Pesanan diantar langsung oleh staf/kurir toko kami. Dokumentasi dicatat saat tiba.</span>
            </span>
          </p>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-lg border border-amber-300 shrink-0">
            Kurir Internal
          </span>
        </div>
      )}

    </div>
  );
}
