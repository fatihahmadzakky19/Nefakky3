'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminLiveChatTab (src/components/admin/AdminLiveChatTab.tsx)
 * DESKRIPSI: Meja Pelayanan CS Live Chat Khusus (Dedicated CS Desk Workspace)
 *            Layar penuh dengan manajemen kontak pelanggan, riwayat pesan,
 *            snug bottom alignment, quote balasan, preset respon cepat,
 *            lampiran foto/video, dan inspektur seluruh pesanan & transaksi pelanggan.
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  User,
  Paperclip,
  Film,
  X,
  Phone,
  Building2,
  MapPin,
  Truck,
  CheckCircle2,
  MessageCircle,
  Mail,
  Smile,
  Search,
  MessageSquare,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Info,
  Receipt,
  CreditCard,
  Calendar,
  UtensilsCrossed,
  BadgePercent,
  Check
} from 'lucide-react';
import { ChatMessage, useData } from '@/context/DataContext';

interface AdminLiveChatTabProps {
  chatMessages: ChatMessage[];
  replyChatMessage: (userEmail: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  markChatAsRead: (userEmail: string, role: 'admin' | 'user') => void;
}

export default function AdminLiveChatTab({
  chatMessages,
  replyChatMessage,
  markChatAsRead
}: AdminLiveChatTabProps) {
  const searchParams = useSearchParams();
  const chatQuery = searchParams?.get('chat');
  const { orders } = useData();

  const [selectedChatUserEmail, setSelectedChatUserEmail] = useState<string>('');
  const [chatSearchFilter, setChatSearchFilter] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'unread'>('all');
  const [adminReplyInput, setAdminReplyInput] = useState<string>('');
  const [adminMediaUrl, setAdminMediaUrl] = useState<string | null>(null);
  const [adminMediaType, setAdminMediaType] = useState<'image' | 'video'>('image');
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [showCustomerSidebar, setShowCustomerSidebar] = useState<boolean>(true);

  const adminFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Preset Template Balasan Cepat CS
  const QUICK_REPLY_TEMPLATES = [
    '🍳 Pesanan sedang kami siapkan di dapur.',
    '🛵 Kurir kami sedang meluncur menuju lokasi Anda.',
    '📸 Boleh kirimkan foto atau detail kendalanya kak?',
    '🙏 Terima kasih banyak telah berbelanja di Nefakky!',
    '✅ Catatan tambahan pesanan Anda telah kami perbarui.'
  ];

  // Auto select chat from URL query param
  useEffect(() => {
    if (chatQuery) {
      setSelectedChatUserEmail(chatQuery);
      markChatAsRead(chatQuery, 'admin');
    }
  }, [chatQuery, markChatAsRead]);

  // Grouping users for chat sidebar list
  const chatUsersMap = useMemo(() => {
    const map: Record<string, { email: string; name: string; avatar?: string; lastMessage: string; lastTime: string; unread: boolean; count: number }> = {};
    
    (chatMessages || []).forEach((m) => {
      const email = m.userEmail.toLowerCase();
      if (!map[email]) {
        map[email] = {
          email: m.userEmail,
          name: m.userName || m.userEmail.split('@')[0],
          avatar: m.userAvatar,
          lastMessage: m.text,
          lastTime: m.timestamp,
          unread: m.readByAdmin === false && m.sender === 'user',
          count: m.readByAdmin === false && m.sender === 'user' ? 1 : 0
        };
      } else {
        map[email].lastMessage = m.text;
        map[email].lastTime = m.timestamp;
        if (m.readByAdmin === false && m.sender === 'user') {
          map[email].unread = true;
          map[email].count += 1;
        }
      }
    });

    const list = Object.values(map);
    if (list.length === 0) {
      return [
        {
          email: 'nizar.azzuhra@gmail.com',
          name: 'Nizar Azzuhra',
          avatar: '',
          lastMessage: 'Halo Min, pesanan Ayam Bakar bisa tanpa sambal?',
          lastTime: '10:15 AM',
          unread: false,
          count: 0
        },
        {
          email: 'sarah.jenkins@email.com',
          name: 'Sarah Jenkins',
          avatar: '',
          lastMessage: 'Order #NF-88392 statusnya sudah dikirim...',
          lastTime: '10:42 AM',
          unread: true,
          count: 1
        },
        {
          email: 'michael.ray@email.com',
          name: 'Michael Ray',
          avatar: '',
          lastMessage: 'Apakah menu truffle pasta ready?',
          lastTime: '09:15 AM',
          unread: true,
          count: 1
        },
        {
          email: 'anita.kumala@email.com',
          name: 'Anita Kumala',
          avatar: '',
          lastMessage: 'Terima kasih atas pelayanannya.',
          lastTime: 'Kemarin',
          unread: false,
          count: 0
        }
      ];
    }

    return list;
  }, [chatMessages]);

  const filteredChatUsers = useMemo(() => {
    let result = chatUsersMap;
    if (activeFilterTab === 'unread') {
      result = result.filter(u => u.unread);
    }
    if (chatSearchFilter.trim()) {
      const q = chatSearchFilter.toLowerCase();
      result = result.filter(
        u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.lastMessage.toLowerCase().includes(q)
      );
    }
    return result;
  }, [chatUsersMap, activeFilterTab, chatSearchFilter]);

  // Set default selected chat if none selected
  useEffect(() => {
    if (!selectedChatUserEmail && chatUsersMap.length > 0) {
      setSelectedChatUserEmail(chatUsersMap[0].email);
    }
  }, [chatUsersMap, selectedChatUserEmail]);

  const activeChatMessages = useMemo(() => {
    if (!selectedChatUserEmail) return [];
    const filtered = (chatMessages || []).filter((m) => m.userEmail.toLowerCase() === selectedChatUserEmail.toLowerCase());
    if (filtered.length > 0) return filtered;

    // Fallback simulated conversation for demo
    if (selectedChatUserEmail.toLowerCase() === 'nizar.azzuhra@gmail.com') {
      return [
        {
          id: 'sim-nz-1',
          userEmail: 'nizar.azzuhra@gmail.com',
          userName: 'Nizar Azzuhra',
          sender: 'user' as const,
          text: 'Halo Min, saya mau tanya apakah pesanan Ayam Bakar saya bisa request tanpa sambal pedas?',
          timestamp: '10:15 AM',
          readByAdmin: true,
          readByUser: true
        },
        {
          id: 'sim-nz-2',
          userEmail: 'nizar.azzuhra@gmail.com',
          userName: 'Nizar Azzuhra',
          sender: 'admin' as const,
          text: 'Halo Kak Nizar! Tentu saja bisa. Catatan tim dapur kami sudah diperbarui untuk pesanan Anda.',
          timestamp: '10:18 AM',
          readByAdmin: true,
          readByUser: true
        }
      ];
    }

    return [];
  }, [chatMessages, selectedChatUserEmail]);

  const activeUserObj = chatUsersMap.find(u => u.email.toLowerCase() === selectedChatUserEmail.toLowerCase()) || {
    email: selectedChatUserEmail,
    name: selectedChatUserEmail.split('@')[0],
    unread: false,
    count: 0
  };

  // ============================================================================
  // PENCARIAN SELURUH PESANAN & TRANSAKSI PELANGGAN AKTIF (PRESISI BERDASARKAN EMAIL)
  // ============================================================================
  const customerOrders = useMemo(() => {
    if (!selectedChatUserEmail) return [];

    const targetEmail = selectedChatUserEmail.trim().toLowerCase();

    // Cari dari database pesanan DataContext secara presisi 100% berdasarkan email
    const matched = (orders || []).filter(o => {
      const oEmail = (o.customerEmail || '').trim().toLowerCase();
      return oEmail === targetEmail;
    });

    if (matched.length > 0) return matched;

    // Fallback riwayat lengkap transaksi demo HANYA untuk demo email bawaan nizar.azzuhra@gmail.com
    if (targetEmail === 'nizar.azzuhra@gmail.com') {
      return [
        {
          id: 'ORD-88219',
          customerName: 'Nizar Azzuhra',
          customerEmail: 'nizar.azzuhra@gmail.com',
          avatar: 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=F97316&color=ffffff',
          address: 'Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor',
          phone: '0812-3456-7890',
          items: [
            { id: 'm1', name: 'Ayam Bakar Madu', price: 35000, quantity: 2, image: '/images/ayam_bakar.jpg' },
            { id: 'm6', name: 'Jus Mangga Harum Manis', price: 16000, quantity: 2, image: '/images/jus_mangga.jpg' }
          ],
          itemCount: 4,
          paymentMethod: 'QRIS / GoPay',
          paymentBadge: 'PAID' as const,
          deliveryType: 'KURIR NEFAKKY',
          distance: '4.2 Km',
          status: 'COMPLETED' as const,
          subtotal: 102000,
          shippingCost: 10000,
          discount: 10000,
          total: 102000,
          date: '26 Agu 2026 • 10:15 WIB',
          createdAt: Date.now() - 3600000
        },
        {
          id: 'ORD-87104',
          customerName: 'Nizar Azzuhra',
          customerEmail: 'nizar.azzuhra@gmail.com',
          avatar: 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=F97316&color=ffffff',
          address: 'Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor',
          phone: '0812-3456-7890',
          items: [
            { id: 'm2', name: 'Nasi Bakar Cakalang', price: 28000, quantity: 2, image: '/images/nasi_bakar.jpg' },
            { id: 'm4', name: 'Garang Asam Ayam Kampung', price: 38000, quantity: 1, image: '/images/garang_asam.jpg' }
          ],
          itemCount: 3,
          paymentMethod: 'BCA Virtual Account',
          paymentBadge: 'PAID' as const,
          deliveryType: 'KURIR NEFAKKY',
          distance: '4.2 Km',
          status: 'COMPLETED' as const,
          subtotal: 94000,
          shippingCost: 10000,
          discount: 0,
          total: 104000,
          date: '24 Agu 2026 • 19:30 WIB',
          createdAt: Date.now() - 172800000
        },
        {
          id: 'ORD-85920',
          customerName: 'Nizar Azzuhra',
          customerEmail: 'nizar.azzuhra@gmail.com',
          avatar: 'https://ui-avatars.com/api/?name=Nizar+Azzuhra&background=F97316&color=ffffff',
          address: 'Puri Bojong Lestari 1 Blok AF 41, Bojong Gede, Bogor',
          phone: '0812-3456-7890',
          items: [
            { id: 'm3', name: 'Gudeg Komplit Telur & Krecek', price: 32000, quantity: 2, image: '/images/gudeg.jpg' },
            { id: 'm5', name: 'Jus Sirsak Murni', price: 15000, quantity: 1, image: '/images/jus_sirsak.jpg' }
          ],
          itemCount: 3,
          paymentMethod: 'ShopeePay',
          paymentBadge: 'PAID' as const,
          deliveryType: 'KURIR NEFAKKY',
          distance: '4.2 Km',
          status: 'COMPLETED' as const,
          subtotal: 79000,
          shippingCost: 10000,
          discount: 5000,
          total: 84000,
          date: '20 Agu 2026 • 12:10 WIB',
          createdAt: Date.now() - 518400000
        }
      ];
    }

    return [];
  }, [orders, selectedChatUserEmail, activeUserObj]);

  // Total Nominal Belanja Kumulatif Pelanggan
  const totalLifetimeSpent = useMemo(() => {
    return customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [customerOrders]);

  const unreadTotal = chatUsersMap.filter(u => u.unread).length;

  // Auto-scroll to bottom smoothly
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeChatMessages, selectedChatUserEmail]);

  const handleAdminMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 20MB.');
        return;
      }
      const isVid = file.type.startsWith('video/');
      const isImg = file.type.startsWith('image/');
      if (!isVid && !isImg) {
        alert('Harap pilih file gambar atau video.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminMediaUrl(reader.result as string);
        setAdminMediaType(isVid ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUserEmail || (!adminReplyInput.trim() && !adminMediaUrl)) return;

    let finalMessage = adminReplyInput.trim();
    if (replyingToMessage) {
      const quoteSnippet = replyingToMessage.text.length > 50 
        ? replyingToMessage.text.slice(0, 50) + '...' 
        : replyingToMessage.text;
      finalMessage = `[Membalas: "${quoteSnippet}"]\n${finalMessage}`;
    }

    replyChatMessage(
      selectedChatUserEmail,
      finalMessage || (adminMediaType === 'video' ? '📹 [Video Balasan CS]' : '📷 [Foto Balasan CS]'),
      adminMediaUrl || undefined,
      adminMediaType
    );

    setAdminReplyInput('');
    setAdminMediaUrl(null);
    setReplyingToMessage(null);
    if (adminFileInputRef.current) adminFileInputRef.current.value = '';

    setTimeout(() => scrollToBottom('smooth'), 100);
  };

  // Helper untuk warna status pesanan
  const getOrderStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DELIVERING':
      case 'ON_DELIVERY':
      case 'SHIPPING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COOKING':
      case 'READY':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-300';
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)] min-h-[680px] font-body-base text-on-surface">
      
      {/* 1. HEADER BAR */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface font-['Playfair_Display'] flex items-center gap-2.5">
            <span>Meja Pelayanan CS Live Chat</span>
            {unreadTotal > 0 && (
              <span className="px-3 py-0.5 rounded-full bg-rose-500 text-white font-mono text-xs font-bold animate-pulse">
                {unreadTotal} Chat Baru
              </span>
            )}
          </h1>
          <p className="font-body-base text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Komunikasi pesan langsung dua arah dengan pelanggan secara realtime dan inspektur seluruh riwayat transaksi.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCustomerSidebar(!showCustomerSidebar)}
            className={`hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
              showCustomerSidebar 
                ? 'bg-[#25160E] text-white border-transparent shadow-sm' 
                : 'bg-surface text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
            title="Tampilkan / Sembunyikan Panel Informasi Pelanggan"
          >
            <Info className="w-4 h-4" />
            <span>Detail &amp; Riwayat Pesanan</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN CHAT CONSOLE CONTAINER */}
      <div className="flex-1 bg-surface-container rounded-3xl shadow-xs border border-outline-variant/20 overflow-hidden flex flex-col md:flex-row">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: DAFTAR KONTAK & PERCAKAPAN (Width: 320px) */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-80 lg:w-88 bg-surface-container-low border-r border-outline-variant/20 flex flex-col shrink-0">
          
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-outline-variant/15 space-y-2.5 bg-surface">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input 
                type="text"
                value={chatSearchFilter}
                onChange={(e) => setChatSearchFilter(e.target.value)}
                placeholder="Cari pelanggan atau pesan..."
                className="w-full bg-surface-container-low pl-9 pr-3 py-2 rounded-xl text-xs text-on-surface border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-[#934B19] transition-all"
              />
              {chatSearchFilter && (
                <button 
                  onClick={() => setChatSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFilterTab('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                  activeFilterTab === 'all'
                    ? 'bg-[#25160E] text-white shadow-xs'
                    : 'bg-surface-container text-stone-600 hover:bg-surface-container-high'
                }`}
              >
                Semua ({chatUsersMap.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilterTab('unread')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeFilterTab === 'unread'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-surface-container text-stone-600 hover:bg-surface-container-high'
                }`}
              >
                <span>Belum Dibaca</span>
                {unreadTotal > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadTotal}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conversation List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
            {filteredChatUsers.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <MessageCircle className="w-8 h-8 text-stone-300" />
                <p className="text-xs text-stone-400 font-medium">Tidak ada percakapan ditemukan.</p>
              </div>
            ) : (
              filteredChatUsers.map((u) => {
                const isSelected = u.email.toLowerCase() === selectedChatUserEmail.toLowerCase();

                return (
                  <div
                    key={u.email}
                    onClick={() => {
                      setSelectedChatUserEmail(u.email);
                      markChatAsRead(u.email, 'admin');
                    }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all relative ${
                      isSelected 
                        ? 'bg-[#25160E] text-white font-semibold' 
                        : 'bg-surface text-on-surface hover:bg-surface-container-high/60'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                      isSelected ? 'bg-[#934B19] text-white' : 'bg-amber-100 text-[#934B19]'
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Chat Snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold truncate">
                          {u.name}
                        </h4>
                        <span className={`text-[10px] shrink-0 ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                          {u.lastTime || '10:42 AM'}
                        </span>
                      </div>

                      <p className={`text-xs truncate leading-snug ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                        {u.lastMessage || 'Mulai percakapan...'}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[9.5px] truncate font-mono ${isSelected ? 'text-stone-400' : 'text-stone-400'}`}>
                          {u.email}
                        </span>

                        {u.unread && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold tracking-wider animate-pulse">
                            BARU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </aside>

        {/* ========================================================================= */}
        {/* CENTER CONSOLE: ACTIVE CONVERSATION STREAM (Flex-1) */}
        {/* ========================================================================= */}
        <main className="flex-1 bg-surface flex flex-col justify-between overflow-hidden relative">
          
          {/* Active Contact Header */}
          <div className="px-5 py-3.5 bg-surface-container-lowest shadow-2xs flex items-center justify-between z-10 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#934B19] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {activeUserObj.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">
                  {activeUserObj.name}
                </h3>
                <p className="font-mono text-on-surface-variant text-[11px] mt-0.5">
                  {activeUserObj.email}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${activeUserObj.email}`}
                className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                title="Kirim Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Messages Feed Area with Snug Bottom Alignment */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col min-h-0 bg-stone-50/50"
          >
            {/* Top Spacer: Snug alignment so bubbles sit nicely above input bar when message count is low */}
            <div className="flex-1 min-h-[12px]" />

            {/* Date Badge */}
            <div className="flex items-center justify-center my-2 shrink-0">
              <span className="bg-stone-200/80 text-stone-600 px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wide">
                Percakapan Layanan Pelanggan Realtime
              </span>
            </div>

            {activeChatMessages.length === 0 ? (
              /* Empty state when opening a new user */
              <div className="my-auto py-10 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-3xl bg-amber-100 text-[#934B19] flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-800">
                    Mulai Percakapan dengan {activeUserObj.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm">
                    Ketik balasan atau klik salah satu respon cepat di bawah untuk memulai obrolan.
                  </p>
                </div>
              </div>
            ) : (
              /* Message bubbles stream */
              <div className="flex flex-col gap-3">
                {activeChatMessages.map((msg: any) => {
                  const isAdmin = msg.sender === 'admin';

                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] sm:max-w-[75%] group ${
                        isAdmin ? 'items-end self-end' : 'items-start self-start'
                      }`}
                    >
                      {/* Reservation Tag if Customer Sent a Reservation Request */}
                      {!isAdmin && (msg.text?.includes('[RESERVASI PRODUK HABIS]') || msg.text?.includes('[RESERVASI MENU HABIS]')) && (
                        <div className="mb-1.5 flex items-center gap-1.5 bg-amber-100/90 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-2xs">
                          <span>🏷️</span>
                          <span>PERMINTAAN RESERVASI PRODUK HABIS</span>
                        </div>
                      )}

                      <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-2xs relative ${
                        isAdmin 
                          ? 'bg-[#25160E] text-white rounded-tr-none' 
                          : msg.text?.includes('[RESERVASI')
                            ? 'bg-amber-50/90 text-stone-900 rounded-tl-none border-2 border-amber-300'
                            : 'bg-white text-stone-900 rounded-tl-none border border-stone-200'
                      }`}>
                        {/* Media Image Attachment if present */}
                        {msg.mediaUrl && msg.mediaType !== 'video' && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                            <img 
                              src={msg.mediaUrl} 
                              alt="Lampiran Chat" 
                              className="w-56 h-36 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Media Video Attachment if present */}
                        {msg.mediaUrl && msg.mediaType === 'video' && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                            <video 
                              src={msg.mediaUrl} 
                              controls 
                              className="w-56 h-36 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        <span className="whitespace-pre-wrap font-normal">{msg.text}</span>
                      </div>

                      {/* Message Footer: Time + Quote/Reply Action + Quick Restock Notify Button */}
                      <div className="flex flex-wrap items-center gap-2 mt-1 px-1">
                        <span className="text-[10px] text-stone-400">
                          {msg.timestamp || 'Baru saja'} {isAdmin ? '• Terkirim CS' : ''}
                        </span>

                        {!isAdmin && (
                          <button
                            type="button"
                            onClick={() => setReplyingToMessage(msg)}
                            className="opacity-0 group-hover:opacity-100 text-[10px] text-[#934B19] font-bold hover:underline transition-opacity cursor-pointer flex items-center gap-0.5"
                          >
                            <span>Balas</span>
                          </button>
                        )}

                        {!isAdmin && (msg.text?.includes('[RESERVASI PRODUK HABIS]') || msg.text?.includes('[RESERVASI MENU HABIS]')) && (
                          <button
                            type="button"
                            onClick={() => {
                              setAdminReplyInput('Halo kak! Kabar gembira, menu yang kakak pesan/reservasi kemarin kini telah KEMBALI TERSEDIA (RESTOCK) di dapur kami dan siap dipesan. Silakan melakukan pemesanan langsung melalui aplikasi ya kak! Selamat menikmati! 🍲✨');
                            }}
                            className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-0.5 rounded-md shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                            title="Klik untuk mengisi pesan balasan restock otomatis"
                          >
                            <span>⚡ Kabari Restock</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} className="h-1 shrink-0" />
          </div>

          {/* ============================================================= */}
          {/* BOTTOM CHAT ACTION & INPUT TOOLBAR */}
          {/* ============================================================= */}
          <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 flex flex-col gap-2.5">
            
            {/* Quick Preset Response Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] text-stone-400 font-bold whitespace-nowrap">Respon Cepat:</span>
              {QUICK_REPLY_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAdminReplyInput(tmpl)}
                  className="px-3 py-1 bg-stone-100 hover:bg-amber-100 hover:text-[#934B19] text-stone-600 rounded-full text-[10.5px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-stone-200/60"
                >
                  {tmpl}
                </button>
              ))}
            </div>

            {/* Quote / Replying-To Banner */}
            {replyingToMessage && (
              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-xl border-l-4 border-[#934B19] text-xs animate-fade-in">
                <div className="flex flex-col pr-2">
                  <span className="text-[10.5px] font-bold text-[#934B19]">
                    Membalas pesan {replyingToMessage.userName || replyingToMessage.userEmail}:
                  </span>
                  <span className="text-xs text-stone-700 truncate max-w-md mt-0.5">
                    "{replyingToMessage.text}"
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setReplyingToMessage(null)}
                  className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                  title="Batalkan Kutipan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Media Preview Bar if file selected */}
            {adminMediaUrl && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl w-max border border-amber-200 animate-fade-in">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-[#934B19]">
                  {adminMediaType === 'video' ? <Film className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                </div>
                <div className="flex flex-col pr-2">
                  <span className="font-bold text-amber-950 text-[10px]">
                    Lampiran Siap Dikirim
                  </span>
                  <span className="font-mono text-amber-700 text-[9px]">
                    {adminMediaType}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setAdminMediaUrl(null);
                    if (adminFileInputRef.current) adminFileInputRef.current.value = '';
                  }}
                  className="text-stone-400 hover:text-rose-600 cursor-pointer p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={adminFileInputRef} 
              onChange={handleAdminMediaUpload} 
              accept="image/*,video/*" 
              className="hidden" 
            />

            {/* Input Form Toolbar */}
            <form onSubmit={handleSendAdminReply} className="flex items-center gap-2.5">
              
              {/* Attachment Button */}
              <button 
                type="button"
                onClick={() => adminFileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-stone-500 hover:text-[#934B19] hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
                title="Lampirkan Foto atau Video"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={adminReplyInput}
                  onChange={(e) => setAdminReplyInput(e.target.value)}
                  placeholder={`Ketik balasan untuk ${activeUserObj.name}...`}
                  className="w-full bg-stone-100 focus:bg-white pl-4 pr-10 py-3 rounded-full text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-[#934B19] border border-stone-200 transition-all placeholder:text-stone-400 font-medium"
                />
                <button 
                  type="button" 
                  onClick={() => setAdminReplyInput(prev => prev + ' 😊')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#934B19] transition-colors cursor-pointer p-1"
                  title="Tambah Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Send Button */}
              <button 
                type="submit"
                disabled={!adminReplyInput.trim() && !adminMediaUrl}
                className="w-11 h-11 rounded-full bg-[#934B19] hover:bg-[#783603] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-all active:scale-95"
                title="Kirim Balasan"
              >
                <Send className="w-4 h-4" />
              </button>

            </form>
          </div>

        </main>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: INSPEKTUR PROFIL & SELURUH TRANSAKSI PELANGGAN (Width: 340px) */}
        {/* ========================================================================= */}
        {showCustomerSidebar && (
          <aside className="w-80 lg:w-92 bg-surface-container-low border-l border-outline-variant/20 p-4 overflow-y-auto hidden lg:flex flex-col gap-4 shrink-0 animate-fade-in">
            
            {/* Header Drawer */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
              <h4 className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#934B19]" />
                <span>Detail &amp; Transaksi Pelanggan</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowCustomerSidebar(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                title="Tutup Panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Customer Profile & Lifetime Metrics Overview */}
            <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20 flex flex-col gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#934B19] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  {activeUserObj.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs sm:text-sm text-on-surface truncate">{activeUserObj.name}</h5>
                  <p className="text-[10px] text-stone-500 font-mono truncate">{activeUserObj.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                    Pelanggan Aktif Terdaftar
                  </span>
                </div>
              </div>

              {/* Lifetime Customer Stats Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/10 text-xs">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/50">
                  <p className="text-[9.5px] text-stone-400 font-bold uppercase tracking-wider">Total Transaksi</p>
                  <p className="font-bold text-[#934B19] text-sm mt-0.5">{customerOrders.length} Pesanan</p>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/50">
                  <p className="text-[9.5px] text-stone-400 font-bold uppercase tracking-wider">Total Belanja</p>
                  <p className="font-bold text-emerald-700 text-xs sm:text-sm mt-0.5 truncate">
                    Rp {totalLifetimeSpent.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            {/* List Seluruh Pesanan & Transaksi Pelanggan */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-[11px] text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#934B19]" />
                  <span>Semua Riwayat Pesanan ({customerOrders.length})</span>
                </h5>
                <Link
                  href="/admin/orders"
                  className="text-[10px] text-[#934B19] hover:underline font-bold flex items-center gap-0.5"
                  title="Buka Kitchen Desk"
                >
                  <span>Kitchen Desk</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {customerOrders.length === 0 ? (
                <div className="p-6 bg-surface rounded-2xl border border-outline-variant/15 text-center text-stone-400 text-xs flex flex-col items-center gap-2">
                  <ShoppingBag className="w-7 h-7 text-stone-300" />
                  <p>Belum ada riwayat transaksi untuk pelanggan ini.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customerOrders.map((ord: any) => (
                    <div 
                      key={ord.id}
                      className="p-3.5 bg-surface rounded-2xl border border-outline-variant/20 space-y-2.5 text-xs shadow-2xs hover:border-[#934B19]/40 transition-all"
                    >
                      {/* Header: Order ID & Status */}
                      <div className="flex items-center justify-between gap-1 border-b border-outline-variant/10 pb-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-stone-900">{ord.id}</span>
                          <p className="text-[9.5px] text-stone-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>{ord.date || 'Hari ini'}</span>
                          </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getOrderStatusBadgeColor(ord.status)}`}>
                          {ord.status}
                        </span>
                      </div>

                      {/* Payment Badge & Method */}
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="flex items-center gap-1 text-stone-500">
                          <CreditCard className="w-3 h-3 text-stone-400" />
                          <span>{ord.paymentMethod || 'Metode Pembayaran'}</span>
                        </span>
                        <span className={`px-2 py-0.2 rounded font-bold text-[9px] ${
                          ord.paymentBadge === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.paymentBadge === 'PAID' ? 'LUNAS' : 'PENDING'}
                        </span>
                      </div>

                      {/* Line Items List */}
                      {ord.items && ord.items.length > 0 && (
                        <div className="bg-stone-50 p-2 rounded-xl space-y-1 text-[11px] border border-stone-200/40">
                          {ord.items.map((it: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-stone-700">
                              <span className="truncate pr-2">
                                <span className="font-bold text-[#934B19]">{it.quantity}x</span> {it.name}
                              </span>
                              <span className="font-mono text-[10px] text-stone-500 shrink-0">
                                Rp {((it.price || 0) * (it.quantity || 1)).toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Delivery Address & Distance */}
                      {ord.address && (
                        <div className="flex items-start gap-1.5 text-[10px] text-stone-500 leading-tight">
                          <MapPin className="w-3 h-3 text-[#934B19] shrink-0 mt-0.5" />
                          <span className="truncate">{ord.address} {ord.distance ? `(${ord.distance})` : ''}</span>
                        </div>
                      )}

                      {/* Price Breakdown Footer */}
                      <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between font-bold">
                        <span className="text-stone-600 text-[11px]">Total Transaksi:</span>
                        <span className="font-mono text-xs text-[#934B19]">
                          Rp {(ord.total || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Support Tips */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 text-amber-950 text-[11px] space-y-1 mt-auto">
              <p className="font-bold flex items-center gap-1 text-[#934B19]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tips Pelayanan CS</span>
              </p>
              <p className="text-[10px] text-stone-600 leading-relaxed">
                Anda dapat memeriksa menu yang dipesan pelanggan di atas saat menjawab pertanyaan seputar pesanan mereka.
              </p>
            </div>

          </aside>
        )}

      </div>

    </div>
  );
}
