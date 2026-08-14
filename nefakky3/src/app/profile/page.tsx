'use client';

/**
 * ============================================================================
 * HALAMAN: Profil Pengguna & Riwayat Pembelian (src/app/profile/page.tsx)
 * DESKRIPSI: Dashboard pribadi pelanggan berbasis Google Stitch AI Design System
 *            (Espresso #25160E, Terracotta #934B19, Warm Cream #FBF9F5).
 * FITUR: Multi-Alamat pengiriman (Rumah, Kantor, Bepergian/Hotel), Auto-Fill GPS,
 *        Ganti Password (non-Google), lacak status pesanan realtime 5-tahap, 
 *        dan obrolan CS Live Chat.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, UserAddress } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { useData, AdminOrder } from '@/context/DataContext';
import RealtimeOrderTracker from '@/components/RealtimeOrderTracker';
import AutoMapPickerModal from '@/components/AutoMapPickerModal';
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
  CreditCard,
  User,
  Crown,
  Plus,
  Trash2,
  Navigation,
  Compass,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Home,
  Briefcase,
  Building,
  Plane,
  AlertCircle
} from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();
  const { 
    user, 
    loading, 
    logout, 
    updatePhoto, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress, 
    changePassword 
  } = useAuth();
  const { 
    orders, 
    confirmOrderReceived, 
    chatMessages, 
    sendChatMessage, 
    markChatAsRead,
    isHighDemand,
    highDemandMessage
  } = useData();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  // Edit Profile States
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditingModal, setIsEditingModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Chat & Order Filter States
  const [chatInput, setChatInput] = useState('');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERING' | 'COMPLETED'>('ALL');
  const [confirmedSuccessMessage, setConfirmedSuccessMessage] = useState<string | null>(null);

  // Multi-Address Management States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressObj, setEditingAddressObj] = useState<UserAddress | null>(null);
  const [addressLabel, setAddressLabel] = useState('Rumah');
  const [addressReceiverName, setAddressReceiverName] = useState('');
  const [addressReceiverPhone, setAddressReceiverPhone] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [addressIsDefault, setAddressIsDefault] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [addressNoticeMessage, setAddressNoticeMessage] = useState<string | null>(null);

  // Change Password States (For Non-Google Accounts)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Generate dynamic initial avatar per user email/name
  const nameForAvatar = user?.displayName || user?.email || 'User';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=3C2A21&color=ffffff&bold=true&size=256`;
  const userAvatar = user?.photoURL || defaultAvatar;

  const currentUserEmail = (user?.email || '').toLowerCase();
  const userChatHistory = chatMessages.filter(m => m.userEmail.toLowerCase() === currentUserEmail);

  // Active address resolution
  const userAddresses = user?.addresses || [];
  const activeAddress = userAddresses.find(a => a.id === user?.activeAddressId) || userAddresses.find(a => a.isDefault) || userAddresses[0];

  // Filter & sort orders matching current user in real-time
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

  // Auto mark chat as read
  useEffect(() => {
    if (user?.email) {
      markChatAsRead(user.email, 'user');
    }
  }, [user, chatMessages.length]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userChatHistory.length]);

  // Authentication Guard & Prefill
  useEffect(() => {
    if (!loading && user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || 'Pelanggan');
      setPhone(user.phoneNumber || '+6281234567890');
    }
  }, [user, loading]);

  // Handle Chat Submit
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

  // Address Modal Handlers
  const handleOpenAddAddressModal = () => {
    setEditingAddressObj(null);
    setAddressLabel('Rumah');
    setAddressReceiverName(displayName || 'Pelanggan Nefakky');
    setAddressReceiverPhone(phone || '+6281234567890');
    setAddressDetails('');
    setAddressIsDefault(userAddresses.length === 0);
    setGpsError(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddressModal = (addr: UserAddress) => {
    setEditingAddressObj(addr);
    setAddressLabel(addr.label);
    setAddressReceiverName(addr.receiverName || displayName);
    setAddressReceiverPhone(addr.receiverPhone || phone);
    setAddressDetails(addr.address);
    setAddressIsDefault(addr.isDefault || false);
    setGpsError(null);
    setIsAddressModalOpen(true);
  };

  // GPS Auto Detect Location
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data && data.display_name) {
            setAddressDetails(data.display_name);
          } else {
            setAddressDetails(`Alamat Terdeteksi GPS (${lat.toFixed(5)}, ${lon.toFixed(5)}) - Jakarta`);
          }
        } catch {
          setAddressDetails(`Alamat GPS (${lat.toFixed(4)}, ${lon.toFixed(4)}) - Jabodetabek`);
        } finally {
          setIsGpsLoading(false);
        }
      },
      (err) => {
        setIsGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Akses lokasi GPS ditolak oleh browser. Silakan izinkan akses lokasi atau isi manual.');
        } else {
          setGpsError('Gagal mendeteksi lokasi GPS. Silakan isi alamat secara manual atau pilih dari Peta.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressDetails.trim()) return;

    if (editingAddressObj) {
      await updateAddress(editingAddressObj.id, {
        label: addressLabel,
        receiverName: addressReceiverName,
        receiverPhone: addressReceiverPhone,
        address: addressDetails.trim(),
        isDefault: addressIsDefault
      });
      setAddressNoticeMessage(`Alamat "${addressLabel}" berhasil diperbarui!`);
    } else {
      await addAddress({
        label: addressLabel,
        receiverName: addressReceiverName,
        receiverPhone: addressReceiverPhone,
        address: addressDetails.trim(),
        isDefault: addressIsDefault
      });
      setAddressNoticeMessage(`Alamat baru "${addressLabel}" berhasil ditambahkan!`);
    }

    setIsAddressModalOpen(false);
    setTimeout(() => setAddressNoticeMessage(null), 4000);
  };

  const handleSwitchActiveAddress = async (addrId: string, label: string) => {
    await setDefaultAddress(addrId);
    setAddressNoticeMessage(`Alamat utama berhasil diubah ke "${label}"! Sangat pas untuk kebutuhan Anda.`);
    setTimeout(() => setAddressNoticeMessage(null), 4000);
  };

  const handleDeleteAddressClick = async (addrId: string, label: string) => {
    if (userAddresses.length <= 1) {
      alert("Anda harus menyisakan minimal 1 alamat pengiriman utama.");
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus alamat "${label}"?`)) {
      await deleteAddress(addrId);
      setAddressNoticeMessage(`Alamat "${label}" berhasil dihapus.`);
      setTimeout(() => setAddressNoticeMessage(null), 3000);
    }
  };

  // Handle Change Password Submit
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (newPass.length < 6) {
      setPassError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPass !== confirmNewPass) {
      setPassError('Konfirmasi password baru tidak cocok. Periksa kembali.');
      return;
    }

    setIsSubmittingPass(true);
    const res = await changePassword(currentPass, newPass);
    setIsSubmittingPass(false);

    if (res.success) {
      setPassSuccess(true);
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => {
        setPassSuccess(false);
        setIsPasswordModalOpen(false);
      }, 1500);
    } else {
      setPassError(res.error || 'Gagal memperbarui password.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160E] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#4F4540] font-medium tracking-wide">Memuat Profil Pelanggan...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-[#3C2A21] text-amber-300 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-xl shadow-amber-950/10 border border-amber-900/20">
            <User className="w-10 h-10 text-amber-200" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#25160E]">Profil Pelanggan</h2>
            <p className="text-xs text-[#4F4540] font-medium leading-relaxed">
              Silakan masuk atau mendaftar akun terlebih dahulu untuk mengakses profil pribadi, kelola multi-alamat, serta melacak pengiriman 5-tahap.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login"
              className="w-full py-3.5 bg-[#25160E] hover:bg-[#3C2A21] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all block text-center"
            >
              Masuk ke Akun Saya
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 bg-white text-[#25160E] hover:bg-stone-50 font-bold text-xs rounded-2xl border border-amber-900/15 shadow-sm transition-all block text-center"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans selection:bg-[#934B19]/10 selection:text-[#934B19] pb-20 lg:pb-0">
      
      {/* Hidden input for gallery photo upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleImageUpload} 
      />

      {/* TOP HEADER / NAVBAR */}
      <Navbar />

      {/* SUCCESS CONFIRMATION BANNER */}
      {(confirmedSuccessMessage || addressNoticeMessage) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-12 pt-6">
          <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-bounce border border-emerald-500">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-200 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{confirmedSuccessMessage || addressNoticeMessage}</p>
            </div>
            <button 
              onClick={() => { setConfirmedSuccessMessage(null); setAddressNoticeMessage(null); }} 
              className="text-white hover:opacity-80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN PROFILE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* TOP PROFILE BANNER CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-amber-900/10 shadow-xl shadow-amber-950/5">
          
          {/* Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/5 via-amber-700/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Avatar & Main User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left w-full md:w-auto relative z-10">
            
            {/* Avatar with Edit Pencil Overlay */}
            <div 
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-amber-900/10 shadow-lg shrink-0 bg-[#3C2A21] group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userAvatar}
                alt={displayName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute bottom-2 right-2 p-2 bg-[#25160E] hover:bg-[#3C2A21] text-amber-300 rounded-xl shadow-md transition-all border border-amber-900/20"
                title="Ganti Foto Profil dari Galeri"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name, Email, Edit Profile & Auth Provider Badge */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
                <h1 className="font-serif text-3xl font-bold text-[#25160E]">
                  {displayName}
                </h1>
                {user.authProvider === 'google' && (
                  <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                    <span>Google SSO</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#4F4540] font-mono">
                {user.email || 'pelanggan@nefakky.com'}
              </p>

              <div className="pt-2 flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <button
                  onClick={() => setIsEditingModal(true)}
                  className="px-5 py-2.5 bg-[#25160E] hover:bg-[#3C2A21] text-white text-xs font-bold rounded-2xl shadow-md transition-all uppercase tracking-wider"
                >
                  Edit Profil
                </button>
                {(user.role === 'admin' || user.email === 'fatihahmadzakky19@gmail.com') && (
                  <Link
                    href="/admin"
                    className="px-5 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-200" />
                    <span>Panel Administrator</span>
                  </Link>
                )}
              </div>
            </div>

          </div>

          {/* Active Phone & Main Address Details */}
          <div className="flex flex-col sm:flex-row items-start gap-6 border-t md:border-t-0 md:border-l border-amber-900/10 pt-6 md:pt-0 md:pl-8 w-full md:w-auto relative z-10">
            
            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="p-3 bg-[#FFA26A]/20 text-[#934B19] rounded-2xl shrink-0 border border-[#FFA26A]/30">
                <Phone className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#4F4540] font-bold uppercase tracking-wider block">No. Telepon</span>
                <span className="text-xs font-bold text-[#1B1C1A]">
                  {phone || <span className="text-stone-400 font-normal italic">Belum diisi</span>}
                </span>
              </div>
            </div>

            {/* Active Address */}
            <div className="flex items-start gap-3 max-w-xs">
              <div className="p-3 bg-[#3C2A21]/10 text-[#3C2A21] rounded-2xl shrink-0 border border-[#3C2A21]/15">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#4F4540] font-bold uppercase tracking-wider block">Alamat Pengiriman Utama</span>
                  {activeAddress?.label && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-[#934B19] text-[9px] font-bold rounded-md">
                      {activeAddress.label}
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-[#1B1C1A] leading-snug line-clamp-2">
                  {activeAddress?.address || <span className="text-stone-400 font-normal italic">Belum diisi</span>}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* TWO COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Account Security & Live Chat CS Desk */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* KEAMANAN AKUN & GANTI PASSWORD CARD */}
            <div className="bg-white border border-amber-900/10 rounded-3xl p-6 shadow-xl shadow-amber-950/5 space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#934B19]/10 text-[#934B19] flex items-center justify-center shrink-0 border border-[#934B19]/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#25160E]">Keamanan & Akun</h3>
                  <p className="text-[10px] text-[#4F4540]">Status verifikasi & kata sandi</p>
                </div>
              </div>

              {user.authProvider === 'google' ? (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Terhubung dengan Google SSO</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-light">
                    Anda masuk menggunakan Akun Google. Kata sandi Anda dikelola dan dilindungi secara aman langsung oleh Google.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#4F4540] font-light leading-relaxed">
                    Perbarui kata sandi Anda secara berkala untuk menjaga keamanan transaksi kuliner Anda.
                  </p>
                  <button
                    onClick={() => {
                      setPassError(null);
                      setPassSuccess(false);
                      setCurrentPass('');
                      setNewPass('');
                      setConfirmNewPass('');
                      setIsPasswordModalOpen(true);
                    }}
                    className="w-full py-3 bg-[#25160E] hover:bg-[#3C2A21] text-amber-300 text-xs font-bold rounded-2xl shadow transition-all flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Ganti Kata Sandi</span>
                  </button>
                </div>
              )}
            </div>

            {/* LIVE CHAT CUSTOMER SERVICE CARD */}
            <div className="bg-white border border-amber-900/10 rounded-3xl p-6 shadow-xl shadow-amber-950/5 space-y-4">
              
              {/* CS Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25160E] text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#25160E]">CS & Support Desk</h3>
                    <p className="text-[10px] text-[#4F4540]">Live chat bantuan pelanggan</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleChipClick('Halo Min, pesanan saya belum sampai nih, tolong dicek ya.')}
                  className="px-3 py-1 bg-[#FBF9F5] hover:bg-amber-100/60 text-[#4F4540] rounded-xl border border-amber-900/10 transition-colors text-[10px] font-medium"
                >
                  🚚 Belum Sampai
                </button>
                <button
                  type="button"
                  onClick={() => handleChipClick('Halo Min, saya ada kendala saat pembayaran.')}
                  className="px-3 py-1 bg-[#FBF9F5] hover:bg-amber-100/60 text-[#4F4540] rounded-xl border border-amber-900/10 transition-colors text-[10px] font-medium"
                >
                  💳 Kendala Bayar
                </button>
              </div>

              {/* Chat History Container */}
              <div className="bg-[#FBF9F5] rounded-2xl p-4 border border-amber-900/10 max-h-[280px] overflow-y-auto space-y-3">
                {userChatHistory.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <MessageSquare className="w-7 h-7 text-stone-300 mx-auto" />
                    <p className="text-xs font-semibold text-[#25160E]">Belum Ada Pesan Chat</p>
                    <p className="text-[10px] text-[#4F4540]">Ketik pesan Anda di bawah untuk terhubung ke CS Admin.</p>
                  </div>
                ) : (
                  userChatHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[9px] text-[#4F4540]">
                        <span className="font-bold text-[#25160E]">
                          {msg.sender === 'user' ? 'Anda' : 'CS Admin'}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-[#25160E] text-white rounded-br-none font-medium'
                            : 'bg-white border border-amber-900/10 text-[#1B1C1A] rounded-bl-none font-normal'
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
                  className="flex-1 px-3.5 py-2.5 bg-[#FBF9F5] border border-amber-900/15 rounded-xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2.5 bg-[#934B19] hover:bg-[#783603] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Logout Card */}
            <div className="bg-white border border-amber-900/10 rounded-3xl p-5 shadow-xl shadow-amber-950/5">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50 rounded-2xl text-xs font-bold text-rose-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4" />
                  <span>Keluar / Logout Akun</span>
                </div>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Multi-Alamat & Riwayat Pesanan */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SEKSI MULTI-ALAMAT PENGIRIMAN (SOLUSI PENGGUNA BEPERGIAN) */}
            <div className="bg-white border border-amber-900/10 rounded-3xl p-6 sm:p-7 shadow-xl shadow-amber-950/5 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#25160E] flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-[#934B19]" />
                    <span>Kelola Alamat Pengiriman (Multi-Alamat)</span>
                  </h2>
                  <p className="text-xs text-[#4F4540] mt-0.5">
                    Solusi praktis jika Anda sedang bepergian: Simpan alamat Rumah, Kantor, atau Hotel tanpa perlu repot ganti alamat baru setiap kali order!
                  </p>
                </div>
                
                <button
                  onClick={handleOpenAddAddressModal}
                  className="px-4 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Alamat Baru</span>
                </button>
              </div>

              {/* LIST OF SAVED ADDRESSES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userAddresses.map((addr) => {
                  const isCurrentActive = addr.id === user.activeAddressId || (addr.isDefault && !user.activeAddressId);
                  
                  return (
                    <div
                      key={addr.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative ${
                        isCurrentActive
                          ? 'bg-[#FBF9F5] border-[#934B19] ring-2 ring-[#934B19]/20 shadow-md'
                          : 'bg-white border-amber-900/10 hover:border-amber-900/30 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Header Tag & Active Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-[#25160E] text-amber-300 font-bold text-[10px] rounded-xl flex items-center gap-1">
                              {addr.label.toLowerCase().includes('rumah') && <Home className="w-3 h-3" />}
                              {addr.label.toLowerCase().includes('kantor') && <Briefcase className="w-3 h-3" />}
                              {(addr.label.toLowerCase().includes('bepergian') || addr.label.toLowerCase().includes('hotel')) && <Plane className="w-3 h-3" />}
                              <span>{addr.label}</span>
                            </span>
                          </div>

                          {isCurrentActive && (
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Alamat Utama</span>
                            </span>
                          )}
                        </div>

                        {/* Receiver Details */}
                        <div className="text-xs space-y-1 pt-1">
                          <p className="font-bold text-[#1B1C1A]">{addr.receiverName || displayName}</p>
                          <p className="text-[#4F4540] text-[11px]">{addr.receiverPhone || phone}</p>
                          <p className="text-[#25160E] font-medium leading-relaxed pt-1 text-[11px]">
                            {addr.address}
                          </p>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-amber-900/10 text-xs">
                        {!isCurrentActive ? (
                          <button
                            onClick={() => handleSwitchActiveAddress(addr.id, addr.label)}
                            className="text-[#934B19] font-bold text-[11px] hover:underline flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Jadikan Utama</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[11px]">Sedang Aktif</span>
                        )}

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEditAddressModal(addr)}
                            className="text-stone-600 hover:text-[#25160E] font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAddressClick(addr.id, addr.label)}
                            className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* SEKSI RIWAYAT PESANAN & PELACAKAN LIVE */}
            <div className="bg-white border border-amber-900/10 rounded-3xl p-6 shadow-xl shadow-amber-950/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#25160E] flex items-center gap-2">
                    <Receipt className="w-6 h-6 text-[#934B19]" />
                    <span>Riwayat Pesanan & Pelacakan Live</span>
                  </h2>
                  <p className="text-xs text-[#4F4540]">Lacak progress 5-tahap real-time & konfirmasi pesanan telah diterima.</p>
                </div>
              </div>

              {/* NOTIFIKASI RESTO MEMBLUDAK (DARI CONTROL PANEL ADMIN) */}
              {isHighDemand && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse mt-3">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-amber-900">
                      Resto Sedang Membludak! (Pemberitahuan Dapur)
                    </h4>
                    <p className="text-[11px] font-medium leading-relaxed text-amber-800">
                      {highDemandMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Filters */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-100">
                <button
                  onClick={() => setOrderFilter('ALL')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                    orderFilter === 'ALL'
                      ? 'bg-[#25160E] text-white shadow-md'
                      : 'bg-[#FBF9F5] text-[#4F4540] hover:bg-amber-100/60 border border-amber-900/10'
                  }`}
                >
                  Semua Pesanan ({myOrders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('DELIVERING')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilter === 'DELIVERING'
                      ? 'bg-[#934B19] text-white shadow-md'
                      : 'bg-amber-50 text-[#934B19] hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Sedang Diantar ({myOrders.filter(o => o.status === 'DELIVERING' || o.status === 'SHIPPING').length})</span>
                </button>
                <button
                  onClick={() => setOrderFilter('COMPLETED')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilter === 'COMPLETED'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selesai ({myOrders.filter(o => o.status === 'COMPLETED').length})</span>
                </button>
              </div>

              {/* Orders List / Empty State */}
              {filteredOrders.length === 0 ? (
                <div className="bg-[#FBF9F5] border border-amber-900/10 rounded-3xl p-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-white text-[#934B19] border border-amber-900/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold text-[#25160E]">Tidak Ada Pesanan</h3>
                    <p className="text-xs text-[#4F4540] max-w-sm mx-auto font-light leading-relaxed">
                      Belum ada riwayat transaksi pada kategori ini. Jelajahi sajian kuliner artisanal kami!
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link 
                      href="/menu"
                      className="px-6 py-3 bg-[#25160E] hover:bg-[#3C2A21] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg transition-all inline-flex items-center gap-2"
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
                      isHighDemand={isHighDemand}
                    />
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* EDIT PROFILE MODAL */}
      {isEditingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160E]/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 border border-amber-900/15">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#25160E]">Edit Profil Pengguna</h3>
              <button onClick={() => setIsEditingModal(false)} className="text-stone-400 hover:text-[#25160E]">
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
                <div className="flex items-center gap-4 p-3 bg-[#FBF9F5] rounded-2xl border border-amber-900/10">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0 bg-[#3C2A21]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={userAvatar}
                      alt="Preview Foto Profil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#25160E]">Foto Profil</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-[#934B19] hover:underline flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Ganti Foto dari Galeri</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#25160E] mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#25160E] mb-1">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingModal(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4F4540] text-xs font-semibold rounded-2xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT ALAMAT PENGIRIMAN (WITH GPS AUTO FILL) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160E]/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 border border-amber-900/15 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#25160E] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#934B19]" />
                <span>{editingAddressObj ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Pengiriman Baru'}</span>
              </h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-stone-400 hover:text-[#25160E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              
              {/* Preset Label Chips */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-2">Label Alamat</label>
                <div className="flex flex-wrap gap-2">
                  {['Rumah', 'Kantor', 'Rumah Ortu', 'Bepergian / Hotel', 'Lainnya'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAddressLabel(chip)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        addressLabel === chip
                          ? 'bg-[#25160E] text-amber-300 border-[#25160E] shadow-sm'
                          : 'bg-[#FBF9F5] text-[#4F4540] border-amber-900/15 hover:bg-amber-50'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* GPS AUTO SET & MAP PICKER BUTTONS */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <p className="text-[11px] font-bold text-[#934B19]">⚡ Pengisian Otomatis Presisi:</p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={isGpsLoading}
                    className="w-full sm:w-1/2 py-2.5 px-3 bg-[#934B19] hover:bg-[#783603] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
                    <span>{isGpsLoading ? 'Mendeteksi GPS...' : 'Gunakan Lokasi Saat Ini (GPS)'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowMapPickerModal(true)}
                    className="w-full sm:w-1/2 py-2.5 px-3 bg-white text-[#25160E] border border-amber-900/20 hover:bg-stone-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#934B19]" />
                    <span>Pilih dari Peta Jabodetabek</span>
                  </button>
                </div>
                {gpsError && (
                  <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 pt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{gpsError}</span>
                  </p>
                )}
              </div>

              {/* Receiver Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#25160E] mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    value={addressReceiverName}
                    onChange={(e) => setAddressReceiverName(e.target.value)}
                    placeholder="Nama Lengkap Penerima"
                    className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-amber-900/15 rounded-xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#25160E] mb-1">No. Telepon / WA</label>
                  <input
                    type="tel"
                    value={addressReceiverPhone}
                    onChange={(e) => setAddressReceiverPhone(e.target.value)}
                    placeholder="+62 8xx-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-amber-900/15 rounded-xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30"
                    required
                  />
                </div>
              </div>

              {/* Address Details Text Area */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-1">Detail Alamat Lengkap</label>
                <textarea
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                  placeholder="Nama jalan, nomor rumah/hotel, RT/RW, kelurahan, kecamatan, kota/kabupaten..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#FBF9F5] border border-amber-900/15 rounded-xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30"
                  required
                />
              </div>

              {/* Is Default Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkDefault"
                  checked={addressIsDefault}
                  onChange={(e) => setAddressIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#934B19] rounded focus:ring-[#934B19]"
                />
                <label htmlFor="chkDefault" className="text-xs text-[#25160E] font-medium cursor-pointer">
                  Jadikan Alamat Pengiriman Utama
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4F4540] text-xs font-semibold rounded-2xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md"
                >
                  Simpan Alamat
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL AUTO MAP PICKER (PRESET & GPS VISUAL) */}
      <AutoMapPickerModal
        isOpen={showMapPickerModal}
        onClose={() => setShowMapPickerModal(false)}
        initialAddress={addressDetails}
        onSelectAddress={(selectedAddr) => {
          setAddressDetails(selectedAddr);
          setShowMapPickerModal(false);
        }}
      />

      {/* MODAL GANTI PASSWORD (NON-GOOGLE ACCOUNTS) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#25160E]/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 border border-amber-900/15">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#25160E] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#934B19]" />
                <span>Ganti Kata Sandi Akun</span>
              </h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-stone-400 hover:text-[#25160E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {passSuccess ? (
              <div className="py-8 text-center space-y-2 text-emerald-600">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <p className="text-sm font-bold">Kata Sandi Berhasil Diperbarui!</p>
              </div>
            ) : (
              <form onSubmit={handleSavePassword} className="space-y-4">
                
                {passError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{passError}</span>
                  </div>
                )}

                {/* Password Saat Ini */}
                <div>
                  <label className="block text-xs font-bold text-[#25160E] mb-1">Password Saat Ini</label>
                  <div className="relative flex items-center">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Masukkan password saat ini..."
                      className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 text-stone-400 hover:text-[#25160E]"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block text-xs font-bold text-[#25160E] mb-1">Password Baru (Min. 6 Karakter)</label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Password baru yang aman..."
                      className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 text-stone-400 hover:text-[#25160E]"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password Baru */}
                <div>
                  <label className="block text-xs font-bold text-[#25160E] mb-1">Ulangi Password Baru</label>
                  <input
                    type="password"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    placeholder="Ketik ulang password baru..."
                    className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#4F4540] text-xs font-semibold rounded-2xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPass}
                    className="px-6 py-2.5 bg-[#934B19] hover:bg-[#783603] disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md flex items-center gap-2"
                  >
                    {isSubmittingPass && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>Simpan Password</span>
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
