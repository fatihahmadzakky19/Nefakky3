'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminSettingsTab (src/components/admin/AdminSettingsTab.tsx)
 * DESKRIPSI: Konversi 100% presisi dari Stitch MCP HTML/Tailwind
 *            (Pengaturan Toko & Layanan Pelanggan, Profil Restoran & Dapur Pusat,
 *            CS Live Chat Split Interface, Attachment Gambar/Video, dan
 *            Indikator Realtime Percakapan).
 * ============================================================================
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Store,
  Smile,
  MoreVertical,
  Check,
  Layers,
  Key,
  Globe
} from 'lucide-react';
import { ChatMessage } from '@/context/DataContext';
import { 
  getMapSettings, 
  saveMapSettings, 
  MapProvider, 
  DEFAULT_CENTRAL_KITCHEN 
} from '@/lib/mapService';

interface AdminSettingsTabProps {
  chatMessages: ChatMessage[];
  replyChatMessage: (userEmail: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  markChatAsRead: (userEmail: string, role: 'admin' | 'user') => void;
}

export default function AdminSettingsTab({
  chatMessages,
  replyChatMessage,
  markChatAsRead
}: AdminSettingsTabProps) {
  const searchParams = useSearchParams();
  const chatQuery = searchParams?.get('chat');

  const [selectedChatUserEmail, setSelectedChatUserEmail] = useState<string>('');
  const [adminReplyInput, setAdminReplyInput] = useState<string>('');
  const [adminMediaUrl, setAdminMediaUrl] = useState<string | null>(null);
  const [adminMediaType, setAdminMediaType] = useState<'image' | 'video'>('image');
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  // Store Settings State
  const [storeName, setStoreName] = useState<string>('Nefakky Artisanal Marketplace');
  const [storeAddress, setStoreAddress] = useState<string>('Jl. Jendral Sudirman No. 45, Kebayoran Baru, Jakarta Selatan 12190');
  const [storePhone, setStorePhone] = useState<string>('+62 812 3456 7890');
  const [storeMaxKm, setStoreMaxKm] = useState<string>('25');
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  // Map Provider & API Settings State
  const [mapProvider, setMapProvider] = useState<MapProvider>('openstreetmap');
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [kitchenLat, setKitchenLat] = useState<string>(String(DEFAULT_CENTRAL_KITCHEN.lat));
  const [kitchenLng, setKitchenLng] = useState<string>(String(DEFAULT_CENTRAL_KITCHEN.lng));
  const [pricePerKm, setPricePerKm] = useState<string>('2500');
  const [showMapSaveToast, setShowMapSaveToast] = useState<boolean>(false);

  // Auto select chat from URL query param
  useEffect(() => {
    if (chatQuery) {
      setSelectedChatUserEmail(chatQuery);
      markChatAsRead(chatQuery, 'admin');
    }
  }, [chatQuery, markChatAsRead]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nefakky_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.storeAddress) setStoreAddress(parsed.storeAddress);
        if (parsed.storePhone) setStorePhone(parsed.storePhone);
        if (parsed.storeMaxKm) setStoreMaxKm(parsed.storeMaxKm);
      }

      const mapSet = getMapSettings();
      if (mapSet) {
        setMapProvider(mapSet.provider || 'openstreetmap');
        setGoogleMapsApiKey(mapSet.googleMapsApiKey || '');
        if (mapSet.centralKitchen) {
          setKitchenLat(String(mapSet.centralKitchen.lat || DEFAULT_CENTRAL_KITCHEN.lat));
          setKitchenLng(String(mapSet.centralKitchen.lng || DEFAULT_CENTRAL_KITCHEN.lng));
        }
        if (mapSet.pricePerKm) setPricePerKm(String(mapSet.pricePerKm));
      }
    } catch (e) {
      console.error('Error loading store settings:', e);
    }
  }, []);

  const handleSaveMapSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveMapSettings({
        provider: mapProvider,
        googleMapsApiKey,
        centralKitchen: {
          name: storeName,
          address: storeAddress,
          lat: parseFloat(kitchenLat) || DEFAULT_CENTRAL_KITCHEN.lat,
          lng: parseFloat(kitchenLng) || DEFAULT_CENTRAL_KITCHEN.lng
        },
        maxDeliveryRadiusKm: parseInt(storeMaxKm, 10) || 25,
        pricePerKm: parseInt(pricePerKm, 10) || 2500
      });
      setShowMapSaveToast(true);
      setTimeout(() => setShowMapSaveToast(false), 3500);
    } catch (e) {
      console.error('Error saving map settings:', e);
    }
  };

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { storeName, storeAddress, storePhone, storeMaxKm };
      localStorage.setItem('nefakky_store_settings', JSON.stringify(payload));
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3500);
    } catch (e) {
      console.error('Error saving store settings:', e);
    }
  };

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

    replyChatMessage(
      selectedChatUserEmail,
      adminReplyInput.trim() || (adminMediaType === 'video' ? '📹 [Video Balasan CS]' : '📷 [Foto Balasan CS]'),
      adminMediaUrl || undefined,
      adminMediaType
    );

    setAdminReplyInput('');
    setAdminMediaUrl(null);
    if (adminFileInputRef.current) adminFileInputRef.current.value = '';
  };

  // Grouping users for left sidebar
  const chatUsersMap = useMemo(() => {
    const map: Record<string, { email: string; name: string; avatar?: string; lastMessage: string; lastTime: string; unread: boolean }> = {};
    
    (chatMessages || []).forEach((m) => {
      if (!map[m.userEmail]) {
        map[m.userEmail] = {
          email: m.userEmail,
          name: m.userName || m.userEmail.split('@')[0],
          avatar: m.userAvatar,
          lastMessage: m.text,
          lastTime: m.timestamp,
          unread: m.readByAdmin === false
        };
      } else {
        map[m.userEmail].lastMessage = m.text;
        map[m.userEmail].lastTime = m.timestamp;
        if (m.readByAdmin === false) map[m.userEmail].unread = true;
      }
    });

    const list = Object.values(map);
    // Jika tidak ada pesan, berikan contoh pengguna untuk tampilan awal
    if (list.length === 0) {
      return [
        {
          email: 'sarah.jenkins@email.com',
          name: 'Sarah Jenkins',
          avatar: '',
          lastMessage: 'Order #NF-88392 belum sampai...',
          lastTime: '10:42 AM',
          unread: true
        },
        {
          email: 'michael.ray@email.com',
          name: 'Michael Ray',
          avatar: '',
          lastMessage: 'Apakah menu truffle pasta h...',
          lastTime: '09:15 AM',
          unread: true
        },
        {
          email: 'anita.kumala@email.com',
          name: 'Anita Kumala',
          avatar: '',
          lastMessage: 'Terima kasih atas pelayanannya.',
          lastTime: 'Kemarin',
          unread: false
        }
      ];
    }

    return list;
  }, [chatMessages]);

  // Set default selected chat if none selected
  useEffect(() => {
    if (!selectedChatUserEmail && chatUsersMap.length > 0) {
      setSelectedChatUserEmail(chatUsersMap[0].email);
    }
  }, [chatUsersMap, selectedChatUserEmail]);

  const activeChatMessages = useMemo(() => {
    if (!selectedChatUserEmail) return [];
    const filtered = (chatMessages || []).filter((m) => m.userEmail === selectedChatUserEmail);
    if (filtered.length > 0) return filtered;

    // Fallback simulated conversation jika mock Sarah Jenkins
    if (selectedChatUserEmail === 'sarah.jenkins@email.com') {
      return [
        {
          id: 'sim-1',
          userEmail: 'sarah.jenkins@email.com',
          userName: 'Sarah Jenkins',
          sender: 'user' as const,
          text: 'Halo admin, order saya dengan nomor resi #NF-88392 statusnya sudah dikirim dari 1 jam yang lalu tapi belum sampai juga. Kurirnya bisa dihubungi?',
          timestamp: '10:42 AM',
          readByAdmin: true,
          readByUser: true
        },
        {
          id: 'sim-2',
          userEmail: 'sarah.jenkins@email.com',
          userName: 'Sarah Jenkins',
          sender: 'admin' as const,
          text: 'Halo Kak Sarah. Mohon maaf atas keterlambatannya. Kami sedang mengecek posisi kurir sekarang. Mohon ditunggu sebentar ya Kak.',
          timestamp: '10:45 AM',
          readByAdmin: true,
          readByUser: true
        },
        {
          id: 'sim-3',
          userEmail: 'sarah.jenkins@email.com',
          userName: 'Sarah Jenkins',
          sender: 'user' as const,
          text: 'Ini posisi di map aplikasi sepertinya stuck.',
          mediaUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARMrX4iRTbuiaf_8dlxg8ILnNWRdAa5eNOCzJLJ-XP6g9kP9e1Oveq_aYHAAu5spuevgA5-EEgIZl0RztLiT00YJ_4nfayaFdtCwMG36__Iu8Sk3beF0HVzJb4CZZIaYcC33g170iOG18yR1yMDzOWOa7BpRnMvNCi4OcIaa_3prKnHKMrwHcEidkRwn_a_lFXbCVk9iRKOuAUUHGBLn1fNi6KZBOqRpg345pKV-uVJ1Yn-JWu-NlZJw',
          mediaType: 'image' as const,
          timestamp: '10:47 AM',
          readByAdmin: true,
          readByUser: true
        }
      ];
    }

    return [];
  }, [chatMessages, selectedChatUserEmail]);

  const activeUserObj = chatUsersMap.find(u => u.email === selectedChatUserEmail) || {
    email: selectedChatUserEmail,
    name: selectedChatUserEmail.split('@')[0]
  };

  const unreadCount = chatUsersMap.filter(u => u.unread).length;

  return (
    <div className="flex flex-col w-full font-body-base text-on-surface space-y-6">
      
      {/* 1. HEADER SECTION */}
      <header className="mb-2">
        <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface font-['Playfair_Display']">
          Pengaturan Toko &amp; Layanan Pelanggan
        </h1>
        <p className="font-body-base text-xs sm:text-sm text-on-surface-variant max-w-2xl mt-1">
          Atur profil restoran, lokasi dapur, serta respon CS live chat langsung kepada pembeli.
        </p>
      </header>

      {/* 2. CONTENT GRID (Left: Store Profile, Right: CS Live Chat) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: STORE PROFILE & CENTRAL KITCHEN (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container rounded-2xl p-6 shadow-xs border border-outline-variant/20">
            
            {/* Box Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                Profil Restoran &amp; Dapur
              </h2>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-[10px] font-bold uppercase">
                Informasi Layanan
              </span>
            </div>

            {/* Success Toast */}
            {showSaveToast && (
              <div className="bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500 p-3.5 mb-5 rounded-r-xl flex items-start gap-2.5 text-xs animate-fade-in shadow-2xs">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <div className="flex-1">
                  <p className="font-body-sm font-bold text-emerald-900">Berhasil disimpan</p>
                  <p className="font-body-sm text-emerald-800 text-[11px]">Pengaturan profil restoran &amp; nomor telepon berhasil diperbarui.</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveStoreSettings} className="flex flex-col gap-4 text-xs">
              
              {/* Nama Toko */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">
                  Nama Toko
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                    storefront
                  </span>
                  <input 
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Masukkan nama toko"
                    className="w-full bg-surface pl-10 pr-3 py-2.5 rounded-xl font-body-base text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp Hotline */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">
                  WhatsApp Hotline
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                    call
                  </span>
                  <input 
                    type="tel"
                    required
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="Nomor WA (+62...)"
                    className="w-full bg-surface pl-10 pr-3 py-2.5 rounded-xl font-mono-data text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Alamat Dapur */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">
                  Alamat Dapur
                </label>
                <div className="relative flex items-start pt-1">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[18px] pointer-events-none">
                    location_on
                  </span>
                  <textarea 
                    rows={3}
                    required
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Alamat lengkap"
                    className="w-full bg-surface pl-10 pr-3 py-2 rounded-xl font-body-base text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Radius Maks Pengiriman */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">
                  Radius Pengiriman Maks (Km)
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                    local_shipping
                  </span>
                  <input 
                    type="number"
                    required
                    value={storeMaxKm}
                    onChange={(e) => setStoreMaxKm(e.target.value)}
                    placeholder="Jarak Km"
                    className="w-full bg-surface pl-10 pr-3 py-2.5 rounded-xl font-mono-data text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="mt-2 w-full bg-primary text-on-primary font-body-base font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Simpan Pengaturan</span>
              </button>

            </form>
          </div>

          {/* MAPS & GEOLOCATION API CONFIGURATION CARD */}
          <div className="bg-surface-container rounded-2xl p-6 shadow-xs border border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#934B19]" />
                <span>Peta &amp; API Lokasi GPS</span>
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-[#934B19] font-mono text-[10px] font-bold">
                Dual Engine
              </span>
            </div>

            {showMapSaveToast && (
              <div className="bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500 p-3 mb-4 rounded-r-xl flex items-start gap-2 text-xs animate-fade-in">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                <div>
                  <p className="font-bold">Konfigurasi Peta Tersimpan</p>
                  <p className="text-[11px]">Provider aktif: {mapProvider === 'google_maps' ? 'Google Maps API' : 'OpenStreetMap'}.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveMapSettings} className="flex flex-col gap-4 text-xs">
              {/* Provider Selection Radio */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">
                  Penyedia Peta Utama (Default Engine)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMapProvider('openstreetmap')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      mapProvider === 'openstreetmap'
                        ? 'bg-amber-50/60 border-[#934B19] text-[#934B19] font-bold shadow-xs'
                        : 'bg-surface border-outline-variant/30 text-on-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs">OpenStreetMap</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-normal">Gratis 100%, tanpa kartu kredit &amp; tanpa API Key.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapProvider('google_maps')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      mapProvider === 'google_maps'
                        ? 'bg-amber-50/60 border-[#934B19] text-[#934B19] font-bold shadow-xs'
                        : 'bg-surface border-outline-variant/30 text-on-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="w-4 h-4 text-rose-600" />
                      <span className="font-bold text-xs">Google Maps</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-normal">Membutuhkan Google Maps API Key.</p>
                  </button>
                </div>
              </div>

              {/* Google Maps API Key Field */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold flex items-center justify-between">
                  <span>Google Maps API Key (Opsional)</span>
                  <span className="text-[10px] text-stone-400 font-normal">Maps JS &amp; Geocoding</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                    key
                  </span>
                  <input 
                    type="text"
                    value={googleMapsApiKey}
                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                    placeholder="AIzaSy... (Kosongkan jika pakai OpenStreetMap)"
                    className="w-full bg-surface pl-10 pr-3 py-2.5 rounded-xl font-mono text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 transition-all"
                  />
                </div>
              </div>

              {/* Central Kitchen Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-on-surface-variant uppercase text-[10px] font-bold">
                    Latitude Dapur
                  </label>
                  <input 
                    type="text"
                    value={kitchenLat}
                    onChange={(e) => setKitchenLat(e.target.value)}
                    placeholder="-6.2088"
                    className="w-full bg-surface px-3 py-2 rounded-xl font-mono text-xs text-on-surface border border-outline-variant/30"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-on-surface-variant uppercase text-[10px] font-bold">
                    Longitude Dapur
                  </label>
                  <input 
                    type="text"
                    value={kitchenLng}
                    onChange={(e) => setKitchenLng(e.target.value)}
                    placeholder="106.8456"
                    className="w-full bg-surface px-3 py-2 rounded-xl font-mono text-xs text-on-surface border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Ongkir per Km */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-[11px] font-bold">
                  Tarif Kurir per Km (Rp)
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                    payments
                  </span>
                  <input 
                    type="number"
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-surface pl-10 pr-3 py-2 rounded-xl font-mono text-xs text-on-surface border border-outline-variant/30"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#934B19] hover:bg-[#783603] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[17px]">save</span>
                <span>Terapkan Pengaturan Peta</span>
              </button>
            </form>
          </div>

          {/* Decorative Dapur Pusat Card */}
          <div 
            className="relative w-full h-36 rounded-2xl overflow-hidden shadow-xs border border-outline-variant/20 bg-cover bg-center group"
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDT9umxz87c6ksasGW-s5WELRRvNqeMy5t60tjNWYbdQRtIfcxPDLTb7KXBkdGc53FAgJqAWAN1VDU1PFCZJP4PZ_Tkg8QnvTpuZvmNAM9j073_uz13wWMswVOdy_yS_4SE5DBk-Tf_E4_Rj2C-MUSqIjBAGraSz2KC4FkVpklIs4dQSDBRPfr6XZkKsWU-WMO7h1R0sPsMEJrQhYawtJlDqcx2E-KRgADcaeRV1tdHyFGTeRsQVluu-w')` }}
          >
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors"></div>
            <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono-data text-on-surface font-bold border border-outline-variant/20 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Dapur Pusat (Hub Jakarta)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CS LIVE CHAT SPLIT DESK (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
          <div className="bg-surface-container rounded-2xl shadow-xs flex flex-col h-full overflow-hidden border border-outline-variant/20">
            
            {/* Chat Box Header */}
            <div className="bg-surface px-6 py-4 flex items-center justify-between shadow-2xs relative z-10 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">forum</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-sm sm:text-base font-bold text-on-surface m-0 leading-tight">
                    Layanan Pelanggan (CS Live Chat)
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                    <span className="font-label-caps text-error uppercase text-[10px] font-bold">
                      {unreadCount > 0 ? `${unreadCount} Chat Baru Belum Dibalas` : 'Semua Chat Terlayani'}
                    </span>
                  </div>
                </div>
              </div>

              <button className="w-9 h-9 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
            </div>

            {/* Chat Body Split */}
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-[480px]">
              
              {/* User List Panel (1/3 width) */}
              <div className="w-full sm:w-1/3 bg-surface-container-low overflow-y-auto flex flex-col border-r border-outline-variant/20 divide-y divide-outline-variant/10">
                {chatUsersMap.map((u) => {
                  const isSelected = u.email === selectedChatUserEmail;

                  return (
                    <div
                      key={u.email}
                      onClick={() => {
                        setSelectedChatUserEmail(u.email);
                        markChatAsRead(u.email, 'admin');
                      }}
                      className={`p-3.5 flex flex-col gap-1 cursor-pointer transition-all relative ${
                        isSelected 
                          ? 'bg-primary text-on-primary font-semibold' 
                          : 'bg-surface text-on-surface hover:bg-surface-variant/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-body-base text-xs font-bold truncate pr-2 flex items-center gap-1.5">
                          {u.name}
                          {u.unread && !isSelected && (
                            <span className="px-1.5 py-0.5 rounded bg-error text-on-error text-[8px] font-bold tracking-wider leading-none">
                              BARU
                            </span>
                          )}
                        </span>
                        <span className={`font-body-sm text-[10px] whitespace-nowrap ${isSelected ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                          {u.lastTime || '10:42 AM'}
                        </span>
                      </div>

                      <p className={`font-body-sm text-xs truncate m-0 ${isSelected ? 'text-on-primary/90' : 'text-on-surface-variant'}`}>
                        {u.lastMessage || 'Halo admin...'}
                      </p>

                      {u.unread && !isSelected && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-3 w-2 h-2 rounded-full bg-error"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Chat Conversation Window (2/3 width) */}
              <div className="w-full sm:w-2/3 bg-surface flex flex-col relative">
                
                {/* Active Contact Info Top Bar */}
                <div className="px-4 py-3 bg-surface-container-lowest shadow-2xs flex flex-col z-10 border-b border-outline-variant/20">
                  <span className="font-body-base font-bold text-xs text-on-surface">
                    Chat dengan: {activeUserObj.name}
                  </span>
                  <span className="font-mono-data text-on-surface-variant text-[10px]">
                    {activeUserObj.email} • Layanan Pesanan Aktif
                  </span>
                </div>

                {/* Messages Feed Area */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-2">
                    <span className="bg-surface-container px-3 py-1 rounded-full font-label-caps text-[10px] text-on-surface-variant font-bold">
                      Hari Ini
                    </span>
                  </div>

                  {activeChatMessages.map((msg: any) => {
                    const isAdmin = msg.sender === 'admin';

                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] gap-1 ${
                          isAdmin ? 'items-end self-end' : 'items-start'
                        }`}
                      >
                        <div className={`px-4 py-2.5 rounded-2xl font-body-base text-xs leading-relaxed ${
                          isAdmin 
                            ? 'bg-primary text-on-primary rounded-tr-none' 
                            : 'bg-surface-container-high text-on-surface rounded-tl-none'
                        }`}>
                          {/* Media Image Attachment if present */}
                          {msg.mediaUrl && msg.mediaType !== 'video' && (
                            <div className="mb-2 rounded-xl overflow-hidden">
                              <img 
                                src={msg.mediaUrl} 
                                alt="Media Chat" 
                                className="w-48 h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          {/* Media Video Attachment if present */}
                          {msg.mediaUrl && msg.mediaType === 'video' && (
                            <div className="mb-2 rounded-xl overflow-hidden">
                              <video 
                                src={msg.mediaUrl} 
                                controls 
                                className="w-48 h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}

                          <span>{msg.text}</span>
                        </div>

                        <span className={`font-body-sm text-[10px] text-on-surface-variant ${
                          isAdmin ? 'mr-2' : 'ml-2'
                        }`}>
                          {msg.timestamp || 'Baru saja'} {isAdmin ? '• Terkirim' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Input Toolbar Area */}
                <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/20">
                  
                  {/* Media Preview Bar if file selected */}
                  {adminMediaUrl && (
                    <div className="flex items-center gap-2 mb-2 p-1.5 bg-surface-container rounded-xl w-max">
                      <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[16px]">
                          {adminMediaType === 'video' ? 'videocam' : 'image'}
                        </span>
                      </div>
                      <div className="flex flex-col pr-2">
                        <span className="font-body-sm font-bold text-on-surface text-[10px]">
                          Lampiran Siap Dikirim
                        </span>
                        <span className="font-mono-data text-on-surface-variant text-[9px]">
                          {adminMediaType}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setAdminMediaUrl(null);
                          if (adminFileInputRef.current) adminFileInputRef.current.value = '';
                        }}
                        className="text-on-surface-variant hover:text-error cursor-pointer p-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
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

                  {/* Input Form */}
                  <form onSubmit={handleSendAdminReply} className="flex items-center gap-2">
                    
                    {/* Attachment Button */}
                    <button 
                      type="button"
                      onClick={() => adminFileInputRef.current?.click()}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
                      title="Lampirkan Gambar/Video"
                    >
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                    </button>

                    {/* Text input */}
                    <div className="flex-1 relative">
                      <input 
                        type="text"
                        value={adminReplyInput}
                        onChange={(e) => setAdminReplyInput(e.target.value)}
                        placeholder={`Ketik balasan untuk ${activeUserObj.name}...`}
                        className="w-full bg-surface-container pl-4 pr-10 py-2 rounded-full font-body-base text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-outline-variant transition-all"
                      />
                      <button 
                        type="button" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="Emoji"
                      >
                        <span className="material-symbols-outlined text-[17px]">sentiment_satisfied</span>
                      </button>
                    </div>

                    {/* Send Button */}
                    <button 
                      type="submit"
                      className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-xs"
                      title="Kirim Balasan"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </button>

                  </form>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
