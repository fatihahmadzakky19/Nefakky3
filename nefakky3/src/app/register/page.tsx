'use client';

/**
 * ============================================================================
 * HALAMAN: Pendaftaran Akun Baru / Registrasi (src/app/register/page.tsx)
 * DESKRIPSI: Pembuatan akun pelanggan baru dengan validasi password,
 *            persetujuan syarat ketentuan, dan pendaftaran cepat via Google SSO.
 * ============================================================================
 */

// Mengimpor React dan hook useState untuk pengelolaan state form registrasi
import React, { useState } from 'react';
// Mengimpor Link untuk navigasi ke halaman login
import Link from 'next/link';
// Mengimpor Image dari Next.js untuk aset visual
import Image from 'next/image';
// Mengimpor hook useRouter untuk navigasi halaman
import { useRouter } from 'next/navigation';
// Mengimpor AuthContext untuk memanggil fungsi register & registerWithGoogle
import { useAuth } from '@/context/AuthContext';
// Mengimpor ikon-ikon modern dari Lucide React
import { Eye, EyeOff, ShieldCheck, Truck, Leaf, User, Mail, Phone, Lock } from 'lucide-react';

// Komponen Utama Halaman Registrasi
export default function RegisterPage() {
  const router = useRouter();
  const { register, registerWithGoogle } = useAuth();

  // State Lokal Formulir Registrasi
  const [fullName, setFullName] = useState(''); // Input nama lengkap
  const [email, setEmail] = useState(''); // Input alamat email
  const [phone, setPhone] = useState(''); // Input nomor telepon/WhatsApp
  const [password, setPassword] = useState(''); // Input kata sandi
  const [confirmPassword, setConfirmPassword] = useState(''); // Input konfirmasi kata sandi
  const [agreeTerms, setAgreeTerms] = useState(false); // Checkbox persetujuan syarat & ketentuan
  const [showPassword, setShowPassword] = useState(false); // Toggle lihat/sembunyikan kata sandi
  const [errorMessage, setErrorMessage] = useState(''); // Pesan error validasi
  const [isSubmitting, setIsSubmitting] = useState(false); // Status loading submit

  // Handler Submit Form Registrasi Akun Manual
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validasi kelengkapan form
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Silakan lengkapi semua kolom yang wajib diisi.');
      return;
    }

    // Validasi kecocokan konfirmasi kata sandi
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    // Validasi persetujuan syarat dan ketentuan
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
    <main className="min-h-screen w-full bg-[#1A1A1A] p-3 sm:p-6 md:p-10 flex items-center justify-center font-sans">
      {/* Outer Card Container */}
      <div className="w-full max-w-[1020px] bg-[#FCEEE2] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 border border-[#EACBB0]/40 my-auto">
        
        {/* LEFT PANEL: Authentic Food Photo */}
        <div className="relative min-h-[240px] sm:min-h-[280px] lg:min-h-[640px] w-full bg-stone-900 overflow-hidden flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
          <Image
            src="/images/krecek.jpg"
            alt="Sajian Kuliner Nusantara khas Nefakky"
            fill
            className="object-cover object-center brightness-[0.85] contrast-[1.05]"
            priority
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

          <div className="relative z-10 space-y-2 sm:space-y-3">
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-semibold text-stone-300 uppercase block">
              BERGABUNG DENGAN NEFAKKY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[38px] leading-[1.15] font-normal text-stone-100 tracking-tight">
              Nikmati Sajian Kuliner Terbaik.
            </h2>
            <p className="text-xs text-stone-300 font-light max-w-md leading-relaxed hidden sm:block">
              Daftar akun sekarang untuk kemudahan pemesanan hidangan favorit khas nusantara dan dapatkan penawaran promo eksklusif.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Form Panel */}
        <div className="flex flex-col justify-between p-5 sm:p-8 md:p-10 bg-[#FCEEE2] relative">
          <div>
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1B0E] tracking-tight">
                Daftar Akun Nefakky
              </h1>
              <p className="text-xs text-[#7A5B43] font-medium mt-1">
                Nikmati Kelezatan Kuliner Otentik Indonesia
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-100/90 border border-red-300 text-red-800 text-xs flex items-center gap-2 animate-fade-in">
                <span className="shrink-0 font-bold">!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#3D2514] mb-1">
                  Nama Lengkap
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[#5C320A] pointer-events-none z-10 opacity-80" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ahmad Zakky"
                    className="w-full px-4 py-2.5 pl-11 bg-[#F59E3D] hover:bg-[#F3952D] focus:bg-[#F59E3D] border border-[#DE8B32] text-[#2A1506] font-medium placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 focus:border-[#C67215] transition-all duration-200 text-xs sm:text-sm shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Grid: Email & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-[#3D2514] mb-1">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-[#5C320A] pointer-events-none z-10 opacity-80" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="fatihzakky@gmail.com"
                      className="w-full px-4 py-2.5 pl-11 bg-[#F59E3D] hover:bg-[#F3952D] focus:bg-[#F59E3D] border border-[#DE8B32] text-[#2A1506] font-medium placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 focus:border-[#C67215] transition-all duration-200 text-xs sm:text-sm shadow-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D2514] mb-1">
                    Nomor Telepon
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 w-4 h-4 text-[#5C320A] pointer-events-none z-10 opacity-80" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01234567890"
                      className="w-full px-4 py-2.5 pl-11 bg-[#F59E3D] hover:bg-[#F3952D] focus:bg-[#F59E3D] border border-[#DE8B32] text-[#2A1506] font-medium placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 focus:border-[#C67215] transition-all duration-200 text-xs sm:text-sm shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#3D2514] mb-1">
                  Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-[#5C320A] pointer-events-none z-10 opacity-80" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pl-11 pr-10 bg-[#F59E3D] hover:bg-[#F3952D] focus:bg-[#F59E3D] border border-[#DE8B32] text-[#2A1506] font-medium placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 focus:border-[#C67215] transition-all duration-200 text-xs sm:text-sm shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#5C320A] hover:text-[#2A1506] transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-[#3D2514] mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-[#5C320A] pointer-events-none z-10 opacity-80" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pl-11 pr-10 bg-[#F59E3D] hover:bg-[#F3952D] focus:bg-[#F59E3D] border border-[#DE8B32] text-[#2A1506] font-medium placeholder-[#7A4513]/70 rounded-xl outline-none focus:ring-2 focus:ring-[#8C4E15]/30 focus:border-[#C67215] transition-all duration-200 text-xs sm:text-sm shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#5C320A] hover:text-[#2A1506] transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs text-[#3D2514] leading-tight">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-[#D47E20] text-[#6E3E13] focus:ring-[#6E3E13] accent-[#6E3E13] w-3.5 h-3.5 shrink-0 cursor-pointer"
                    required
                  />
                  <span>
                    Saya Menyertujui{' '}
                    <a href="#" className="font-semibold text-[#542C0A] hover:underline">
                      Syarat &amp; Ketentuan
                    </a>{' '}
                    Serta{' '}
                    <a href="#" className="font-semibold text-[#542C0A] hover:underline">
                      Kebijakan Privasi
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#6E3E13] hover:bg-[#58310E] active:scale-[0.99] text-white font-bold tracking-wider rounded-xl shadow-md transition-all duration-200 text-xs sm:text-sm uppercase flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Buat Akun Baru'
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8CBAF]"></div>
              </div>
              <span className="relative px-3 bg-[#FCEEE2] text-[10px] tracking-wider text-[#8A6B52] font-semibold uppercase">
                Atau Daftar Dengan
              </span>
            </div>

            {/* Google Register Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
              className="w-full py-3 bg-white hover:bg-stone-50 active:scale-[0.99] text-stone-700 font-semibold rounded-full shadow-sm border border-stone-200/80 transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Masuk Dengan Google</span>
            </button>

            {/* Footer Navigation */}
            <div className="mt-4 text-center">
              <p className="text-xs text-[#7A5B43]">
                Sudah Punya Akun?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#542C0A] hover:underline"
                >
                  Masuk
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Feature Badges */}
          <div className="mt-4 flex items-center justify-center gap-6 text-[#8A6B52]">
            <span title="Jaminan Kualitas"><ShieldCheck className="w-4 h-4 hover:text-[#542C0A] transition-colors" /></span>
            <span title="Pengiriman Cepat"><Truck className="w-4 h-4 hover:text-[#542C0A] transition-colors" /></span>
            <span title="Bahan Segar Alami"><Leaf className="w-4 h-4 hover:text-[#542C0A] transition-colors" /></span>
          </div>

        </div>

      </div>
    </main>
  );
}
