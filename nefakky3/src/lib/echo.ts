/**
 * ============================================================================
 * LARAVEL ECHO & WEBSOCKET CLIENT CONFIGURATION (echo.ts)
 * ============================================================================
 * Menghubungkan antarmuka Next.js ke Server WebSocket Laravel Reverb.
 * Mendukung autentikasi private channel, reconnect otomatis, dan real-time event.
 * ============================================================================
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getStoredAuthToken, LARAVEL_API_URL } from './laravelApi';

// Pastikan Pusher terdefinisi pada window di lingkungan browser
if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

/**
 * Mendapatkan instance singleton Laravel Echo untuk Reverb WebSocket
 */
export const getEchoInstance = (): Echo<any> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!echoInstance) {
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'cp4frec811yllnlrvpbl';
    const host = process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost';
    const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT || 8080);
    const scheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http';
    const isHttps = scheme === 'https';

    // Endpoint autentikasi channel diambil dari base URL API Laravel
    // (mis. http://localhost:8000/api -> http://localhost:8000/broadcasting/auth)
    // agar tidak hardcode localhost dan tetap bekerja di produksi.
    const apiBase = LARAVEL_API_URL.replace(/\/api\/?$/, '');
    const authEndpoint = process.env.NEXT_PUBLIC_REVERB_AUTH_ENDPOINT || `${apiBase}/broadcasting/auth`;

    try {
      echoInstance = new Echo({
        broadcaster: 'reverb',
        key: key,
        wsHost: host,
        wsPort: port,
        wssPort: port,
        forceTLS: isHttps,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: authEndpoint,
        auth: {
          headers: {
            get Authorization() {
              const token = getStoredAuthToken();
              return token ? `Bearer ${token}` : '';
            },
            Accept: 'application/json',
          },
        },
      });
    } catch (error) {
      console.warn('[Laravel Echo] Gagal menginisialisasi WebSocket connection:', error);
      return null;
    }
  }

  return echoInstance;
};

/**
 * Memutuskan koneksi WebSocket ketika pengguna keluar
 */
export const disconnectEcho = (): void => {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      // Ignore
    }
    echoInstance = null;
  }
};
