'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Search, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function Navbar({ showSearch, searchQuery, onSearchChange }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { totalCartCount } = useCart();

  const nameForAvatar = user?.displayName || user?.email || 'Gourmet User';
  const userAvatar = user?.photoURL;

  // Active route checkers
  const isHomeActive = pathname === '/';
  const isMenuActive = pathname === '/menu' || pathname.startsWith('/menu/');
  const isCommentsActive = pathname === '/comments';
  const isNotificationsActive = pathname === '/notifications';
  const isProfileActive = pathname === '/profile';

  return (
    <header className="sticky top-0 w-full z-50 bg-[#fbf9f5]/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(69,26,3,0.05)] border-b border-amber-900/10 transition-all">
      <div className="h-20 max-w-[1280px] mx-auto px-5 lg:px-16 flex items-center justify-between">
        
        {/* Brand Logo (Google Stitch Specification) */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="w-10 h-10 rounded-2xl bg-[#25160e] text-[#fbf9f5] flex items-center justify-center font-bold font-serif text-xl shadow-md group-hover:scale-105 transition-transform">
            N
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#25160e] group-hover:text-[#934b19] transition-colors">
            Nefakky
          </span>
        </Link>

        {/* Navigation Links (Google Stitch Specification) */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold select-none">
          <Link 
            href="/" 
            className={`transition-all py-2 font-medium ${
              isHomeActive 
                ? 'text-[#934b19] font-bold border-b-2 border-[#934b19]' 
                : 'text-[#4f4540] hover:text-[#934b19]'
            }`}
          >
            Beranda
          </Link>
          <Link 
            href="/menu" 
            className={`transition-all py-2 font-medium ${
              isMenuActive 
                ? 'text-[#934b19] font-bold border-b-2 border-[#934b19]' 
                : 'text-[#4f4540] hover:text-[#934b19]'
            }`}
          >
            Katalog Menu
          </Link>
          <Link 
            href="/comments" 
            className={`transition-all py-2 font-medium ${
              isCommentsActive 
                ? 'text-[#934b19] font-bold border-b-2 border-[#934b19]' 
                : 'text-[#4f4540] hover:text-[#934b19]'
            }`}
          >
            Ulasan Rasa
          </Link>
          <Link 
            href="/notifications" 
            className={`transition-all py-2 font-medium ${
              isNotificationsActive 
                ? 'text-[#934b19] font-bold border-b-2 border-[#934b19]' 
                : 'text-[#4f4540] hover:text-[#934b19]'
            }`}
          >
            Status Pesanan
          </Link>
        </nav>

        {/* Cart & Profile Avatar Bar */}
        <div className="flex items-center gap-5">

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#934b19] hover:bg-[#783603] text-white text-xs font-semibold rounded-full transition-all shadow-md"
              title="Masuk ke Panel Admin"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span className="hidden sm:inline">Panel Admin</span>
            </Link>
          )}

          {/* Cart Icon (Google Stitch Specification) */}
          <Link 
            href="/cart"
            className="relative cursor-pointer group p-1.5 rounded-full hover:bg-[#25160e]/5 transition-colors"
            title="Keranjang Belanja"
          >
            <ShoppingBag className="w-6 h-6 text-[#25160e] group-hover:text-[#934b19] transition-colors" />
            {totalCartCount > 0 && (
              <span className="animate-pulse absolute -top-1 -right-1 bg-[#934b19] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* User Profile Avatar Pill (Google Stitch Specification) */}
          {user ? (
            <Link 
              href="/profile"
              className="flex items-center gap-3 pl-3 border-l border-[#d3c3bd] group cursor-pointer"
              title="Lihat Profil Akun"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#1b1c1a] leading-tight group-hover:text-[#934b19] transition-colors">
                  {user.displayName || user.email?.split('@')[0] || 'Gourmet User'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#25160e] flex items-center justify-center text-white shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-[#934b19]/40 transition-all shadow-sm">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 bg-[#25160e] hover:bg-[#3c2a21] text-white text-xs font-bold rounded-full transition-all shadow-md"
            >
              Masuk
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}
