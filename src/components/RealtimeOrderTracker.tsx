'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  PackageCheck, 
  Bike, 
  Check, 
  AlertTriangle,
  Sparkles,
  Flame
} from 'lucide-react';
import { AdminOrder } from '@/context/DataContext';

interface RealtimeOrderTrackerProps {
  order: AdminOrder;
  onConfirmReceived: (id: string) => void;
  isHighDemand?: boolean;
}

export default function RealtimeOrderTracker({
  order,
  onConfirmReceived,
  isHighDemand = false
}: RealtimeOrderTrackerProps) {
  // Live ticking timer for real-time elapsed seconds
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');

  useEffect(() => {
    // Increment timer every second
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    // Update last sync text timestamp
    setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    return () => clearInterval(interval);
  }, [order.status]);

  // Determine numerical step index (1..5)
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
        etaIcon: '🥳',
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
            etaIcon: '⚠️',
            title: 'Diterima • Resto Membludak (Lonjakan Pesanan)',
            desc: 'Dapur dalam antrean tinggi. Pesanan Anda berada dalam antrean masak utama.',
            badgeBg: 'bg-[#934B19] text-white border-amber-900',
            percentage: 20
          };
        case 2:
          return {
            etaText: '~45 - 60 Menit',
            etaIcon: '🍳',
            title: 'Sedang Dimasak oleh Koki Dapur',
            desc: 'Bumbu rempah otentik sedang meresap ke dalam olahan sajian segar Anda.',
            badgeBg: 'bg-[#934B19] text-white border-amber-900',
            percentage: 40
          };
        case 3:
          return {
            etaText: '~25 - 45 Menit',
            etaIcon: '📦',
            title: 'Selesai Dimasak & Dikemas',
            desc: 'Hidangan selesai dimasak dan dikemas rapi, menunggu penjemputan oleh kurir.',
            badgeBg: 'bg-[#3C2A21] text-amber-200 border-amber-900/30',
            percentage: 60
          };
        case 4:
          return {
            etaText: '~10 - 25 Menit',
            etaIcon: '🛵',
            title: 'Kurir Sedang Meluncur ke Lokasi Anda',
            desc: 'Kurir dalam perjalanan mengantarkan hidangan hangat ke alamat pengiriman.',
            badgeBg: 'bg-[#934B19] text-white border-amber-900 animate-pulse',
            percentage: 80
          };
        default:
          return {
            etaText: '0 Menit',
            etaIcon: '🎉',
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
            etaIcon: '📥',
            title: 'Pesanan Diterima Dapur',
            desc: 'Pesanan sudah masuk dan diverifikasi oleh tim resto Nefakky.',
            badgeBg: 'bg-[#3C2A21] text-amber-200 border-amber-900/20',
            percentage: 20
          };
        case 2:
          return {
            etaText: '~30 - 45 Menit',
            etaIcon: '🍳',
            title: 'Sedang Dimasak oleh Koki Dapur',
            desc: 'Tim dapur sedang mengolah hidangan segar Anda dengan bumbu rempah pilihan.',
            badgeBg: 'bg-[#934B19] text-white border-amber-900',
            percentage: 40
          };
        case 3:
          return {
            etaText: '~15 - 30 Menit',
            etaIcon: '📦',
            title: 'Pesanan Siap & Dikemas',
            desc: 'Makanan telah selesai dimasak & dikemas rapi higienis siap diantar.',
            badgeBg: 'bg-[#3C2A21] text-amber-200 border-amber-900/20',
            percentage: 60
          };
        case 4:
          return {
            etaText: '~5 - 15 Menit',
            etaIcon: '🛵',
            title: 'Kurir Sedang Di Jalan',
            desc: 'Kurir kami sedang meluncur membawa hidangan hangat ke alamat Anda!',
            badgeBg: 'bg-[#934B19] text-white border-amber-900 animate-pulse',
            percentage: 80
          };
        default:
          return {
            etaText: 'Tiba (0 Menit)',
            etaIcon: '🎉',
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
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-900/10 shadow-xl shadow-amber-950/5 space-y-5 hover:shadow-2xl transition-all">
      
      {/* 1. TOP HEADER INFO & REALTIME SYNC BADGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3C2A21] text-amber-200 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-900/20 shadow-sm">
            #{order.id.slice(-4)}
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-[#25160E] flex items-center gap-2">
              <span>Pesanan #{order.id}</span>
              <span className="text-[10px] text-[#4F4540] font-normal">• {order.date}</span>
            </h3>
            <p className="text-[11px] text-[#4F4540] font-medium line-clamp-1">
              {order.items.map(i => `${i.name} (${i.quantity}x)`).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
          <div className="text-left sm:text-right">
            <span className="font-serif text-sm font-black text-[#25160E] block">
              Rp {order.total.toLocaleString('id-ID')}
            </span>
            <span className="text-[9px] text-[#4F4540]">
              {order.paymentMethod} • {order.paymentBadge === 'PAID' ? 'LUNAS' : order.paymentBadge}
            </span>
          </div>

          <span className={`px-3.5 py-1 rounded-2xl text-[11px] font-bold shadow-sm shrink-0 ${
            isCompleted 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
              : 'bg-[#934B19] text-white border border-amber-900 animate-pulse'
          }`}>
            {isCompleted ? '✅ SELESAI' : '🔥 PROSES DAHULU'}
          </span>
        </div>
      </div>

      {/* 2. REALTIME MONITOR BANNER WITH LIVE PULSE */}
      <div className="space-y-3 bg-[#FBF9F5] p-4 sm:p-5 rounded-2xl border border-amber-900/10">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/10 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-[#934B19]'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCompleted ? 'bg-emerald-500' : 'bg-[#934B19]'}`} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F4540]">
                🔴 LIVE TRACKING REALTIME • Update: {lastSyncTime}
              </span>
            </div>

            <h4 className="font-bold text-xs text-[#25160E] flex items-center gap-1.5">
              <span>{eta.title}</span>
            </h4>
            <p className="text-[11px] text-[#4F4540] font-light leading-relaxed">
              {eta.desc}
            </p>
          </div>

          <div className={`px-3.5 py-2 rounded-2xl text-xs font-bold border shrink-0 flex flex-col items-end gap-0.5 shadow-sm ${eta.badgeBg}`}>
            <div className="flex items-center gap-1.5">
              <span>{eta.etaIcon}</span>
              <span>Estimasi: <strong>{eta.etaText}</strong></span>
            </div>
            {!isCompleted && (
              <span className="text-[9px] font-mono opacity-90">
                Durasi Berjalan: +{timeFormatted}
              </span>
            )}
          </div>
        </div>

        {/* 3. DYNAMIC STEPPER GRAPHIC PROGRESS BAR */}
        <div className="space-y-2 pt-1">
          
          {/* Progress track */}
          <div className="relative h-2.5 bg-stone-200/80 rounded-full overflow-hidden">
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
          <div className="grid grid-cols-5 gap-1.5 text-center pt-2">
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
                  className={`p-2 rounded-2xl text-[9px] font-bold flex flex-col items-center gap-1 border transition-all ${styleClasses}`}
                >
                  <div className="flex items-center gap-0.5">
                    {isPassed ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                    <span>{st.num}. {st.label}</span>
                  </div>
                  <span className="text-[8px] font-normal opacity-90">{st.sub}</span>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* 4. USER ACTION: CONFIRM ORDER RECEIVED */}
      {!isCompleted && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-stone-100">
          <p className="text-[11px] text-[#4F4540] font-medium text-center sm:text-left">
            💡 Makanan sudah diantar dan Anda terima? Mohon tekan tombol konfirmasi di samping.
          </p>
          <button
            onClick={() => onConfirmReceived(order.id)}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>✅ Konfirmasi Pesanan Diterima</span>
          </button>
        </div>
      )}

    </div>
  );
}
