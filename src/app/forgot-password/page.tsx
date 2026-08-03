'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#1e1e1e] p-3 sm:p-6 md:p-10 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1000px] min-h-[580px] bg-[#FAF8F5] rounded-[28px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2 border border-stone-200/40">
        
        {/* LEFT PANEL */}
        <div className="relative min-h-[280px] lg:min-h-full w-full bg-stone-900 overflow-hidden flex flex-col justify-end p-8 md:p-12 text-white">
          <Image
            src="/images/ayam_bakar_hero.png"
            alt="Artisanal Ayam Bakar khas Nefakky"
            fill
            className="object-cover object-center brightness-[0.75]"
            priority
          />
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-stone-300 uppercase block">
              KEAMANAN AKUN NEFAKKY
            </span>
            <h2 className="font-serif text-3xl leading-[1.2] font-normal text-stone-100">
              Pemulihan Akun
            </h2>
            <p className="text-xs text-stone-300 font-light max-w-sm">
              Kami akan mengirimkan petunjuk untuk mengatur ulang kata sandi dan mengamankan akun kuliner Anda.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col justify-between p-8 sm:p-12 bg-[#FAF8F5]">
          <div>
            <div className="mb-8">
              <Link href="/login" className="inline-flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors mb-6">
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Halaman Masuk
              </Link>
              <h1 className="font-serif text-3xl font-semibold text-stone-900 tracking-tight">
                Atur Ulang Kata Sandi
              </h1>
              <p className="text-xs text-stone-500 font-normal mt-1.5">
                Masukkan alamat email yang terhubung dengan akun Anda.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-lg font-semibold text-emerald-900">
                  Email Terkirim!
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Tautan pemulihan kata sandi telah dikirim ke <strong>{email}</strong>. Silakan periksa folder masuk atau spam email Anda.
                </p>
                <div className="pt-2">
                  <Link href="/login" className="btn-primary inline-block text-xs py-2.5 px-6 w-auto">
                    Kembali ke Masuk
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="budi@example.com"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary mt-2">
                  Kirim Tautan Pemulihan
                </button>
              </form>
            )}
          </div>

          <div className="pt-6 text-center">
            <p className="text-xs text-stone-400">
              Portal Keamanan Nefakky &copy; 2026
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
