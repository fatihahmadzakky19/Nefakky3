'use client';

/**
 * ============================================================================
 * HALAMAN: Pendaftaran Akun Baru / Registrasi (src/app/register/page.tsx)
 * DESKRIPSI: Pembuatan akun pelanggan baru dengan validasi password,
 *            indikator kekuatan sandi real-time, persetujuan syarat ketentuan,
 *            dan pendaftaran cepat via Google SSO.
 * DESAIN: Editorial Minimalist Luxury (Clean Split Layout, White Canvas & Black CTA).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, registerWithGoogle } = useAuth();

  // State Formulir Registrasi
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill email dari query param jika dialihkan dari halaman login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  // Kalkulasi Kekuatan Kata Sandi
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Lemah', color: 'bg-rose-500' };
      case 2:
        return { score: 50, label: 'Cukup', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Kuat', color: 'bg-emerald-500' };
      case 4:
        return { score: 100, label: 'Sangat Kuat', color: 'bg-emerald-600' };
      default:
        return { score: 10, label: 'Sangat Pendek', color: 'bg-rose-400' };
    }
  };

  const strength = getPasswordStrength(password);

  // Handler Submit Form Registrasi Akun
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('Silakan lengkapi semua kolom yang wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Syarat & Ketentuan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(fullName, email, phone, password);
      if (res.success) {
        router.push('/');
        router.refresh();
      } else {
        setErrorMessage(res.error || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan saat pendaftaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Registrasi Cepat via Google OAuth SSO
  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await registerWithGoogle();
      if (res.success) {
        router.push('/');
        router.refresh();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage('Gagal mendaftar dengan akun Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#1A1A1A] flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-10 font-sans">
      {/* Outer Split Card Container */}
      <div className="w-full max-w-[1100px] min-h-[640px] lg:min-h-[760px] bg-white sm:rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT PANEL: Artisanal Mango Juice Photography */}
        <div className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-full w-full bg-neutral-900 overflow-hidden flex flex-col justify-end p-6 sm:p-10 lg:p-14 text-white">
          <Image
            src="/images/jus_mangga.jpg"
            alt="Sajian Minuman Jus Mangga Segar Nefakky"
            fill
            className="object-cover object-center brightness-[0.88] contrast-[1.05]"
            priority
          />
          {/* Subtle Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

          <div className="relative z-10 space-y-2">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] font-semibold text-amber-200/90 uppercase block">
              BERGABUNG DENGAN NEFAKKY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-normal leading-[1.15] text-white tracking-tight">
              Nikmati Sajian Kuliner<br />Terbaik
            </h2>
          </div>
        </div>

        {/* RIGHT PANEL: Minimalist Editorial Register Form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-white">
          <div className="w-full max-w-[390px] space-y-5">
            
            {/* Header */}
            <div className="text-center space-y-1">
              <Link href="/" className="inline-block">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  Nefakky.
                </span>
              </Link>
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                Buat Akun Baru
              </h1>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Daftar untuk memulai perjalanan Anda bersama kami.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3.5">
              
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-fade-in font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Field: Nama Lengkap */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field: Alamat Email */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Field: WhatsApp / Nomor Telepon */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-semibold text-neutral-700">
                    WhatsApp / Nomor Telepon
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xx xxxx xxxx"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                    />
                  </div>
                </div>

                {/* Field: Kata Sandi */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Dynamic Password Strength Indicator */}
                  {password && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-neutral-500 font-medium">Kekuatan Sandi:</span>
                        <span className="font-semibold text-neutral-700">{strength.label}</span>
                      </div>
                      <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Field: Konfirmasi Kata Sandi */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi Anda"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                      aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox Syarat & Ketentuan */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-neutral-600 leading-tight select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 accent-neutral-900 w-3.5 h-3.5 mt-0.5 shrink-0 cursor-pointer"
                      required
                    />
                    <span>
                      Saya menyetujui{' '}
                      <span className="font-semibold text-neutral-900 hover:underline">Syarat &amp; Ketentuan</span>{' '}
                      serta{' '}
                      <span className="font-semibold text-neutral-900 hover:underline">Kebijakan Privasi</span>.
                    </span>
                  </label>
                </div>

                {/* Tombol Submit Register */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 bg-black hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Daftar Akun'
                  )}
                </button>
              </form>

              {/* Divider ATAU */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="w-full border-t border-stone-200"></div>
                <span className="relative px-3 bg-white text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
                  ATAU
                </span>
              </div>

              {/* Tombol Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-white border border-stone-200 hover:bg-stone-50 active:scale-[0.99] text-neutral-700 text-xs sm:text-sm font-medium rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Daftar dengan Google</span>
              </button>

            </div>

            {/* Footer Navigation */}
            <div className="text-center text-xs text-neutral-500">
              Sudah memiliki akun?{' '}
              <Link href="/login" className="font-semibold text-neutral-900 hover:underline">
                Masuk
              </Link>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
