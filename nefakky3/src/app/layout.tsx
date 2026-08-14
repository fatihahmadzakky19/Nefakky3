import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Nefakky - Nikmati Masakan Rumahan, Semudah Satu Sentuhan',
  description: 'Platform pemesanan makanan rumahan berkualitas UMKM dengan kemudahan pembayaran online dan pelacakan pesanan real-time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#FAF8F5] text-stone-800 antialiased font-sans selection:bg-[#8A6337]/20 selection:text-[#8A6337]">
        <AuthProvider>
          <DataProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
