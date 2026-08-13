'use client';

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
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Reset Password Form, 3: Success
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
    <main className="min-h-screen w-full bg-[#1A1A1A] p-3 sm:p-6 md:p-10 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1020px] min-h-[580px] bg-[#FCEEE2] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 border border-[#EACBB0]/40 my-auto">
        
        {/* LEFT PANEL */}
        <div className="relative min-h-[240px] sm:min-h-[280px] lg:min-h-full w-full bg-stone-900 overflow-hidden flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
          <Image
            src="/images/ayam_bakar.jpg"
            alt="Artisanal Ayam Bakar khas Nefakky"
            fill
            className="object-cover object-center brightness-[0.85] contrast-[1.05]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
          <div className="relative z-10 space-y-2 sm:space-y-3">
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-semibold text-stone-300 uppercase block">
              KEAMANAN AKUN NEFAKKY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] leading-[1.15] font-normal text-stone-100 tracking-tight">
              Pemulihan Akun
            </h2>
            <p className="text-xs text-stone-300 font-light max-w-sm leading-relaxed hidden sm:block">
              Setel ulang kata sandi akun kuliner Anda secara instan dan aman untuk melanjutkan transaksi.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col justify-between p-6 sm:p-10 md:p-12 bg-[#FCEEE2]">
          <div>
            <div className="mb-6">
              <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[#542C0A] hover:underline transition-colors mb-6">
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Halaman Masuk
              </Link>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1B0E] tracking-tight">
                Atur Ulang Kata Sandi
              </h1>
              <p className="text-xs text-[#7A5B43] font-medium mt-1">
                {step === 1 && 'Masukkan alamat email yang terhubung dengan akun Anda.'}
                {step === 2 && `Buat kata sandi baru untuk akun ${email}`}
                {step === 3 && 'Kata sandi berhasil diperbarui!'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D2514] mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-[#5C320A] pointer-events-none z-10 opacity-80" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="fatihzakky@gmail.com"
                      className="w-full px-4 py-3 pl-11 bg-[#F59E3D] hover:bg-[#F3952D] focus:bg-[#F59E3D] border border-[#DE8B32] text-[#2A1506] font-medium placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 focus:border-[#C67215] transition-all duration-200 text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#6E3E13] hover:bg-[#58310E] active:scale-[0.99] text-white font-bold tracking-wider rounded-xl shadow-md transition-all duration-200 text-sm uppercase flex items-center justify-center gap-2 mt-2"
                >
                  Lanjut Setel Ulang
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3D2514] mb-1.5">
                    Kata Sandi Baru (Min. 6 Karakter)
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-[#5C320A] pointer-events-none z-10 opacity-80" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password baru..."
                      className="w-full px-4 py-3 pl-11 bg-[#F59E3D] hover:bg-[#F3952D] focus:bg-[#F59E3D] border border-[#DE8B32] text-[#2A1506] font-medium placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 focus:border-[#C67215] transition-all duration-200 text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D2514] mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative flex items-center">
                    <KeyRound className="absolute left-3.5 w-4 h-4 text-[#5C320A] pointer-events-none z-10 opacity-80" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru..."
                      className="w-full px-4 py-3 pl-11 bg-[#F59E3D] hover:bg-[#F3952D] focus:bg-[#F59E3D] border border-[#DE8B32] text-[#2A1506] font-medium placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 focus:border-[#C67215] transition-all duration-200 text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#6E3E13] hover:bg-[#58310E] active:scale-[0.99] disabled:opacity-50 text-white font-bold tracking-wider rounded-xl shadow-md transition-all duration-200 text-sm uppercase flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="bg-emerald-100/80 border border-emerald-300 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-emerald-950">
                  Kata Sandi Diperbarui!
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Kata sandi baru Anda untuk <strong>{email}</strong> telah berhasil disimpan. Silakan masuk menggunakan kata sandi baru.
                </p>
                <div className="pt-2">
                  <Link href="/login" className="py-2.5 px-6 bg-[#6E3E13] hover:bg-[#58310E] text-white font-bold rounded-xl text-xs inline-block transition-colors shadow-sm uppercase">
                    Masuk Sekarang
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 text-center">
            <p className="text-xs text-[#8A6B52]">
              Portal Keamanan Nefakky &copy; 2026
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

