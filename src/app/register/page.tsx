'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, ShieldCheck, Truck, Leaf } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

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
      setErrorMessage('Konfirmasi password tidak cocok.');
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

  return (
    <main className="min-h-screen w-full bg-[#1e1e1e] p-3 sm:p-6 md:p-10 flex items-center justify-center font-sans">
      {/* Outer Card Container matching screenshot layout */}
      <div className="w-full max-w-[1080px] bg-[#FAF8F5] rounded-2xl sm:rounded-[28px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 border border-stone-200/40 my-auto">
        
        {/* LEFT PANEL: Marble & Olive Oil Bright Culinary Photo */}
        <div className="relative min-h-[180px] sm:min-h-[240px] lg:min-h-[640px] w-full bg-stone-100 overflow-hidden flex flex-col justify-between p-6 sm:p-8 md:p-12 text-white">
          <Image
            src="/images/register_food.png"
            alt="Olive oil bottle, vine tomatoes and basil on white marble surface"
            fill
            className="object-cover object-center brightness-[0.95]"
            priority
          />
          {/* Subtle top/bottom Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

          {/* Top Logo */}
          <div className="relative z-10">
            <span className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-white/90">
              Nefakky
            </span>
          </div>
          
          {/* Bottom Heading & Subtitle */}
          <div className="relative z-10 space-y-2 sm:space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[40px] leading-[1.15] font-normal text-white tracking-tight">
              Artisanship in every bite.
            </h2>
            <p className="text-xs text-stone-100 font-light max-w-md leading-relaxed hidden sm:block">
              Join our community of epicureans and discover ingredients sourced from the world's most dedicated producers.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Centered Form Card Panel */}
        <div className="flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 bg-[#FAF8F5] relative">
          
          {/* Form Card Overlay */}
          <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-soft-card border border-stone-100">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
                Join the Marketplace
              </h1>
              <p className="text-xs text-stone-500 font-normal mt-1">
                Experience the finest artisanal flavors.
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
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alexander Dupont"
                  className="input-field"
                  required
                />
              </div>

              {/* Grid: Email & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alexander@example.com"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-10"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  required
                />
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
                    I agree to the{' '}
                    <a href="#" className="font-semibold text-[#8A6337] hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="font-semibold text-[#8A6337] hover:underline">
                      Privacy Policy
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
                  'Create Account'
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="mt-5 text-center">
              <p className="text-xs text-stone-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-[#8A6337] hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Feature Badges matching icons row in reference */}
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
