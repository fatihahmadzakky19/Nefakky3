'use client';

/**
 * ============================================================================
 * KOMPONEN: RealtimeOrderTracker.tsx (Widget Pelacak Pengiriman 5-Tahap Live)
 * DESKRIPSI: Widget pelacak pesanan makanan realtime dengan progres 5 tahap
 *            (Diterima -> Dimasak -> Siap -> Diantar -> Selesai), estimasi waktu,
 *            dan integrasi konfirmasi penerimaan.
 * TEMA: Nefakky Editorial Culinary
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  PackageCheck, 
  Bike, 
  Check, 
  Truck
} from 'lucide-react';
import { Clock, CheckCircle2, ChefHat } from '@/components/icons/CustomIcons';
import { AdminOrder } from '@/context/DataContext';

interface RealtimeOrderTrackerProps {
  order: AdminOrder;
  onConfirmReceived?: (id: string, proofPhotoUrl?: string) => void;
  isHighDemand?: boolean;
}

export default function RealtimeOrderTracker({
  order,
  onConfirmReceived,
  isHighDemand = false
}: RealtimeOrderTrackerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    return () => clearInterval(interval);
  }, [order.status]);

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

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const getEtaDetails = () => {
    if (isCompleted) {
      return {
        etaText: 'Tiba (0 Menit)',
        title: 'Pesanan Telah Tiba & Selesai',
        desc: 'Pesanan telah sampai di lokasi Anda. Selamat menikmati hidangan otentik Nefakky!',
        badgeBg: 'bg-emerald-700 text-white border-emerald-800',
        percentage: 100
      };
    }

    if (isHighDemand) {
      switch (currentStep) {
        case 1:
          return {
            etaText: '~60 - 90 Menit',
            title: 'Diterima • Antrean Dapur Tinggi',
            desc: 'Dapur dalam pesanan padat. Pesanan Anda berada dalam antrean masak utama.',
            badgeBg: 'bg-[#C2410C] text-white border-[#9A3412]',
            percentage: 20
          };
        case 2:
          return {
            etaText: '~45 - 60 Menit',
            title: 'Sedang Dimasak oleh Koki Dapur',
            desc: 'Bumbu rempah otentik sedang diolah bersama bahan segar Anda.',
            badgeBg: 'bg-[#C2410C] text-white border-[#9A3412]',
            percentage: 40
          };
        case 3:
          return {
            etaText: '~25 - 45 Menit',
            title: 'Selesai Dimasak & Dikemas',
            desc: 'Hidangan selesai dimasak dan dikemas higienis, menunggu pengantaran kurir.',
            badgeBg: 'bg-stone-800 text-stone-100 border-stone-700',
            percentage: 60
          };
        case 4:
          return {
            etaText: '~10 - 25 Menit',
            title: 'Kurir Dalam Perjalanan',
            desc: 'Kurir sedang meluncur mengantarkan hidangan hangat ke alamat pengiriman.',
            badgeBg: 'bg-[#C2410C] text-white border-[#9A3412]',
            percentage: 80
          };
        default:
          return {
            etaText: '0 Menit',
            title: 'Pesanan Selesai',
            desc: 'Pesanan telah diterima.',
            badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            percentage: 100
          };
      }
    } else {
      switch (currentStep) {
        case 1:
          return {
            etaText: '~45 - 60 Menit',
            title: 'Pesanan Diterima Dapur',
            desc: 'Pesanan sudah masuk dan diverifikasi oleh tim dapur Nefakky.',
            badgeBg: 'bg-stone-800 text-stone-100 border-stone-700',
            percentage: 20
          };
        case 2:
          return {
            etaText: '~30 - 45 Menit',
            title: 'Sedang Dimasak Koki',
            desc: 'Tim dapur sedang mengolah hidangan Anda dengan bumbu rempah pilihan.',
            badgeBg: 'bg-[#C2410C] text-white border-[#9A3412]',
            percentage: 40
          };
        case 3:
          return {
            etaText: '~15 - 30 Menit',
            title: 'Pesanan Siap & Dikemas',
            desc: 'Makanan telah selesai dimasak & dikemas rapi siap dijemput kurir.',
            badgeBg: 'bg-stone-800 text-stone-100 border-stone-700',
            percentage: 60
          };
        case 4:
          return {
            etaText: '~5 - 15 Menit',
            title: 'Kurir Sedang Mengantar',
            desc: 'Kurir kami sedang membawa hidangan hangat langsung ke alamat Anda.',
            badgeBg: 'bg-[#C2410C] text-white border-[#9A3412]',
            percentage: 80
          };
        default:
          return {
            etaText: 'Tiba (0 Menit)',
            title: 'Pesanan Selesai',
            desc: 'Pesanan telah sampai di tujuan. Selamat menikmati!',
            badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
    <div className="space-y-4 text-left font-sans">
      {/* 1. STATUS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm text-stone-900">
              ID: #{order.id.slice(-6).toUpperCase()}
            </span>
            <span className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
              {order.paymentMethod?.toUpperCase() || 'ONLINE'}
            </span>
          </div>
          <span className="text-[11px] text-stone-500 block mt-0.5">
            Waktu Pesan: {order.date || 'Hari ini'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded uppercase tracking-wider ${
            isCompleted 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-[#C2410C] text-white'
          }`}>
            {isCompleted ? 'Selesai' : 'Dalam Proses'}
          </span>
        </div>
      </div>

      {/* 2. REALTIME MONITOR BANNER */}
      <div className="space-y-3 bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200 shadow-subtle">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-[#C2410C]'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isCompleted ? 'bg-emerald-600' : 'bg-[#C2410C]'}`} />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500">
                Pelacakan Langsung • Sinkronisasi: {lastSyncTime}
              </span>
            </div>

            <h4 className="font-semibold text-xs text-stone-900 flex items-center gap-1.5">
              <span>{eta.title}</span>
            </h4>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              {eta.desc}
            </p>
          </div>

          <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0 flex flex-col items-start sm:items-end gap-0.5 shadow-subtle ${eta.badgeBg}`}>
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

        {/* 3. DYNAMIC PROGRESS BAR & STEPS */}
        <div className="space-y-2 pt-1">
          
          <div className="relative h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#C2410C] transition-all duration-500 ease-out"
              style={{ width: `${eta.percentage}%` }}
            />
          </div>

          {/* 5 Step Badges Grid */}
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 text-center pt-1.5">
            {STEPS.map((st) => {
              const isCurrent = currentStep === st.num;
              const isPassed = currentStep > st.num;

              let styleClasses = 'bg-white text-stone-400 border-stone-200';
              if (isCurrent) {
                styleClasses = isCompleted 
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-subtle'
                  : 'bg-[#C2410C] text-white border-[#9A3412] shadow-subtle';
              } else if (isPassed) {
                styleClasses = 'bg-stone-900 text-white border-stone-900';
              }

              const Icon = st.icon;

              return (
                <div 
                  key={st.num}
                  className={`p-1.5 sm:p-2 rounded-lg text-[8px] sm:text-[9px] font-medium flex flex-col items-center gap-0.5 border transition-colors ${styleClasses}`}
                >
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    {isPassed ? (
                      <Check className="w-2.5 h-2.5 shrink-0 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-2.5 h-2.5 shrink-0" />
                    )}
                    <span>{st.label}</span>
                  </div>
                  <span className="text-[7px] sm:text-[8px] opacity-80">{st.sub}</span>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 4. INFORMASI PENGANTARAN */}
      {order.proofPhoto && (
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={order.proofPhoto} alt="Bukti Foto" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-semibold text-stone-900 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#C2410C]" />
                Dokumentasi Serah Terima Kurir
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">Tersimpan Resmi &amp; Terverifikasi</span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-medium rounded border border-emerald-200">
            Terverifikasi
          </span>
        </div>
      )}

      {!isCompleted && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <p className="text-[11px] text-stone-500">
            <span className="text-stone-700 font-medium flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
              <span>Pesanan diantar langsung oleh staf/kurir toko kami.</span>
            </span>
          </p>
          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-medium rounded border border-stone-200 shrink-0">
            Kurir Internal
          </span>
        </div>
      )}

    </div>
  );
}
