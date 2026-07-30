'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Check, X, Search, Sparkles, AlertCircle, Compass } from 'lucide-react';

interface AutoMapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (address: string, distanceKm: number) => void;
  initialAddress?: string;
}

// Kitchen Hub Coordinates (Central Kitchen Jakarta)
const KITCHEN_LAT = -6.2088;
const KITCHEN_LON = 106.8456;

// Popular Location Presets in Jabodetabek
const LOCATION_PRESETS = [
  { name: 'Senayan / SCBD', address: 'Jl. Jend. Sudirman No. 52, Senayan, Kebayoran Baru, Jakarta Selatan, 12190', lat: -6.2253, lon: 106.8086, dist: 3.5 },
  { name: 'Menteng & Cikini', address: 'Jl. Diponegoro No. 34, Menteng, Jakarta Pusat, 10310', lat: -6.1989, lon: 106.8411, dist: 2.1 },
  { name: 'Kemang & Bangka', address: 'Jl. Kemang Raya No. 18, Bangka, Mampang Prapatan, Jakarta Selatan, 12730', lat: -6.2612, lon: 106.8143, dist: 7.2 },
  { name: 'Pondok Indah', address: 'Jl. Metro Pondok Indah No. 88, Kebayoran Lama, Jakarta Selatan, 12310', lat: -6.2655, lon: 106.7842, dist: 9.8 },
  { name: 'Kelapa Gading', address: 'Jl. Boulevard Barat Raya No. 12, Kelapa Gading, Jakarta Utara, 14240', lat: -6.1558, lon: 106.9025, dist: 11.5 },
  { name: 'BSD City', address: 'Jl. Grand Boulevard BSD City No. 1, Pagedangan, Tangerang Selatan, 15339', lat: -6.3021, lon: 106.6524, dist: 22.4 }
];

export default function AutoMapPickerModal({
  isOpen,
  onClose,
  onSelectAddress,
  initialAddress = ''
}: AutoMapPickerModalProps) {
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: KITCHEN_LAT, lon: KITCHEN_LON });
  const [addressInput, setAddressInput] = useState<string>(initialAddress || 'Jl. Jend. Sudirman No. 52, Senayan, Jakarta Selatan, 12190');
  const [isDetectingGPS, setIsDetectingGPS] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(4.2);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Update distance whenever coordinates change
  useEffect(() => {
    const dist = calculateDistance(KITCHEN_LAT, KITCHEN_LON, coords.lat, coords.lon);
    setDistanceKm(dist);
  }, [coords]);

  // Handle GPS Auto-Detection
  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Browser Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setIsDetectingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        setIsDetectingGPS(false);

        // Reverse geocoding via OpenStreetMap Nominatim
        setIsGeocoding(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data && data.display_name) {
            const formatted = data.display_name.split(',').slice(0, 5).join(', ');
            setAddressInput(formatted);
          } else {
            setAddressInput(`Lokasi Terdeteksi GPS (${lat.toFixed(4)}, ${lon.toFixed(4)}), Jakarta`);
          }
        } catch (err) {
          setAddressInput(`Lokasi Terdeteksi GPS (${lat.toFixed(4)}, ${lon.toFixed(4)}), Jakarta`);
        } finally {
          setIsGeocoding(false);
        }
      },
      (error) => {
        setIsDetectingGPS(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('Izin akses lokasi ditolak. Silakan pilih lokasi dari daftar preset di bawah.');
        } else {
          setGpsError('Gagal mendeteksi sinyal GPS. Menggunakan estimasi area terdekat.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSelectPreset = (preset: typeof LOCATION_PRESETS[0]) => {
    setCoords({ lat: preset.lat, lon: preset.lon });
    setAddressInput(preset.address);
    setDistanceKm(preset.dist);
  };

  const handleConfirmLocation = () => {
    onSelectAddress(addressInput, distanceKm);
    onClose();
  };

  if (!isOpen) return null;

  const isSafeDistance = distanceKm <= 15;

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
            onClick={handleAutoDetectGPS}
            disabled={isDetectingGPS}
            className="w-full py-3.5 px-4 bg-[#5C3D28] hover:bg-[#472E1E] text-white rounded-2xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 group border border-amber-900/20 active:scale-[0.99]"
          >
            <Navigation className={`w-4 h-4 text-amber-300 ${isDetectingGPS ? 'animate-spin' : 'group-hover:rotate-45 transition-transform'}`} />
            <span>{isDetectingGPS ? 'Mendeteksi Koordinat GPS Anda...' : '📍 Deteksi Lokasi GPS Saya Saat Ini (Otomatis)'}</span>
          </button>

          {gpsError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* OpenStreetMap Interactive Map Preview Canvas */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-stone-300/80 shadow-inner bg-stone-100 group">
            {/* Embedded OpenStreetMap Iframe centered at coords */}
            <iframe
              title="OpenStreetMap Location Picker"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.02}%2C${coords.lat - 0.02}%2C${coords.lon + 0.02}%2C${coords.lat + 0.02}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`}
              className="w-full h-full filter contrast-[1.02] brightness-[0.98]"
            />

            {/* Floating Distance Badge Over Map */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200 shadow-sm flex items-center gap-2 text-xs font-semibold text-stone-800">
              <Compass className="w-3.5 h-3.5 text-[#5C3D28]" />
              <span>Radius dari Dapur Utama: <strong className={isSafeDistance ? 'text-emerald-700' : 'text-rose-600'}>{distanceKm} km</strong></span>
            </div>

            {/* Radius Safety Status Badge */}
            <div className="absolute bottom-3 right-3">
              {isSafeDistance ? (
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
              Alamat Lengkap Terdeteksi {isGeocoding && <span className="text-[#5C3D28] font-normal animate-pulse">(Mencari nama jalan...)</span>}
            </label>
            <div className="relative">
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
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
              {LOCATION_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    coords.lat === p.lat && coords.lon === p.lon
                      ? 'bg-[#F5EBE1] border-[#5C3D28] ring-1 ring-[#5C3D28]/30 font-semibold text-[#5C3D28]'
                      : 'bg-white border-stone-200/80 hover:bg-stone-50 text-stone-700 font-medium'
                  }`}
                >
                  <div className="font-semibold text-stone-900 truncate">{p.name}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{p.dist} km dari Dapur</div>
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
            <span>Gunakan Alamat Ini ({distanceKm} km)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
