'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import { 
  ShoppingBag, 
  User, 
  Tag, 
  Truck, 
  CheckCircle2, 
  Star, 
  Ticket, 
  Bell, 
  ArrowLeft
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'promo' | 'order' | 'payment' | 'kitchen' | 'voucher';
  title: string;
  time: string;
  content: string;
  read: boolean;
  hasAccentBar?: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { orders, vouchers, chatMessages } = useData();
  const { totalCartCount } = useCart();

  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Belum Dibaca' | 'Promo' | 'Pesanan'>('Semua');
  const [pageLimit, setPageLimit] = useState<number>(5);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  // Dynamically generate real notifications based on actual user and admin activities
  const dynamicNotifications: NotificationItem[] = React.useMemo(() => {
    if (!user) return [];

    const items: NotificationItem[] = [];
    const userEmail = user.email?.toLowerCase();

    // 1. Generate real notifications from user's orders & Admin status updates
    const userOrders = (orders || []).filter(o => 
      (userEmail && o.customerEmail?.toLowerCase() === userEmail) || 
      o.customerName?.toLowerCase() === (user.displayName?.toLowerCase() || '')
    );

    userOrders.forEach(ord => {
      // Base creation notification
      const isCreateRead = readNotifIds.includes(`notif-ord-${ord.id}-create`);
      items.push({
        id: `notif-ord-${ord.id}-create`,
        type: 'order',
        title: 'Pesanan Dikonfirmasi',
        time: ord.date || 'Baru saja',
        content: `Pesanan #${ord.id} (${ord.items.map(i => i.name).join(', ')}) sebesar Rp ${ord.total.toLocaleString('id-ID')} telah berhasil dibuat (${ord.paymentMethod}).`,
        read: isCreateRead || ord.status !== 'PENDING',
        hasAccentBar: !isCreateRead
      });

      // Status updates dynamically driven by Admin status changes
      if (ord.status === 'COOKING') {
        const isCookRead = readNotifIds.includes(`notif-ord-${ord.id}-cooking`);
        items.push({
          id: `notif-ord-${ord.id}-cooking`,
          type: 'kitchen',
          title: 'Pesanan Sedang Dimasak',
          time: 'Proses Dapur',
          content: `Tim dapur Nefakky sedang memasak dan menyiapkan porsi segar pesanan #${ord.id}.`,
          read: isCookRead,
          hasAccentBar: !isCookRead
        });
      } else if (ord.status === 'SHIPPING') {
        const isShipRead = readNotifIds.includes(`notif-ord-${ord.id}-shipping`);
        items.push({
          id: `notif-ord-${ord.id}-shipping`,
          type: 'order',
          title: 'Pesanan Dalam Pengiriman',
          time: 'Dalam Pengiriman',
          content: `Kurir ${ord.deliveryType} sedang mengantarkan pesanan #${ord.id} ke lokasi Anda.`,
          read: isShipRead,
          hasAccentBar: !isShipRead
        });
      } else if (ord.status === 'COMPLETED') {
        const isCompRead = readNotifIds.includes(`notif-ord-${ord.id}-completed`);
        items.push({
          id: `notif-ord-${ord.id}-completed`,
          type: 'payment',
          title: 'Pesanan Selesai & Diterima',
          time: 'Selesai',
          content: `Pesanan #${ord.id} telah diterima. Terima kasih telah menikmati sajian kuliner Nefakky!`,
          read: isCompRead || true,
          hasAccentBar: false
        });
      }
    });

    // 2. Generate real notifications from CS Admin Chat replies
    const adminReplies = (chatMessages || []).filter(m => 
      userEmail && m.userEmail?.toLowerCase() === userEmail && m.sender === 'admin'
    );
    adminReplies.forEach(msg => {
      const isChatRead = readNotifIds.includes(`notif-chat-${msg.id}`) || msg.readByUser;
      items.push({
        id: `notif-chat-${msg.id}`,
        type: 'promo',
        title: 'Pesan Balasan dari Admin CS',
        time: msg.timestamp || 'Baru saja',
        content: `Admin CS: "${msg.text}"`,
        read: isChatRead ?? false,
        hasAccentBar: !isChatRead
      });
    });

    // 3. Generate real notifications from active Vouchers created by Admin
    (vouchers || []).filter(v => v.status === 'Active' && v.isActive !== false).forEach(v => {
      const isVouchRead = readNotifIds.includes(`notif-vouch-${v.id}`);
      items.push({
        id: `notif-vouch-${v.id}`,
        type: 'voucher',
        title: `Voucher Promo: ${v.name}`,
        time: `Berlaku s/d ${v.expiry}`,
        content: `Gunakan kode promo ${v.code} untuk mendapatkan diskon ${v.discountPercent}% dengan minimal belanja Rp ${v.minSpend.toLocaleString('id-ID')}!`,
        read: isVouchRead
      });
    });

    return items;
  }, [user, orders, vouchers, chatMessages, readNotifIds]);

  const filteredNotifications = dynamicNotifications.filter(item => {
    if (activeFilter === 'Belum Dibaca') return !item.read;
    if (activeFilter === 'Promo') return item.type === 'promo' || item.type === 'voucher';
    if (activeFilter === 'Pesanan') return item.type === 'order' || item.type === 'payment' || item.type === 'kitchen';
    return true; // Semua
  });

  const markAllAsRead = () => {
    const allIds = dynamicNotifications.map(n => n.id);
    setReadNotifIds(allIds);
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'promo':
        return <Tag className="w-4 h-4 text-[#7A4B29]" />;
      case 'order':
        return <Truck className="w-4 h-4 text-stone-700" />;
      case 'payment':
        return <CheckCircle2 className="w-4 h-4 text-stone-700" />;
      case 'kitchen':
        return <Star className="w-4 h-4 text-[#7A4B29]" />;
      case 'voucher':
        return <Ticket className="w-4 h-4 text-[#7A4B29]" />;
      default:
        return <Bell className="w-4 h-4 text-stone-700" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5C3D28] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Notifikasi...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-[#5C3D28] rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
            🔔
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Notifikasi Akun</h2>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              Silakan masuk atau mendaftar akun terlebih dahulu untuk melihat notifikasi dan pembaruan pesanan Anda.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 bg-[#7A4B29] hover:bg-[#613A1F] text-white font-medium text-xs rounded-full shadow transition-all block text-center"
            >
              Masuk ke Akun Saya
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 border border-[#7A4B29] text-[#7A4B29] hover:bg-[#7A4B29]/5 font-medium text-xs rounded-full transition-all block text-center"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-[#5C3D28]/10 selection:text-[#5C3D28]">
      
      {/* 1. TOP NAVBAR HEADER */}
      <Navbar />

      {/* 2. MAIN NOTIFICATIONS CONTAINER */}
      <main className="max-w-4xl mx-auto px-6 sm:px-12 py-10 space-y-8">
        
        {/* Title */}
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#2D231C] tracking-tight">
              Notifikasi
            </h1>

            {filteredNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-[#7A4B29] hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-3">
          {(['Semua', 'Belum Dibaca', 'Promo', 'Pesanan'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#7A4B29] text-white shadow-sm'
                    : 'bg-[#EFECE6] text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Dynamic Notifications List Cards or Empty State */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-stone-200/80 text-center space-y-5 shadow-xs animate-fade-in my-6">
            <div className="w-16 h-16 bg-[#FAF6F0] text-[#5C3D28] rounded-full flex items-center justify-center mx-auto text-3xl border border-[#8A6337]/20 shadow-xs">
              🔔
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900">Belum Ada Notifikasi</h3>
              <p className="text-xs text-stone-500 font-light leading-relaxed">
                {activeFilter === 'Belum Dibaca' 
                  ? 'Semua notifikasi Anda telah dibaca.' 
                  : 'Notifikasi pembaruan status pesanan, pengiriman, balasan pesan CS, dan promo baru dari Admin akan muncul di sini setelah ada aktivitas.'}
              </p>
            </div>
            <div className="pt-2">
              <Link 
                href="/menu" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#5C3D28] hover:bg-[#472E1E] text-white font-medium text-xs rounded-full shadow-md transition-all uppercase tracking-wider"
              >
                <span>Jelajahi Menu Nefakky</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.slice(0, pageLimit).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!readNotifIds.includes(item.id)) {
                    setReadNotifIds(prev => [...prev, item.id]);
                  }
                }}
                className={`bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4 relative overflow-hidden cursor-pointer ${
                  !item.read ? 'bg-[#FAF7F2]' : ''
                }`}
              >
                {/* Optional Brown Left Accent Bar */}
                {item.hasAccentBar && !item.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#7A4B29]" />
                )}

                {/* Left Circle Icon + Text Content */}
                <div className="flex items-start gap-4 pl-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    item.type === 'promo' || item.type === 'kitchen' || item.type === 'voucher'
                      ? 'bg-[#F7EFE5]'
                      : 'bg-stone-100'
                  }`}>
                    {getIconForType(item.type)}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-stone-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-light max-w-xl leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>

                {/* Timestamp Right */}
                <div className="text-[11px] text-stone-400 font-light shrink-0 pt-0.5">
                  {item.time}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Bottom Load Older Notifications Button */}
        {filteredNotifications.length > pageLimit && (
          <div className="pt-4 text-center">
            <button
              onClick={() => setPageLimit(prev => prev + 5)}
              className="px-8 py-3 bg-[#FAF8F5] border border-[#8A6337]/30 hover:bg-stone-100 text-stone-700 font-medium text-xs rounded-full transition-colors shadow-sm"
            >
              Muat notifikasi sebelumnya
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
