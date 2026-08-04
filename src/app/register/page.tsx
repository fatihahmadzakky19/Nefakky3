'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, ShieldCheck, Truck, Leaf, User, Mail, Phone, Lock } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, registerWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Silakan lengkapi semua kolom yang wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
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
    <main className="min-h-screen w-full bg-[#1e1e1e] p-3 sm:p-6 md:p-10 flex items-center justify-center font-sans">
      {/* Outer Card Container */}
      <div className="w-full max-w-[1080px] bg-[#FAF8F5] rounded-2xl sm:rounded-[28px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 border border-stone-200/40 my-auto">
        
        {/* LEFT PANEL: Authentic Food Photo */}
        <div className="relative min-h-[220px] sm:min-h-[260px] lg:min-h-[640px] w-full bg-stone-900 overflow-hidden flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
          <Image
            src="/images/register_food.png"
            alt="Sajian Kuliner Nusantara khas Nefakky"
            fill
            className="object-cover object-center brightness-[0.85] contrast-[1.05]"
            priority
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          <div className="relative z-10 space-y-2 sm:space-y-3">
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-semibold text-stone-300 uppercase block">
              BERGABUNG DENGAN NEFAKKY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[40px] leading-[1.15] font-normal text-stone-100 tracking-tight">
              Nikmati Sajian Kuliner Terbaik.
            </h2>
            <p className="text-xs text-stone-300 font-light max-w-md leading-relaxed hidden sm:block">
              Daftar akun sekarang untuk kemudahan pemesanan hidangan favorit khas nusantara dan dapatkan penawaran promo eksklusif.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Form Card Panel */}
        <div className="flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 bg-[#FAF8F5] relative">
          
          {/* Form Card Overlay */}
          <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-soft-card border border-stone-100">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
                Daftar Akun Nefakky
              </h1>
              <p className="text-xs text-stone-500 font-normal mt-1">
                Nikmati kelezatan kuliner otentik Indonesia.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                <span className="shrink-0 font-bold">!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Budi Santoso"
                    className="input-field !pl-11 !pr-4"
                    required
                  />
                </div>
              </div>

              {/* Grid: Email & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none z-10" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="budi@example.com"
                      className="input-field !pl-11 !pr-4"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Nomor Telepon
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none z-10" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="input-field !pl-11 !pr-4"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field !pl-11 !pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-stone-400 hover:text-stone-600 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field !pl-11 !pr-4"
                    required
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-stone-600 leading-tight">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-stone-300 text-stone-800 focus:ring-[#8A6337] w-3.5 h-3.5 shrink-0"
                    required
                  />
                  <span>
                    Saya menyetujui{' '}
                    <a href="#" className="font-semibold text-[#8A6337] hover:underline">
                      Syarat & Ketentuan
                    </a>{' '}
                    serta{' '}
                    <a href="#" className="font-semibold text-[#8A6337] hover:underline">
                      Kebijakan Privasi
                    </a>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary mt-3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Buat Akun Baru'
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <span className="relative px-3 bg-white text-[10px] tracking-wider text-stone-400 font-medium uppercase">
                ATAU DAFTAR DENGAN
              </span>
            </div>

            {/* Google Register Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
              className="btn-google w-full"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Daftar dengan Google</span>
            </button>

            {/* Footer Navigation */}
            <div className="mt-5 text-center">
              <p className="text-xs text-stone-600">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="font-medium text-[#8A6337] hover:underline"
                >
                  Masuk
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Feature Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-stone-400">
            <span title="Jaminan Kualitas"><ShieldCheck className="w-4 h-4 hover:text-[#8A6337] transition-colors" /></span>
            <span title="Pengiriman Cepat"><Truck className="w-4 h-4 hover:text-[#8A6337] transition-colors" /></span>
            <span title="Bahan Segar Alami"><Leaf className="w-4 h-4 hover:text-[#8A6337] transition-colors" /></span>
          </div>

        </div>

      </div>
    </main>
  );
}
