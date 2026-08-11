'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LockKeyhole } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically redirect if already logged in
  React.useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, loading, router]);

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
    <main className="min-h-screen w-full bg-[#25160E] p-3 sm:p-6 md:p-10 flex items-center justify-center font-sans">
      {/* Outer Card Container (Google Stitch Design Tokens) */}
      <div className="w-full max-w-[1020px] bg-[#FBF9F5] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 border border-amber-900/20 my-auto">
        
        {/* LEFT PANEL: Authentic Ayam Bakar Photo */}
        <div className="relative min-h-[240px] sm:min-h-[280px] lg:min-h-[620px] w-full bg-[#25160E] overflow-hidden flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
          <Image
            src="/images/ayam_bakar.jpg"
            alt="Artisanal Ayam Bakar khas Nefakky disajikan di tampah bambu tradisional dengan sambal dan lalapan segar"
            fill
            className="object-cover object-center brightness-[0.85] contrast-[1.05]"
            priority
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#25160E]/95 via-[#25160E]/40 to-transparent" />
          
          <div className="relative z-10 space-y-2 sm:space-y-3">
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-semibold text-amber-200 uppercase block">
              Nefakky Artisanal Marketplace
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white">
              Kemewahan Rasa Tradisional Otentik
            </h2>
            <p className="text-[11px] sm:text-xs text-amber-100/80 font-light leading-relaxed max-w-sm">
              Masuk ke akun Anda untuk melacak pengiriman 5-tahap, klaim voucher diskon, dan menikmati kuliner rumahan otentik.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Form Login */}
        <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center space-y-6 bg-[#FBF9F5]">
          
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold tracking-wider text-[#934B19] uppercase block">Selamat Datang Kembali</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#25160E] tracking-tight">Masuk ke Akun</h1>
            <p className="text-xs text-[#4F4540]">Silakan masukkan email dan kata sandi Anda.</p>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2 animate-fade-in font-medium">
              <span className="text-sm">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Login Utama */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field Email */}
            <div className="space-y-1 text-left">
              <label className="block text-xs font-bold text-[#25160E]">Alamat Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh: nama@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Field Password */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#25160E]">Kata Sandi</label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-[#934B19] hover:underline">
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] shadow-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Ingat Saya */}
            <div className="flex items-center justify-between text-xs text-[#4F4540] pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-amber-900/30 text-[#934B19] focus:ring-[#934B19]"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
            </div>

            {/* Tombol Submit Login */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#25160E] hover:bg-[#3C2A21] text-white font-bold text-xs rounded-2xl shadow-lg transition-all active:scale-[0.99] uppercase tracking-wider disabled:opacity-60"
            >
              {isSubmitting ? 'Memproses Login...' : 'Masuk Sekarang'}
            </button>
          </form>

          {/* Divider Atau */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-amber-900/10" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F4540]">Atau Masuk Dengan</span>
            <div className="flex-1 h-px bg-amber-900/10" />
          </div>

          {/* Tombol Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 bg-white border border-amber-900/15 hover:bg-stone-50 text-[#1B1C1A] text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Masuk dengan Google</span>
          </button>

          {/* Link Pendaftaran Akun */}
          <div className="text-center pt-2 text-xs text-[#4F4540]">
            Belum memiliki akun?{' '}
            <Link href="/register" className="font-bold text-[#934B19] hover:underline">
              Daftar Akun Baru
            </Link>
          </div>

        </div>

      </div>
    </main>
  );
}
