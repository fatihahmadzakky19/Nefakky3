'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Bell, Search } from 'lucide-react';

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
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=5C3D28&color=ffffff&bold=true&size=256`;
  const userAvatar = user?.photoURL || defaultAvatar;

  // Active route checkers
  const isHomeActive = pathname === '/';
  const isMenuActive = pathname === '/menu' || pathname.startsWith('/menu/');
  const isCommentsActive = pathname === '/comments';
  const isCartActive = pathname === '/cart';
  const isNotificationsActive = pathname === '/notifications';
  const isProfileActive = pathname === '/profile';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/50 px-4 sm:px-8 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo Brand */}
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[#4A3222]">
          Nefakky
        </Link>

        {/* Navigation Links with Dynamic Active Underline Indicator */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-stone-600">
          <Link 
            href="/" 
            className={`transition-all relative pb-0.5 ${
              isHomeActive 
                ? 'text-[#5C3D28] font-bold border-b-2 border-[#5C3D28]' 
                : 'hover:text-[#5C3D28]'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/menu" 
            className={`transition-all relative pb-0.5 ${
              isMenuActive 
                ? 'text-[#5C3D28] font-bold border-b-2 border-[#5C3D28]' 
                : 'hover:text-[#5C3D28]'
            }`}
          >
            Menu
          </Link>
          <Link 
            href="/#promo-section" 
            className="hover:text-[#5C3D28] transition-colors relative pb-0.5"
          >
            Promo
          </Link>
          <Link 
            href="/comments" 
            className={`transition-all relative pb-0.5 ${
              isCommentsActive 
                ? 'text-[#5C3D28] font-bold border-b-2 border-[#5C3D28]' 
                : 'hover:text-[#5C3D28]'
            }`}
          >
            Komentar
          </Link>
        </nav>

        {/* Icons & Actions Bar */}
        <div className="flex items-center gap-4 text-stone-700">
          {showSearch && onSearchChange && (
            <div className="relative hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari menu makanan..."
                className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-[#EFECE6] border border-transparent rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:border-stone-300 transition-all"
              />
            </div>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="px-2.5 py-1 bg-amber-900 text-amber-200 text-[11px] font-semibold rounded-full hover:bg-amber-800 transition-colors hidden sm:inline-block"
            >
              Admin Panel
            </Link>
          )}

          {/* Cart Icon */}
          <Link 
            href="/cart"
            className={`p-2 transition-colors relative ${
              isCartActive ? 'text-[#5C3D28] font-bold' : 'hover:text-[#5C3D28]'
            }`}
            title="Keranjang Belanja"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {totalCartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#5C3D28] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* Notifications Bell */}
          <Link 
            href="/notifications" 
            className={`p-2 transition-colors relative ${
              isNotificationsActive ? 'text-[#5C3D28] font-bold' : 'hover:text-[#5C3D28]'
            }`} 
            title="Lihat Notifikasi"
          >
            <Bell className="w-5 h-5 stroke-[1.5]" />
          </Link>

          {/* User Profile Avatar */}
          <Link 
            href="/profile"
            className={`relative w-8 h-8 rounded-full overflow-hidden border transition-all shrink-0 flex items-center justify-center bg-stone-100 ${
              isProfileActive ? 'border-2 border-[#5C3D28] ring-2 ring-[#5C3D28]/30' : 'border-stone-300 hover:border-[#5C3D28]'
            }`}
            title="Lihat Profil"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={userAvatar}
              alt="User Profile Avatar"
              className="w-full h-full object-cover"
            />
          </Link>
        </div>

      </div>
    </header>
  );
}
