'use client';

/**
 * ============================================================================
 * KOMPONEN: Navbar.tsx (Bilah Navigasi Nordic Citrus & Deep Navy - Nefakky)
 * DESKRIPSI: Bilah navigasi modern berkarakter segar, cerah, dan bersih:
 *            Deep Navy (#0F172A), Blood Orange Citrus (#FF5400), dan
 *            Sun Gold (#FFB703) dengan kontras tajam bebas AI-slop.
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
  Sparkles, 
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

  const userAvatar = user?.photoURL || (user?.displayName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0F172A&color=ffffff&bold=true` : (user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=0F172A&color=ffffff&bold=true` : null));

  const isHomeActive = pathname === '/';
  const isMenuActive = pathname === '/menu' || pathname.startsWith('/menu/');
  const isCommentsActive = pathname === '/comments';
  const isNotificationsActive = pathname === '/notifications';
  const isProfileActive = pathname === '/profile';
  const isCartActive = pathname === '/cart';

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-300 shadow-xs">
        <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Drawer Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-xl text-[#0F172A] hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-[#FF5400]" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Handcrafted Brand Logo */}
            <Link href="/" className="flex flex-col group select-none">
              <span className="font-serif text-xl sm:text-2xl font-black tracking-wider text-[#0F172A] group-hover:text-[#FF5400] transition-colors uppercase leading-none">
                NEFAKKY
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest text-[#FF5400] font-bold uppercase mt-0.5 font-mono">
                Dapur Otentik
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80 select-none">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                isHomeActive 
                  ? 'bg-[#0F172A] text-white shadow-sm' 
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              Beranda
            </Link>
            <Link 
              href="/menu" 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                isMenuActive 
                  ? 'bg-[#0F172A] text-white shadow-sm' 
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              <span>Katalog Menu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5400] animate-pulse"></span>
            </Link>
            <Link 
              href="/comments" 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                isCommentsActive 
                  ? 'bg-[#0F172A] text-white shadow-sm' 
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              Ulasan Rasa
            </Link>
            <Link 
              href="/notifications" 
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                isNotificationsActive 
                  ? 'bg-[#0F172A] text-white shadow-sm' 
                  : 'text-slate-600 hover:text-[#0F172A] hover:bg-white'
              }`}
            >
              Status Pesanan
            </Link>
          </nav>

          {/* Cart & Profile Controls */}
          <div className="flex items-center gap-2.5 sm:gap-4">

            {/* Admin Portal Guard Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#FF5400] to-[#E04800] hover:from-[#E04800] hover:to-[#C73C00] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#FF5400]/20 active:scale-95"
                title="Masuk ke Panel Admin"
              >
                <ShieldCheck className="w-4 h-4 text-[#FFB703]" />
                <span className="hidden sm:inline">Panel Admin</span>
              </Link>
            )}

            {/* Cart Button with Live Counter Badge */}
            <Link 
              href="/cart"
              className={`relative p-2.5 rounded-xl border transition-all duration-200 group flex items-center justify-center ${
                isCartActive 
                  ? 'bg-[#FF5400] text-white border-[#FF5400] shadow-md shadow-[#FF5400]/20' 
                  : 'bg-white hover:bg-slate-50 text-[#0F172A] border-slate-200 hover:border-[#FF5400]/40 shadow-2xs'
              }`}
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF5400] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Profile Avatar Pill / Login */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:pr-3 rounded-full bg-white border border-slate-200 hover:border-[#FF5400]/40 transition-all shadow-2xs cursor-pointer group"
                  aria-expanded={isProfileMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white shrink-0 overflow-hidden ring-2 ring-[#FF5400]/20 group-hover:ring-[#FF5400]/50 transition-all">
                    {userAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={userAvatar} alt="Avatar Pengguna" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#FFB703]" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-[#0F172A] group-hover:text-[#FF5400] transition-colors max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Pelanggan'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F172A] transition-transform hidden sm:inline" />
                </button>

                {/* Profile Popup Menu */}
                {isProfileMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-fade-in"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-[#0F172A] truncate">
                        {user.displayName || 'Pecinta Kuliner'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-[#FF5400] hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-[#FF5400]" />
                        <span>Profil & Alamat Antar</span>
                      </Link>
                      <Link 
                        href="/notifications" 
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-[#FF5400] hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Clock className="w-4 h-4 text-[#FF5400]" />
                        <span>Status Pesanan Aktif</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
                            await logout();
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar (Log Out)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-95 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-[#FFB703]" />
                <span>Masuk Akun</span>
              </Link>
            )}

          </div>

        </div>

        {/* Mobile Slide-Over Drawer Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 top-20 z-40 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div 
              className="bg-white border-b border-slate-200 shadow-2xl p-6 space-y-5 max-h-[calc(100vh-5rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Brand Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#0F172A] tracking-wider uppercase leading-tight">NEFAKKY</h3>
                  <p className="text-[10px] text-[#FF5400] font-mono font-bold">Dapur Nusantara Otentik</p>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF5400]">Navigasi Utama</p>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all ${
                    isHomeActive ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4 text-[#FFB703]" />
                  <span>Beranda</span>
                </Link>
                <Link
                  href="/menu"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all ${
                    isMenuActive ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Utensils className="w-4 h-4 text-[#FFB703]" />
                  <span>Katalog Menu Nusantara</span>
                </Link>
                <Link
                  href="/comments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all ${
                    isCommentsActive ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#FFB703]" />
                  <span>Ulasan Rasa Pelanggan</span>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-xs font-bold transition-all ${
                    isNotificationsActive ? 'bg-[#0F172A] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4 text-[#FFB703]" />
                  <span>Status & Lacak Pesanan</span>
                </Link>
              </div>

              {/* Kitchen Hours Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                  <Flame className="w-4 h-4 text-[#FF5400]" />
                  <span>Dapur Buka Setiap Hari</span>
                </div>
                <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                  08:00 - 21:00 WIB • Pesan instan diantar hangat langsung dari dapur pusat Bogor.
                </p>
              </div>

              {isAdmin && (
                <div className="pt-2">
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#FF5400] to-[#E04800] text-white text-xs font-bold shadow-md shadow-[#FF5400]/20"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FFB703]" />
                    <span>Masuk Panel Administrator</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] select-none">
        <div className="max-w-md mx-auto grid grid-cols-5 items-center py-2 px-1">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all ${
              isHomeActive ? 'text-[#FF5400] font-bold' : 'text-slate-400 hover:text-[#0F172A]'
            }`}
          >
            <Home className={`w-5 h-5 transition-transform ${isHomeActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] leading-none">Beranda</span>
          </Link>

          <Link
            href="/menu"
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all ${
              isMenuActive ? 'text-[#FF5400] font-bold' : 'text-slate-400 hover:text-[#0F172A]'
            }`}
          >
            <Utensils className={`w-5 h-5 transition-transform ${isMenuActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] leading-none">Menu</span>
          </Link>

          <Link
            href="/cart"
            className={`relative flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all ${
              isCartActive ? 'text-[#FF5400] font-bold' : 'text-slate-400 hover:text-[#0F172A]'
            }`}
          >
            <div className="relative">
              <ShoppingBag className={`w-5 h-5 transition-transform ${isCartActive ? 'scale-110' : ''}`} />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#FF5400] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">Keranjang</span>
          </Link>

          <Link
            href="/notifications"
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all ${
              isNotificationsActive ? 'text-[#FF5400] font-bold' : 'text-slate-400 hover:text-[#0F172A]'
            }`}
          >
            <Clock className={`w-5 h-5 transition-transform ${isNotificationsActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] leading-none">Status</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all ${
              isProfileActive ? 'text-[#FF5400] font-bold' : 'text-slate-400 hover:text-[#0F172A]'
            }`}
          >
            <User className={`w-5 h-5 transition-transform ${isProfileActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] leading-none">Profil</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
