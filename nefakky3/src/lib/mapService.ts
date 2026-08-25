/**
 * ============================================================================
 * SERVICE: Dual Mode Map Engine (OpenStreetMap & Google Maps) (src/lib/mapService.ts)
 * DESKRIPSI: Layanan peta fleksibel untuk:
 *            - OpenStreetMap (Default Gratis, Tanpa API Key)
 *            - Google Maps (Opsional dengan Google Maps API Key)
 *            - Geocoding & Reverse Geocoding Alamat
 *            - Kalkulator Jarak Haversine & Ongkir Pengiriman
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
  pricePerKm: number;
}

/** Koordinat Dapur Pusat Nefakky (Jakarta Pusat) */
export const DEFAULT_CENTRAL_KITCHEN = {
  name: 'Dapur Pusat Nefakky',
  address: 'Jl. Jendral Sudirman No. 45, Kebayoran Baru, Jakarta Selatan 12190',
  lat: -6.2088,
  lng: 106.8456
};

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  provider: 'openstreetmap',
  googleMapsApiKey: '',
  centralKitchen: DEFAULT_CENTRAL_KITCHEN,
  maxDeliveryRadiusKm: 25,
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
      // Ambil 5 segmen pertama untuk alamat yang rapi dan ringkas
      return data.display_name.split(',').slice(0, 5).join(', ').trim();
    }
  } catch (err) {
    console.warn('OpenStreetMap reverse geocode error:', err);
  }

  return `Area Koordinat (${lat.toFixed(4)}, ${lng.toFixed(4)}), Jakarta`;
};

/**
 * Forward Geocoding: Mencari koordinat dari teks nama jalan / kota
 */
export const searchAddressCoordinates = async (
  query: string,
  provider: MapProvider = 'openstreetmap',
  apiKey?: string
): Promise<{ address: string; lat: number; lng: number }[]> => {
  if (!query || query.trim().length < 3) return [];

  // 1. Google Maps Places / Geocoding
  if (provider === 'google_maps' && apiKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=id`
      );
      const data = await res.json();
      if (data.status === 'OK' && data.results) {
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

  // 2. OpenStreetMap Nominatim Search
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Indonesia')}&limit=5&accept-language=id`,
      {
        headers: {
          'User-Agent': 'NefakkyFoodMarketplace/1.0'
        }
      }
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        address: item.display_name.split(',').slice(0, 5).join(', ').trim(),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    }
  } catch (err) {
    console.warn('OpenStreetMap search error:', err);
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

  // OpenStreetMap Embed
  const delta = 0.015;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;
};
