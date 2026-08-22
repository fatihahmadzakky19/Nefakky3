'use client';

/**
 * ============================================================================
 * HALAMAN: Pemulihan / Lupa Kata Sandi (src/app/forgot-password/page.tsx)
 * DESKRIPSI: Alur pemulihan akun & setel ulang kata sandi 3-tahap
 *            (Verifikasi Email -> Masukkan Sandi Baru -> Konfirmasi Sukses).
 * DESAIN: Editorial Minimalist Luxury (Clean Split Layout, White Canvas & Black CTA).
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle2, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email.trim()) return;
    setStep(2);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email, newPassword);
    setLoading(false);

    if (res.success) {
      setStep(3);
    } else {
      setErrorMessage(res.error || 'Gagal memperbarui kata sandi.');
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#1A1A1A] flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-10 font-sans">
      {/* Outer Split Card Container */}
      <div className="w-full max-w-[1100px] min-h-[640px] lg:min-h-[720px] bg-white sm:rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT PANEL: Artisanal Food Photography */}
        <div className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-full w-full bg-neutral-900 overflow-hidden flex flex-col justify-end p-6 sm:p-10 lg:p-14 text-white">
          <Image
            src="/images/ayam_bakar.jpg"
            alt="Artisanal Ayam Bakar khas Nefakky"
            fill
            className="object-cover object-center brightness-[0.88] contrast-[1.05]"
            priority
          />
          {/* Subtle Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
          
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] sm:text-[11px] tracking-[0.25em] font-semibold text-amber-200/90 uppercase block">
              KEAMANAN AKUN NEFAKKY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-normal leading-[1.15] text-white tracking-tight">
              Pemulihan Akun
            </h2>
            <p className="text-xs text-neutral-300 font-light max-w-sm leading-relaxed hidden sm:block">
              Setel ulang kata sandi akun kuliner Anda secara instan dan aman untuk melanjutkan pesanan.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Form Panel */}
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
                Atur Ulang Kata Sandi
              </h1>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {step === 1 && 'Masukkan alamat email yang terhubung dengan akun Anda.'}
                {step === 2 && `Buat kata sandi baru untuk akun ${email}`}
                {step === 3 && 'Kata sandi akun Anda berhasil diperbarui!'}
              </p>
            </div>

            {/* Card Container */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
              
              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-fade-in font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Input Email */}
              {step === 1 && (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div className="space-y-1.5 text-left">
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

                  <button
                    type="submit"
                    className="w-full py-2.5 sm:py-3 bg-black hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
                  >
                    Lanjut Setel Ulang
                  </button>
                </form>
              )}

              {/* Step 2: Reset Password Form */}
              {step === 2 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Kata Sandi Baru (Min. 6 Karakter)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 bg-black hover:bg-neutral-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Simpan Kata Sandi Baru'
                    )}
                  </button>
                </form>
              )}

              {/* Step 3: Success State */}
              {step === 3 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-emerald-950">
                    Kata Sandi Diperbarui!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Kata sandi baru untuk <strong>{email}</strong> telah berhasil disimpan. Silakan masuk menggunakan kata sandi baru.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="py-2.5 px-6 bg-black hover:bg-neutral-800 text-white font-medium rounded-xl text-xs inline-block transition-all shadow-sm"
                    >
                      Masuk Sekarang
                    </Link>
                  </div>
                </div>
              )}

            </div>

            {/* Back Navigation */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 hover:underline font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Halaman Masuk
              </Link>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
