// Mengimpor tipe Metadata dan Viewport dari Next.js untuk konfigurasi SEO dan responsivitas mobile
import type { Metadata, Viewport } from 'next';
// Mengimpor Script dari Next.js untuk memuat skrip eksternal seperti SDK Midtrans Snap
import Script from 'next/script';
// Mengimpor file stylesheet global TailwindCSS & Custom Glassmorphism
import './globals.css';
// Mengimpor AuthProvider untuk manajemen sesi autentikasi pengguna (login, register, token)
import { AuthProvider } from '@/context/AuthContext';
// Mengimpor DataProvider untuk pengolahan data master produk, order, review, & voucher
import { DataProvider } from '@/context/DataContext';
// Mengimpor CartProvider untuk pengolahan keranjang belanja & kalkulasi diskon promo
import { CartProvider } from '@/context/CartContext';
// Mengimpor RealtimeToastBanner untuk notifikasi WebSocket Laravel Reverb secara live
import RealtimeToastBanner from '@/components/RealtimeToastBanner';
// Mengimpor Toaster dari library Sonner untuk toast notification modern dan floating
import { Toaster } from 'sonner';

/**
 * Konfigurasi Viewport untuk tampilan mobile responsif presisi tinggi
 * - width: device-width menyesuaikan lebar layar gadget
 * - initialScale: 1 skala awal tampilan
 * - themeColor: warna tema address bar browser (#25160E)
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#25160E',
};

/**
 * Objek Metadata global untuk SEO dan optimasi mesin pencari aplikasi Nefakky Marketplace
 */
export const metadata: Metadata = {
  title: 'Nefakky - Nikmati Masakan Rumahan, Semudah Satu Sentuhan', // Judul tab peramban
  description: 'Platform pemesanan makanan rumahan berkualitas UMKM dengan kemudahan pembayaran online dan pelacakan pesanan real-time.', // Deskripsi cuplikan pencarian Google
};

/**
 * Komponen Utama RootLayout yang membungkus seluruh hierarki halaman aplikasi Next.js
 * @param children Komponen anak / halaman aktif yang akan dirender
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Tag HTML utama dengan atribut bahasa Indonesia ("id")
    <html lang="id">
      {/* Body dengan background krem hangat (#FAF8F5), font sans antialiased, dan warna seleksi kustom */}
      <body className="bg-[#FAF8F5] text-stone-800 antialiased font-sans selection:bg-[#8A6337]/20 selection:text-[#8A6337]">
        {/* Skrip Resmi Midtrans Snap Sandbox untuk pop-up pembayaran online */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-8T4q9uw1fIGB-pla'}
          strategy="lazyOnload"
        />
        {/* Provider Autentikasi Pengguna (Auth Context) */}
        <AuthProvider>
          {/* Provider Data Master & Sinkronisasi API / Firebase (Data Context) */}
          <DataProvider>
            {/* Provider Keranjang Belanja & Checkout (Cart Context) */}
            <CartProvider>
              {/* Render konten halaman utama yang sedang aktif */}
              {children}
              {/* Floating Banner Notifikasi Realtime Reverb (Pesanan Baru / Update Status) */}
              <RealtimeToastBanner />
              {/* Komponen Toaster Sonner untuk toast notification interaktif */}
              <Toaster position="top-right" richColors closeButton />
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


