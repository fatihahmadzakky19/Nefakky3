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
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-amber-200/50 px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo Brand (Clean Typography Without Icon) */}
        <Link href="/" className="font-serif text-2xl font-black tracking-tight text-slate-900 group">
          <span className="bg-gradient-to-r from-slate-900 via-amber-900 to-orange-600 bg-clip-text text-transparent hover:scale-105 transition-transform inline-block">
            Nefakky
          </span>
        </Link>

        {/* Navigation Links with Dynamic Active Underline Indicator */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <Link 
            href="/" 
            className={`transition-all relative pb-0.5 ${
              isHomeActive 
                ? 'text-orange-600 font-bold border-b-2 border-orange-500' 
                : 'hover:text-orange-600'
            }`}
          >
            Beranda
          </Link>
          <Link 
            href="/menu" 
            className={`transition-all relative pb-0.5 ${
              isMenuActive 
                ? 'text-orange-600 font-bold border-b-2 border-orange-500' 
                : 'hover:text-orange-600'
            }`}
          >
            Katalog Menu
          </Link>
          <Link 
            href="/comments" 
            className={`transition-all relative pb-0.5 ${
              isCommentsActive 
                ? 'text-orange-600 font-bold border-b-2 border-orange-500' 
                : 'hover:text-orange-600'
            }`}
          >
            Ulasan Pelanggan
          </Link>
        </nav>

        {/* Icons & Actions Bar */}
        <div className="flex items-center gap-4 text-slate-700">
          {showSearch && onSearchChange && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari menu favoritmu..."
                className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-amber-50/70 border border-amber-200/80 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 transition-all shadow-inner"
              />
            </div>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-semibold rounded-full transition-all shadow-md shadow-slate-900/20 hover:scale-105 active:scale-95"
              title="Masuk ke Panel Admin"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Panel Admin</span>
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            href="/cart"
            className={`p-2 transition-colors relative rounded-full hover:bg-amber-100/50 ${
              isCartActive ? 'text-orange-600 font-bold' : 'hover:text-orange-600'
            }`}
            title="Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            {totalCartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* Notifications Bell */}
          <Link 
            href="/notifications" 
            className={`p-2 transition-colors relative rounded-full hover:bg-amber-100/50 ${
              isNotificationsActive ? 'text-orange-600 font-bold' : 'hover:text-orange-600'
            }`} 
            title="Lihat Notifikasi"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
          </Link>

          {/* User Profile Avatar or Guest Login Button */}
          {user ? (
            <Link 
              href="/profile"
              className={`relative w-8 h-8 rounded-full overflow-hidden border transition-all shrink-0 flex items-center justify-center bg-slate-100 ${
                isProfileActive ? 'border-2 border-orange-500 ring-2 ring-orange-500/30 scale-105' : 'border-slate-300 hover:border-orange-500'
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
              className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white text-xs font-semibold rounded-full transition-all shadow-md shadow-orange-500/25 active:scale-95"
            >
              Masuk Akun
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
