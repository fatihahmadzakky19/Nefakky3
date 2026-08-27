'use client';

/**
 * ============================================================================
 * KOMPONEN: RealtimeToastBanner.tsx
 * DESKRIPSI: Banner notifikasi pop-up realtime WebSocket Laravel Reverb.
 *            Menampilkan animasi visual ketika ada pesanan baru, pergeseran status
 *            pengiriman 5-tahap, pesan live chat, dan perubahan stok barang.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  useRealtimeBroadcaster, 
  RealtimeOrderPayload, 
  RealtimeChatPayload, 
  RealtimeProductPayload, 
  RealtimeActivityPayload 
} from '@/hooks/useRealtimeBroadcaster';
import { 
  ShoppingBag, 
  Truck, 
  MessageSquare, 
  Package, 
  Bell, 
  X, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';

interface ToastItem {
  id: string;
  type: 'order' | 'status' | 'chat' | 'product' | 'activity';
  title: string;
  description: string;
  timestamp: string;
  badge?: string;
  link?: string;
}

export default function RealtimeToastBanner() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Helper untuk menambahkan toast baru
  const addToast = (toast: Omit<ToastItem, 'id' | 'timestamp'>) => {
    const newToast: ToastItem = {
      ...toast,
      id: 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 4)); // Simpan maksimal 4 toast aktif
  };

  // Hapus toast tertentu
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Otomatis hapus toast paling lama setelah 7 detik
  useEffect(() => {
    if (toasts.length === 0) return;

    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(0, prev.length - 1));
    }, 7000);

    return () => clearTimeout(timer);
  }, [toasts]);

  // Pasang listener Laravel Reverb
  useRealtimeBroadcaster({
    onOrderPlaced: (data: RealtimeOrderPayload) => {
      addToast({
        type: 'order',
        title: 'Pesanan Baru Diterima!',
        description: data.message || `Pesanan #${data.order_id} dari ${data.customer_name || 'Pelanggan'} berhasil dibuat.`,
        badge: data.total_amount ? `Rp ${data.total_amount.toLocaleString('id-ID')}` : undefined,
        link: `/orders?id=${data.order_id}`,
      });
    },

    onOrderStatusUpdated: (data: RealtimeOrderPayload) => {
      addToast({
        type: 'status',
        title: 'Status Pesanan Berubah',
        description: data.message || `Pesanan #${data.order_id} sekarang: ${data.new_status || data.status}`,
        badge: data.new_status || data.status,
        link: `/orders?id=${data.order_id}`,
      });
    },

    onChatMessageSent: (data: RealtimeChatPayload) => {
      addToast({
        type: 'chat',
        title: `Pesan Chat (${data.user_name || data.sender})`,
        description: data.text ? (data.text.length > 50 ? data.text.substring(0, 50) + '...' : data.text) : 'Pesan baru diterima',
        badge: data.sender === 'admin' ? 'Admin' : 'Customer',
      });
    },

    onProductStockUpdated: (data: RealtimeProductPayload) => {
      addToast({
        type: 'product',
        title: 'Update Stok Menu',
        description: data.message || `Stok menu ${data.name} diperbarui menjadi ${data.stock} porsi.`,
        badge: `Sisa ${data.stock}`,
        link: '/menu',
      });
    },

    onActivityLogged: (data: RealtimeActivityPayload) => {
      addToast({
        type: 'activity',
        title: data.title || 'Aktivitas Realtime',
        description: data.message || 'Ada pembaruan data pada sistem.',
        badge: data.category?.toUpperCase(),
      });
    },
  });

  if (toasts.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Notifikasi Realtime"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((t) => {
        let Icon = Bell;
        let bgGradient = 'from-amber-500/10 to-orange-500/10 border-amber-200/80 text-amber-900';
        let iconBg = 'bg-amber-600 text-white';

        if (t.type === 'order') {
          Icon = ShoppingBag;
          bgGradient = 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950';
          iconBg = 'bg-emerald-600 text-white shadow-emerald-500/30';
        } else if (t.type === 'status') {
          Icon = Truck;
          bgGradient = 'from-blue-50 to-indigo-50 border-blue-200 text-blue-950';
          iconBg = 'bg-blue-600 text-white shadow-blue-500/30';
        } else if (t.type === 'chat') {
          Icon = MessageSquare;
          bgGradient = 'from-violet-50 to-purple-50 border-violet-200 text-violet-950';
          iconBg = 'bg-violet-600 text-white shadow-violet-500/30';
        } else if (t.type === 'product') {
          Icon = Package;
          bgGradient = 'from-amber-50 to-yellow-50 border-amber-200 text-amber-950';
          iconBg = 'bg-amber-600 text-white shadow-amber-500/30';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto bg-white/95 backdrop-blur-md border ${bgGradient} p-4 rounded-2xl shadow-xl shadow-stone-900/5 transition-all duration-300 transform translate-y-0 opacity-100 flex items-start gap-3 relative overflow-hidden group`}
          >
            {/* Realtime Pulsing Indicator Bar */}
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-emerald-500" />

            {/* Icon Container */}
            <div className={`p-2.5 rounded-xl ${iconBg} shadow-sm shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-xs tracking-tight truncate">{t.title}</span>
                {t.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                    {t.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">{t.description}</p>
              
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Reverb Live • {t.timestamp}</span>
                </div>
                
                {t.link && (
                  <Link
                    href={t.link}
                    className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    Lihat <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(t.id)}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
