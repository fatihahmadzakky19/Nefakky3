'use client';

/**
 * ============================================================================
 * KOMPONEN: AuthRequiredModal.tsx (Modal Wajib Login / Registrasi Pengguna Tamu)
 * DESKRIPSI: Modal pop-up editorial luxury yang memandu pengguna tamu (guest)
 *            bahwa aktivitas tertentu (seperti klaim voucher promo, menambah menu
 *            ke keranjang, melakukan checkout, mengirim ulasan rasa, dll)
 *            hanya dapat dilakukan setelah mendaftar atau masuk ke akun.
 * ============================================================================
 */

// Mengimpor React dan hook useState untuk state internal komponen
import React, { useState } from 'react';
// Mengimpor komponen Link dari Next.js untuk navigasi antar halaman
import Link from 'next/link';
// Mengimpor hook useRouter dari Next.js untuk operasi navigasi dinamis
import { useRouter } from 'next/navigation';
// Mengimpor hook useAuth dari AuthContext untuk fitur login Google SSO
import { useAuth } from '@/context/AuthContext';
import { X, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { Lock, Gmail } from '@/components/icons/CustomIcons';

/**
 * Interface properti komponen AuthRequiredModal
 */
export interface AuthRequiredModalProps {
  isOpen: boolean; // Menandakan apakah modal sedang terbuka
  onClose: () => void; // Fungsi untuk menutup modal
  title?: string; // Judul modal kustom (opsional)
  description?: string; // Deskripsi modal kustom (opsional)
  actionName?: string; // Nama aktivitas yang dicegah (misal: "mengklaim voucher diskon", "melakukan checkout")
}

/**
 * Komponen Utama: AuthRequiredModal
 */
export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = 'Wajib Masuk / Daftar Akun',
  description,
  actionName = 'melakukan aktivitas ini'
}: AuthRequiredModalProps) {
  // Inisialisasi hook router Next.js
  const router = useRouter();
  // Mengambil fungsi login Google SSO dari AuthContext
  const { loginWithGoogle } = useAuth();
  // State untuk indikator loading saat autentikasi Google sedang diproses
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  // State untuk menyimpan pesan error jika login Google mengalami kendala
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Jika modal dalam keadaan tertutup, jangan render apapun
  if (!isOpen) return null;

  // Teks deskripsi default yang informatif jika tidak diberikan deskripsi kustom
  const defaultDescription = `Untuk ${actionName}, Anda wajib masuk atau mendaftarkan akun terlebih dahulu. Pengguna yang belum login hanya dapat melihat katalog dan informasi hidangan.`;

  /**
   * Handler: Autentikasi Instan dengan Akun Google (Single Sign-On)
   */
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true); // Aktifkan animasi loading
    setGoogleError(null); // Bersihkan error sebelumnya
    try {
      // Panggil method loginWithGoogle dari AuthContext
      const res = await loginWithGoogle();
      if (res.success) {
        onClose(); // Tutup modal jika login berhasil
        router.refresh(); // Segarkan halaman untuk memuat sesi pengguna baru
      } else if (res.error) {
        setGoogleError(res.error); // Tampilkan pesan error jika login gagal
      }
    } catch (e: any) {
      setGoogleError('Gagal masuk dengan akun Google.'); // Tangani exception jaringan/Google popup
    } finally {
      setIsGoogleLoading(false); // Nonaktifkan status loading
    }
  };

  return (
    // Overlay backdrop hitam semi-transparan dengan efek blur kaca
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-fade-in font-sans">
      {/* Kontainer kartu modal putih dengan sudut membulat */}
      <div 
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 relative my-auto p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()} // Mencegah penutupan modal saat mengklik area dalam kartu
      >
        {/* Tombol Silang (Close Button) di sudut kanan atas */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-black flex items-center justify-center transition-all cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ikon Gembok Berwarna Emas & Cokelat Tua */}
        <div className="w-14 h-14 bg-[#25160E] text-amber-200 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-7 h-7" />
        </div>

        {/* Konten Judul & Pesan Penjelasan */}
        <div className="space-y-1.5 text-center">
          <span className="text-[10px] font-bold tracking-widest text-[#934B19] uppercase">
            AKSES TERBATAS PELANGGAN
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
            {title}
          </h2>
          <p className="text-xs text-stone-500 font-light leading-relaxed max-w-xs mx-auto">
            {description || defaultDescription}
          </p>
        </div>

        {/* Notifikasi Pesan Error Google jika ada */}
        {googleError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 text-left font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{googleError}</span>
          </div>
        )}

        {/* Tombol-Tombol Aksi Autentikasi */}
        <div className="space-y-2.5 pt-2">
          {/* Tombol Masuk Instan via Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 bg-white border border-stone-300 hover:bg-stone-50 active:scale-[0.99] text-neutral-800 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            {/* Logo Resmi Google / Gmail */}
            <Gmail className="w-5 h-5 shrink-0" />
            <span>{isGoogleLoading ? 'Menghubungkan Google...' : 'Masuk Cepat dengan Google'}</span>
          </button>

          {/* Tombol Masuk dengan Email & Password Biasa */}
          <Link
            href="/login"
            onClick={onClose}
            className="w-full py-3 bg-[#25160E] hover:bg-black active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Masuk dengan Email &amp; Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Tombol Pendaftaran Akun Pelanggan Baru */}
          <Link
            href="/register"
            onClick={onClose}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-200"
          >
            <UserCheck className="w-4 h-4" />
            <span>Belum Punya Akun? Daftar Sekarang</span>
          </Link>
        </div>

        {/* Tautan Pembatalan / Lanjut Jelajah Menu */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-700 font-medium transition-colors cursor-pointer"
          >
            Lanjut Melihat Menu Saja
          </button>
        </div>
      </div>
    </div>
  );
}
