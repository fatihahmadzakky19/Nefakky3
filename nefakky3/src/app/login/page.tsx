'use client';

/**
 * ============================================================================
 * HALAMAN: Masuk Akun / Login Pengguna & Admin (src/app/login/page.tsx)
 * DESKRIPSI: Otentikasi pengguna berbasis Firebase (Google SSO & Email/Password).
 *            Dilengkapi pengalihan otomatis peran (Role-based redirect):
 *            Admin -> /admin, Customer -> / (Beranda).
 * DESAIN: Editorial Minimalist Luxury (Clean Split Layout, White Canvas & Black CTA).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle, loading } = useAuth();

  // State Formulir Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect: Pengalihan otomatis bila sesi aktif
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  // Handler Submit Form Login Manual
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Silakan isi email dan kata sandi Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan saat melakukan login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Login Cepat via Google OAuth SSO
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        if (res.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan saat login dengan akun Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#1A1A1A] flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-10 font-sans">
      {/* Outer Split Card Container */}
      <div className="w-full max-w-[1100px] min-h-[640px] lg:min-h-[720px] bg-white sm:rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT PANEL: Artisanal Culinary Photography */}
        <div className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-full w-full bg-neutral-900 overflow-hidden flex flex-col justify-end p-6 sm:p-10 lg:p-14 text-white">
          <Image
            src="/images/ayam_bakar.jpg"
            alt="Artisanal Ayam Bakar khas Nefakky disajikan di tampah bambu tradisional dengan sambal dan lalapan segar"
            fill
            className="object-cover object-center brightness-[0.88] contrast-[1.05]"
            priority
          />
          {/* Subtle Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
          
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] font-semibold text-amber-200/90 uppercase block">
              NEFAKKY ARTISANAL MARKETPLACE
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-normal leading-[1.15] text-white tracking-tight">
              Kemewahan Rasa<br />Tradisional Otentik
            </h2>
          </div>
        </div>

        {/* RIGHT PANEL: Minimalist Editorial Auth Form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-white">
          <div className="w-full max-w-[380px] space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1.5">
              <Link href="/" className="inline-block">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  Nefakky.
                </span>
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                Masuk ke Akun Anda
              </h1>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Selamat datang kembali. Masuk untuk melanjutkan pesanan.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
              
              {/* Error Alert Box */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-fade-in font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Field Email */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@perusahaan.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field Password */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Options Row: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 accent-neutral-900 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Ingat saya</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-neutral-600 hover:text-neutral-900 hover:underline font-medium"
                  >
                    Lupa password?
                  </Link>
                </div>

                {/* Tombol Submit Login */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 bg-black hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Masuk'
                  )}
                </button>
              </form>

              {/* Divider Atau */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="w-full border-t border-stone-200"></div>
                <span className="relative px-3 bg-white text-[11px] text-neutral-400 font-normal lowercase">
                  atau
                </span>
              </div>

              {/* Tombol Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-white border border-stone-200 hover:bg-stone-50 active:scale-[0.99] text-neutral-700 text-xs sm:text-sm font-medium rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Masuk dengan Google</span>
              </button>

            </div>

            {/* Footer Navigation */}
            <div className="text-center text-xs text-neutral-500">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-neutral-900 hover:underline">
                Daftar sekarang
              </Link>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
