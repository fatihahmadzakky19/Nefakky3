'use client';

/**
 * ============================================================================
 * HALAMAN: Profil Pengguna & Riwayat Pembelian (src/app/profile/page.tsx)
 * DESKRIPSI: Dashboard pribadi pelanggan untuk mengelola profil, melacak status pesanan
 *            realtime 5-tahap (Diterima, Dimasak, Siap, Diantar/Di Jalan, Diterima Pelanggan),
 *            melakukan Konfirmasi Pesanan Diterima, serta obrolan CS Live Chat.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { useData, AdminOrder } from '@/context/DataContext';
import RealtimeOrderTracker from '@/components/RealtimeOrderTracker';
import { 
  ShoppingBag, 
  Bell, 
  Pencil, 
  Phone, 
  MapPin, 
  LogOut, 
  ArrowRight,
  X,
  CheckCircle2,
  MessageSquare,
  Send,
  Headphones,
  ShieldCheck,
  Clock,
  Truck,
  Utensils,
  Package,
  Receipt,
  Check,
  Sparkles,
  CreditCard
} from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();
  const { user, loading, logout, updatePhoto } = useAuth();
  const { orders, confirmOrderReceived, chatMessages, sendChatMessage, markChatAsRead } = useData();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERING' | 'COMPLETED'>('ALL');
  const [confirmedSuccessMessage, setConfirmedSuccessMessage] = useState<string | null>(null);

  // Generate dynamic initial avatar per user email/name
  const nameForAvatar = user?.displayName || user?.email || 'User';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=F97316&color=ffffff&bold=true&size=256`;
  const userAvatar = user?.photoURL || defaultAvatar;

  const currentUserEmail = (user?.email || '').toLowerCase();
  const userChatHistory = chatMessages.filter(m => m.userEmail.toLowerCase() === currentUserEmail);

  // Filter & sort orders matching current user in real-time (newest first)
  const myOrders = React.useMemo(() => {
    if (!user?.email) return [];
    const emailLower = user.email.toLowerCase();
    const nameLower = (user.displayName || user.email.split('@')[0]).toLowerCase();

    return (orders || [])
      .filter(o => 
        (o.customerEmail && o.customerEmail.toLowerCase() === emailLower) ||
        (o.userId && user.uid && o.userId === user.uid) ||
        (o.customerName && o.customerName.toLowerCase().includes(nameLower))
      )
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [user, orders]);

  const filteredOrders = myOrders.filter(o => {
    if (orderFilter === 'ACTIVE') return o.status === 'RECEIVED' || o.status === 'COOKING' || o.status === 'READY' || o.status === 'PENDING';
    if (orderFilter === 'DELIVERING') return o.status === 'DELIVERING' || o.status === 'SHIPPING';
    if (orderFilter === 'COMPLETED') return o.status === 'COMPLETED';
    return true;
  });

  // Auto mark chat as read by user when visiting profile
  useEffect(() => {
    if (user?.email) {
      markChatAsRead(user.email, 'user');
    }
  }, [user, chatMessages.length]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userChatHistory.length]);

  // Authentication Guard
  useEffect(() => {
    if (!loading && user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || 'Pelanggan');
      setPhone(user.phoneNumber || '081234567890');
      setAddress('Jl. Kebon Jeruk No. 12, Jakarta Barat');
    }
  }, [user, loading]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user?.email) return;

    sendChatMessage(user.email, displayName, chatInput.trim(), userAvatar);
    setChatInput('');
  };

  const handleChipClick = (text: string) => {
    if (!user?.email) return;
    sendChatMessage(user.email, displayName, text, userAvatar);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (updatePhoto) {
          updatePhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditingModal(false);
    }, 1200);
  };

  const handleConfirmReceived = (orderId: string) => {
    confirmOrderReceived(orderId);
    setConfirmedSuccessMessage(`Pesanan #${orderId} telah dikonfirmasi DITERIMA! Terima kasih sudah berbelanja di Nefakky.`);
    setTimeout(() => {
      setConfirmedSuccessMessage(null);
    }, 5000);
  };

  // 5-Stage Step helper logic
  const getOrderStepNumber = (status: AdminOrder['status']) => {
    switch (status) {
      case 'RECEIVED':
      case 'PENDING':
        return 1;
      case 'COOKING':
        return 2;
      case 'READY':
        return 3;
      case 'DELIVERING':
      case 'SHIPPING':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 1;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCEEE2] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#6E3E13] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Profil Pelanggan...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FCEEE2] text-stone-800 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-[#F59E3D] text-[#2D1B0E] rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm border border-[#DE8B32]">
            👤
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#2D1B0E]">Profil Pelanggan</h2>
            <p className="text-xs text-[#7A5B43] font-medium leading-relaxed">
              Silakan masuk atau mendaftar akun terlebih dahulu untuk melihat profil, riwayat pesanan, konfirmasi pesanan, dan dukungan pelanggan.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 bg-[#6E3E13] hover:bg-[#58310E] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all block text-center"
            >
              Masuk ke Akun Saya
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 bg-white text-[#2D1B0E] hover:bg-stone-50 font-bold text-xs rounded-full border border-stone-200 shadow-xs transition-all block text-center"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCEEE2] text-stone-800 font-sans selection:bg-[#6E3E13]/10 selection:text-[#6E3E13]">
      
      {/* Hidden input for gallery photo upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleImageUpload} 
      />

      {/* 1. TOP HEADER / NAVBAR */}
      <Navbar />

      {/* SUCCESS CONFIRMATION BANNER */}
      {confirmedSuccessMessage && (
        <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-6">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-200 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{confirmedSuccessMessage}</p>
            </div>
            <button onClick={() => setConfirmedSuccessMessage(null)} className="text-white hover:opacity-80">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN PROFILE CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-8 space-y-8">
        
        {/* TOP PROFILE BANNER CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-stone-100 shadow-sm">
          
          {/* Avatar & Main User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left w-full md:w-auto">
            
            {/* Avatar with Edit Pencil Overlay */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0 bg-stone-100 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userAvatar}
                alt={displayName}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute bottom-1 right-1 p-2 bg-[#6E3E13] hover:bg-[#58310E] text-white rounded-full shadow transition-all"
                title="Ambil Foto dari Galeri"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name, Email, Edit Profile Button */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="font-serif text-3xl font-bold text-[#2D1B0E]">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 bg-[#F59E3D] text-[#2D1B0E] text-[10px] font-bold rounded-full border border-[#DE8B32]">
                  VIP Pelanggan
                </span>
              </div>
              <p className="text-xs text-[#7A5B43] font-mono">
                {user.email || 'pelanggan@nefakky.com'}
              </p>

              <div className="pt-2 flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <button
                  onClick={() => setIsEditingModal(true)}
                  className="px-5 py-2 bg-[#6E3E13] hover:bg-[#58310E] text-white text-xs font-bold rounded-full shadow-sm transition-all uppercase tracking-wider"
                >
                  Edit Profile
                </button>
                {(user.role === 'admin' || user.email === 'fatihahmadzakky19@gmail.com') && (
                  <Link
                    href="/admin"
                    className="px-5 py-2 bg-[#F59E3D] hover:bg-[#E58F2E] text-[#2D1B0E] text-xs font-bold rounded-full shadow-md transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#6E3E13]" />
                    <span>Panel Administrator</span>
                  </Link>
                )}
              </div>
            </div>

          </div>

          {/* Details Grid (Phone & Address) */}
          <div className="flex flex-col sm:flex-row items-start gap-6 border-t md:border-t-0 md:border-l border-amber-200/60 pt-6 md:pt-0 md:pl-8 w-full md:w-auto">
            
            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-orange-100/70 text-orange-600 rounded-2xl shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">No. Telepon</span>
                <span className="text-xs font-bold text-slate-800">
                  {phone || <span className="text-slate-400 font-normal italic">Belum diisi</span>}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 max-w-xs">
              <div className="p-2.5 bg-amber-100/70 text-amber-700 rounded-2xl shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Alamat Pengiriman</span>
                <span className="text-xs font-semibold text-slate-800 leading-snug">
                  {address || <span className="text-slate-400 font-normal italic">Belum diisi</span>}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* TWO COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Account & Live Chat */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* LIVE CHAT CUSTOMER SERVICE CARD */}
            <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-4">
              {/* CS Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-slate-900">CS & Support</h3>
                    <p className="text-[10px] text-slate-500">Live chat bantuan resto</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleChipClick('Halo Min, pesanan saya belum sampai nih, tolong dicek ya.')}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-slate-700 rounded-lg border border-amber-200/80 transition-colors text-[10px] font-medium"
                >
                  🚚 Pesanan Belum Sampai
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick('Halo Min, saya ada kendala saat pembayaran.')}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-slate-700 rounded-lg border border-amber-200/80 transition-colors text-[10px] font-medium"
                >
                  💳 Kendala Bayar
                </button>
              </div>

              {/* Chat History Container */}
              <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 max-h-[260px] overflow-y-auto space-y-2.5">
                {userChatHistory.length === 0 ? (
                  <div className="py-6 text-center space-y-1.5">
                    <MessageSquare className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">Belum Ada Pesan Chat</p>
                    <p className="text-[10px] text-slate-400">Ketik pesan di bawah untuk menghubungi CS.</p>
                  </div>
                ) : (
                  userChatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1 text-[9px] text-slate-400">
                        <span className="font-bold text-slate-600">
                          {msg.sender === 'user' ? 'Anda' : 'Admin CS'}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[88%] px-3 py-2 rounded-xl text-xs leading-relaxed shadow-xs ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-br-none font-medium'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none font-normal'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Logout Card */}
            <div className="bg-white border border-amber-100 rounded-3xl p-5 shadow-sm">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-2xl text-xs font-bold text-red-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  <span>Keluar / Logout Akun</span>
                </div>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Riwayat Pembelian & Status Pesanan 5-Tahap */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header & Filter Tabs */}
            <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-orange-500" />
                    <span>Riwayat Pembelian & Pembayaran</span>
                  </h2>
                  <p className="text-xs text-slate-500">Lacak status pesanan 5-tahap & lakukan konfirmasi pesanan diterima.</p>
                </div>
              </div>

              {/* NOTIFIKASI RESTO MEMBLUDAK (>15 ORDER) */}
              {orders.length > 15 && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse mt-3">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-rose-900">
                      Resto Sedang Membludak / Sangat Ramai! ({orders.length} Pesanan Bersamaan)
                    </h4>
                    <p className="text-[11px] font-medium leading-relaxed text-rose-800">
                      Dapur kami saat ini sedang melayani lebih dari 15 pemesanan sekaligus di waktu yang sama. Estimasi kedatangan pesanan Anda diperkirakan <strong>MELEBIHI 1 JAM (~1.5 Jam / 90 Menit)</strong>. Terima kasih atas kesabaran Anda menunggu hidangan lezat kami!
                    </p>
                  </div>
                </div>
              )}

              {/* Status Filters */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                <button
                  onClick={() => setOrderFilter('ALL')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    orderFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-100/60'
                  }`}
                >
                  Semua Pesanan ({myOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('DELIVERING')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilter === 'DELIVERING'
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/25'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Sedang Diantar ({myOrders.filter(o => o.status === 'DELIVERING' || o.status === 'SHIPPING').length})</span>
                </button>
                <button
                  onClick={() => setOrderFilter('COMPLETED')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilter === 'COMPLETED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selesai / Diterima ({myOrders.filter(o => o.status === 'COMPLETED').length})</span>
                </button>
              </div>
            </div>

            {/* Orders List / Empty State */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-amber-100 rounded-3xl p-10 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-amber-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-slate-900">Tidak Ada Pesanan</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-light leading-relaxed">
                    Belum ada riwayat transaksi pada kategori ini. Jelajahi sajian kuliner kami dan nikmati diskon menarik!
                  </p>
                </div>
                <div className="pt-2">
                  <Link 
                    href="/menu"
                    className="btn-primary inline-flex max-w-xs mx-auto"
                  >
                    <span>Jelajahi Menu Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <RealtimeOrderTracker
                    key={order.id}
                    order={order}
                    onConfirmReceived={handleConfirmReceived}
                    isHighDemand={orders.length > 15}
                  />
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* 3. EDIT PROFILE MODAL */}
      {isEditingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900">Edit Profil Pengguna</h3>
              <button onClick={() => setIsEditingModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="py-8 text-center space-y-2 text-emerald-600">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <p className="text-sm font-bold">Profil Berhasil Diperbarui!</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Photo Upload Section in Modal */}
                <div className="flex items-center gap-4 p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userAvatar}
                      alt="Preview Foto Profil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Foto Profil</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Ganti Foto dari Galeri</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-xxxx-xxxx"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Pengiriman</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat rumah / pengiriman lengkap Anda..."
                    rows={3}
                    className="w-full px-4 py-3 bg-amber-50/30 border border-amber-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-full shadow-md shadow-orange-500/20"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
