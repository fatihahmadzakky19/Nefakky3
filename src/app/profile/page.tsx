'use client';

/**
 * ============================================================================
 * HALAMAN: Profil Pengguna (src/app/profile/page.tsx)
 * DESKRIPSI: Dashboard pribadi pelanggan untuk mengelola data akun, riwayat pesanan,
 *            status pengiriman real-time, obrolan bantuan live chat dengan admin,
 *            serta pengaturan alamat & telepon.
 * GUIDELINES: Mengikuti Standar Industri UI/UX, Clean Code, Aksesibilitas,
 *            dan 100% Bahasa Indonesia.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { useData, ChatMessage } from '@/context/DataContext';
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
  Clock
} from 'lucide-react';

interface UserOrder {
  id: string;
  title: string;
  date: string;
  status: 'Delivered' | 'In Transit' | 'Processing';
  price: number;
  image: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const { user, loading, logout, updatePhoto } = useAuth();
  const { chatMessages, sendChatMessage, markChatAsRead } = useData();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Generate dynamic initial avatar per user email/name if photoURL is not uploaded yet
  const nameForAvatar = user?.displayName || user?.email || 'User';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=5C3D28&color=ffffff&bold=true&size=256`;
  const userAvatar = user?.photoURL || defaultAvatar;

  const currentUserEmail = (user?.email || '').toLowerCase();
  const userChatHistory = chatMessages.filter(m => m.userEmail.toLowerCase() === currentUserEmail);

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

  // Authentication Guard: handled via UI prompt when !user
  useEffect(() => {
    if (!loading && user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || 'Pelanggan');
      setPhone(user.phoneNumber || '');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5C3D28] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Profil Pengguna...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-[#5C3D28] rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
            👤
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-stone-900">Profil Pelanggan</h2>
            <p className="text-xs text-stone-600 font-light leading-relaxed">
              Silakan masuk atau mendaftar akun terlebih dahulu untuk melihat profil, riwayat pesanan, dan dukungan pelanggan.
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

      {/* 2. MAIN PROFILE CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-8">
        
        {/* TOP PROFILE BANNER CARD */}
        <div className="bg-[#FAF8F5] border border-stone-200/60 rounded-[32px] p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          
          {/* Avatar & Main User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left w-full md:w-auto">
            
            {/* Avatar with Edit Pencil Overlay */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md shrink-0 bg-stone-100 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userAvatar}
                alt={displayName}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute bottom-1 right-1 p-1.5 bg-stone-700 hover:bg-stone-900 text-white rounded-full shadow transition-all"
                title="Ambil Foto dari Galeri"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name, Email, Edit Profile Button */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-normal text-[#2D231C]">
                {displayName}
              </h1>
              <p className="text-xs text-stone-500 font-mono">
                {user.email || 'eleanor.vance@lifestyle.com'}
              </p>

              <div className="pt-2 flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <button
                  onClick={() => setIsEditingModal(true)}
                  className="px-6 py-2.5 bg-[#424242] hover:bg-[#262626] text-white text-xs font-medium rounded-full shadow-sm transition-all"
                >
                  Edit Profile
                </button>
                {(user.role === 'admin' || user.email === 'fatihahmadzakky19@gmail.com') && (
                  <Link
                    href="/admin"
                    className="px-6 py-2.5 bg-[#613A1F] hover:bg-[#4A2B16] text-white text-xs font-semibold rounded-full shadow-md transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Kembali ke Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>

          </div>

          {/* Details Grid (Phone & Address) */}
          <div className="flex flex-col sm:flex-row items-start gap-8 border-t md:border-t-0 md:border-l border-stone-200/60 pt-6 md:pt-0 md:pl-10 w-full md:w-auto">
            
            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#F5F2EC] text-stone-600 rounded-full shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-stone-400 font-medium block">Phone</span>
                <span className="text-xs font-semibold text-stone-800">
                  {phone || <span className="text-stone-400 font-normal italic">Belum diisi</span>}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 max-w-xs">
              <div className="p-2.5 bg-[#F5F2EC] text-stone-600 rounded-full shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-stone-400 font-medium block">Address</span>
                <span className="text-xs font-semibold text-stone-800 leading-snug">
                  {address || <span className="text-stone-400 font-normal italic">Belum diisi</span>}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* TWO COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Account Settings */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Account Settings Card */}
            <div className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-100 pb-3">
                Account Settings
              </h2>

              <div className="space-y-1">
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-2xl text-xs font-medium text-red-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Recent Orders & Customer Service */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* LIVE CHAT CUSTOMER SERVICE CARD */}
            <div className="bg-white border border-stone-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              {/* CS Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5C3D28] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
                      Customer Service & Support
                    </h3>
                    <p className="text-xs text-stone-500 font-light">
                      Tuliskan keresahan, kendala, atau pertanyaan Anda. Tim Admin CS siap membantu via Live Chat.
                    </p>
                  </div>
                </div>

                {/* Online Badge */}
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full text-emerald-800 text-xs font-semibold self-start sm:self-auto shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>CS Admin Online</span>
                </div>
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleChipClick('Halo Min, pesanan saya belum sampai nih, tolong dicek ya.')}
                  className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F5F2EC] text-stone-700 rounded-full border border-stone-200/80 transition-colors text-[11px]"
                >
                  🚚 Pesanan Belum Sampai
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick('Halo Min, saya ada kendala saat proses pembayaran.')}
                  className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F5F2EC] text-stone-700 rounded-full border border-stone-200/80 transition-colors text-[11px]"
                >
                  💳 Kendala Pembayaran
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick('Halo Min, mau tanya rekomendasi menu paling favorit dong.')}
                  className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F5F2EC] text-stone-700 rounded-full border border-stone-200/80 transition-colors text-[11px]"
                >
                  🍲 Tanya Menu & Bumbu
                </button>
              </div>

              {/* Chat History Container */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-stone-200/60 max-h-[340px] overflow-y-auto space-y-3">
                {userChatHistory.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-stone-300 mx-auto stroke-[1.5]" />
                    <p className="text-xs font-medium text-stone-600">Belum ada obrolan dengan CS</p>
                    <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                      Tuliskan keresahan atau pertanyaan Anda di bawah untuk memulai obrolan langsung dengan Admin Nefakky.
                    </p>
                  </div>
                ) : (
                  userChatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
                        <span className="font-semibold text-stone-600">
                          {msg.sender === 'user' ? 'Anda' : 'Admin CS Nefakky'}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#5C3D28] text-white rounded-br-none'
                            : 'bg-white border border-stone-200 text-stone-900 rounded-bl-none font-normal'
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
              <form onSubmit={handleSendChat} className="flex items-center gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ketikkan keresahan atau kendala Anda di sini..."
                  className="flex-1 px-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-full text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#5C3D28]/30 placeholder-stone-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-5 py-3 bg-[#5C3D28] hover:bg-[#432A1B] disabled:opacity-50 text-white text-xs font-semibold rounded-full shadow transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Kirim</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold text-stone-900">
                Recent Orders
              </h2>
              {orders.length > 0 && (
                <Link 
                  href="/#pesanan" 
                  className="text-xs font-medium text-[#7A4B29] hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Orders Cards List / Empty State */}
            {orders.length === 0 ? (
              <div className="bg-white border border-stone-200/60 rounded-3xl p-10 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 bg-[#F5F2EC] text-[#5C3D28] rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-semibold text-stone-900">Belum Ada Transaksi</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto font-light leading-relaxed">
                    Anda belum memiliki riwayat pemesanan. Jelajahi menu kami dan pesan sajian kuliner favorit Anda.
                  </p>
                </div>
                <div className="pt-2">
                  <Link 
                    href="/#menu-terlaris"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#424242] hover:bg-[#262626] text-white text-xs font-medium rounded-full shadow-sm transition-all"
                  >
                    <span>Mulai Belanja</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white border border-stone-200/60 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    
                    {/* Thumbnail & Title */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                        <Image
                          src={order.image}
                          alt={order.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-stone-400 block">
                          {order.id}
                        </span>
                        <h3 className="font-serif text-base font-semibold text-stone-900">
                          {order.title}
                        </h3>
                        <p className="text-xs text-stone-500 font-light">
                          {order.date}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge & Price */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
                        order.status === 'Delivered' ? 'bg-stone-100 text-stone-700' :
                        order.status === 'In Transit' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {order.status}
                      </span>

                      <span className="font-serif font-bold text-lg text-stone-900 min-w-[100px] text-right">
                        Rp {order.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* 3. EDIT PROFILE MODAL */}
      {isEditingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-xl font-semibold text-stone-900">Edit Profil Pengguna</h3>
              <button onClick={() => setIsEditingModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="py-8 text-center space-y-2 text-emerald-600">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="text-xs font-semibold">Profil berhasil diperbarui!</p>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Photo Upload Section in Modal */}
                <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userAvatar}
                      alt="Preview Foto Profil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-stone-800">Foto Profil</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-medium text-[#7A4B29] hover:underline flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Ganti Foto dari Galeri</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-xxxx-xxxx"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Alamat Pengiriman</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Masukkan alamat rumah / pengiriman lengkap Anda..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#F0EEEA] border border-[#E4E0D7] rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8A6337]/30"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingModal(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-full"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#424242] hover:bg-[#262626] text-white text-xs font-medium rounded-full"
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
