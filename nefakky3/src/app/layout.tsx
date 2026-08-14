// Mengimpor tipe Metadata dari Next.js untuk konfigurasi SEO dan Meta Tags
import type { Metadata } from 'next';
// Mengimpor file stylesheet global TailwindCSS & Custom Glassmorphism
import './globals.css';
// Mengimpor AuthProvider untuk manajemen sesi autentikasi pengguna
import { AuthProvider } from '@/context/AuthContext';
// Mengimpor DataProvider untuk pengolahan data master produk, order, & voucher
import { DataProvider } from '@/context/DataContext';
// Mengimpor CartProvider untuk pengolahan keranjang belanja & diskon promo
import { CartProvider } from '@/context/CartContext';

// Objek Metadata global untuk SEO halaman utama Nefakky Marketplace
export const metadata: Metadata = {
  title: 'Nefakky - Nikmati Masakan Rumahan, Semudah Satu Sentuhan', // Judul halaman di browser
  description: 'Platform pemesanan makanan rumahan berkualitas UMKM dengan kemudahan pembayaran online dan pelacakan pesanan real-time.', // Meta deskripsi SEO
};

// Komponen Utama RootLayout yang membungkus seluruh halaman aplikasi Next.js
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
        {/* Provider Autentikasi Pengguna */}
        <AuthProvider>
          {/* Provider Data Master & Firebase/Laravel Sync */}
          <DataProvider>
            {/* Provider Keranjang Belanja */}
            <CartProvider>
              {/* Tampilkan halaman / komponen anak yang sedang diakses */}
              {children}
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

