/**
 * ============================================================================
 * SERVICE: Dual Mode Map Engine (OpenStreetMap & Google Maps) (src/lib/mapService.ts)
 * DESKRIPSI: Layanan peta fleksibel untuk:
 *            - OpenStreetMap (Default Gratis, Tanpa API Key)
 *            - Google Maps (Opsional dengan Google Maps API Key)
 *            - Geocoding & Reverse Geocoding Alamat Cerdas
 *            - Kalkulator Jarak Haversine & Ongkir Pengiriman (10rb/10km + 2.5rb/3km)
 * ============================================================================
 */

export type MapProvider = 'openstreetmap' | 'google_maps';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapSettings {
  provider: MapProvider;
  googleMapsApiKey?: string;
  centralKitchen: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  maxDeliveryRadiusKm: number;
  baseDeliveryFee: number;       // Tarif dasar (<= 10 km) -> Rp 10.000
  extraFeePer3Km: number;        // Tarif tambahan (> 10 km) -> Rp 2.500 per 3 km
  pricePerKm?: number;           // Backward compatibility
}

/** Koordinat Dapur Pusat Nefakky Default (Bogor / Jabodetabek) */
export const DEFAULT_CENTRAL_KITCHEN = {
  name: 'Dapur Pusat Nefakky',
  address: 'Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Kel. Pabuaran, Kec. Bojong Gede, Kab. Bogor, Prov. Jawa Barat',
  lat: -6.4967,
  lng: 106.7972
};

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  provider: 'openstreetmap',
  googleMapsApiKey: '',
  centralKitchen: DEFAULT_CENTRAL_KITCHEN,
  maxDeliveryRadiusKm: 25,
  baseDeliveryFee: 10000,
  extraFeePer3Km: 2500,
  pricePerKm: 2500
};

const MAP_SETTINGS_STORAGE_KEY = 'nefakky_map_settings';

/**
 * Membaca pengaturan peta dari localStorage
 */
export const getMapSettings = (): MapSettings => {
  if (typeof window === 'undefined') return DEFAULT_MAP_SETTINGS;
  try {
    const raw = localStorage.getItem(MAP_SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_MAP_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Error reading map settings:', err);
  }
  return DEFAULT_MAP_SETTINGS;
};

/**
 * Menyimpan pengaturan peta ke localStorage
 */
export const saveMapSettings = (settings: Partial<MapSettings>): MapSettings => {
  const current = getMapSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    localStorage.setItem(MAP_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
};

/**
 * Menghitung jarak garis lurus antara dua koordinat (Haversine Formula) dalam Km
 */
export const calculateHaversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius bumi dalam KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

/**
 * Kalkulator Ongkos Kirim Resmi Nefakky:
 * - Jarak <= 10 km: Flat Rp 10.000
 * - Jarak > 10 km: Rp 10.000 + (ceil((jarak - 10) / 3) * Rp 2.500)
 */
export const calculateDeliveryFee = (
  distKm: number,
  baseFee: number = 10000,
  extraPer3Km: number = 2500
): number => {
  if (!distKm || distKm <= 0) return baseFee;
  if (distKm <= 10) {
    return baseFee; // Rp 10.000
  }
  const extraKm = distKm - 10;
  const extraIntervals = Math.ceil(extraKm / 3); // Tambahan Rp 2.500 per 3 km
  return baseFee + (extraIntervals * extraPer3Km);
};

/**
 * Reverse Geocoding: Mengambil nama jalan & alamat lengkap dari koordinat
 */
export const reverseGeocodeCoordinates = async (
  lat: number,
  lng: number,
  provider: MapProvider = 'openstreetmap',
  apiKey?: string
): Promise<string> => {
  // 1. Google Maps Geocoding jika provider Google Maps dan API Key valid
  if (provider === 'google_maps' && apiKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=id`
      );
      const data = await res.json();
      if (data.status === 'OK' && data.results?.[0]) {
        return data.results[0].formatted_address;
      }
    } catch (err) {
      console.warn('Google Maps reverse geocode failed, fallback to OSM:', err);
    }
  }

  // 2. OpenStreetMap Nominatim Geocoding (Gratis & Cepat)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`,
      {
        headers: {
          'User-Agent': 'NefakkyFoodMarketplace/1.0'
        }
      }
    );
    const data = await res.json();
    if (data && data.display_name) {
      return data.display_name.split(',').slice(0, 5).join(', ').trim();
    }
  } catch (err) {
    console.warn('OpenStreetMap reverse geocode error:', err);
  }

  return `Area Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

/**
 * Forward Geocoding: Mencari koordinat dari teks nama jalan / kota dengan multi-tier fallback presisi
 */
export const searchAddressCoordinates = async (
  query: string,
  provider: MapProvider = 'openstreetmap',
  apiKey?: string
): Promise<{ address: string; lat: number; lng: number }[]> => {
  if (!query || query.trim().length < 3) return [];

  // 1. Google Maps Places / Geocoding (jika API key disediakan)
  if (provider === 'google_maps' && apiKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=id`
      );
      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results.map((r: any) => ({
          address: r.formatted_address,
          lat: r.geometry.location.lat,
          lng: r.geometry.location.lng
        }));
      }
    } catch (err) {
      console.warn('Google search failed, fallback to OSM:', err);
    }
  }

  // 2. OpenStreetMap Nominatim Search dengan Smart Indonesian Administrative Fallback
  const cleanAdministrativeKeywords = (str: string) => {
    return str
      .replace(/rt\s*\.?\s*\d+(\s*\/\s*rw\s*\.?\s*\d+)?/gi, '')
      .replace(/rw\s*\.?\s*\d+/gi, '')
      .replace(/blok\s*[a-z0-9-]+/gi, '')
      .replace(/no\.\s*\d+/gi, '')
      .replace(/\b(kel\.|kelurahan|kec\.|kecamatan|kab\.|kabupaten|prov\.|provinsi)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const queriesToTry: string[] = [];
  
  // Deteksi khusus jika alamat mengandung Bojong Gede / Pabuaran Bogor
  const lower = query.toLowerCase();
  if (lower.includes('bojong') || lower.includes('pabuaran') || lower.includes('bogor')) {
    queriesToTry.push('Puri Bojong Lestari, Bojong Gede, Bogor');
    queriesToTry.push('Pabuaran, Bojong Gede, Bogor');
    queriesToTry.push('Bojong Gede, Bogor, Jawa Barat');
  }

  // Tier 1: Query asli
  queriesToTry.push(query.trim());

  // Tier 2: Query setelah dibersihkan
  const cleaned = cleanAdministrativeKeywords(query);
  if (cleaned && cleaned !== query.trim()) {
    queriesToTry.push(cleaned);
  }

  // Tier 3: Segmentasi koma
  const segments = query.split(',').map(s => cleanAdministrativeKeywords(s)).filter(s => s.length > 1);
  if (segments.length >= 2) {
    queriesToTry.push(`${segments[0]}, ${segments.slice(-2).join(', ')}`);
    queriesToTry.push(segments.slice(-3).join(', '));
    queriesToTry.push(segments.slice(-2).join(', '));
  }

  const uniqueQueries = Array.from(new Set(queriesToTry.filter(q => q && q.trim().length >= 3)));

  for (const q of uniqueQueries) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Indonesia')}&countrycodes=id&limit=5&accept-language=id`,
        {
          headers: {
            'User-Agent': 'NefakkyFoodMarketplace/1.0'
          }
        }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          address: item.display_name.split(',').slice(0, 5).join(', ').trim(),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
      }
    } catch (err) {
      console.warn(`OpenStreetMap search tier failed for "${q}":`, err);
    }
  }

  // Hard fallback koordinat jika Bojong Gede Bogor terdeteksi di teks
  if (lower.includes('bojong') && lower.includes('bogor')) {
    return [{
      address: 'Puri Bojong Lestari, Pabuaran, Bojong Gede, Kab. Bogor, Jawa Barat',
      lat: -6.4967,
      lng: 106.7972
    }];
  }

  return [];
};

/**
 * Menghasilkan URL Embed Iframe untuk OpenStreetMap atau Google Maps
 */
export const getMapEmbedUrl = (
  lat: number,
  lng: number,
  provider: MapProvider = 'openstreetmap',
  apiKey?: string
): string => {
  if (provider === 'google_maps' && apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15&language=id`;
  }

  // OpenStreetMap Embed dengan koordinat presisi
  const safeLat = Number(lat) || DEFAULT_CENTRAL_KITCHEN.lat;
  const safeLng = Number(lng) || DEFAULT_CENTRAL_KITCHEN.lng;
  const delta = 0.012;

  const minLon = (safeLng - delta).toFixed(6);
  const minLat = (safeLat - delta).toFixed(6);
  const maxLon = (safeLng + delta).toFixed(6);
  const maxLat = (safeLat + delta).toFixed(6);

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${safeLat.toFixed(6)}%2C${safeLng.toFixed(6)}`;
};
