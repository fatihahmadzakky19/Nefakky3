'use client';

/**
 * ============================================================================
 * KOMPONEN: Footer.tsx (Footer Editorial Minimalis Nefakky)
 * DESKRIPSI: Bagian kaki halaman dengan tipografi editorial bersih,
 *            tautan navigasi, kontak layanan pelanggan, dan hak cipta.
 * ============================================================================
 */

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAF8F5] border-t border-stone-200/80 pt-12 pb-24 lg:pb-8 px-4 sm:px-8 lg:px-16 text-stone-700 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Column (Left) */}
          <div className="md:col-span-5 space-y-3">
            <Link href="/" className="inline-block">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 uppercase">
                NEFAKKY
              </span>
            </Link>
            <p className="text-xs text-stone-500 font-light leading-relaxed max-w-sm">
              Crafting artisanal experiences through carefully curated flavors and handcrafted excellence. Delivered fresh from our kitchen to your table.
            </p>
          </div>

          {/* Navigation Column (Middle) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2 text-xs text-stone-500 font-light">
              <li>
                <Link href="/" className="hover:text-neutral-900 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-neutral-900 transition-colors">
                  Katalog Menu
                </Link>
              </li>
              <li>
                <Link href="/comments" className="hover:text-neutral-900 transition-colors">
                  Ulasan Rasa
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="hover:text-neutral-900 transition-colors">
                  Lacak Pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support Column (Right) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
              Kontak &amp; Layanan
            </h4>
            <ul className="space-y-2 text-xs text-stone-500 font-light">
              <li>
                <span className="block text-stone-400 text-[11px]">Email Resmi:</span>
                <a href="mailto:halo@nefakky.com" className="font-medium text-neutral-800 hover:underline">
                  halo@nefakky.com
                </a>
              </li>
              <li>
                <span className="block text-stone-400 text-[11px]">WhatsApp CS:</span>
                <span className="font-medium text-neutral-800">
                  +62 812 3456 7890
                </span>
              </li>
              <li>
                <span className="block text-stone-400 text-[11px]">Dapur Utama &amp; Admin:</span>
                <span>Puri Bojong Lestari 1 Blok AF 41, RT 10 / RW 14, Pabuaran, Bojong Gede, Bogor, Jawa Barat</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400 font-light">
          <p>&copy; 2026 Nefakky Artisanal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-neutral-700 transition-colors uppercase tracking-wider">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="#" className="hover:text-neutral-700 transition-colors uppercase tracking-wider">
              Kebijakan Privasi
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
