'use client';

/**
 * ============================================================================
 * KOMPONEN: AuthRequiredModal.tsx (Modal Wajib Login / Registrasi)
 * DESKRIPSI: Modal pop-up editorial luxury untuk memberitahu pengguna tamu (guest)
 *            bahwa aktivitas (klaim voucher, pemesanan, keranjang, ulasan, dll)
 *            hanya dapat dilakukan setelah mendaftar atau masuk ke akun.
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, X, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionName?: string; // e.g. "mengklaim voucher diskon", "menambahkan menu ke keranjang", "melakukan transaksi"
}

export default function AuthRequiredModal({
  isOpen,
  onClose,
  title = 'Wajib Masuk / Daftar Akun',
  description,
  actionName = 'melakukan aktivitas ini'
}: AuthRequiredModalProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultDescription = `Untuk ${actionName}, Anda wajib masuk atau mendaftarkan akun terlebih dahulu. Pengguna yang belum login hanya dapat melihat katalog dan informasi hidangan.`;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onClose();
        router.refresh();
      } else if (res.error) {
        setGoogleError(res.error);
      }
    } catch (e: any) {
      setGoogleError('Gagal masuk dengan akun Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-fade-in font-sans">
      <div 
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-stone-200 relative my-auto p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-black flex items-center justify-center transition-all cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon Badge */}
        <div className="w-14 h-14 bg-[#25160E] text-amber-200 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-7 h-7" />
        </div>

        {/* Header Content */}
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

        {/* Google Error Message if any */}
        {googleError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 text-left font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{googleError}</span>
          </div>
        )}

        {/* Actions Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Quick Google SSO */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-3 bg-white border border-stone-300 hover:bg-stone-50 active:scale-[0.99] text-neutral-800 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isGoogleLoading ? 'Menghubungkan Google...' : 'Masuk Cepat dengan Google'}</span>
          </button>

          {/* Regular Login */}
          <Link
            href="/login"
            onClick={onClose}
            className="w-full py-3 bg-[#25160E] hover:bg-black active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Masuk dengan Email &amp; Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Register New Account */}
          <Link
            href="/register"
            onClick={onClose}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-200"
          >
            <UserCheck className="w-4 h-4" />
            <span>Belum Punya Akun? Daftar Sekarang</span>
          </Link>
        </div>

        {/* Footer Note */}
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
