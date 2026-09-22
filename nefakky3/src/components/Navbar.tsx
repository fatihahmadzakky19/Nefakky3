'use client';

/**
 * ============================================================================
 * KOMPONEN: Navbar.tsx
 * DESKRIPSI: Bilah Navigasi Editorial Culinary Nefakky (Dapur Otentik)
 *            Bersih, elegan, tipografi tajam, navigasi presisi tanpa nested pills
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';
import { ShoppingBag, Home, User, Clock, ShieldCheck, LogOut, Flame, MessageSquare, Utensils } from '@/components/icons/CustomIcons';

interface NavbarProps {
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function Navbar({ showSearch, searchQuery, onSearchChange }: NavbarProps) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { totalCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const userAvatar = user?.photoURL || (user?.displayName 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=1C1917&color=ffffff&bold=true` 
    : (user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=1C1917&color=ffffff&bold=true` : null));

  const isHomeActive = pathname === '/';
  const isMenuActive = pathname === '/menu' || pathname.startsWith('/menu/');
  const isCommentsActive = pathname === '/comments';
  const isNotificationsActive = pathname === '/notifications';
  const isProfileActive = pathname === '/profile';
  const isCartActive = pathname === '/cart';

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-stone-200 transition-colors">
        <div className="h-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-stone-800 hover:bg-stone-100 lg:hidden transition-colors cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#C2410C]" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Nefakky Editorial Culinary Brand */}
            <Link href="/" className="flex flex-col group select-none">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-[#C2410C] transition-colors">
                  NEFAKKY
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]"></span>
              </div>
              <span className="text-[10px] tracking-widest text-stone-500 font-medium uppercase -mt-0.5">
                Dapur Otentik
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links — Editorial text style */}
          <nav className="hidden lg:flex items-center gap-7 select-none">
            <Link 
              href="/" 
              className={`relative text-sm font-medium py-1 transition-colors duration-150 ${
                isHomeActive 
                  ? 'text-stone-900 font-semibold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Beranda
              {isHomeActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2410C] rounded-full" />
              )}
            </Link>

            <Link 
              href="/menu" 
              className={`relative text-sm font-medium py-1 transition-colors duration-150 flex items-center gap-1.5 ${
                isMenuActive 
                  ? 'text-stone-900 font-semibold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Katalog Menu</span>
              {isMenuActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2410C] rounded-full" />
              )}
            </Link>

            <Link 
              href="/comments" 
              className={`relative text-sm font-medium py-1 transition-colors duration-150 ${
                isCommentsActive 
                  ? 'text-stone-900 font-semibold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ulasan Rasa
              {isCommentsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2410C] rounded-full" />
              )}
            </Link>

            <Link 
              href="/notifications" 
              className={`relative text-sm font-medium py-1 transition-colors duration-150 ${
                isNotificationsActive 
                  ? 'text-stone-900 font-semibold' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Status Pesanan
              {isNotificationsActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C2410C] rounded-full" />
              )}
            </Link>
          </nav>

          {/* Action Icons & Profile Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">

            {/* Admin Guard Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium rounded-lg transition-colors border border-stone-800"
                title="Masuk ke Panel Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="hidden sm:inline">Panel Admin</span>
              </Link>
            )}

            {/* Cart Button with Refined Counter Badge */}
            <Link 
              href="/cart"
              className={`relative p-2 rounded-lg border transition-all duration-150 group flex items-center justify-center ${
                isCartActive 
                  ? 'bg-[#C2410C] text-white border-[#C2410C]' 
                  : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200 hover:border-stone-300'
              }`}
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C2410C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#FBFBFA]">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Profile Avatar / Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-lg bg-white border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer"
                  aria-expanded={isProfileMenuOpen}
                >
                  <div className="w-7 h-7 rounded-md bg-stone-900 flex items-center justify-center text-white shrink-0 overflow-hidden">
                    {userAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userAvatar} alt="Avatar Pengguna" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-stone-300" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-stone-800 max-w-[110px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Pelanggan'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:inline" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-stone-200 p-1.5 z-50 animate-fade-in"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {user.displayName || 'Pecinta Kuliner'}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-[#C2410C]" />
                        <span>Profil Akun</span>
                      </Link>
                      <Link 
                        href="/notifications" 
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition-colors"
                      >
                        <Clock className="w-4 h-4 text-[#C2410C]" />
                        <span>Pesanan Aktif</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
                            await logout();
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-stone-300" />
                <span>Masuk</span>
              </Link>
            )}

          </div>

        </div>

        {/* Mobile Slide-Over Drawer Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 top-18 z-40 bg-stone-900/40 backdrop-blur-xs" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="bg-white border-b border-stone-200 shadow-elevated p-5 space-y-4 max-h-[calc(100vh-4.5rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900 tracking-tight">NEFAKKY</h3>
                  <p className="text-[10px] text-stone-500 font-medium uppercase">Dapur Nusantara Otentik</p>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100"
                  aria-label="Tutup Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isHomeActive ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Home className="w-4 h-4 text-stone-500" />
                  <span>Beranda</span>
                </Link>
                <Link
                  href="/menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isMenuActive ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Utensils className="w-4 h-4 text-stone-500" />
                  <span>Katalog Menu Nusantara</span>
                </Link>
                <Link
                  href="/comments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isCommentsActive ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-stone-500" />
                  <span>Ulasan Rasa Pelanggan</span>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isNotificationsActive ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>Status & Lacak Pesanan</span>
                </Link>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                  <Flame className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Dapur Buka Setiap Hari</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  08:00 - 21:00 WIB • Sajian hangat langsung diantar dari dapur pusat.
                </p>
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-stone-900 text-white text-xs font-medium"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                    <span>Masuk Panel Administrator</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 select-none shadow-subtle">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center py-2 px-1">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors ${
              isHomeActive ? 'text-[#C2410C] font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] leading-none">Beranda</span>
          </Link>

          <Link
            href="/menu"
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors ${
              isMenuActive ? 'text-[#C2410C] font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span className="text-[10px] leading-none">Menu</span>
          </Link>

          <Link
            href="/cart"
            className={`relative flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors ${
              isCartActive ? 'text-[#C2410C] font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#C2410C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">Keranjang</span>
          </Link>

          <Link
            href="/notifications"
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors ${
              isNotificationsActive ? 'text-[#C2410C] font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[10px] leading-none">Status</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-lg transition-colors ${
              isProfileActive ? 'text-[#C2410C] font-semibold' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] leading-none">Profil</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
