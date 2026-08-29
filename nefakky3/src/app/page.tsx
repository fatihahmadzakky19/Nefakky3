'use client';

/**
 * ============================================================================
 * HALAMAN: Beranda Utama (User Homepage - src/app/page.tsx)
 * DESKRIPSI: Dikonversikan secara presisi 100% dari ekspor Stitch MCP HTML/Tailwind
 *            (Dynamic Hero Showcase Slider, Floating Category Pills, Active
 *            Voucher Strip, 6 Featured Menu Cards Grid, Coming Soon Teaser,
 *            Filosofi Rasa Split Panel, dan Footer Editorial 4-Kolom).
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, isVoucherValidNow, cleanPromoCode } from '@/context/DataContext';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';
import Navbar from '@/components/Navbar';
import { 
  Star, 
  Search, 
  Bell, 
  ShoppingBag, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus,
  UtensilsCrossed,
  Hourglass,
  Leaf,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Ticket,
  User,
  ShieldCheck
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { vouchers, products, isVoucherUsedByUser } = useData();
  const { cartItems, totalCartCount, addToCart, removeFromCart, claimPromo } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [claimedNotice, setClaimedNotice] = useState<{ text: string; success: boolean } | null>(null);
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleWishlist = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Saring semua voucher aktif yang dibuat oleh Admin dan BELUM pernah dipakai oleh akun pengguna ini
  const activeVouchers = useMemo(() => {
    return (vouchers || [])
      .filter(v => isVoucherValidNow(v).active)
      .filter(v => !isVoucherUsedByUser(v.code, user?.uid, user?.email));
  }, [vouchers, user, isVoucherUsedByUser]);

  const currentVoucher = useMemo(() => {
    if (!activeVouchers || activeVouchers.length === 0) return null;
    const cleanSelected = cleanPromoCode(selectedVoucherCode);
    const foundSelected = activeVouchers.find(v => cleanPromoCode(v.code) === cleanSelected);
    if (foundSelected) return foundSelected;
    const foundWeekend = activeVouchers.find(v => cleanPromoCode(v.code).includes('WEEKEND'));
    if (foundWeekend) return foundWeekend;
    return activeVouchers[0] || null;
  }, [activeVouchers, selectedVoucherCode]);

  const categories = ['Semua', 'Makanan Berat', 'Minuman', 'Menu Hemat'];

  // Sinkronisasi data Hero Slider dengan database produk aktif
  const dynamicHeroSlides = useMemo(() => {
    const defaultSlides = [
      {
        id: 'm1',
        rating: '4.9/5',
        reviewCount: '(156+ Ulasan Pelanggan)',
        title: 'Ayam Bakar Madu Rempah Nusantara',
        subtitle: 'Ayam pejantan pilihan dibakar dengan lumuran bumbu kecap rempah tradisional yang meresap sempurna hingga ke tulang, disajikan dengan sambal terasi khas.',
        image: '/images/ayam_bakar.jpg',
        price: 35000,
        category: 'Makanan Berat',
        product: undefined
      },
      {
        id: 'm4',
        rating: '5.0/5',
        reviewCount: '(312+ Ulasan Pelanggan)',
        title: 'Gudeg Komplit Tradisional Khas Jogja',
        subtitle: 'Nangka muda dimasak perlahan berjam-jam dengan santan kental dan gula kelapa alami, disajikan lengkap dengan telur bacem, suwiran ayam, dan krecek gurih.',
        image: '/images/gudeg.jpg',
        price: 10000,
        category: 'Makanan Berat',
        product: undefined
      },
      {
        id: 'm2',
        rating: '4.8/5',
        reviewCount: '(98+ Ulasan Pelanggan)',
        title: 'Aroma Wangi Gurih Nasi Bakar Daun Pisang Tradisional',
        subtitle: 'Nasi gurih dibungkus daun pisang segar dengan isian suwir ayam dan cumi pedas, dibakar di atas arang batok kelapa hingga harum merebak.',
        image: '/images/nasi_bakar.jpg',
        price: 10000,
        category: 'Makanan Berat',
        product: undefined
      },
      {
        id: 'm5',
        rating: '4.8/5',
        reviewCount: '(88+ Ulasan Pelanggan)',
        title: 'Garang Asam Ayam Kampung Belimbing Wuluh',
        subtitle: 'Potongan ayam kampung segar dikukus dalam bungkus daun pisang dengan kuah santan asam segar, belimbing wuluh alami, dan cabai rawit utuh.',
        image: '/images/garang_asam.jpg',
        price: 10000,
        category: 'Menu Hemat',
        product: undefined
      },
      {
        id: 'm6',
        rating: '4.9/5',
        reviewCount: '(145+ Ulasan Pelanggan)',
        title: 'Kesegaran Alami Aneka Jus Buah Tropis',
        subtitle: '100% buah segar alami pilihan: Mangga Harum Manis, Sirsak Segar, dan Jambu Biji Merah tanpa tambahan pemanis buatan, diproses higienis.',
        image: '/images/jus_mangga.jpg',
        price: 5000,
        category: 'Minuman',
        product: undefined
      }
    ];

    if (!products || products.length === 0) return defaultSlides;
    const active = products.filter(p => p.visibility !== false && !p.isDeleted);
    if (active.length === 0) return defaultSlides;

    return active.map((p) => {
      const isJuice = p.category === 'Minuman' || p.name.toLowerCase().includes('jus');
      return {
        id: p.id,
        rating: `${p.rating || 4.9}/5`,
        reviewCount: `(${p.reviewsCount || 100}+ Ulasan Pelanggan)`,
        title: p.name === 'Ayam Bakar'
          ? 'Ayam Bakar Madu Rempah Nusantara'
          : p.name === 'Nasi Bakar'
          ? 'Aroma Wangi Gurih Nasi Bakar Daun Pisang'
          : p.name === 'Gudeg'
          ? 'Gudeg Komplit Tradisional Khas Jogja'
          : p.name === 'Garang Asam'
          ? 'Garang Asam Ayam Kampung Belimbing Wuluh'
          : p.name === 'Krecek'
          ? 'Sambal Goreng Krecek Gurih Pedas Santan'
          : isJuice
          ? 'Kesegaran Alami Aneka Jus Buah Tropis'
          : p.name,
        subtitle: p.description || 'Kelezatan otentik kuliner nusantara diproses dengan resep warisan terbaik.',
        image: p.image || '/images/ayam_bakar.jpg',
        price: p.price,
        category: p.category,
        product: p
      };
    });
  }, [products]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % dynamicHeroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [dynamicHeroSlides.length]);

  const handleClaimVoucher = (code: string) => {
    const res = claimPromo(code);
    setClaimedNotice({
      text: res.message || `Voucher ${code} berhasil diklaim ke keranjang!`,
      success: res.success
    });
    setTimeout(() => setClaimedNotice(null), 4500);
  };

  // Mengambil daftar produk aktif langsung dari backend / database DataContext
  const activeProducts = (products && products.length > 0)
    ? products.filter(p => p.visibility !== false && !p.isDeleted)
    : [];

  const displayedFavorites = activeProducts.filter(item => {
    if (activeCategory === 'Semua') return true;
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  const openDetailModal = (item: any) => {
    setDetailProduct({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      rating: item.rating || 4.9,
      reviewsCount: `${item.reviewsCount || 150}+ Ulasan`,
      image: item.image || '/images/ayam_bakar.jpg',
      description: item.description,
      ingredients: item.ingredients || 'Bahan baku pilihan alami 100% berkualitas.',
      storage: item.usageAdvice || 'Santap selagi hangat untuk kenikmatan maksimal.',
      isComingSoon: Boolean(item.isComingSoon)
    });
  };

  const currentSlide = dynamicHeroSlides[heroIndex % dynamicHeroSlides.length] || dynamicHeroSlides[0];
  const userAvatar = user?.photoURL || (user?.displayName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=25160E&color=ffffff&bold=true` : (user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=25160E&color=ffffff&bold=true` : null));

  return (
    <div className="bg-[#FAF8F5] font-sans text-[#25160E] min-h-screen selection:bg-[#934b19]/20 selection:text-[#934b19] flex flex-col justify-between">
      
      {/* 1. NAVBAR UTAMA TERPADU */}
      <Navbar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="w-full flex-1">
        <div className="flex flex-col w-full">

          {/* DYNAMIC HERO SHOWCASE SLIDER (Crisp 2-Column Food Showcase) */}
          <section className="relative w-full bg-[#FAF8F5] overflow-hidden border-b border-stone-200/60">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-100/25 to-transparent pointer-events-none"></div>

            <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Content */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left z-10">
                
                {/* 5-Star Rating Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-[#934B19]">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-[#1b1b1d]">{currentSlide.rating}</span>
                  <span className="text-xs text-stone-500 font-light">{currentSlide.reviewCount}</span>
                </div>

                {/* Headline Title */}
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1b1b1d] leading-[1.15] mb-4">
                  {currentSlide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm lg:text-base text-stone-600 font-light leading-relaxed mb-6 sm:mb-8 max-w-xl">
                  {currentSlide.subtitle}
                </p>

                {/* CTA Buttons, Price Tag, & Slide Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/menu" 
                      className="bg-[#934B19] hover:bg-[#7a3e14] text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-[#934B19]/15 active:scale-[0.99]"
                    >
                      <span>Eksplorasi Menu</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => {
                        const targetProd = currentSlide.product || activeProducts.find(p => p.id === currentSlide.id) || activeProducts[0];
                        if (targetProd) openDetailModal(targetProd);
                      }}
                      className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all shadow-xs active:scale-[0.99] cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                  </div>

                  {/* Indicator Dots for Slides */}
                  <div className="flex items-center gap-2 sm:ml-auto">
                    {dynamicHeroSlides.map((_item: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          i === (heroIndex % dynamicHeroSlides.length) ? 'w-6 bg-[#934B19]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                        }`}
                        aria-label={`Ke slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Crisp, Synchronized Food Showcase Card */}
              <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end">
                <div 
                  onClick={() => {
                    const targetProd = currentSlide.product || activeProducts.find(p => p.id === currentSlide.id) || activeProducts[0];
                    if (targetProd) openDetailModal(targetProd);
                  }}
                  className="relative w-full max-w-sm lg:max-w-md h-[320px] sm:h-[380px] lg:h-[400px] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-stone-100 group cursor-pointer"
                >
                  {/* Real Food Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    alt={currentSlide.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={currentSlide.image}
                  />

                  {/* Top Floating Badge: Category & Price */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="backdrop-blur-md bg-black/60 text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20">
                      {currentSlide.category || 'Kuliner Nusantara'}
                    </span>
                    <span className="backdrop-blur-md bg-[#934B19] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      Rp {(currentSlide.price || 35000).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Bottom Floating Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between pointer-events-none">
                    <div className="backdrop-blur-md bg-black/40 px-3.5 py-1.5 rounded-full border border-white/20">
                      <span className="text-[11px] font-medium tracking-wide">Pilihan Otentik Nefakky</span>
                    </div>
                  </div>
                </div>

                {/* Slider Prev / Next Controls Under Card */}
                <div className="flex items-center justify-between w-full max-w-sm lg:max-w-md mt-3 px-1">
                  <span className="text-xs text-stone-400 font-mono">
                    0{(heroIndex % dynamicHeroSlides.length) + 1} / 0{dynamicHeroSlides.length}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setHeroIndex((heroIndex - 1 + dynamicHeroSlides.length) % dynamicHeroSlides.length)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-[#1b1b1d] border border-stone-300 shadow-xs hover:bg-stone-100 transition-all cursor-pointer"
                      aria-label="Slide Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setHeroIndex((heroIndex + 1) % dynamicHeroSlides.length)}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25160E] text-white border border-[#25160E] shadow-xs hover:bg-black transition-all cursor-pointer"
                      aria-label="Slide Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* FLOATING QUICK CATEGORY PILLS */}
          <section className="sticky top-20 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200 py-3">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-full font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#25160E] text-white'
                        : 'bg-[#FAF8F5] text-[#25160E] border border-stone-300/80 hover:bg-stone-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ACTIVE VOUCHER STRIP (DINAMIS DARI DATA ADMIN) */}
          {currentVoucher && (
            <section className="max-w-7xl mx-auto px-6 py-6 w-full">
              <div className="bg-gradient-to-r from-[#25160E] to-[#3a2316] rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-[#4a2e1d] text-white">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-12 h-12 rounded bg-white/10 flex items-center justify-center backdrop-blur-sm shrink-0">
                    <Ticket className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-lg font-bold text-white">
                        Special Offer: {currentVoucher.code} ({currentVoucher.discountPercent}% OFF)
                      </h3>
                      {currentVoucher.event && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-400/30 uppercase">
                          {currentVoucher.event}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 font-light mt-0.5">
                      {currentVoucher.name} • Min. belanja Rp {(currentVoucher.minSpend || 0).toLocaleString('id-ID')}. Berlaku: {currentVoucher.expiry || 'Aktif'}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {activeVouchers.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-lg border border-white/10 flex-wrap">
                      {activeVouchers.map((v) => (
                        <button
                          key={v.id || v.code}
                          type="button"
                          onClick={() => setSelectedVoucherCode(v.code)}
                          className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
                            (cleanPromoCode(currentVoucher?.code) === cleanPromoCode(v.code)) 
                              ? 'bg-amber-400 text-black shadow-xs scale-105' 
                              : 'text-stone-300 hover:text-white hover:bg-white/10'
                          }`}
                          title={`Pilih voucher ${v.code}`}
                        >
                          {v.code.startsWith('#') ? v.code : `#${v.code}`}
                        </button>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={() => handleClaimVoucher(currentVoucher.code)}
                    className="bg-[#934B19] text-white font-semibold text-xs px-6 py-3 rounded-lg whitespace-nowrap hover:bg-[#7a3e14] active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    Klaim Kupon
                  </button>
                </div>
              </div>

              {claimedNotice && (
                <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in font-medium shadow-xs ${
                  claimedNotice.success 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {claimedNotice.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{claimedNotice.text}</span>
                </div>
              )}
            </section>
          )}

          {/* FEATURED MENU GRID (PILIHAN FAVORIT) */}
          <section className="max-w-7xl mx-auto px-6 py-6 w-full">
            <div className="flex items-end justify-between mb-6 border-b border-stone-200 pb-3">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b1b1d]">Pilihan Favorit</h2>
                <p className="text-xs text-stone-500 font-light mt-1">Curated bestsellers based on authentic taste.</p>
              </div>
              <Link 
                href="/menu" 
                className="font-semibold text-xs text-[#934B19] flex items-center gap-1 hover:underline"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid 6 Kartu Produk (Desain Presisi Sesuai Katalog) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedFavorites.map((product) => {
                const inCart = cartItems.find(i => i.id === product.id);
                const cartQty = inCart?.quantity || 0;
                const isFav = favorites.includes(product.id);
                const rating = Number(product.rating) || 4.9;
                const soldCount = String(product.soldCount || '1.5k Terjual');
                const price = Number(product.price) || 0;
                const isBestSeller = (soldCount.includes('1.') || soldCount.includes('2.') || soldCount.includes('3.')) || rating >= 4.8;

                return (
                  <article 
                    key={product.id}
                    onClick={() => openDetailModal(product)}
                    className="group flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer justify-between"
                  >
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                        src={product.image}
                      />

                      {/* Rating & Sold Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-[#1b1b1d] border border-stone-200 flex items-center gap-1 shadow-2xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rating.toFixed(1)}</span>
                        <span className="text-stone-400 text-[10px] ml-0.5">({soldCount})</span>
                      </div>

                      {/* Out of Stock / Best Seller Tag */}
                      {(product.stock ?? 10) <= 0 ? (
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase shadow-xs">
                            PRODUK HABIS
                          </span>
                        </div>
                      ) : isBestSeller ? (
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-[#934B19] text-white px-2.5 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase shadow-xs">
                            BEST SELLER
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#1b1b1d] leading-snug group-hover:text-[#934B19] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-500 font-light line-clamp-2 mt-1 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Footer Row: Category & Price & Add Action */}
                      <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                          {product.category || 'Makanan Berat'}
                        </span>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="font-serif text-base font-bold text-[#1b1b1d]">
                            Rp {price.toLocaleString('id-ID')}
                          </span>

                          {(product.stock ?? 10) <= 0 ? (
                            <button
                              onClick={() => setDetailProduct(product)}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                              title="Produk habis, klik untuk reservasi ke CS"
                            >
                              Reservasi CS
                            </button>
                          ) : cartQty > 0 ? (
                            <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="w-6 h-6 bg-white text-stone-800 rounded flex items-center justify-center font-bold hover:bg-stone-200 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-neutral-900 px-1">{cartQty}</span>
                              <button
                                onClick={() => addToCart(product.id)}
                                className="w-6 h-6 bg-black text-white rounded flex items-center justify-center font-bold hover:bg-neutral-800 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (product.category === 'Minuman' || product.id === 'm6' || product.name.toLowerCase().includes('jus')) {
                                  setDetailProduct(product);
                                } else {
                                  addToCart(product.id);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                              title="Pesan / Tambah ke Keranjang"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* SPLIT PANEL (FILOSOFI RASA) */}
          <section className="max-w-7xl mx-auto px-6 py-12 w-full border-t border-stone-200 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left: 2 Overlapping Photography Cards */}
              <div className="relative h-[480px] sm:h-[560px] w-full">
                <div 
                  className="absolute top-0 left-0 w-2/3 h-2/3 bg-cover bg-center rounded-2xl border border-stone-200 z-10 shadow-md" 
                  style={{ backgroundImage: "url('/images/ayam_bakar.jpg')" }}
                ></div>
                <div 
                  className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-cover bg-center rounded-2xl border border-stone-200 z-20 -ml-16 shadow-xl" 
                  style={{ backgroundImage: "url('/images/gudeg.jpg')" }}
                ></div>
              </div>

              {/* Right: Content */}
              <div className="flex flex-col space-y-4 text-left">
                <span className="font-mono text-xs text-[#934B19] font-bold uppercase tracking-widest block">
                  Filosofi Rasa
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1b1b1d] leading-tight">
                  Seni Memasak yang Merawat Tradisi Kuliner
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                  Di Nefakky, kami meyakini bahwa kelezatan otentik tidak dapat terburu-buru. Kami merawat resep warisan leluhur nusantara dengan bumbu rempah alami, teknik ungkep tradisional, serta ketelitian penuh rasa demi menyajikan hidangan terbaik untuk Anda.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                    <Hourglass className="w-6 h-6 text-[#934B19] mb-1" />
                    <h4 className="font-semibold text-xs text-[#1b1b1d]">Ungkep Perlahan</h4>
                    <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                      Kesabaran adalah bumbu utama kami. Daging dan rempah diolah berjam-jam agar bumbu meresap sempurna hingga ke serat terdalam.
                    </p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                    <Leaf className="w-6 h-6 text-[#934B19] mb-1" />
                    <h4 className="font-semibold text-xs text-[#1b1b1d]">Bahan Segar Alami</h4>
                    <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                      Dipasok segar setiap hari dari hasil tani lokal terbaik tanpa pengawet buatan, menjaga kemurnian dan kesegaran cita rasa.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* MODAL DETAIL PRODUK */}
      {detailProduct && (
        <MenuDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}

    </div>
  );
}
