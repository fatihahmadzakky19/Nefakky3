'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  User, 
  Menu, 
  X, 
  Home, 
  Utensils, 
  MessageSquare, 
  Clock,
  LogOut 
} from 'lucide-react';

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

  const nameForAvatar = user?.displayName || user?.email || 'Gourmet User';
  const userAvatar = user?.photoURL;

  // Active route checkers
  const isHomeActive = pathname === '/';
  const isMenuActive = pathname === '/menu' || pathname.startsWith('/menu/');
  const isCommentsActive = pathname === '/comments';
  const isNotificationsActive = pathname === '/notifications';
  const isProfileActive = pathname === '/profile';
  const isCartActive = pathname === '/cart';

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-[#fbf9f5]/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(69,26,3,0.05)] border-b border-amber-900/10 transition-all">
        <div className="h-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-16 flex items-center justify-between">
          
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-xl text-[#25160e] hover:bg-[#25160e]/5 lg:hidden transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group select-none">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#25160e] text-[#fbf9f5] flex items-center justify-center font-bold font-serif text-lg sm:text-xl shadow-md group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#25160e] group-hover:text-[#934b19] transition-colors">
                Nefakky
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
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
          <div className="flex items-center gap-2.5 sm:gap-5">

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-[#934b19] hover:bg-[#783603] text-white text-[11px] sm:text-xs font-semibold rounded-full transition-all shadow-md"
                title="Masuk ke Panel Admin"
              >
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span className="hidden xs:inline sm:inline">Panel Admin</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link 
              href="/cart"
              className="relative cursor-pointer group p-2 rounded-full hover:bg-[#25160e]/5 transition-colors"
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#25160e] group-hover:text-[#934b19] transition-colors" />
              {totalCartCount > 0 && (
                <span className="animate-pulse absolute -top-0.5 -right-0.5 bg-[#934b19] text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* User Profile Avatar Pill & Log Out */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#d3c3bd]">
                <Link 
                  href="/profile"
                  className="flex items-center gap-2.5 group cursor-pointer"
                  title="Lihat Profil Akun"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-[#1b1c1a] leading-tight group-hover:text-[#934b19] transition-colors">
                      {user.displayName || user.email?.split('@')[0] || 'Gourmet User'}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#25160e] flex items-center justify-center text-white shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-[#934b19]/40 transition-all shadow-sm">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={async () => {
                    if (confirm('Apakah Anda yakin ingin keluar (log out) dari akun ini?')) {
                      await logout();
                    }
                  }}
                  className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                  title="Keluar / Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#25160e] hover:bg-[#3c2a21] text-white text-xs font-bold rounded-full transition-all shadow-md"
              >
                Masuk
              </Link>
            )}

          </div>

        </div>

        {/* Mobile Slide-Over Drawer Navigation Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-20 z-40 bg-[#25160e]/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="bg-[#fbf9f5] border-b border-amber-900/10 shadow-2xl p-6 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1.5 pb-4 border-b border-amber-900/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#934b19]">Navigasi Utama</p>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all ${
                    isHomeActive ? 'bg-[#25160e] text-white' : 'text-[#4f4540] hover:bg-amber-900/5'
                  }`}
                >
                  <Home className="w-5 h-5 text-amber-500" />
                  <span>Beranda</span>
                </Link>
                <Link
                  href="/menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all ${
                    isMenuActive ? 'bg-[#25160e] text-white' : 'text-[#4f4540] hover:bg-amber-900/5'
                  }`}
                >
                  <Utensils className="w-5 h-5 text-amber-500" />
                  <span>Katalog Menu</span>
                </Link>
                <Link
                  href="/comments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all ${
                    isCommentsActive ? 'bg-[#25160e] text-white' : 'text-[#4f4540] hover:bg-amber-900/5'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <span>Ulasan Rasa</span>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-sm font-bold transition-all ${
                    isNotificationsActive ? 'bg-[#25160e] text-white' : 'text-[#4f4540] hover:bg-amber-900/5'
                  }`}
                >
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Status Pesanan</span>
                </Link>
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#934b19] text-white text-sm font-bold shadow-md"
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-200" />
                    <span>Masuk Panel Admin</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Fixed Mobile Bottom Navigation Bar (Google Delivery App Standard - lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-xl border-t border-amber-900/10 py-1.5 px-2 shadow-[0_-4px_24px_rgba(69,26,3,0.08)] flex justify-around items-center select-none">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            isHomeActive ? 'text-[#934b19] font-bold' : 'text-[#4f4540] hover:text-[#934b19]'
          }`}
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'scale-110' : ''}`} />
          <span className="text-[10px]">Beranda</span>
        </Link>

        <Link
          href="/menu"
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            isMenuActive ? 'text-[#934b19] font-bold' : 'text-[#4f4540] hover:text-[#934b19]'
          }`}
        >
          <Utensils className={`w-5 h-5 ${isMenuActive ? 'scale-110' : ''}`} />
          <span className="text-[10px]">Menu</span>
        </Link>

        <Link
          href="/cart"
          className={`relative flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            isCartActive ? 'text-[#934b19] font-bold' : 'text-[#4f4540] hover:text-[#934b19]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${isCartActive ? 'scale-110' : ''}`} />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#934b19] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Keranjang</span>
        </Link>

        <Link
          href="/notifications"
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            isNotificationsActive ? 'text-[#934b19] font-bold' : 'text-[#4f4540] hover:text-[#934b19]'
          }`}
        >
          <Clock className={`w-5 h-5 ${isNotificationsActive ? 'scale-110' : ''}`} />
          <span className="text-[10px]">Status</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all ${
            isProfileActive ? 'text-[#934b19] font-bold' : 'text-[#4f4540] hover:text-[#934b19]'
          }`}
        >
          <User className={`w-5 h-5 ${isProfileActive ? 'scale-110' : ''}`} />
          <span className="text-[10px]">Profil</span>
        </Link>
      </div>
    </>
  );
}

