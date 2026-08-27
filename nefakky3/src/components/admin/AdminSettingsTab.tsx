'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminSettingsTab (src/components/admin/AdminSettingsTab.tsx)
 * DESKRIPSI: Pusat Pengaturan Toko & Dapur, Alamat, Jarak Pengantar, Peta Interaktif
 *            (Sinkronisasi Otomatis Realtime saat Alamat Diketik), Tarif Ongkir
 *            (Flat 10rb <= 10 km, +2.5rb per 3km > 10 km), & Tautan Cepat CS Chat.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  Phone,
  MapPin,
  Truck,
  CheckCircle2,
  Globe,
  Search,
  Navigation,
  Compass,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  AlertCircle,
  Map,
  Loader2,
  Sparkles,
  Calculator,
  Coins
} from 'lucide-react';
import { 
  getMapSettings, 
  saveMapSettings, 
  DEFAULT_CENTRAL_KITCHEN,
  reverseGeocodeCoordinates,
  searchAddressCoordinates,
  getMapEmbedUrl,
  calculateDeliveryFee
} from '@/lib/mapService';

interface AdminSettingsTabProps {
  chatMessages?: any[];
  replyChatMessage?: any;
  markChatAsRead?: any;
}

export default function AdminSettingsTab({}: AdminSettingsTabProps) {
  // ============================================================================
  // 1. STATE: PENGATURAN TOKO, ALAMAT, JARAK & TARIF KURIR
  // ============================================================================
  const [storeName, setStoreName] = useState<string>('Nefakky Artisanal Marketplace');
  const [storeAddress, setStoreAddress] = useState<string>(
    'Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Kel. Pabuaran, Kec. Bojong Gede, Kab. Bogor, Prov. Jawa Barat'
  );
  const [storePhone, setStorePhone] = useState<string>('+62 812 3456 7890');
  const [storeMaxKm, setStoreMaxKm] = useState<string>('25');
  
  // Aturan Tarif Pengantaran Baru (10rb/10km + 2.5rb/3km)
  const [baseDeliveryFee, setBaseDeliveryFee] = useState<string>('10000');
  const [extraFeePer3Km, setExtraFeePer3Km] = useState<string>('2500');

  // Coordinates State (OpenStreetMap Engine)
  const [kitchenLat, setKitchenLat] = useState<string>(String(DEFAULT_CENTRAL_KITCHEN.lat));
  const [kitchenLng, setKitchenLng] = useState<string>(String(DEFAULT_CENTRAL_KITCHEN.lng));

  // UI Feedback & Autocomplete State
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodingNotice, setGeocodingNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<{ address: string; lat: number; lng: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const isInitialMount = useRef<boolean>(true);

  // Load from localStorage & mapService on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nefakky_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.storeAddress) setStoreAddress(parsed.storeAddress);
        if (parsed.storePhone) setStorePhone(parsed.storePhone);
        if (parsed.storeMaxKm) setStoreMaxKm(String(parsed.storeMaxKm));
        if (parsed.baseDeliveryFee) setBaseDeliveryFee(String(parsed.baseDeliveryFee));
        if (parsed.extraFeePer3Km) setExtraFeePer3Km(String(parsed.extraFeePer3Km));
      }

      const mapSet = getMapSettings();
      if (mapSet) {
        if (mapSet.centralKitchen) {
          setKitchenLat(String(mapSet.centralKitchen.lat || DEFAULT_CENTRAL_KITCHEN.lat));
          setKitchenLng(String(mapSet.centralKitchen.lng || DEFAULT_CENTRAL_KITCHEN.lng));
          if (mapSet.centralKitchen.address && !saved) {
            setStoreAddress(mapSet.centralKitchen.address);
          }
        }
        if (mapSet.baseDeliveryFee) setBaseDeliveryFee(String(mapSet.baseDeliveryFee));
        if (mapSet.extraFeePer3Km) setExtraFeePer3Km(String(mapSet.extraFeePer3Km));
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }, []);

  // ============================================================================
  // 2. AUTO GEOCODING REALTIME KETIKA ALAMAT DIKETIK / DIUBAH
  // ============================================================================
  useEffect(() => {
    // Lewati trigger saat mount pertama
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!storeAddress || storeAddress.trim().length < 4) {
      setAddressSuggestions([]);
      return;
    }

    setIsGeocoding(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchAddressCoordinates(storeAddress, 'openstreetmap');
        if (results && results.length > 0) {
          setAddressSuggestions(results);
          const top = results[0];
          setKitchenLat(top.lat.toFixed(6));
          setKitchenLng(top.lng.toFixed(6));
          setGeocodingNotice({
            type: 'success',
            text: `Peta otomatis bergeser ke: ${top.address.split(',').slice(0, 3).join(', ')}`
          });
        } else {
          setAddressSuggestions([]);
        }
      } catch (err) {
        console.warn('Auto geocode failed:', err);
      } finally {
        setIsGeocoding(false);
        setTimeout(() => setGeocodingNotice(null), 4000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [storeAddress]);

  // Geocoding Manual & GPS Helpers
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setGeocodingNotice({ type: 'error', text: 'Perangkat Anda tidak mendukung fitur Geolocation GPS.' });
      return;
    }

    setIsGeocoding(true);
    setGeocodingNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setKitchenLat(lat.toFixed(6));
        setKitchenLng(lng.toFixed(6));

        try {
          const addr = await reverseGeocodeCoordinates(lat, lng, 'openstreetmap');
          if (addr) {
            setStoreAddress(addr);
            setGeocodingNotice({
              type: 'success',
              text: `GPS Berhasil terdeteksi: (${lat.toFixed(4)}, ${lng.toFixed(4)})`
            });
          }
        } catch {
          setGeocodingNotice({
            type: 'success',
            text: `Koordinat GPS diperbarui: (${lat.toFixed(4)}, ${lng.toFixed(4)})`
          });
        } finally {
          setIsGeocoding(false);
          setTimeout(() => setGeocodingNotice(null), 4000);
        }
      },
      (err) => {
        setIsGeocoding(false);
        setGeocodingNotice({
          type: 'error',
          text: `Gagal membaca GPS: ${err.message || 'Izin akses lokasi ditolak.'}`
        });
        setTimeout(() => setGeocodingNotice(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLookupAddressCoordinatesManual = async () => {
    if (!storeAddress || storeAddress.trim().length < 3) {
      setGeocodingNotice({ type: 'error', text: 'Silakan ketik alamat dapur terlebih dahulu.' });
      return;
    }

    setIsGeocoding(true);
    setGeocodingNotice(null);

    try {
      const results = await searchAddressCoordinates(storeAddress, 'openstreetmap');
      if (results && results.length > 0) {
        setAddressSuggestions(results);
        const best = results[0];
        setKitchenLat(best.lat.toFixed(6));
        setKitchenLng(best.lng.toFixed(6));
        setGeocodingNotice({
          type: 'success',
          text: `Titik peta diperbarui sesuai alamat: ${best.address.split(',')[0]}`
        });
      } else {
        setGeocodingNotice({
          type: 'error',
          text: 'Alamat tidak ditemukan. Silakan periksa ejaan nama kelurahan/kecamatan/kabupaten.'
        });
      }
    } catch {
      setGeocodingNotice({
        type: 'error',
        text: 'Terjadi kesalahan saat mencari titik koordinat alamat.'
      });
    } finally {
      setIsGeocoding(false);
      setTimeout(() => setGeocodingNotice(null), 4000);
    }
  };

  const handleSelectSuggestion = (item: { address: string; lat: number; lng: number }) => {
    setKitchenLat(item.lat.toFixed(6));
    setKitchenLng(item.lng.toFixed(6));
    setShowSuggestions(false);
    setGeocodingNotice({
      type: 'success',
      text: `Titik peta bergeser ke: ${item.address}`
    });
    setTimeout(() => setGeocodingNotice(null), 4000);
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const latNum = parseFloat(kitchenLat) || DEFAULT_CENTRAL_KITCHEN.lat;
      const lngNum = parseFloat(kitchenLng) || DEFAULT_CENTRAL_KITCHEN.lng;
      const radiusNum = parseInt(storeMaxKm, 10) || 25;
      const baseFeeNum = parseInt(baseDeliveryFee, 10) || 10000;
      const extraFeeNum = parseInt(extraFeePer3Km, 10) || 2500;

      // 1. Save store basic info
      const storePayload = {
        storeName,
        storeAddress,
        storePhone,
        storeMaxKm: radiusNum,
        baseDeliveryFee: baseFeeNum,
        extraFeePer3Km: extraFeeNum
      };
      localStorage.setItem('nefakky_store_settings', JSON.stringify(storePayload));

      // 2. Save map engine & coordinates
      saveMapSettings({
        provider: 'openstreetmap',
        centralKitchen: {
          name: storeName,
          address: storeAddress,
          lat: latNum,
          lng: lngNum
        },
        maxDeliveryRadiusKm: radiusNum,
        baseDeliveryFee: baseFeeNum,
        extraFeePer3Km: extraFeeNum,
        pricePerKm: extraFeeNum
      });

      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3500);
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  };

  // Embed map URL generator (OpenStreetMap 100% Free & Live)
  const currentMapUrl = useMemo(() => {
    const lat = parseFloat(kitchenLat) || DEFAULT_CENTRAL_KITCHEN.lat;
    const lng = parseFloat(kitchenLng) || DEFAULT_CENTRAL_KITCHEN.lng;
    return getMapEmbedUrl(lat, lng, 'openstreetmap');
  }, [kitchenLat, kitchenLng]);

  return (
    <div className="flex flex-col w-full font-body-base text-on-surface space-y-6">
      
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface font-['Playfair_Display']">
            Pengaturan Toko, Dapur &amp; Peta Pengantaran
          </h1>
          <p className="font-body-base text-xs sm:text-sm text-on-surface-variant max-w-2xl mt-1">
            Konfigurasi profil restoran, alamat dapur pusat, titik koordinat peta GPS, serta radius dan simulasi tarif kurir pengantaran.
          </p>
        </div>

        {/* Global Save Toast Badge */}
        {showSaveToast && (
          <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Pengaturan Restoran &amp; Peta Berhasil Disimpan!</span>
          </div>
        )}
      </header>

      {/* 2. DEDICATED CS LIVE CHAT QUICK BANNER */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#25160E] to-[#452718] text-white rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#934B19] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            <MessageCircle className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-amber-100">
                Meja Pelayanan CS Live Chat
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                Halaman Khusus
              </span>
            </div>
            <p className="text-xs text-stone-300 font-light mt-0.5">
              Meja percakapan CS pelanggan kini telah tersedia di halaman workspace tersendiri.
            </p>
          </div>
        </div>

        <Link
          href="/admin/chat"
          className="px-5 py-2.5 bg-[#934B19] hover:bg-[#783603] text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <span>Buka Meja CS Live Chat</span>
          <ArrowRight className="w-4 h-4 text-amber-200" />
        </Link>
      </div>

      {/* 3. MAIN SETTINGS GRID */}
      <form onSubmit={handleSaveAllSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: INFORMASI TOKO & ALAMAT DAPUR (6 Columns) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          <div className="bg-surface-container rounded-3xl p-6 shadow-xs border border-outline-variant/20 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#934B19] text-white flex items-center justify-center shadow-xs">
                  <Store className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h2 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
                    Profil Restoran &amp; Alamat Dapur
                  </h2>
                  <p className="text-[11px] text-on-surface-variant font-normal">
                    Informasi kontak dan titik pusat penjemputan pesanan
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Terverifikasi
              </span>
            </div>

            {/* Geocoding Notice Toast */}
            {geocodingNotice && (
              <div className={`p-3 rounded-2xl flex items-start gap-2 text-xs animate-fade-in ${
                geocodingNotice.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' 
                  : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}>
                {geocodingNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] font-medium leading-relaxed">{geocodingNotice.text}</span>
              </div>
            )}

            <div className="flex flex-col gap-4 text-xs">
              {/* Nama Toko */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-[10px] font-bold">
                  Nama Toko / Restoran
                </label>
                <div className="relative flex items-center">
                  <Store className="w-4 h-4 absolute left-3 text-stone-400 pointer-events-none" />
                  <input 
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Nama restoran"
                    className="w-full bg-surface pl-9 pr-3 py-2.5 rounded-xl text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-[#934B19] border border-outline-variant/30 transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp Hotline */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-on-surface-variant uppercase text-[10px] font-bold">
                  WhatsApp Hotline Dapur
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 absolute left-3 text-stone-400 pointer-events-none" />
                  <input 
                    type="tel"
                    required
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full bg-surface pl-9 pr-3 py-2.5 rounded-xl font-mono text-xs text-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-[#934B19] border border-outline-variant/30 transition-all"
                  />
                </div>
              </div>

              {/* Alamat Dapur dengan Auto-Geocoding Realtime */}
              <div className="flex flex-col gap-1 relative">
                <div className="flex items-center justify-between">
                  <label className="font-label-caps text-on-surface-variant uppercase text-[10px] font-bold flex items-center gap-1.5">
                    <span>Alamat Lengkap Dapur Pusat</span>
                    {isGeocoding && (
                      <span className="text-[#934B19] flex items-center gap-1 font-bold text-[9.5px] animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Mencari titik peta...</span>
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={handleLookupAddressCoordinatesManual}
                    disabled={isGeocoding}
                    className="text-[10px] text-[#934B19] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    title="Cari koordinat latitude & longitude dari alamat ini"
                  >
                    <Search className="w-3 h-3" />
                    <span>Sinkronkan Titik Peta</span>
                  </button>
                </div>
                <div className="relative flex items-start">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-stone-400 pointer-events-none" />
                  <textarea 
                    rows={3}
                    required
                    value={storeAddress}
                    onChange={(e) => {
                      setStoreAddress(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Tulis alamat lengkap dapur (peta akan otomatis bergeser ke lokasi)..."
                    className="w-full bg-surface pl-9 pr-3 py-2.5 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-[#934B19] border border-outline-variant/30 transition-all resize-none leading-relaxed font-medium"
                  />
                </div>

                {/* Suggestions Dropdown saat mengetik alamat */}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-stone-100 animate-fade-in">
                    <div className="px-3 py-1.5 bg-stone-50 text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#934B19]" />
                        <span>Pilihan Titik Lokasi Peta Ditemukan:</span>
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setShowSuggestions(false)}
                        className="text-stone-400 hover:text-stone-700 font-bold"
                      >
                        Tutup
                      </button>
                    </div>
                    {addressSuggestions.slice(0, 4).map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(sug)}
                        className="p-2.5 hover:bg-amber-50 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <MapPin className="w-3.5 h-3.5 text-[#934B19] shrink-0" />
                          <span className="truncate text-stone-700 group-hover:text-amber-950 font-medium">
                            {sug.address}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-stone-400 group-hover:text-[#934B19] shrink-0 bg-stone-100 group-hover:bg-amber-100 px-2 py-0.5 rounded">
                          {sug.lat.toFixed(3)}, {sug.lng.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GPS Live Locator Button */}
              <div className="flex items-center justify-between p-3 bg-surface rounded-2xl border border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#934B19]" />
                  <span className="text-[11px] font-semibold text-on-surface">Deteksi GPS Dapur Saat Ini</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentGPS}
                  disabled={isGeocoding}
                  className="px-3.5 py-1.5 bg-[#934B19]/10 hover:bg-[#934B19]/20 text-[#934B19] font-bold text-[10px] rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Navigation className={`w-3 h-3 ${isGeocoding ? 'animate-spin' : ''}`} />
                  <span>{isGeocoding ? 'Mendeteksi...' : 'Ambil GPS Saya'}</span>
                </button>
              </div>

              {/* Coordinates Grid (Dapat Diedit Manual & Otomatis Memperbarui Peta) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-on-surface-variant uppercase text-[10px] font-bold">
                    Latitude Koordinat
                  </label>
                  <input 
                    type="text"
                    value={kitchenLat}
                    onChange={(e) => setKitchenLat(e.target.value)}
                    placeholder="-6.4967"
                    className="w-full bg-surface px-3 py-2 rounded-xl font-mono text-xs text-on-surface border border-outline-variant/30 font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-on-surface-variant uppercase text-[10px] font-bold">
                    Longitude Koordinat
                  </label>
                  <input 
                    type="text"
                    value={kitchenLng}
                    onChange={(e) => setKitchenLng(e.target.value)}
                    placeholder="106.7972"
                    className="w-full bg-surface px-3 py-2 rounded-xl font-mono text-xs text-on-surface border border-outline-variant/30 font-bold"
                  />
                </div>
              </div>

              {/* Aturan Baru Tarif Pengantaran (10rb/10km + 2.5rb/3km) */}
              <div className="p-4 bg-surface rounded-2xl border border-outline-variant/20 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/10">
                  <Coins className="w-4 h-4 text-[#934B19]" />
                  <h4 className="font-bold text-xs text-on-surface">Aturan Tarif Ongkos Kirim Kurir</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tarif Dasar <= 10 km */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-on-surface-variant uppercase text-[9.5px] font-bold">
                      Tarif Dasar (Jarak &le; 10 Km)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-[10px] font-bold text-stone-400">Rp</span>
                      <input 
                        type="number"
                        required
                        min={0}
                        step={1000}
                        value={baseDeliveryFee}
                        onChange={(e) => setBaseDeliveryFee(e.target.value)}
                        placeholder="10000"
                        className="w-full bg-surface-container-lowest pl-8 pr-2 py-2 rounded-xl font-mono text-xs text-on-surface font-bold border border-outline-variant/30"
                      />
                    </div>
                  </div>

                  {/* Tambahan > 10 km per 3 km */}
                  <div className="flex flex-col gap-1">
                    <label className="font-label-caps text-on-surface-variant uppercase text-[9.5px] font-bold">
                      Tambahan per 3 Km (Jarak &gt; 10 Km)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-[10px] font-bold text-stone-400">Rp</span>
                      <input 
                        type="number"
                        required
                        min={0}
                        step={500}
                        value={extraFeePer3Km}
                        onChange={(e) => setExtraFeePer3Km(e.target.value)}
                        placeholder="2500"
                        className="w-full bg-surface-container-lowest pl-8 pr-2 py-2 rounded-xl font-mono text-xs text-on-surface font-bold border border-outline-variant/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Maksimum Radius */}
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-on-surface-variant uppercase text-[9.5px] font-bold">
                    Maks Radius Jangkauan Pengantaran (Km)
                  </label>
                  <div className="relative flex items-center">
                    <Truck className="w-3.5 h-3.5 absolute left-3 text-stone-400 pointer-events-none" />
                    <input 
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={storeMaxKm}
                      onChange={(e) => setStoreMaxKm(e.target.value)}
                      placeholder="25"
                      className="w-full bg-surface-container-lowest pl-8 pr-2 py-2 rounded-xl font-mono text-xs text-on-surface font-bold border border-outline-variant/30"
                    />
                  </div>
                </div>
              </div>

              {/* Simulasi Perhitungan Ongkir Nyata */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/70 text-xs text-amber-950 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-[#934B19]">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-4 h-4" />
                    <span>Formula Ongkir Aktif</span>
                  </span>
                  <span className="font-mono text-[11px]">
                    0-{storeMaxKm} Km
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10.5px] font-mono text-stone-700 pt-1">
                  <div className="bg-white/80 p-2 rounded-xl border border-amber-200/50 text-center">
                    <p className="text-[9px] text-stone-400 font-sans">Jarak &le; 10 Km</p>
                    <p className="font-bold text-[#934B19]">Rp {parseInt(baseDeliveryFee || '10000', 10).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-amber-200/50 text-center">
                    <p className="text-[9px] text-stone-400 font-sans">Jarak 13 Km</p>
                    <p className="font-bold text-[#934B19]">Rp {calculateDeliveryFee(13, parseInt(baseDeliveryFee || '10000', 10), parseInt(extraFeePer3Km || '2500', 10)).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-amber-200/50 text-center">
                    <p className="text-[9px] text-stone-400 font-sans">Jarak 16 Km</p>
                    <p className="font-bold text-[#934B19]">Rp {calculateDeliveryFee(16, parseInt(baseDeliveryFee || '10000', 10), parseInt(extraFeePer3Km || '2500', 10)).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PETA INTERAKTIF LIVE (OPENSTREETMAP ENGINE) (6 Columns) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Live Interactive Map Card */}
          <div className="bg-surface-container rounded-3xl p-6 shadow-xs border border-outline-variant/20 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#934B19] text-white flex items-center justify-center shadow-xs">
                  <Globe className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h2 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
                    Peta Interaktif Live (OpenStreetMap)
                  </h2>
                  <p className="text-[11px] text-on-surface-variant font-normal">
                    Posisi peta langsung bergeser otomatis saat Anda mengubah alamat
                  </p>
                </div>
              </div>

              <a 
                href={`https://www.google.com/maps?q=${kitchenLat},${kitchenLng}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-[#934B19] hover:underline font-bold flex items-center gap-1"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded Live Map Iframe dengan Key Unik untuk Refresh Instan */}
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-inner relative bg-stone-100">
              <iframe
                key={`${kitchenLat}_${kitchenLng}`}
                title="Peta Lokasi Dapur Pusat"
                src={currentMapUrl}
                className="w-full h-full border-0 transition-opacity duration-300"
                loading="lazy"
              />
              
              {/* Overlay Label Dapur */}
              <div className="absolute top-3 left-3 bg-[#25160E]/90 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold text-amber-200 shadow-md flex items-center gap-2 pointer-events-none border border-white/10">
                <span className={`w-2.5 h-2.5 rounded-full ${isGeocoding ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
                <span className="truncate max-w-[200px]">{storeName || 'Dapur Pusat'}</span>
              </div>

              {/* Status Loading Geocoding Realtime */}
              {isGeocoding && (
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-amber-300 text-[11px] font-bold text-[#934B19] flex items-center gap-1.5 animate-fade-in">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sinkronisasi Titik Lokasi Peta...</span>
                </div>
              )}
            </div>

            {/* Engine Info Badge & Titik Koordinat Aktif */}
            <div className="p-3.5 bg-surface rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-on-surface">Titik Koordinat Terpasang</h4>
                  <p className="text-[10px] text-stone-500 font-mono">
                    Lat: {parseFloat(kitchenLat).toFixed(4)} | Lng: {parseFloat(kitchenLng).toFixed(4)}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold w-max">
                Live Sinkron
              </span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full bg-[#934B19] hover:bg-[#783603] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer shadow-md active:scale-98 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-200" />
              <span>Simpan Seluruh Pengaturan Restoran &amp; Peta</span>
            </button>

          </div>

        </div>

      </form>

    </div>
  );
}
