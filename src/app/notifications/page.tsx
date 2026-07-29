'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
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
  ArrowLeft,
  ChevronRight
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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'promo',
    title: 'Exclusive Weekend Treat',
    time: '2 mins ago',
    content: 'Enjoy 20% off on all artisanal breads and home-cooked meals this weekend.',
    read: false,
    hasAccentBar: true
  },
  {
    id: 'n2',
    type: 'order',
    title: 'Your Order is on the Way',
    time: '1 hour ago',
    content: 'Chef Julian has dispatched your order #NF-2024. Expect it by 2:00 PM.',
    read: false
  },
  {
    id: 'n3',
    type: 'payment',
    title: 'Payment Confirmed',
    time: '3 hours ago',
    content: 'Transaction for Rp 185.000 was successful. Thank you for supporting our artisans.',
    read: true
  },
  {
    id: 'n4',
    type: 'kitchen',
    title: 'New in the Kitchen',
    time: '5 hours ago',
    content: 'Organic Truffle Honey & Special Lamb Shank Tongseng is now available in our kitchen.',
    read: false,
    hasAccentBar: true
  },
  {
    id: 'n5',
    type: 'voucher',
    title: 'A Gift for You',
    time: 'Yesterday',
    content: 'You\'ve received a Rp 15.000 voucher for your loyalty. Use code NEFAKKY10.',
    read: true
  }
];

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { totalCartCount } = useCart();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Promos' | 'Orders'>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [pageLimit, setPageLimit] = useState<number>(5);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'Unread') return !item.read;
    if (activeFilter === 'Promos') return item.type === 'promo' || item.type === 'voucher';
    if (activeFilter === 'Orders') return item.type === 'order' || item.type === 'payment';
    return true; // All
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5C3D28] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Notifikasi...</p>
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
              Notifications
            </h1>

            <button
              onClick={markAllAsRead}
              className="text-xs font-medium text-[#7A4B29] hover:underline"
            >
              Tandai semua dibaca
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center gap-3">
          {(['All', 'Unread', 'Promos', 'Orders'] as const).map((filter) => {
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

        {/* Notifications List Cards */}
        <div className="space-y-4">
          {filteredNotifications.slice(0, pageLimit).map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
              }}
              className={`bg-white rounded-2xl p-5 border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4 relative overflow-hidden cursor-pointer ${
                !item.read ? 'bg-[#FAF7F2]' : ''
              }`}
            >
              {/* Optional Brown Left Accent Bar */}
              {item.hasAccentBar && (
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

        {/* Bottom Load Older Notifications Button */}
        {filteredNotifications.length > pageLimit && (
          <div className="pt-4 text-center">
            <button
              onClick={() => setPageLimit(prev => prev + 5)}
              className="px-8 py-3 bg-[#FAF8F5] border border-stone-300 hover:bg-stone-100 text-stone-700 font-medium text-xs rounded-full transition-colors shadow-sm"
            >
              Load older notifications
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
