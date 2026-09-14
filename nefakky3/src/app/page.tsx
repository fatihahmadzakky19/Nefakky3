'use client';

/**
 * ============================================================================
 * HALAMAN: Beranda Utama (User Homepage - src/app/page.tsx)
 * TEMA: Nordic Citrus & Deep Navy
 * DESKRIPSI: Tampilan kuliner segar, modern, dan bertenaga dengan perpaduan
 *            Deep Navy (#0F172A), Electric Blood Orange (#FF5400), dan
 *            Sun Gold (#FFB703) di atas kanvas bersih (#F8FAFC).
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, isVoucherValidNow, cleanPromoCode, sortReviewsNewestFirst } from '@/context/DataContext';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import Navbar from '@/components/Navbar';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus,
  Sparkles,
  AlertCircle,
  Award,
  Heart
} from 'lucide-react';
import { Clock, Leaf, Ticket, ShieldCheck, Flame, Star, Hourglass, MessageSquare, CheckCircle2, Utensils } from '@/components/icons/CustomIcons';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { vouchers, products, reviews, isVoucherUsedByUser } = useData();
  const { cartItems, totalCartCount, addToCart, removeFromCart, claimPromo } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [claimedNotice, setClaimedNotice] = useState<{ text: string; success: boolean } | null>(null);
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authActionName, setAuthActionName] = useState<string>('melakukan aktivitas ini');

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
        badge: 'Spesial Dapur Kami',
        title: 'Ayam Bakar Madu Rempah Nusantara',
        subtitle: 'Ayam pejantan pilihan dibakar di atas arang batok kelapa dengan lumuran bumbu kecap rempah tradisional yang meresap sempurna hingga ke tulang.',
        image: '/images/ayam_bakar.jpg',
        price: 35000,
        category: 'Makanan Berat',
        product: undefined
      },
      {
        id: 'm4',
        rating: '5.0/5',
        reviewCount: '(312+ Ulasan Pelanggan)',
        badge: 'Resep Legendaris',
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
        badge: 'Aroma Daun Pisang',
        title: 'Aroma Wangi Nasi Bakar Tradisional',
        subtitle: 'Nasi gurih berbumbu dibungkus daun pisang segar dengan isian suwir ayam dan cumi pedas, dibakar perlahan hingga aroma rempah merebak harum.',
        image: '/images/nasi_bakar.jpg',
        price: 10000,
        category: 'Makanan Berat',
        product: undefined
      },
      {
        id: 'm5',
        rating: '4.8/5',
        reviewCount: '(88+ Ulasan Pelanggan)',
        badge: 'Segar & Berkuah',
        title: 'Garang Asam Ayam Kampung Belimbing Wuluh',
        subtitle: 'Potongan ayam kampung segar dikukus dalam bungkus daun pisang dengan kuah santan asam gurih, belimbing wuluh alami, dan cabai rawit utuh.',
        image: '/images/garang_asam.jpg',
        price: 10000,
        category: 'Menu Hemat',
        product: undefined
      },
      {
        id: 'm6',
        rating: '4.9/5',
        reviewCount: '(145+ Ulasan Pelanggan)',
        badge: '100% Buah Alami',
        title: 'Kesegaran Alami Aneka Jus Buah Tropis',
        subtitle: 'Buah segar pilihan: Mangga Harum Manis, Sirsak Segar, dan Jambu Biji Merah tanpa tambahan pemanis buatan, diproses higienis dan menyegarkan.',
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
        badge: isJuice ? '100% Buah Segar' : 'Pilihan Chef Nefakky',
        title: p.name === 'Ayam Bakar'
          ? 'Ayam Bakar Madu Rempah Nusantara'
          : p.name === 'Nasi Bakar'
          ? 'Aroma Wangi Nasi Bakar Daun Pisang'
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

  // Autoplay hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % dynamicHeroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [dynamicHeroSlides.length]);

  const handleClaimVoucher = (code: string) => {
    if (!user) {
      setAuthActionName('mengklaim dan menggunakan kupon voucher diskon');
      setShowAuthModal(true);
      return;
    }
    const res = claimPromo(code);
    setClaimedNotice({
      text: res.message || `Voucher ${code} berhasil diklaim ke keranjang!`,
      success: res.success
    });
    setTimeout(() => setClaimedNotice(null), 4500);
  };

  const activeProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter(p => p.visibility !== false && !p.isDeleted);
  }, [products]);

  const displayedFavorites = useMemo(() => {
    return activeProducts.filter(item => {
      if (activeCategory === 'Semua') return true;
      return item.category?.toLowerCase() === activeCategory.toLowerCase();
    });
  }, [activeProducts, activeCategory]);

  // Sinkronisasi Ulasan Pelanggan Realtime dari Database DataContext (Halaman Ulasan Rasa)
  const liveCommunityReviews = useMemo(() => {
    const defaultReviews = [
      {
        id: 'def-1',
        authorName: 'Rian Pratama',
        authorAvatar: null,
        comment: 'Ayam bakar madunya beneran juara! Bumbunya meresap sampai ke dalam, sambal terasinya mantap pedas manis pas banget.',
        rating: 5,
        productName: 'Ayam Bakar Madu',
        date: 'Baru saja'
      },
      {
        id: 'def-2',
        authorName: 'Siti Rahmawati',
        authorAvatar: null,
        comment: 'Gudeg komplitnya serasa makan langsung di Jogja. Nangka mudanya empuk dan legit, kreceknya gurih nagih.',
        rating: 5,
        productName: 'Gudeg Komplit',
        date: 'Baru saja'
      },
      {
        id: 'def-3',
        authorName: 'Dimas Kurniawan',
        authorAvatar: null,
        comment: 'Jus mangga dan sirsaknya bener-bener buah asli tanpa sirup biang. Kental, segar, dan packingnya rapi banget!',
        rating: 5,
        productName: 'Jus Mangga & Sirsak',
        date: 'Baru saja'
      }
    ];

    if (!reviews || reviews.length === 0) return defaultReviews;
    const active = reviews.filter(r => !r.isHidden && (r.status === 'PUBLISHED' || r.status === 'APPROVED' || !r.status));
    if (active.length === 0) return defaultReviews;

    const sorted = sortReviewsNewestFirst ? sortReviewsNewestFirst(active) : active;
    return sorted.slice(0, 3);
  }, [reviews]);

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
      ingredients: item.ingredients || 'Bahan baku rempah pilihan alami 100% berkualitas tinggi.',
      storage: item.usageAdvice || 'Santap selagi hangat untuk menikmati kelezatan maksimal.',
      isComingSoon: Boolean(item.isComingSoon)
    });
  };

  const currentSlide = dynamicHeroSlides[heroIndex % dynamicHeroSlides.length] || dynamicHeroSlides[0];

  return (
    <div className="relative font-sans text-[#0F172A] bg-[#F8FAFC] min-h-screen selection:bg-[#FF5400]/20 selection:text-[#FF5400] flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. NAVBAR UTAMA */}
      <Navbar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="w-full flex-1 relative z-10 pb-20 lg:pb-12">
        <div className="flex flex-col w-full">

          {/* DYNAMIC EDITORIAL HERO SHOWCASE */}
          <section className="relative w-full bg-gradient-to-b from-slate-100/80 via-[#F8FAFC] to-[#F8FAFC] border-b border-slate-200/60 overflow-hidden">
            {/* Atmospheric Warm Ambient Blur */}
            <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-[#FF5400]/8 rounded-full blur-3xl pointer-events-none -z-0"></div>
            <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#FFB703]/8 rounded-full blur-3xl pointer-events-none -z-0"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Headline & Curation */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left z-10">
                
                {/* Culinary Rating */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                    <div className="flex items-center text-[#FFB703]">
                      <Star className="w-3.5 h-3.5 fill-[#FFB703]" />
                    </div>
                    <span className="font-bold text-xs text-[#0F172A]">{currentSlide.rating}</span>
                    <span className="text-[11px] text-slate-500 font-normal">{currentSlide.reviewCount}</span>
                  </div>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] leading-[1.18] tracking-tight mb-4">
                  {currentSlide.title}
                </h1>

                {/* Subtitle / Description */}
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mb-8 max-w-xl">
                  {currentSlide.subtitle}
                </p>

                {/* CTA Buttons & Slide Indicators */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/menu" 
                      className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-slate-900/15 active:scale-95"
                    >
                      <span>Jelajahi Menu</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => {
                        const targetProd = currentSlide.product || activeProducts.find(p => p.id === currentSlide.id) || activeProducts[0];
                        if (targetProd) openDetailModal(targetProd);
                      }}
                      className="bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-300 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      Detail Rasa
                    </button>
                  </div>
                </div>

                {/* Slide Nav Dots */}
                <div className="flex items-center gap-2 mt-8">
                  {dynamicHeroSlides.map((_item: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === (heroIndex % dynamicHeroSlides.length) ? 'w-8 bg-[#FF5400]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Ke slide ${i + 1}`}
                    />
                  ))}
                </div>

              </div>

              {/* Right Column: Culinary Presentation Card */}
              <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end">
                <div 
                  onClick={() => {
                    const targetProd = currentSlide.product || activeProducts.find(p => p.id === currentSlide.id) || activeProducts[0];
                    if (targetProd) openDetailModal(targetProd);
                  }}
                  className="relative w-full max-w-sm lg:max-w-md h-[340px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    alt={currentSlide.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={currentSlide.image}
                  />

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none"></div>

                  {/* Top Floating Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="backdrop-blur-md bg-black/60 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                      {currentSlide.category || 'Kuliner Nusantara'}
                    </span>
                    <span className="backdrop-blur-md bg-[#FF5400] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md">
                      Rp {(currentSlide.price || 35000).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Bottom Dish Title in Card */}
                  <div className="absolute bottom-4 left-4 right-4 text-white flex items-center justify-between pointer-events-none">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-[#FFB703] font-bold tracking-wider">Menu Terpilih</p>
                      <h4 className="font-serif text-lg font-bold text-white line-clamp-1">{currentSlide.title}</h4>
                    </div>
                    <span className="p-2 rounded-full bg-[#FF5400] text-white shadow-md">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Slider Prev / Next Controls */}
                <div className="flex items-center justify-between w-full max-w-sm lg:max-w-md mt-4 px-1">
                  <span className="text-xs text-slate-500 font-mono font-semibold">
                    0{(heroIndex % dynamicHeroSlides.length) + 1} / 0{dynamicHeroSlides.length}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setHeroIndex((heroIndex - 1 + dynamicHeroSlides.length) % dynamicHeroSlides.length)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-[#0F172A] border border-slate-200 shadow-2xs hover:bg-slate-100 transition-all cursor-pointer"
                      aria-label="Slide Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setHeroIndex((heroIndex + 1) % dynamicHeroSlides.length)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-sm hover:bg-[#1E293B] transition-all cursor-pointer"
                      aria-label="Slide Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* 4 VALUE PILLARS STRIP (Nordic Deep Navy) */}
          <section className="w-full bg-[#0F172A] text-white py-6 border-y border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FF5400] shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dimasak Fresh</h4>
                  <p className="text-[11px] text-slate-400 font-light">Langsung saat order masuk</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#10B981] shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">100% Rempah Alami</h4>
                  <p className="text-[11px] text-slate-400 font-light">Tanpa pengawet buatan</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#FFB703] shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Pengiriman Cepat</h4>
                  <p className="text-[11px] text-slate-400 font-light">Pantau status live GPS</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Jaminan Higienis</h4>
                  <p className="text-[11px] text-slate-400 font-light">Dapur bersih terstandar</p>
                </div>
              </div>
            </div>
          </section>

          {/* ACTIVE VOUCHER STRIP (VIBRANT CITRUS & NAVY DESIGN) */}
          {currentVoucher && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <div className="relative bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl border border-slate-700 text-white overflow-hidden">
                {/* Decorative Pattern / Lighting */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5400]/15 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center gap-4 text-white z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF5400]/20 border border-[#FF5400]/30 flex items-center justify-center text-[#FF5400] shrink-0 shadow-inner">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black bg-[#FF5400] text-white px-2.5 py-0.5 rounded-md tracking-wider">
                        {currentVoucher.code}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-white">
                        Hemat {currentVoucher.discountPercent}% OFF
                      </h3>
                      {currentVoucher.event && (
                        <span className="px-2 py-0.5 bg-white/10 text-[#FFB703] text-[10px] font-bold rounded-full border border-white/10 uppercase font-mono">
                          {currentVoucher.event}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-light mt-1">
                      {currentVoucher.name} • Min. belanja Rp {(currentVoucher.minSpend || 0).toLocaleString('id-ID')}. Berlaku: {currentVoucher.expiry || 'Aktif'}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
                  {activeVouchers.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-xl border border-white/10 flex-wrap">
                      {activeVouchers.map((v) => (
                        <button
                          key={v.id || v.code}
                          type="button"
                          onClick={() => setSelectedVoucherCode(v.code)}
                          className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                            (cleanPromoCode(currentVoucher?.code) === cleanPromoCode(v.code)) 
                              ? 'bg-[#FF5400] text-white shadow-xs scale-105' 
                              : 'text-slate-300 hover:text-white hover:bg-white/10'
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
                    className="bg-[#FFB703] hover:bg-[#F59E0B] text-slate-950 font-black text-xs px-6 py-3 rounded-xl whitespace-nowrap active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    Klaim ke Keranjang
                  </button>
                </div>
              </div>

              {claimedNotice && (
                <div className={`mt-3 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in font-medium shadow-xs ${
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

          {/* QUICK CATEGORY FILTER PILLS */}
          <section className="sticky top-20 z-30 bg-[#F8FAFC]/95 backdrop-blur-md border-y border-slate-200 py-3.5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-[#0F172A] text-white shadow-md scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-[#FF5400]/40 hover:text-[#0F172A]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <Link 
                href="/menu"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5400] hover:underline shrink-0"
              >
                <span>Lihat Semua Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* FEATURED MENU GRID */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
            <div className="flex items-end justify-between mb-8 border-b border-slate-200 pb-4">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#FF5400] block mb-1">
                  Menu Unggulan Dapur
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
                  Pilihan Favorit Pelanggan
                </h2>
              </div>
              <Link 
                href="/menu" 
                className="font-bold text-xs text-[#FF5400] flex items-center gap-1 hover:underline"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid Kartu Produk */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayedFavorites.map((product) => {
                const inCart = cartItems.find(i => i.id === product.id);
                const cartQty = inCart?.quantity || 0;
                const isFav = favorites.includes(product.id);
                const rating = Number(product.rating) || 4.9;
                const soldCount = String(product.soldCount || '1.5k Terjual');
                const price = Number(product.price) || 0;
                const isBestSeller = (soldCount.includes('1.') || soldCount.includes('2.') || soldCount.includes('3.')) || rating >= 4.8;
                const isOutOfStock = (product.stock ?? 10) <= 0;

                return (
                  <article 
                    key={product.id}
                    onClick={() => openDetailModal(product)}
                    className="group flex flex-col bg-white border border-slate-200/90 rounded-3xl overflow-hidden hover:shadow-xl hover:border-[#FF5400]/40 transition-all duration-300 cursor-pointer justify-between"
                  >
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                        src={product.image}
                      />

                      {/* Floating Rating Badge */}
                      <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-[#0F172A] border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                        <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
                        <span>{rating.toFixed(1)}</span>
                        <span className="text-slate-400 text-[10px] font-normal">({soldCount})</span>
                      </div>

                      {/* Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(product.id, e)}
                        className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm ${
                          isFav ? 'bg-rose-50 text-rose-500' : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                        title="Simpan ke Favorit"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      {/* Status Badges */}
                      {isOutOfStock ? (
                        <div className="absolute bottom-3.5 left-3.5">
                          <span className="bg-rose-600 text-white px-3 py-1 rounded-full font-bold text-[10px] tracking-wider uppercase shadow-sm">
                            HABIS • RESERVASI
                          </span>
                        </div>
                      ) : isBestSeller ? (
                        <div className="absolute bottom-3.5 left-3.5">
                          <span className="bg-[#FF5400] text-white px-3 py-1 rounded-full font-bold text-[10px] tracking-wider uppercase shadow-sm flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            BEST SELLER
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5400] font-mono">
                            {product.category || 'Makanan Berat'}
                          </span>
                        </div>
                        
                        <h3 className="font-serif text-lg font-bold text-[#0F172A] leading-snug group-hover:text-[#FF5400] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-normal line-clamp-2 mt-1 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Footer Row: Price & Quantity Controls */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-slate-400 block -mb-0.5">Harga</span>
                          <span className="font-serif text-base sm:text-lg font-bold text-[#0F172A]">
                            Rp {price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {isOutOfStock ? (
                            <button
                              onClick={() => setDetailProduct(product)}
                              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                              title="Produk habis, klik untuk reservasi ke CS"
                            >
                              Reservasi CS
                            </button>
                          ) : cartQty > 0 ? (
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="w-7 h-7 bg-white text-slate-800 rounded-lg flex items-center justify-center font-bold hover:bg-slate-200 transition-colors shadow-2xs"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-[#0F172A] px-1.5">{cartQty}</span>
                              <button
                                onClick={() => addToCart(product.id)}
                                className="w-7 h-7 bg-[#0F172A] text-white rounded-lg flex items-center justify-center font-bold hover:bg-[#1E293B] transition-colors shadow-2xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (!user) {
                                  setAuthActionName('menambahkan hidangan ke keranjang');
                                  setShowAuthModal(true);
                                  return;
                                }
                                if (product.category === 'Minuman' || product.id === 'm6' || product.name.toLowerCase().includes('jus')) {
                                  setDetailProduct(product);
                                } else {
                                  addToCart(product.id);
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#FF5400] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                              title="Pesan Hidangan"
                            >
                              <Plus className="w-3.5 h-3.5 text-[#FFB703]" />
                              <span>Pesan</span>
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

          {/* SPLIT PANEL: FILOSOFI RASA NUSANTARA */}
          <section className="w-full bg-slate-100/80 border-y border-slate-200 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left: 2 Overlapping Artisanal Food Photos */}
              <div className="lg:col-span-6 relative h-[380px] sm:h-[460px] w-full">
                <div 
                  className="absolute top-0 left-0 w-3/4 h-3/4 bg-cover bg-center rounded-3xl border-4 border-white z-10 shadow-xl" 
                  style={{ backgroundImage: "url('/images/ayam_bakar.jpg')" }}
                ></div>
                <div 
                  className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-cover bg-center rounded-3xl border-4 border-white z-20 shadow-2xl" 
                  style={{ backgroundImage: "url('/images/gudeg.jpg')" }}
                ></div>
              </div>

              {/* Right: Narrative Content */}
              <div className="lg:col-span-6 flex flex-col space-y-5 text-left">
                <span className="font-mono text-xs text-[#FF5400] font-bold uppercase tracking-widest block">
                  Filosofi Dapur Kami
                </span>
                
                <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#0F172A] leading-tight">
                  Seni Memasak yang Menghargai Waktu & Tradisi
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Di Nefakky, kami meyakini bahwa cita rasa otentik nusantara tidak dapat diciptakan secara instan. Kami merawat warisan bumbu leluhur dengan teknik ungkep tradisional, bumbu rempah ulek asli, dan ketelitian penuh rasa demi menghadirkan kehangatan di setiap gigitan.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <Hourglass className="w-6 h-6 text-[#FF5400]" />
                    <h4 className="font-bold text-xs text-[#0F172A]">Ungkep Perlahan</h4>
                    <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                      Daging diolah berjam-jam agar bumbu kecap rempah meresap sempurna hingga ke serat tulang terdalam.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <Leaf className="w-6 h-6 text-[#10B981]" />
                    <h4 className="font-bold text-xs text-[#0F172A]">Bahan Segar Alami</h4>
                    <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                      Dipasok segar setiap subuh dari mitra petani lokal tanpa bahan pengawet atau pemanis buatan.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* COMMUNITY TESTIMONIALS (REALTIME DARI DATA ULASAN RASA) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="font-mono text-xs text-[#FF5400] font-bold uppercase tracking-widest block mb-1">
                  Ulasan Pelanggan Realtime
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F172A]">
                  Apa Kata Sahabat Kuliner Nefakky
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-1">
                  Cerita nyata & pengalaman rasa otentik langsung dari data ulasan pelanggan kami.
                </p>
              </div>

              <Link 
                href="/comments" 
                className="font-bold text-xs text-[#FF5400] flex items-center gap-1 hover:underline shrink-0"
              >
                <span>Lihat Semua & Tulis Ulasan Rasa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveCommunityReviews.map((item: any, idx: number) => {
                const author = item.authorName || item.author || 'Pelanggan Nefakky';
                const initial = author[0]?.toUpperCase() || 'P';
                const dish = item.productName || item.dish || 'Menu Spesial';
                const rating = typeof item.rating === 'number' ? item.rating : 5;
                const avatar = item.authorAvatar || item.avatar;
                const dateText = item.date || 'Baru saja';

                return (
                  <div 
                    key={item.id || idx}
                    className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xl hover:border-[#FF5400]/40 transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex text-[#FFB703]">
                          {[...Array(Math.min(5, Math.max(1, Math.round(rating))))].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#FFB703]" />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-[#FF5400]/10 text-[#FF5400] px-2.5 py-0.5 rounded-full">
                          {dish}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed italic line-clamp-3">
                        "{item.comment || item.text}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 ring-2 ring-[#FF5400]/20">
                          {avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatar} alt={author} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-serif">{initial}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1">{author}</h4>
                          <p className="text-[10px] text-slate-400 font-light">{dateText}</p>
                        </div>
                      </div>

                      {item.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={item.photoUrl} 
                          alt="Foto Makanan" 
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0" 
                        />
                      )}
                    </div>
                  </div>
                );
              })}
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

      {/* MODAL WAJIB AUTENTIKASI */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionName={authActionName}
      />

    </div>
  );
}
