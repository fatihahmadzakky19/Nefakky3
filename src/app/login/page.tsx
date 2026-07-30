'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LockKeyhole, AlertTriangle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleWarning, setGoogleWarning] = useState('');
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
    setGoogleWarning('');
    if (!email || !password) {
      setErrorMessage('Silakan isi email dan password Anda.');
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
        setErrorMessage(res.error || 'Login gagal. Periksa kembali email dan password Anda.');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan saat melakukan login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setGoogleWarning('');
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
      } else {
        if (res.error?.includes('belum terdaftar') || res.error?.includes('Google')) {
          setGoogleWarning(res.error);
        } else {
          setErrorMessage(res.error || 'Gagal login dengan Google.');
        }
      }
    } catch (err: any) {
      setGoogleWarning('Akun Google ini belum terdaftar di sistem. Silakan melakukan registrasi terlebih dahulu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#1e1e1e] p-3 sm:p-6 md:p-10 flex items-center justify-center font-sans">
      {/* Outer Card Container matching screenshot aspect & rounded style */}
      <div className="w-full max-w-[1080px] bg-[#FAF8F5] rounded-2xl sm:rounded-[28px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 border border-stone-200/40 my-auto">
        
        {/* LEFT PANEL: High End Dark Culinary Photography */}
        <div className="relative min-h-[200px] sm:min-h-[260px] lg:min-h-[620px] w-full bg-stone-900 overflow-hidden flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
          <Image
            src="/images/login_food.png"
            alt="Artisanal sourdough bread, tomatoes, olives and cheese on dark slate"
            fill
            className="object-cover object-center brightness-[0.75] contrast-[1.05]"
            priority
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          
          <div className="relative z-10 space-y-2 sm:space-y-3">
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-semibold text-stone-300 uppercase block">
              THE ART OF DINING
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[40px] leading-[1.15] font-normal text-stone-100 tracking-tight">
              A palette of pure provenance.
            </h2>
            <p className="text-xs text-stone-300 font-light max-w-md leading-relaxed hidden sm:block">
              Curated ingredients from heritage growers, delivered with digital precision.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Clean Off-White Elegant Form */}
        <div className="flex flex-col justify-between p-5 sm:p-10 md:p-12 bg-[#FAF8F5] relative">
          <div>
            {/* Header Brand */}
            <div className="flex items-center justify-between mb-8">
              <span className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
                Nefakky
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-8">
              <h1 className="font-serif text-3xl font-semibold text-stone-900 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs text-stone-500 font-normal mt-1.5">
                Sign in to continue your culinary journey.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
                <span className="shrink-0 font-bold">!</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="gourmet@nefakky.com"
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between pt-1 pb-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-stone-300 text-stone-800 focus:ring-[#8A6337] w-3.5 h-3.5"
                  />
                  <span>Remember Me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-medium text-[#8A6337] hover:text-[#735129] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="btn-primary mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <span className="relative px-3 bg-[#FAF8F5] text-[10px] tracking-wider text-stone-400 font-medium uppercase">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google SSO Section */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="btn-google w-full"
              >
                {/* Google Colored Icon */}
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
                <span>Sign in with Google</span>
              </button>

              {/* Google Unregistered Warning Alert Box */}
              {googleWarning && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-2 animate-fade-in shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-900 block mb-0.5">
                        Peringatan: Akun Belum Terdaftar
                      </span>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        {googleWarning}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1 border-t border-amber-200/60 mt-1">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A6337] hover:text-[#735129] hover:underline"
                    >
                      <span>Lakukan Registrasi Sekarang</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation & Security */}
          <div className="pt-6 text-center space-y-3">
            <p className="text-xs text-stone-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-[#8A6337] hover:underline"
              >
                Register
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <LockKeyhole className="w-3 h-3" />
              <span>Secure connection active</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
