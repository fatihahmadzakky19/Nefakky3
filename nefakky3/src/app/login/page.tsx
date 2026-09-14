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
import { EyeOff, AlertCircle } from 'lucide-react';
import { Mail, Lock, Gmail, Eye } from '@/components/icons/CustomIcons';

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
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl space-y-2 animate-fade-in font-medium">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                  {errorMessage.toLowerCase().includes('belum terdaftar') && (
                    <Link
                      href={`/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                      className="block text-center py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
                    >
                      Daftar Akun Baru Sekarang
                    </Link>
                  )}
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
                className="w-full py-2.5 bg-white border border-stone-200 hover:bg-stone-50 active:scale-[0.99] text-neutral-700 text-xs sm:text-sm font-medium rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
              >
                <Gmail className="w-5 h-5 shrink-0" />
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
