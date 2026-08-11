'use client';

/**
 * ============================================================================
 * HALAMAN: Dashboard Utama Pelanggan (User Dashboard - /)
 * DESKRIPSI: Menampilkan Hero Banner, Kategori Pilihan, Menu Terlaris, Promo,
 *            serta Akses Tamu Tanpa Wajib Login Terlebih Dahulu.
 * GUIDELINES: Sesuai standar Clean Code, modular, dan Bahasa Indonesia 100%.
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, isVoucherValidNow } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import { 
  Search, 
  ShoppingBag, 
  Bell, 
  User, 
  Star, 
  Utensils, 
  Cookie, 
  Coffee, 
  IceCream, 
  Gift, 
  ArrowRight,
  ShieldCheck,
  LogOut,
  Ticket,
  Plus,
  Minus,
  X,
  CheckCircle2
} from 'lucide-react';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount?: number;
  image: string;
  description: string;
  badge?: 'TERPOPULER' | 'BARU';
}

const ALL_MENUS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Ayam Bakar',
    category: 'Makanan Berat',
    price: 35000,
    rating: 4.9,
    image: '/images/ayam_bakar.jpg',
    description: 'Ayam pejantan pilihan dibakar dengan lumuran bumbu kecap rempah tradisional yang meresap hingga ke tulang.',
    badge: 'TERPOPULER'
  },
  {
    id: 'm2',
    name: 'Nasi Bakar',
    category: 'Makanan Berat',
    price: 28000,
    rating: 4.8,
    image: '/images/nasi_bakar.jpg',
    description: 'Nasi gurih rempah dibungkus daun pisang dengan isian cumi pedas manis yang dibakar harum khas nusantara.',
    badge: 'BARU'
  },
  {
    id: 'm3',
    name: 'Krecek',
    category: 'Menu Hemat',
    price: 22000,
    rating: 4.9,
    image: '/images/krecek.jpg',
    description: 'Olahan krecek kulit sapi lembut dimasak dengan santan kental gurih, cabai rawit pedas, dan kacang tolo.',
    badge: 'TERPOPULER'
  },
  {
    id: 'm4',
    name: 'Gudeg',
    category: 'Makanan Berat',
    price: 40000,
    rating: 5.0,
    image: '/images/gudeg.jpg',
    description: 'Nangka muda dimasak perlahan dengan santan dan gula jawa disajikan dengan telur bacem, suwiran ayam, dan krecek.'
  },
  {
    id: 'm5',
    name: 'Garang Asam',
    category: 'Menu Hemat',
    price: 32000,
    rating: 4.8,
    image: '/images/garang_asam.jpg',
    description: 'Potongan ayam kampung segar dikukus dalam bungkus daun pisang dengan kuah santan asam segar, belimbing wulung, dan cabai rawit.'
  },
  {
    id: 'm6',
    name: 'Jus (Jambu, Sirsak, Mangga)',
    category: 'Minuman',
    price: 15000,
    rating: 4.7,
    image: '/images/jus_mangga.jpg',
    description: 'Aneka pilihan jus buah segar alami berkualitas premium: Jambu Biji Merah, Sirsak Manis, atau Mangga Harum Manis.'
  }
];


export default function UserHomePage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const { products, vouchers } = useData();
  const { cart, totalCartCount, addToCart, removeFromCart, cartItems, subtotal, claimPromo } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Filter visible products from DataContext
  const visibleProducts = products.filter(p => p.visibility !== false);

  // Dynamic Hero Slides mapped directly from real products sold by user
  const heroSlides = visibleProducts.length > 0 
    ? visibleProducts.slice(0, 5).map((p, idx) => ({
        id: p.id,
        name: p.name,
        tagline: p.description,
        rating: `${p.rating.toFixed(1)}/5`,
        reviews: `${p.reviewsCount || 100}+ Ulasan`,
        price: `Rp ${p.price.toLocaleString('id-ID')}`,
        image: p.image || '/images/ayam_bakar.jpg',
        badgeText: p.badge ? `🔥 ${p.badge}` : idx === 0 ? '🔥 TERLARIS HARI INI' : idx === 1 ? '👨‍🍳 REKOMENDASI KOKI' : '🌟 BEST SELLER'
      }))
    : [
        {
          id: 'm1',
          name: 'Ayam Bakar',
          tagline: 'Ayam Pejantan Dibakar Bumbu Rempah • 100% Halal',
          rating: '4.9/5',
          reviews: '2.500+ Ulasan',
          price: 'Rp 35.000',
          image: '/images/ayam_bakar.jpg',
          badgeText: '🔥 TERLARIS HARI INI'
        }
      ];

  // Hero Animated Showcase Slides & Timer
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Loading state handler
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-amber-800/20 border-t-[#7A4B29] rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-500 font-medium">Memuat Nefakky Marketplace...</p>
      </div>
    );
  }

  // 3 Categories matching teacher revision
  const categoriesList = [
    { name: 'Makanan Berat', icon: Utensils },
    { name: 'Menu Hemat', icon: Gift },
    { name: 'Minuman', icon: Coffee },
  ];

  // Filtering products
  const filteredProducts = visibleProducts.filter(item => {
    const matchCat = activeCategory === 'Semua' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const bestsellers = filteredProducts.slice(0, 4);

  const discount = promoApplied ? subtotal * 0.3 : 0;
  const finalPrice = Math.max(0, subtotal - discount);

  return (
    <div className="min-h-screen bg-[#FCEEE2] text-stone-800 font-sans selection:bg-[#6E3E13]/10 selection:text-[#6E3E13]">
      
      {/* 1. HEADER / NAVBAR */}
      <Navbar showSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* 2. HERO SECTION */}
      <section className="px-4 sm:px-8 py-10 md:py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[50px] leading-[1.15] font-bold text-[#2D1B0E] tracking-tight">
              Nikmati Hidangan Rumahan Rasa Nusantara Yang Otentik
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-xs sm:text-sm text-[#7A5B43] font-medium max-w-lg leading-relaxed">
              Kurasi makanan terbaik dari dapur pilihan, siap diantar ke meja makan Anda dengan kehangatan dan kemewahan yang tak terlupakan.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Link 
                href="/menu"
                className="px-7 py-3.5 bg-[#6E3E13] hover:bg-[#58310E] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all active:scale-[0.98] inline-block text-center"
              >
                Pesan Sekarang
              </Link>
              <Link 
                href="/menu"
                className="px-7 py-3.5 bg-white hover:bg-stone-50 text-[#2D1B0E] font-bold text-xs rounded-full shadow-sm border border-stone-200/60 transition-all inline-block text-center"
              >
                Lihat Menu
              </Link>
            </div>

          </div>

          {/* Hero Right Animated Culinary Showcase */}
          <div className="lg:col-span-6">
            <div className="relative w-full h-[340px] sm:h-[380px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-[#EACBB0]/60 bg-stone-900 flex items-center justify-center p-6 group">
              
              {/* Animated Active Slide Image Container */}
              {heroSlides.map((slide, index) => {
                const isActive = index === heroSlideIndex;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 pointer-events-none z-0'
                    }`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.name}
                      fill
                      className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-[0.95]"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                );
              })}

              {/* Floating Live Customer Rating Toast (Bottom Left Overlay) */}
              <div className="absolute bottom-5 left-5 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-stone-200/80 flex items-center gap-3 animate-fade-in max-w-[260px]">
                <div className="w-10 h-10 rounded-xl bg-[#6E3E13] text-amber-400 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D1B0E] leading-tight">
                    {heroSlides[heroSlideIndex]?.name}
                  </div>
                  <div className="text-[10px] text-[#7A5B43] font-semibold mt-0.5">
                    ⭐ {heroSlides[heroSlideIndex]?.rating} ({heroSlides[heroSlideIndex]?.reviews})
                  </div>
                </div>
              </div>

              {/* Interactive Carousel Navigation Indicators */}
              <div className="absolute bottom-3 right-5 z-20 flex items-center gap-1.5 bg-stone-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === heroSlideIndex ? 'w-5 bg-[#F59E3D]' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Lihat Slide ${idx + 1}`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section id="kategori" className="w-full py-12 bg-[#F59E3D] border-y border-[#DE8B32]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center space-y-6">
          
          {/* Title */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1B0E]">
              Kategori Menu
            </h2>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto pt-2">
            {categoriesList.map((cat) => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.name;

              return (
                <div
                  key={cat.name}
                  onClick={() => {
                    setActiveCategory(isActive ? 'Semua' : cat.name);
                    const el = document.getElementById('menu-terlaris');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 group shadow-sm hover:shadow-md ${
                    isActive 
                      ? 'bg-[#6E3E13] border-[#6E3E13] text-white shadow-md' 
                      : 'bg-white border-stone-100 text-[#2D1B0E] hover:border-white'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#6E3E13] text-white group-hover:scale-105'
                  }`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-center">
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. BESTSELLERS MENU SECTION */}
      <section id="menu-terlaris" className="px-4 sm:px-8 py-14 max-w-6xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between border-b border-[#EACBB0]/60 pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1B0E]">
              Menu Terlaris
            </h2>
            <p className="text-xs text-[#7A5B43] mt-1 font-medium">
              Pilihan pelanggan yang paling dicintai minggu ini.
            </p>
          </div>
          <Link 
            href="/menu"
            className="text-xs font-semibold text-[#542C0A] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Lihat Semua Katalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellers.slice(0, 3).map((item) => {
            const qty = cart[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group p-3.5"
              >
                <div>
                  {/* Card Image */}
                  <div 
                    onClick={() => setDetailProduct(item as any)}
                    className="relative h-48 w-full bg-stone-100 rounded-xl overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#2D1B0E] line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#2D1B0E] shrink-0 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Price & Cart Action */}
                <div className="px-3 pb-2 pt-2 flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#2D1B0E]">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>

                  {qty > 0 ? (
                    <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-full border border-stone-200">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-6 h-6 rounded-full bg-white text-stone-800 flex items-center justify-center shadow-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-stone-800 px-1">{qty}</span>
                      <button
                        onClick={() => {
                          if (!user) { setShowAuthModal(true); return; }
                          addToCart(item.id);
                        }}
                        className="w-6 h-6 rounded-full bg-[#6E3E13] text-white flex items-center justify-center shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (!user) { setShowAuthModal(true); return; }
                        addToCart(item.id);
                      }}
                      className="w-10 h-10 rounded-full bg-[#6E3E13] hover:bg-[#58310E] text-white flex items-center justify-center transition-all shadow-md active:scale-95"
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* 5. WEEKEND PROMO BANNER */}
      <section id="promo-section" className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
        {(() => {
          const weekendVoucher = (vouchers || []).find((v: any) => v.code === 'WEEKENDSERU');
          const { active: isWeekendActive } = isVoucherValidNow(weekendVoucher);

          return (
            <div className="bg-[#6E3E13] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
              
              {/* Left Text */}
              <div className="space-y-4 max-w-md text-left relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${isWeekendActive ? 'bg-amber-400 text-amber-950' : 'bg-stone-700 text-stone-300'}`}>
                    {isWeekendActive ? 'Promo Aktif Hari Ini' : 'Aktif Sabtu & Minggu'}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white select-none tracking-tight">
                  Weekend Promo : Diskon 15%
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 font-light leading-relaxed select-none">
                  Meriahkan akhir pekanmu dengan sajian istimewa dari Nefakky. Gunakan kode promo <strong className="underline font-semibold text-amber-200">WEEKENDSERU</strong> pada hari Sabtu &amp; Minggu.
                </p>
                <div>
                  <button 
                    onClick={() => {
                      const res = claimPromo('WEEKENDSERU');
                      if (res.success) {
                        if (totalCartCount === 0) {
                          addToCart('m2');
                        }
                        router.push('/cart');
                      } else {
                        alert(res.message);
                      }
                    }}
                    className={`px-6 py-3.5 font-bold text-xs rounded-full shadow-md transition-colors flex items-center gap-2 ${
                      isWeekendActive 
                        ? 'bg-[#F59E3D] hover:bg-[#E58F2E] text-[#2D1B0E]' 
                        : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
                    }`}
                  >
                    <span>{isWeekendActive ? 'Ambil Promonya & Check Out' : 'Cek Kode Promo'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Ticket Graphic */}
              <div className="relative z-10 shrink-0">
                <div className={`w-56 h-36 rounded-2xl border text-[#2D1B0E] flex flex-col items-center justify-center gap-1.5 shadow-2xl p-4 transition-all ${
                  isWeekendActive 
                    ? 'bg-[#F59E3D] border-[#DE8B32]' 
                    : 'bg-stone-300 border-stone-400 opacity-80'
                }`}>
                  <Ticket className="w-10 h-10 text-[#6E3E13]" />
                  <span className="font-mono text-xs font-extrabold tracking-wider uppercase">
                    WEEKENDSERU
                  </span>
                  <span className="text-[11px] font-semibold text-[#5C320A]">
                    {isWeekendActive ? 'Diskon 15% All Items' : 'Hanya Hari Sabtu & Minggu'}
                  </span>
                </div>
              </div>

              {/* Background Decorative Pattern */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            </div>
          );
        })()}
      </section>

      {/* 6. CART DRAWER SLIDE-OVER */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6">
            
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
                <h3 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#6E3E13]" />
                  <span>Keranjang Belanja</span>
                </h3>
                <button 
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              {totalCartCount === 0 ? (
                <div className="text-center py-12 text-stone-400 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-stone-300" />
                  <p className="text-xs">Keranjang Anda masih kosong.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = ALL_MENUS.find(m => m.id === id);
                    if (!item) return null;

                    return (
                      <div key={id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                        <div>
                          <h4 className="text-xs font-semibold text-stone-800">{item.name}</h4>
                          <p className="text-[11px] text-[#6E3E13] font-serif font-bold">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(id)} className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold">-</button>
                          <span className="text-xs font-bold text-stone-800">{qty}</span>
                          <button onClick={() => addToCart(id)} className="w-5 h-5 rounded-full bg-[#6E3E13] text-white flex items-center justify-center text-xs font-bold">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total & Checkout */}
            {totalCartCount > 0 && (
              <div className="border-t border-stone-200 pt-4 space-y-3">
                <div className="space-y-1 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promo Diskon (15%):</span>
                      <span>- Rp {discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-serif text-base font-bold text-stone-900 pt-2 border-t border-stone-100">
                    <span>Total Pembayaran:</span>
                    <span>Rp {finalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button 
                  onClick={() => alert('Fitur Pembayaran QRIS / Bank Transfer siap diproses! Pesanan berhasil dikirim ke Dapur Nefakky.')}
                  className="w-full py-3.5 bg-[#6E3E13] hover:bg-[#58310E] text-white font-bold text-xs uppercase rounded-full shadow transition-all"
                >
                  Lanjut ke Checkout
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer id="footer-section" className="bg-[#6E3E13] text-stone-300 py-12 px-6 sm:px-12 mt-16 border-t border-[#58310E]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-light">
          <div>
            <span className="font-serif text-2xl font-bold text-white block mb-1">
              Nefakky
            </span>
            <p className="text-stone-300 max-w-xs">
              Platform pemesanan makanan rumahan UMKM terpercaya dengan cita rasa istimewa.
            </p>
          </div>

          <div className="text-center sm:text-right text-stone-300 space-y-1">
            <p>&copy; 2026 Nefakky Marketplace. All rights reserved.</p>
            <p className="text-[11px] text-amber-200 font-medium">Nikmati Masakan Rumahan, Semudah Satu Sentuhan.</p>
          </div>
        </div>
      </footer>

      {/* Menu Detail Modal Overlay */}
      <MenuDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />

      {/* Guest Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCEEE2] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 border border-[#EACBB0]">
            <div className="w-14 h-14 bg-[#F59E3D] text-[#2D1B0E] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#2D1B0E]">Silakan Masuk Terlebih Dahulu</h3>
              <p className="text-xs text-[#7A5B43] font-medium leading-relaxed">
                Anda perlu masuk atau mendaftar akun untuk membeli dan menambahkan makanan ini ke keranjang.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3.5 bg-[#6E3E13] hover:bg-[#58310E] text-white font-bold text-xs uppercase rounded-full shadow transition-all"
              >
                Masuk ke Akun Saya
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full py-3 border border-[#6E3E13] text-[#6E3E13] hover:bg-[#6E3E13]/5 font-bold text-xs uppercase rounded-full transition-all"
              >
                Daftar Akun Baru
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-[#7A5B43] hover:underline font-medium pt-1"
              >
                Lanjutkan Melihat Menu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
