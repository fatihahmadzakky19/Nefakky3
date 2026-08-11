'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Check, X, Search, Sparkles, AlertCircle, Compass } from 'lucide-react';

/**
 * Interface properti modal pemilihan lokasi alamat pengiriman berbasis GPS.
 */
interface AutoMapPickerModalProps {
  /** Statusvisibilitas modal (terbuka/tertutup) */
  isOpen: boolean;
  /** Fungsi callback untuk menutup modal */
  onClose: () => void;
  /** Fungsi callback saat alamat dan jarak berhasil dipilih */
  onSelectAddress: (selectedAddress: string, distanceKm: number) => void;
  /** Alamat awal opsional yang ditampilkan di form */
  initialAddress?: string;
}

/** Koordinat Dapur Pusat Nefakky (Jakarta Pusat) */
const KITCHEN_CENTRAL_LATITUDE = -6.2088;
const KITCHEN_CENTRAL_LONGITUDE = 106.8456;

/** Radius bumi dalam satuan kilometer (rumus Haversine) */
const EARTH_RADIUS_KM = 6371;

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
 * Komponen Modal Autocomplete Peta GPS & Kalkulator Jarak Haversine.
 * Memungkinkan pelanggan memilih lokasi alamat pengiriman secara presisi.
 */
export default function AutoMapPickerModal({
  isOpen,
  onClose,
  onSelectAddress,
  initialAddress = ''
}: AutoMapPickerModalProps) {
  // State koordinat lokasi saat ini
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({
    lat: KITCHEN_CENTRAL_LATITUDE,
    lon: KITCHEN_CENTRAL_LONGITUDE
  });

  // State teks input alamat
  const [addressInputText, setAddressInputText] = useState<string>(
    initialAddress || 'Jl. Jend. Sudirman No. 52, Senayan, Jakarta Selatan, 12190'
  );

  // State indikator pemrosesan & pesan error
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsErrorMessage, setGpsErrorMessage] = useState<string | null>(null);
  const [shippingDistanceKm, setShippingDistanceKm] = useState<number>(4.2);
  const [isGeocodingActive, setIsGeocodingActive] = useState<boolean>(false);

  /**
   * Menghitung jarak garis lurus antara dua titik koordinat bumi (rumus Haversine).
   * @param lat1 Latitude titik 1
   * @param lon1 Longitude titik 1
   * @param lat2 Latitude titik 2
   * @param lon2 Longitude titik 2
   * @returns Jarak dalam kilometer (diperbulan ke 1 desimal)
   */
  const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const deltaLat = (lat2 - lat1) * (Math.PI / 180);
    const deltaLon = (lon2 - lon1) * (Math.PI / 180);
    const haversineValue =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);

    const centralAngle = 2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));
    return Number((EARTH_RADIUS_KM * centralAngle).toFixed(1));
  };

  // Mengubah jarak pengiriman otomatis setiap kali koordinat berubah
  useEffect(() => {
    const calculatedKm = calculateHaversineDistance(
      KITCHEN_CENTRAL_LATITUDE,
      KITCHEN_CENTRAL_LONGITUDE,
      coordinates.lat,
      coordinates.lon
    );
    setShippingDistanceKm(calculatedKm);
  }, [coordinates]);

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
        const detectedLon = position.coords.longitude;
        setCoordinates({ lat: detectedLat, lon: detectedLon });
        setIsDetectingGps(false);

        // Reverse geocoding via OpenStreetMap Nominatim API
        setIsGeocodingActive(true);
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${detectedLat}&lon=${detectedLon}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            const formattedAddress = data.display_name.split(',').slice(0, 5).join(', ');
            setAddressInputText(formattedAddress);
          } else {
            setAddressInputText(
              `Lokasi Terdeteksi GPS (${detectedLat.toFixed(4)}, ${detectedLon.toFixed(4)}), Jakarta`
            );
          }
        } catch {
          setAddressInputText(
            `Lokasi Terdeteksi GPS (${detectedLat.toFixed(4)}, ${detectedLon.toFixed(4)}), Jakarta`
          );
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
   * Memilih lokasi dari daftar preset area Jabodetabek.
   */
  const handleSelectLocationPreset = (preset: typeof JABODETABEK_LOCATION_PRESETS[0]) => {
    setCoordinates({ lat: preset.latitude, lon: preset.longitude });
    setAddressInputText(preset.address);
    setShippingDistanceKm(preset.estimatedDistanceKm);
  };

  /**
   * Mengonfirmasi alamat pengiriman yang dipilih.
   */
  const handleConfirmLocation = () => {
    onSelectAddress(addressInputText, shippingDistanceKm);
    onClose();
  };

  if (!isOpen) return null;

  const isSafeDistanceRange = shippingDistanceKm <= 15;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#5C3D28] text-amber-200 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Peta Pinpoint Lokasi Otomatis</h3>
              <p className="text-[11px] text-stone-500">Deteksi GPS &amp; kalkulasi radius kesegaran makanan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* GPS Auto Detect Banner Button */}
          <button
            onClick={handleAutoDetectGps}
            disabled={isDetectingGps}
            className="w-full py-3.5 px-4 bg-[#5C3D28] hover:bg-[#472E1E] text-white rounded-2xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 group border border-amber-900/20 active:scale-[0.99]"
          >
            <Navigation className={`w-4 h-4 text-amber-300 ${isDetectingGps ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
            <span>{isDetectingGps ? 'Mendeteksi Koordinat GPS Anda...' : '📍 Deteksi Lokasi GPS Saya Saat Ini (Otomatis)'}</span>
          </button>

          {gpsErrorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{gpsErrorMessage}</span>
            </div>
          )}

          {/* OpenStreetMap Interactive Map Preview Canvas */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-stone-300/80 shadow-inner bg-stone-100 group">
            {/* Embedded OpenStreetMap Iframe centered at coordinates */}
            <iframe
              title="OpenStreetMap Location Picker"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.02}%2C${coordinates.lat - 0.02}%2C${coordinates.lon + 0.02}%2C${coordinates.lat + 0.02}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lon}`}
              className="w-full h-full filter contrast-[1.02] brightness-[0.98]"
            />

            {/* Floating Distance Badge Over Map */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200 shadow-sm flex items-center gap-2 text-xs font-semibold text-stone-800">
              <Compass className="w-3.5 h-3.5 text-[#5C3D28]" />
              <span>Radius dari Dapur Utama: <strong className={isSafeDistanceRange ? 'text-emerald-700' : 'text-rose-600'}>{shippingDistanceKm} km</strong></span>
            </div>

            {/* Radius Safety Status Badge */}
            <div className="absolute bottom-3 right-3">
              {isSafeDistanceRange ? (
                <span className="px-3 py-1 bg-emerald-700 text-white rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Radius Aman (&lt; 15 km)
                </span>
              ) : (
                <span className="px-3 py-1 bg-rose-600 text-white rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
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
                className="w-full p-3 bg-[#FAF8F5] border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-[#5C3D28] focus:bg-white transition-all font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* Quick Select Presets Jabodetabek */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">
              PILIH AREA TERDEKAT (PRESET QUICK-SELECT):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JABODETABEK_LOCATION_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocationPreset(p)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    coordinates.lat === p.latitude && coordinates.lon === p.longitude
                      ? 'bg-[#F5EBE1] border-[#5C3D28] ring-1 ring-[#5C3D28]/30 font-semibold text-[#5C3D28]'
                      : 'bg-white border-stone-200/80 hover:bg-stone-50 text-stone-700 font-medium'
                  }`}
                >
                  <div className="font-semibold text-stone-900 truncate">{p.name}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{p.estimatedDistanceKm} km dari Dapur</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-stone-100 bg-[#FAF8F5] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-full transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmLocation}
            className="px-6 py-2.5 bg-[#5C3D28] hover:bg-[#472E1E] text-white text-xs font-semibold rounded-full shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Gunakan Alamat Ini ({shippingDistanceKm} km)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
