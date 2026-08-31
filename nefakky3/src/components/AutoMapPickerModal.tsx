'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Check, 
  X, 
  Search, 
  Sparkles, 
  AlertCircle, 
  Compass, 
  Layers, 
  Settings2,
  Key
} from 'lucide-react';
import { 
  MapProvider, 
  getMapSettings, 
  saveMapSettings, 
  calculateHaversineDistanceKm, 
  reverseGeocodeCoordinates, 
  searchAddressCoordinates, 
  getMapEmbedUrl,
  DEFAULT_CENTRAL_KITCHEN
} from '@/lib/mapService';

/**
 * Interface properti modal pemilihan lokasi alamat pengiriman berbasis GPS & Dual Mode Maps.
 */
interface AutoMapPickerModalProps {
  /** Status visibilitas modal (terbuka/tertutup) */
  isOpen: boolean;
  /** Fungsi callback untuk menutup modal */
  onClose: () => void;
  /** Fungsi callback saat alamat dan jarak berhasil dipilih */
  onSelectAddress: (
    selectedAddress: string,
    distanceKm: number,
    coords?: { lat: number; lng: number },
    isVerified?: boolean
  ) => void;
  /** Alamat awal opsional yang ditampilkan di form */
  initialAddress?: string;
  /** Koordinat awal opsional */
  initialCoords?: { lat: number; lng: number };
}

/** Daftar lokasi preset populer area Jabodetabek */
const JABODETABEK_LOCATION_PRESETS = [
  {
    name: 'Senayan / SCBD',
    address: 'Jl. Jend. Sudirman No. 52, Senayan, Kebayoran Baru, Jakarta Selatan, 12190',
    latitude: -6.2253,
    longitude: 106.8086,
    estimatedDistanceKm: 3.5
  },
  {
    name: 'Menteng & Cikini',
    address: 'Jl. Diponegoro No. 34, Menteng, Jakarta Pusat, 10310',
    latitude: -6.1989,
    longitude: 106.8411,
    estimatedDistanceKm: 2.1
  },
  {
    name: 'Kemang & Bangka',
    address: 'Jl. Kemang Raya No. 18, Bangka, Mampang Prapatan, Jakarta Selatan, 12730',
    latitude: -6.2612,
    longitude: 106.8143,
    estimatedDistanceKm: 7.2
  },
  {
    name: 'Pondok Indah',
    address: 'Jl. Metro Pondok Indah No. 88, Kebayoran Lama, Jakarta Selatan, 12310',
    latitude: -6.2655,
    longitude: 106.7842,
    estimatedDistanceKm: 9.8
  },
  {
    name: 'Kelapa Gading',
    address: 'Jl. Boulevard Barat Raya No. 12, Kelapa Gading, Jakarta Utara, 14240',
    latitude: -6.1558,
    longitude: 106.9025,
    estimatedDistanceKm: 11.5
  },
  {
    name: 'BSD City',
    address: 'Jl. Grand Boulevard BSD City No. 1, Pagedangan, Tangerang Selatan, 15339',
    latitude: -6.3021,
    longitude: 106.6524,
    estimatedDistanceKm: 22.4
  }
];

/**
 * Komponen Modal Autocomplete Peta GPS & Kalkulator Jarak Haversine Dual Engine (OSM + GMap).
 */
export default function AutoMapPickerModal({
  isOpen,
  onClose,
  onSelectAddress,
  initialAddress = '',
  initialCoords
}: AutoMapPickerModalProps) {
  const [mapSettings, setMapSettingsState] = useState(getMapSettings());
  const [activeProvider, setActiveProvider] = useState<MapProvider>(mapSettings.provider || 'openstreetmap');
  const [googleApiKeyInput, setGoogleApiKeyInput] = useState<string>(mapSettings.googleMapsApiKey || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  // State koordinat lokasi saat ini
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: initialCoords?.lat || DEFAULT_CENTRAL_KITCHEN.lat,
    lng: initialCoords?.lng || DEFAULT_CENTRAL_KITCHEN.lng
  });

  // State teks input alamat & pencarian
  const [addressInputText, setAddressInputText] = useState<string>(
    initialAddress || 'Jl. Jend. Sudirman No. 52, Senayan, Jakarta Selatan, 12190'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ address: string; lat: number; lng: number }[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // State indikator pemrosesan & pesan error
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsErrorMessage, setGpsErrorMessage] = useState<string | null>(null);
  const [shippingDistanceKm, setShippingDistanceKm] = useState<number>(4.2);
  const [isGeocodingActive, setIsGeocodingActive] = useState<boolean>(false);

  // Inisialisasi pengaturan peta saat mount
  useEffect(() => {
    const s = getMapSettings();
    setMapSettingsState(s);
    setActiveProvider(s.provider);
    setGoogleApiKeyInput(s.googleMapsApiKey || '');
  }, [isOpen]);

  // Mengubah jarak pengiriman otomatis setiap kali koordinat berubah
  useEffect(() => {
    const kitchenLat = mapSettings?.centralKitchen?.lat || DEFAULT_CENTRAL_KITCHEN.lat;
    const kitchenLng = mapSettings?.centralKitchen?.lng || DEFAULT_CENTRAL_KITCHEN.lng;
    const calculatedKm = calculateHaversineDistanceKm(
      kitchenLat,
      kitchenLng,
      coordinates.lat,
      coordinates.lng
    );
    setShippingDistanceKm(calculatedKm);
  }, [coordinates, mapSettings]);

  /**
   * Mengaktifkan pendeteksian sinyal GPS perangkat pelanggan.
   */
  const handleAutoDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsErrorMessage('Browser Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setIsDetectingGps(true);
    setGpsErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const detectedLat = position.coords.latitude;
        const detectedLng = position.coords.longitude;
        setCoordinates({ lat: detectedLat, lng: detectedLng });
        setIsDetectingGps(false);

        // Reverse geocoding via Active Map Engine
        setIsGeocodingActive(true);
        try {
          const formattedAddress = await reverseGeocodeCoordinates(
            detectedLat,
            detectedLng,
            activeProvider,
            googleApiKeyInput
          );
          setAddressInputText(formattedAddress);
        } catch {
          setAddressInputText(`Lokasi Terdeteksi GPS (${detectedLat.toFixed(4)}, ${detectedLng.toFixed(4)}), Jakarta`);
        } finally {
          setIsGeocodingActive(false);
        }
      },
      (error) => {
        setIsDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsErrorMessage('Izin akses lokasi ditolak. Silakan pilih lokasi dari daftar preset di bawah.');
        } else {
          setGpsErrorMessage('Gagal mendeteksi sinyal GPS. Menggunakan estimasi area terdekat.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /**
   * Pencarian Alamat dengan Autocomplete
   */
  const handleSearchAddress = async (q: string) => {
    setSearchQuery(q);
    if (!q || q.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAddressCoordinates(q, activeProvider, googleApiKeyInput);
      setSearchResults(results);
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Memilih lokasi dari hasil pencarian
   */
  const handleSelectSearchResult = (result: { address: string; lat: number; lng: number }) => {
    setCoordinates({ lat: result.lat, lng: result.lng });
    setAddressInputText(result.address);
    setSearchResults([]);
    setSearchQuery('');
  };

  /**
   * Memilih lokasi dari daftar preset area Jabodetabek.
   */
  const handleSelectLocationPreset = (preset: typeof JABODETABEK_LOCATION_PRESETS[0]) => {
    setCoordinates({ lat: preset.latitude, lng: preset.longitude });
    setAddressInputText(preset.address);
    setShippingDistanceKm(preset.estimatedDistanceKm);
  };

  /**
   * Mengganti Provider Peta (OpenStreetMap vs Google Maps)
   */
  const handleSwitchProvider = (provider: MapProvider) => {
    setActiveProvider(provider);
    saveMapSettings({ provider, googleMapsApiKey: googleApiKeyInput });
    if (provider === 'google_maps' && !googleApiKeyInput) {
      setShowApiKeyInput(true);
    }
  };

  /**
   * Menyimpan Google Maps API Key
   */
  const handleSaveGoogleApiKey = () => {
    saveMapSettings({ googleMapsApiKey: googleApiKeyInput, provider: 'google_maps' });
    setShowApiKeyInput(false);
  };

  /**
   * Mengonfirmasi alamat pengiriman yang dipilih.
   */
  const handleConfirmLocation = () => {
    onSelectAddress(addressInputText, shippingDistanceKm, coordinates, true);
    onClose();
  };

  if (!isOpen) return null;

  const isSafeDistanceRange = shippingDistanceKm <= 15;
  const embedUrl = getMapEmbedUrl(coordinates.lat, coordinates.lng, activeProvider, googleApiKeyInput);

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#5C3D28] text-amber-200 flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">Peta Pinpoint Lokasi Otomatis</h3>
              <p className="text-[10px] sm:text-[11px] text-stone-500">Dual Engine: OpenStreetMap &amp; Google Maps API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            aria-label="Tutup Peta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">

          {/* Engine Selector Pills */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSwitchProvider('openstreetmap')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeProvider === 'openstreetmap'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>OpenStreetMap (Gratis)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchProvider('google_maps')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeProvider === 'google_maps'
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Google Maps API</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-white transition-colors cursor-pointer"
              title="Pengaturan API Key Peta"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          {/* Google Maps API Key Config Box (Collapsible) */}
          {showApiKeyInput && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#934B19]" />
                  Google Maps API Key (Opsional):
                </span>
                <span className="text-[10px] text-stone-500">Simpan ke browser</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleApiKeyInput}
                  onChange={(e) => setGoogleApiKeyInput(e.target.value)}
                  placeholder="Masukkan AIzaSy... (Atau kosongkan untuk OpenStreetMap)"
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-amber-300 text-stone-900 font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveGoogleApiKey}
                  className="px-3 py-1.5 bg-[#934B19] text-white rounded-lg font-bold text-xs shadow-xs hover:bg-[#783603] cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}

          {/* Search Box with Autocomplete */}
          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchAddress(e.target.value)}
                placeholder="Ketik nama jalan, komplek, gedung, atau kelurahan..."
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#5C3D28] transition-all font-medium"
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 animate-pulse">
                  Mencari...
                </span>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-stone-200 py-1 z-30 max-h-48 overflow-y-auto animate-fade-in">
                {searchResults.map((res, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-3 py-2 hover:bg-stone-50 text-xs text-stone-800 border-b border-stone-100 last:border-0 flex items-start gap-2 cursor-pointer transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#934B19] shrink-0 mt-0.5" />
                    <span className="truncate">{res.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Auto Detect Banner Button */}
          <button
            type="button"
            onClick={handleAutoDetectGps}
            disabled={isDetectingGps}
            className="w-full py-3 sm:py-3.5 px-4 bg-[#5C3D28] hover:bg-[#472E1E] text-white rounded-xl sm:rounded-2xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 group border border-amber-900/20 active:scale-[0.99] cursor-pointer"
          >
            <Navigation className={`w-4 h-4 text-amber-300 ${isDetectingGps ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
            <span>{isDetectingGps ? 'Mendeteksi Koordinat GPS Anda...' : 'Deteksi Lokasi GPS Saya Saat Ini (Otomatis)'}</span>
          </button>

          {gpsErrorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{gpsErrorMessage}</span>
            </div>
          )}

          {/* Interactive Map Preview Canvas */}
          <div className="relative w-full h-40 sm:h-48 rounded-xl sm:rounded-2xl overflow-hidden border border-stone-300/80 shadow-inner bg-stone-100 group">
            <iframe
              title="Interactive Location Picker Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={embedUrl}
              className="w-full h-full filter contrast-[1.02] brightness-[0.98]"
            />

            {/* Floating Distance Badge Over Map */}
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 shadow-sm flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-stone-800">
              <Compass className="w-3.5 h-3.5 text-[#5C3D28]" />
              <span>Radius Dapur: <strong className={isSafeDistanceRange ? 'text-emerald-700' : 'text-rose-600'}>{shippingDistanceKm} km</strong></span>
            </div>

            {/* Radius Safety Status Badge */}
            <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3">
              {isSafeDistanceRange ? (
                <span className="px-2.5 py-1 bg-emerald-700 text-white rounded-full text-[9px] sm:text-[10px] font-bold shadow-md flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Radius Aman (&lt; 15 km)
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-rose-600 text-white rounded-full text-[9px] sm:text-[10px] font-bold shadow-md flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Melebihi Radius (15 km)
                </span>
              )}
            </div>
          </div>

          {/* Address Text Area Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-stone-700">
              Alamat Lengkap Terdeteksi {isGeocodingActive && <span className="text-[#5C3D28] font-normal animate-pulse">(Mencari nama jalan...)</span>}
            </label>
            <div className="relative">
              <textarea
                value={addressInputText}
                onChange={(e) => setAddressInputText(e.target.value)}
                rows={2}
                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota..."
                className="w-full p-2.5 sm:p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#5C3D28] focus:bg-white transition-all font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* Quick Select Presets Jabodetabek */}
          <div className="space-y-2">
            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400">
              PILIH AREA TERDEKAT (PRESET QUICK-SELECT):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JABODETABEK_LOCATION_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocationPreset(p)}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left text-xs transition-all active:scale-95 cursor-pointer ${
                    coordinates.lat === p.latitude && coordinates.lng === p.longitude
                      ? 'bg-[#F5EBE1] border-[#5C3D28] ring-1 ring-[#5C3D28]/30 font-semibold text-[#5C3D28]'
                      : 'bg-white border-stone-200/80 hover:bg-stone-50 text-stone-700 font-medium'
                  }`}
                >
                  <div className="font-semibold text-stone-900 truncate">{p.name}</div>
                  <div className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5">{p.estimatedDistanceKm} km dari Dapur</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-stone-100 bg-[#FAF8F5] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl sm:rounded-full transition-colors active:scale-95 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#5C3D28] hover:bg-[#472E1E] text-white text-xs font-semibold rounded-xl sm:rounded-full shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Gunakan Alamat Ini ({shippingDistanceKm} km)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
