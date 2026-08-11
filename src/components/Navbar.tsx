'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Bell, Search, ShieldCheck, UtensilsCrossed } from 'lucide-react';

interface NavbarProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function Navbar({ showSearch, searchQuery, onSearchChange }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { totalCartCount } = useCart();

  const nameForAvatar = user?.displayName || user?.email || 'User';
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=F97316&color=ffffff&bold=true&size=256`;
  const userAvatar = user?.photoURL || defaultAvatar;

  // Active route checkers
  const isHomeActive = pathname === '/';
  const isMenuActive = pathname === '/menu' || pathname.startsWith('/menu/');
  const isCommentsActive = pathname === '/comments';
  const isCartActive = pathname === '/cart';
  const isNotificationsActive = pathname === '/notifications';
  const isProfileActive = pathname === '/profile';

  return (
    <header className="sticky top-0 z-40 bg-[#F59E3D] border-b border-[#DE8B32]/40 px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo Brand */}
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[#2D1B0E] group select-none">
          <span className="hover:opacity-80 transition-opacity inline-block">
            Nefakky
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#2D1B0E] select-none">
          <Link 
            href="/" 
            className={`transition-all relative pb-0.5 ${
              isHomeActive 
                ? 'font-bold border-b-2 border-[#2D1B0E]' 
                : 'hover:opacity-80'
            }`}
          >
            Beranda
          </Link>
          <Link 
            href="/menu" 
            className={`transition-all relative pb-0.5 ${
              isMenuActive 
                ? 'font-bold border-b-2 border-[#2D1B0E]' 
                : 'hover:opacity-80'
            }`}
          >
            Katalog Menu
          </Link>
          <Link 
            href="/comments" 
            className={`transition-all relative pb-0.5 ${
              isCommentsActive 
                ? 'font-bold border-b-2 border-[#2D1B0E]' 
                : 'hover:opacity-80'
            }`}
          >
            Ulasan Pelanggan
          </Link>
        </nav>

        {/* Icons & Actions Bar */}
        <div className="flex items-center gap-4 text-[#2D1B0E]">
          {showSearch && onSearchChange && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5C320A] pointer-events-none" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari menu favoritmu..."
                className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-white/30 border border-[#DE8B32] rounded-full text-xs text-[#2D1B0E] placeholder-[#5C320A]/70 focus:outline-none focus:bg-white/50 transition-all"
              />
            </div>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#6E3E13] hover:bg-[#58310E] text-white text-xs font-semibold rounded-full transition-all shadow-xs"
              title="Masuk ke Panel Admin"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>Panel Admin</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            href="/cart"
            className={`p-2 transition-colors relative rounded-full hover:bg-black/5 ${
              isCartActive ? 'font-bold' : 'hover:opacity-80'
            }`}
            title="Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            {totalCartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#6E3E13] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* Notifications Bell */}
          <Link 
            href="/notifications" 
            className={`p-2 transition-colors relative rounded-full hover:bg-black/5 ${
              isNotificationsActive ? 'font-bold' : 'hover:opacity-80'
            }`} 
            title="Lihat Notifikasi"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
          </Link>

          {/* User Profile Avatar or Guest Login Button */}
          {user ? (
            <Link 
              href="/profile"
              className={`relative w-8 h-8 rounded-full overflow-hidden border transition-all shrink-0 flex items-center justify-center bg-stone-100 ${
                isProfileActive ? 'border-2 border-[#6E3E13] ring-2 ring-[#6E3E13]/30 scale-105' : 'border-stone-300 hover:border-[#6E3E13]'
              }`}
              title="Lihat Profil Akun"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={userAvatar}
                alt="Foto Profil Pelanggan"
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#6E3E13] hover:bg-[#58310E] text-white text-xs font-semibold rounded-full transition-all shadow-xs active:scale-95"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
