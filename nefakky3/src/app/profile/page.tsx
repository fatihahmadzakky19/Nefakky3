'use client';

/**
 * ============================================================================
 * HALAMAN: Profil Pengguna & Dashboard Pelanggan (src/app/profile/page.tsx)
 * DESKRIPSI: Dikonversikan secara presisi 100% dari ekspor Stitch MCP HTML/Tailwind
 *            (Fixed Header, Banner Profil Utama Rounded-[32px] dengan Avatar Edit,
 *            Layout 2-Kolom: CS Live Support Desk Chat h-[700px] dengan Quick Chips,
 *            Alert Resto Membludak Dinamis, Kelola Multi-Alamat Rumah & Kantor,
 *            Riwayat Pesanan Tabbed Aktif/Selesai dengan Tombol Lacak & Pesan Lagi).
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData } from '@/context/DataContext';
import { 
  Search, 
  Bell, 
  ShoppingBag, 
  User, 
  Edit3, 
  Phone, 
  Home, 
  Briefcase, 
  Headphones, 
  Bot, 
  Send, 
  Paperclip, 
  Flame, 
  MapPin, 
  RefreshCw, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  X, 
  CheckCircle2,
  LogOut,
  Camera,
  Image as ImageIcon,
  Globe,
  Link2,
  RotateCcw,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';

/** Helper Kompresi & Konversi Gambar ke Data URL Base64 yang Optimal */
const compressImageFile = (file: File, maxWidth = 400, maxHeight = 400, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function UserProfilePage() {
  const router = useRouter();
  const { 
    user, 
    logout, 
    updatePhoto, 
    updateProfile, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
  } = useAuth();
  const { orders, chatMessages, sendChatMessage, isHighDemand, highDemandMessage } = useData();
  const { addToCart, totalCartCount } = useCart();

  // File & Camera Input References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // State Tabs Riwayat Pesanan: 'all' | 'active' | 'completed'
  const [orderTab, setOrderTab] = useState<'all' | 'active' | 'completed'>('all');

  // State Edit Profile Modal
  const defaultUserPhoto = user?.photoURL || (user?.displayName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=25160E&color=ffffff&bold=true` : 'https://ui-avatars.com/api/?name=User&background=25160E&color=ffffff&bold=true');
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(user?.displayName || 'Pelanggan Nefakky');
  const [editPhone, setEditPhone] = useState<string>(user?.phoneNumber || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>(defaultUserPhoto);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState<boolean>(false);
  const [photoFeedback, setPhotoFeedback] = useState<string | null>(null);

  // State Add/Edit Address Modal
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [modalAddressLabel, setModalAddressLabel] = useState<string>('Rumah');
  const [modalAddressText, setModalAddressText] = useState<string>('');
  const [modalReceiverName, setModalReceiverName] = useState<string>('');
  const [modalReceiverPhone, setModalReceiverPhone] = useState<string>('');
  const [modalIsDefault, setModalIsDefault] = useState<boolean>(false);

  React.useEffect(() => {
    if (user) {
      setEditName(user.displayName || 'Pelanggan Nefakky');
      setEditPhone(user.phoneNumber || '');
      setEditAvatarUrl(user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=25160E&color=ffffff&bold=true`);
    }
  }, [user]);

  // Handler: Ambil foto dari Galeri HP / PC atau Kamera Selfie
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setPhotoFeedback('Memproses gambar...');
      const compressedDataUrl = await compressImageFile(file);
      setEditAvatarUrl(compressedDataUrl);
      setPhotoFeedback('Foto profil berhasil dimuat!');
      setTimeout(() => setPhotoFeedback(null), 3500);
    } catch (err) {
      console.error("Gagal membaca file gambar:", err);
      setPhotoFeedback('Gagal memuat file gambar.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Handler: Sinkronkan dengan foto akun Google
  const handleSyncGooglePhoto = () => {
    const googlePhoto = user?.photoURL && user.photoURL.includes('googleusercontent.com')
      ? user.photoURL
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Google User')}&background=4285F4&color=ffffff&bold=true`;
    
    setEditAvatarUrl(googlePhoto);
    setPhotoFeedback('Foto akun Google diterapkan!');
    setTimeout(() => setPhotoFeedback(null), 3500);
  };

  // Handler: Reset ke avatar inisial nama
  const handleResetToInitials = () => {
    const initialAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(editName || user?.displayName || user?.email || 'User')}&background=25160E&color=ffffff&bold=true`;
    setEditAvatarUrl(initialAvatar);
    setPhotoFeedback('Avatar inisial nama diterapkan!');
    setTimeout(() => setPhotoFeedback(null), 3500);
  };

  // Dynamic Addresses from user profile
  const addresses = user?.addresses || [];
  const primaryAddress = addresses.find(a => a.isDefault) || addresses[0];

  // Address Modal Handlers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setModalAddressLabel('Rumah');
    setModalAddressText('');
    setModalReceiverName(user?.displayName || '');
    setModalReceiverPhone(user?.phoneNumber || '');
    setModalIsDefault(addresses.length === 0);
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setModalAddressLabel(addr.label || 'Rumah');
    setModalAddressText(addr.address || '');
    setModalReceiverName(addr.receiverName || user?.displayName || '');
    setModalReceiverPhone(addr.receiverPhone || user?.phoneNumber || '');
    setModalIsDefault(Boolean(addr.isDefault));
    setShowAddressModal(true);
  };

  const handleSaveAddressModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAddressText.trim()) return;

    if (editingAddressId) {
      if (updateAddress) {
        await updateAddress(editingAddressId, {
          label: modalAddressLabel,
          address: modalAddressText.trim(),
          receiverName: modalReceiverName.trim() || user?.displayName || 'Pelanggan',
          receiverPhone: modalReceiverPhone.trim() || user?.phoneNumber || '',
          isDefault: modalIsDefault
        });
      }
    } else {
      if (addAddress) {
        await addAddress({
          label: modalAddressLabel,
          address: modalAddressText.trim(),
          receiverName: modalReceiverName.trim() || user?.displayName || 'Pelanggan',
          receiverPhone: modalReceiverPhone.trim() || user?.phoneNumber || '',
          isDefault: modalIsDefault || addresses.length === 0
        });
      }
    }
    setShowAddressModal(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      if (deleteAddress) {
        await deleteAddress(id);
      }
    }
  };

  const handleSetPrimaryAddress = async (id: string) => {
    if (setDefaultAddress) {
      await setDefaultAddress(id);
    }
  };

  // State CS Live Chat
  const [chatInput, setChatInput] = useState<string>('');
  const userEmail = user?.email || 'pelanggan@nefakky.com';
  const userName = user?.displayName || 'Pelanggan Nefakky';

  // Filter messages for current user
  const userChats = (chatMessages || []).filter(
    (msg: any) => (msg.userEmail || '').toLowerCase() === userEmail.toLowerCase()
  );

  const handleSendChat = (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text || !text.trim()) return;

    sendChatMessage(userEmail, userName, text.trim(), editAvatarUrl);
    setChatInput('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateProfile) {
      updateProfile({
        displayName: editName.trim(),
        phoneNumber: editPhone.trim(),
        photoURL: editAvatarUrl
      });
    } else if (updatePhoto && editAvatarUrl) {
      updatePhoto(editAvatarUrl);
    }
    setShowEditModal(false);
  };

  const handleReorder = (order: any) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        addToCart(item.id);
      });
      router.push('/cart');
    }
  };

  // Filter pesanan sesuai tab
  const myOrders = (orders || []).filter(o => {
    if (orderTab === 'active') return o.status !== 'COMPLETED' && o.status !== 'CANCELLED';
    if (orderTab === 'completed') return o.status === 'COMPLETED' || o.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="bg-[#fcf8fa] font-sans text-[#1b1b1d] min-h-screen selection:bg-stone-900 selection:text-white flex flex-col justify-between">
      
      <div>
        {/* 1. FIXED HEADER SESUAI STITCH MCP */}
        <header className="fixed top-0 w-full z-50 bg-[#fcf8fa]/90 backdrop-blur-xl border-b border-stone-200 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
            
            {/* Brand Wordmark (Left) */}
            <div className="flex-1 flex items-center font-serif text-2xl tracking-widest text-black font-bold">
              <Link href="/">NEFAKKY</Link>
            </div>

            {/* Desktop Navigation (Centered) */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link href="/" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Beranda
              </Link>
              <Link href="/menu" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Menu
              </Link>
              <Link href="/comments" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Ulasan Rasa
              </Link>
              <Link href="/notifications" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Pesanan
              </Link>
            </nav>

            {/* Right Action Icons & Profile (Right) */}
            <div className="flex-1 flex items-center justify-end gap-6">
              <div className="relative flex items-center">
                <Link href="/cart" className="text-stone-600 hover:text-black transition-colors" title="Keranjang">
                  <ShoppingBag className="w-5 h-5" />
                </Link>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 bg-black text-white text-[10px] font-bold rounded-full">
                    {totalCartCount}
                  </span>
                )}
              </div>

              <Link 
                href="/profile"
                className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:bg-neutral-800 transition-colors overflow-hidden cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={editAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
              </Link>
            </div>

          </div>
        </header>

        {/* 2. MAIN PROFILE CONTENT */}
        <main className="w-full pt-20 bg-[#fcf8fa]">
          <div className="flex flex-col w-full">
            <div className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 text-left">
              
              {/* ========================================================================= */}
              {/* BANNER PROFIL UTAMA ROUNDED-[32PX] */}
              {/* ========================================================================= */}
              <section className="w-full bg-white shadow-md rounded-[32px] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row gap-8 justify-between items-start relative z-10 border border-stone-200">
                
                {/* Left: Avatar & Info */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="relative group cursor-pointer" onClick={() => setShowEditModal(true)}>
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-sm bg-stone-100 border border-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        src={editAvatarUrl} 
                        alt={editName}
                      />
                    </div>
                    <button 
                      type="button"
                      className="absolute bottom-0 right-0 w-9 h-9 bg-black text-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                      title="Ganti Foto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight leading-none">
                        {editName}
                      </h1>
                      <span className="px-2.5 py-1 bg-stone-100 text-stone-700 font-semibold text-[10px] rounded-md uppercase tracking-wider shadow-2xs border border-stone-200">
                        {user?.role === 'admin' ? 'Administrator' : 'Google SSO'}
                      </span>
                    </div>
                    
                    <p className="font-mono text-xs sm:text-sm text-stone-500">{userEmail}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        Edit Profil
                      </button>
                      
                      {user?.role === 'admin' && (
                        <Link 
                          href="/admin/products"
                          className="bg-stone-100 text-black px-5 py-2.5 rounded-xl font-semibold text-xs border border-stone-200 shadow-2xs hover:bg-stone-200 transition-colors"
                        >
                          Panel Administrator
                        </Link>
                      )}

                      <button 
                        onClick={() => logout && logout()}
                        className="text-stone-500 hover:text-rose-600 px-3 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Contact & Primary Address */}
                <div className="w-full lg:w-80 flex flex-col gap-3">
                  <div className="bg-stone-50 p-4 rounded-2xl flex items-center gap-4 border border-stone-200 shadow-2xs">
                    <div className="w-11 h-11 rounded-full bg-stone-200 flex items-center justify-center text-black shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Telepon</span>
                      {user?.phoneNumber ? (
                        <span className="font-mono font-bold text-xs text-black truncate">{user.phoneNumber}</span>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Belum diatur</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-2xl flex items-start gap-4 border border-stone-200 shadow-2xs relative overflow-hidden group">
                    <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center text-white shrink-0 z-10">
                      <Home className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0 z-10">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-widest">Alamat Rumah</span>
                        {primaryAddress && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      {primaryAddress ? (
                        <p className="text-xs text-black line-clamp-2 mt-1 font-light leading-relaxed">
                          {primaryAddress.address}
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400 italic mt-1 font-light">
                          Belum ada alamat tersimpan (Otomatis saat checkout)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </section>

              {/* ========================================================================= */}
              {/* TWO-COLUMN LAYOUT (CS LIVE CHAT & MAIN CONTENT) */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                
                {/* LEFT SIDEBAR: CS Live Chat (4 Cols) */}
                <aside className="lg:col-span-4 flex flex-col">
                  <div className="bg-white shadow-md rounded-[32px] p-6 flex flex-col h-[700px] relative overflow-hidden border border-stone-200">
                    
                    {/* Chat Header */}
                    <div className="flex items-center justify-between pb-4 mb-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                          <Headphones className="w-5 h-5" />
                        </div>
                        <h2 className="font-serif text-lg font-bold text-black">Support Desk</h2>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full border border-stone-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[11px] font-semibold text-stone-700">Online</span>
                      </div>
                    </div>

                    {/* Quick Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      <button 
                        onClick={() => handleSendChat('Pesanan saya belum sampai, mohon dicek ya.')}
                        className="whitespace-nowrap px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-[11px] font-semibold text-black transition-colors cursor-pointer"
                      >
                        Pesanan Belum Sampai
                      </button>
                      <button 
                        onClick={() => handleSendChat('Bagaimana cara konfirmasi kendala pembayaran Midtrans?')}
                        className="whitespace-nowrap px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-[11px] font-semibold text-black transition-colors cursor-pointer"
                      >
                        Kendala Bayar
                      </button>
                      <button 
                        onClick={() => handleSendChat('Halo admin, boleh minta rekomendasi menu terlaris?')}
                        className="whitespace-nowrap px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-[11px] font-semibold text-black transition-colors cursor-pointer"
                      >
                        Rekomendasi Menu
                      </button>
                    </div>

                    {/* Chat Feed */}
                    <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-3 pr-1">
                      <p className="text-[11px] font-mono text-stone-400 text-center my-1">Hari ini, Live CS Support</p>

                      {/* Default Welcome Message */}
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-black" />
                        </div>
                        <div className="bg-stone-100 p-3.5 rounded-2xl rounded-tl-none text-xs text-black font-light leading-relaxed">
                          Halo {editName}! Ada yang bisa kami bantu dengan pesanan kuliner Nefakky Anda hari ini?
                        </div>
                      </div>

                      {/* Dynamic User Messages */}
                      {userChats.map((msg: any, idx: number) => {
                        const isFromUser = msg.sender === 'user';
                        return (
                          <div 
                            key={idx} 
                            className={`flex gap-2 max-w-[85%] ${isFromUser ? 'self-end flex-row-reverse' : ''}`}
                          >
                            {!isFromUser && (
                              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                                <Headphones className="w-4 h-4" />
                              </div>
                            )}
                            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isFromUser 
                                ? 'bg-black text-white rounded-tr-none font-light' 
                                : 'bg-stone-100 text-black rounded-tl-none font-light'
                            }`}>
                              <p>{msg.text}</p>
                              <span className="text-[9px] opacity-60 block text-right mt-1">{msg.timestamp || 'Baru saja'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Input Bar */}
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                      className="pt-3 border-t border-stone-100 flex items-center gap-2"
                    >
                      <button 
                        type="button" 
                        onClick={() => alert('Fitur upload berkas ke CS aktif.')}
                        className="w-11 h-11 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors shrink-0"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      
                      <div className="flex-1 bg-stone-100 rounded-xl flex items-center px-3 h-11 border border-stone-200">
                        <input 
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ketik pesan ke CS..."
                          className="w-full bg-transparent text-xs text-black placeholder-stone-400 focus:outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-11 h-11 rounded-xl bg-black hover:bg-neutral-800 flex items-center justify-center text-white transition-colors shrink-0 shadow-xs cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>
                </aside>

                {/* RIGHT MAIN COLUMN: Addresses & Orders (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Alert Banner (Dynamic Resto Demand) */}
                  <div className="w-full bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl shadow-2xs flex items-center gap-4">
                    <Flame className="w-6 h-6 text-amber-600 shrink-0 animate-bounce" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-bold text-xs uppercase tracking-wider">
                        {isHighDemand ? 'Resto Sedang Membludak!' : 'Dapur Siap Melayani Pesanan'}
                      </span>
                      <span className="text-xs font-light opacity-90">
                        {highDemandMessage || 'Waktu tunggu pengiriman standar 20-35 menit langsung dari dapur kami.'}
                      </span>
                    </div>
                  </div>

                  {/* Section A: Manage Addresses */}
                  <section className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-black" />
                        <h3 className="font-serif text-xl font-bold text-black tracking-tight">Kelola Alamat Pengiriman</h3>
                      </div>
                      <button
                        onClick={handleOpenAddAddress}
                        className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Alamat</span>
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="bg-white p-8 rounded-2xl shadow-xs border border-dashed border-stone-300 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h4 className="font-serif text-sm font-bold text-neutral-900">Belum Ada Alamat Tersimpan</h4>
                          <p className="text-xs text-stone-500 font-light leading-relaxed">
                            Alamat Anda akan otomatis tersimpan saat pertama kali checkout, atau Anda dapat menambahkannya sekarang.
                          </p>
                        </div>
                        <button
                          onClick={handleOpenAddAddress}
                          className="mt-1 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Alamat Baru</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div 
                            key={addr.id}
                            className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 flex flex-col gap-3 relative overflow-hidden group justify-between"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-black text-white rounded-lg">
                                  {addr.label?.toLowerCase().includes('kantor') ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                                </div>
                                <span className="font-bold text-xs text-black">{addr.label}</span>
                              </div>
                              {addr.isDefault && (
                                <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 font-bold text-[10px] rounded-md uppercase tracking-wider border border-stone-200">
                                  Utama
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-stone-600 font-light line-clamp-2 leading-relaxed">
                              {addr.address}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-100">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleOpenEditAddress(addr)}
                                  className="font-semibold text-xs text-black hover:underline cursor-pointer"
                                >
                                  Edit
                                </button>
                                
                                {!addr.isDefault && (
                                  <>
                                    <span className="text-stone-300">/</span>
                                    <button 
                                      onClick={() => handleSetPrimaryAddress(addr.id)}
                                      className="font-semibold text-xs text-stone-500 hover:text-black cursor-pointer"
                                    >
                                      Jadikan Utama
                                    </button>
                                  </>
                                )}
                              </div>

                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                                title="Hapus Alamat"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Section B: Order History */}
                  <section className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="font-serif text-xl font-bold text-black tracking-tight">Riwayat Pesanan</h3>
                      
                      {/* Tabs */}
                      <div className="flex p-1 bg-stone-100 rounded-xl border border-stone-200 w-fit">
                        <button 
                          onClick={() => setOrderTab('all')}
                          className={`px-4 py-1.5 font-semibold text-xs rounded-lg transition-colors ${
                            orderTab === 'all' ? 'bg-white text-black shadow-xs' : 'text-stone-600 hover:text-black'
                          }`}
                        >
                          Semua
                        </button>
                        <button 
                          onClick={() => setOrderTab('active')}
                          className={`px-4 py-1.5 font-semibold text-xs rounded-lg transition-colors ${
                            orderTab === 'active' ? 'bg-white text-black shadow-xs' : 'text-stone-600 hover:text-black'
                          }`}
                        >
                          Aktif
                        </button>
                        <button 
                          onClick={() => setOrderTab('completed')}
                          className={`px-4 py-1.5 font-semibold text-xs rounded-lg transition-colors ${
                            orderTab === 'completed' ? 'bg-white text-black shadow-xs' : 'text-stone-600 hover:text-black'
                          }`}
                        >
                          Selesai
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {myOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-xs space-y-2">
                          <p className="text-xs text-stone-500 font-light">Tidak ada pesanan di kategori ini.</p>
                        </div>
                      ) : (
                        myOrders.map((ord: any) => {
                          const isActive = ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED';

                          return (
                            <div 
                              key={ord.id}
                              className={`bg-white p-5 rounded-2xl border flex flex-col sm:flex-row gap-5 items-center justify-between shadow-xs transition-all ${
                                isActive ? 'border-stone-300' : 'border-stone-200 opacity-90'
                              }`}
                            >
                              <div className="w-full sm:w-28 h-28 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 relative">
                                <Image 
                                  src={ord.items?.[0]?.image || '/images/ayam_bakar.jpg'} 
                                  alt={ord.items?.[0]?.name || 'Menu'} 
                                  fill 
                                  className="object-cover" 
                                  sizes="112px"
                                />
                              </div>

                              <div className="flex-1 flex flex-col gap-2 w-full">
                                <div className="flex justify-between items-start w-full">
                                  <div>
                                    <span className="font-mono text-[11px] text-stone-400">
                                      #{ord.id} • {ord.date || 'Hari ini'}
                                    </span>
                                    <h4 className="font-serif text-base font-bold text-black mt-0.5">
                                      {ord.items?.[0]?.name || 'Nefakky Signature Bundle'}
                                    </h4>
                                  </div>

                                  <div className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                    isActive ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  }`}>
                                    {isActive && <RefreshCw className="w-3 h-3 animate-spin" />}
                                    <span>{isActive ? 'Diproses' : 'Selesai'}</span>
                                  </div>
                                </div>

                                <p className="text-xs text-stone-500 font-light line-clamp-1">
                                  {ord.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')}
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                                  <span className="font-mono font-bold text-xs text-black">
                                    Rp {(ord.total || ord.subtotal || 145000).toLocaleString('id-ID')}
                                  </span>

                                  {isActive ? (
                                    <Link 
                                      href="/notifications" 
                                      className="font-semibold text-xs text-black hover:text-stone-700 flex items-center gap-1"
                                    >
                                      <span>Lacak Status</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  ) : (
                                    <button 
                                      onClick={() => handleReorder(ord)}
                                      className="font-semibold text-xs text-black bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                    >
                                      Pesan Lagi
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>

                </div>

              </div>

            </div>
          </div>
        </main>
      </div>

      {/* 3. MODAL EDIT PROFILE DENGAN 3 PILIHAN FOTO (GALERI, FOTO SENDIRI/KAMERA, GOOGLE/MANUAL) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left border border-stone-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-neutral-900">Edit Profil Pelanggan</h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">Perbarui nama, nomor kontak, dan foto profil Anda.</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-black hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden Input Files untuk Galeri & Kamera */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileSelect} 
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              accept="image/*" 
              capture="user" 
              className="hidden" 
              onChange={handleFileSelect} 
            />

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              {/* Bagian Pilihan Foto Profil */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200/80 space-y-3">
                <label className="font-bold text-stone-800 block text-xs">
                  Foto Profil (Avatar)
                </label>

                {/* Pratinjau Foto */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-stone-300 shadow-md bg-stone-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={editAvatarUrl} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover" 
                    />
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-900">Pilih Sumber Foto:</p>
                    <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                      Unggah dari galeri perangkat, ambil foto selfie lewat kamera, atau sinkronkan foto Google.
                    </p>
                    {photoFeedback && (
                      <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 animate-fade-in">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{photoFeedback}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 3 Tombol Opsi: Galeri, Kamera / Foto Sendiri, Google */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  
                  {/* Opsi 1: Galeri */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-[#934B19] transition-all text-neutral-800 group cursor-pointer shadow-2xs active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100/70 text-[#934B19] flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[11px]">Dari Galeri</span>
                    <span className="text-[9px] text-stone-400">Pilih File</span>
                  </button>

                  {/* Opsi 2: Foto Sendiri / Kamera */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-emerald-700 transition-all text-neutral-800 group cursor-pointer shadow-2xs active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[11px]">Foto Sendiri</span>
                    <span className="text-[9px] text-stone-400">Kamera/Selfie</span>
                  </button>

                  {/* Opsi 3: Login / Akun Google */}
                  <button
                    type="button"
                    onClick={handleSyncGooglePhoto}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 hover:border-blue-600 transition-all text-neutral-800 group cursor-pointer shadow-2xs active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[11px]">Foto Google</span>
                    <span className="text-[9px] text-stone-400">Akun Google</span>
                  </button>

                </div>

                {/* Toggle Input URL Manual atau Reset */}
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                    className="text-[#934B19] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>{showManualUrlInput ? 'Sembunyikan URL Manual' : 'Input URL / Link Foto Manual'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToInitials}
                    className="text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Inisial Nama</span>
                  </button>
                </div>

                {/* Input Text URL Manual jika dibuka */}
                {showManualUrlInput && (
                  <div className="pt-2 animate-fade-in">
                    <input 
                      type="url"
                      placeholder="https://contoh-link-gambar.com/foto.jpg"
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}

              </div>

              {/* Form Input Nama Lengkap */}
              <div>
                <label className="font-semibold text-neutral-900 block mb-1">Nama Lengkap</label>
                <input 
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              {/* Form Input Nomor Telepon / WhatsApp */}
              <div>
                <label className="font-semibold text-neutral-900 block mb-1">Nomor Telepon / WhatsApp</label>
                <input 
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="+62 812-3456-7890"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-black text-white font-semibold text-xs py-3 rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 bg-stone-100 text-neutral-800 font-semibold text-xs py-3 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL TAMBAH / EDIT ALAMAT PENGIRIMAN */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-left border border-stone-200 animate-fade-in">
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-neutral-900">
                  {editingAddressId ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Baru'}
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Isi detail alamat pengantaran hidangan kuliner Anda.
                </p>
              </div>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-black hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddressModal} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-900 block mb-1">
                  Label Alamat <span className="text-[10px] font-normal text-stone-500">(Bisa diketik manual atau pilih cepat)</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={modalAddressLabel}
                    onChange={(e) => setModalAddressLabel(e.target.value)}
                    placeholder="Tulis label custom (misal: Rumah Nenek, Kosan, Kantor Cabang...)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 font-medium mr-0.5">Pilihan cepat:</span>
                    {['Rumah', 'Kantor', 'Apartemen', 'Kos', 'Villa', 'Toko'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setModalAddressLabel(lbl)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                          modalAddressLabel.trim().toLowerCase() === lbl.toLowerCase()
                            ? 'bg-black text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-900 block mb-1">Alamat Lengkap</label>
                <textarea
                  required
                  rows={3}
                  value={modalAddressText}
                  onChange={(e) => setModalAddressText(e.target.value)}
                  placeholder="Contoh: Jl. Bojong Indah No. 12, RT 02 / RW 05, Kel. Pabuaran, Kec. Bojong Gede"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-900 block mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    value={modalReceiverName}
                    onChange={(e) => setModalReceiverName(e.target.value)}
                    placeholder="Nama penerima"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-900 block mb-1">No. Telepon</label>
                  <input
                    type="tel"
                    value={modalReceiverPhone}
                    onChange={(e) => setModalReceiverPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modalIsDefault}
                  onChange={(e) => setModalIsDefault(e.target.checked)}
                  className="rounded text-black focus:ring-black"
                />
                <span className="text-xs text-stone-700 font-medium">Jadikan Alamat Pengiriman Utama</span>
              </label>

              <div className="pt-2 flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-black text-white font-semibold text-xs py-3 rounded-xl hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {editingAddressId ? 'Simpan Perubahan' : 'Tambah Alamat'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-5 bg-stone-100 text-neutral-800 font-semibold text-xs py-3 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
