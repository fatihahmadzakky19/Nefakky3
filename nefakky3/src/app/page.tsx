'use client';

/**
 * ============================================================================
 * HALAMAN: Beranda Utama (User Homepage - src/app/page.tsx)
 * TEMA: Nefakky Editorial Culinary (Dapur Otentik Nusantara)
 * DESKRIPSI: Desain editorial kuliner berkarakter hangat, elegan, dan manusiawi
 *            tanpa blur blob, neon, atau efek visual berlebihan (Anti AI-Slop).
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
  AlertCircle,
  Heart
} from 'lucide-react';
import { Clock, Leaf, Ticket, ShieldCheck, Flame, Star, Hourglass, CheckCircle2 } from '@/components/icons/CustomIcons';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { vouchers, products, reviews, isVoucherUsedByUser } = useData();
  const { cartItems, addToCart, removeFromCart, claimPromo } = useCart();

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
        reviewCount: '(156+ Ulasan)',
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
        reviewCount: '(312+ Ulasan)',
        badge: 'Resep Tradisional',
        title: 'Gudeg Komplit Khas Dapur Jogja',
        subtitle: 'Nangka muda dimasak perlahan dengan santan kental dan gula kelapa alami, disajikan lengkap bersama telur bacem, suwiran ayam, dan krecek gurih.',
        image: '/images/gudeg.jpg',
        price: 10000,
        category: 'Makanan Berat',
        product: undefined
      },
      {
        id: 'm2',
        rating: '4.8/5',
        reviewCount: '(98+ Ulasan)',
        badge: 'Aroma Daun Pisang',
        title: 'Aroma Wangi Nasi Bakar Tradisional',
        subtitle: 'Nasi gurih berbumbu dibungkus daun pisang segar dengan isian suwir ayam dan cumi pedas, dipanggang perlahan hingga rempah merebak harum.',
        image: '/images/nasi_bakar.jpg',
        price: 10000,
        category: 'Makanan Berat',
        product: undefined
      },
      {
        id: 'm5',
        rating: '4.8/5',
        reviewCount: '(88+ Ulasan)',
        badge: 'Segar & Asam Gurih',
        title: 'Garang Asam Ayam Belimbing Wuluh',
        subtitle: 'Potongan ayam empuk berpadu kuah santan asam gurih segar dengan irisan belimbing wuluh alami dan cabai rawit utuh beraroma khas.',
        image: '/images/garang_asam.jpg',
        price: 10000,
        category: 'Menu Hemat',
        product: undefined
      },
      {
        id: 'm6',
        rating: '4.9/5',
        reviewCount: '(145+ Ulasan)',
        badge: '100% Buah Alami',
        title: 'Kesegaran Alami Aneka Jus Tropis',
        subtitle: 'Buah segar pilihan: Mangga Harum Manis, Sirsak Segar, dan Jambu Merah murni tanpa pemanis buatan, diproses higienis dan menyegarkan.',
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
        reviewCount: `(${p.reviewsCount || 100}+ Ulasan)`,
        badge: isJuice ? '100% Buah Segar' : 'Pilihan Chef Nefakky',
        title: p.name === 'Ayam Bakar'
          ? 'Ayam Bakar Madu Rempah Nusantara'
          : p.name === 'Nasi Bakar'
          ? 'Aroma Wangi Nasi Bakar Daun Pisang'
          : p.name === 'Gudeg'
          ? 'Gudeg Komplit Khas Dapur Jogja'
          : p.name === 'Garang Asam'
          ? 'Garang Asam Ayam Belimbing Wuluh'
          : p.name === 'Krecek'
          ? 'Sambal Goreng Krecek Gurih Santan'
          : isJuice
          ? 'Kesegaran Alami Aneka Jus Tropis'
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

  // Sinkronisasi Ulasan Pelanggan Realtime dari Database DataContext
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
    <div className="relative font-sans text-stone-900 bg-[#FBFBFA] min-h-screen selection:bg-[#C2410C]/15 selection:text-[#C2410C] flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. NAVBAR UTAMA */}
      <Navbar />

      {/* 2. MAIN CONTENT AREA */}
      <main className="w-full flex-1 relative z-10 pb-28 lg:pb-12">
        <div className="flex flex-col w-full">

          {/* DYNAMIC EDITORIAL HERO SHOWCASE (Clean, Human-Centered, No Blur Blobs) */}
          <section className="relative w-full bg-[#FBFBFA] border-b border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              
              {/* Left Column: Headline & Editorial Context */}
              <div className="lg:col-span-7 flex flex-col justify-center text-left">
                
                {/* Culinary Rating & Badge */}
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-4 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-stone-200 shadow-subtle">
                    <div className="flex items-center text-[#D97706]">
                      <Star className="w-3.5 h-3.5 fill-[#D97706]" />
                    </div>
                    <span className="font-semibold text-xs text-stone-900">{currentSlide.rating}</span>
                    <span className="text-[11px] text-stone-500 font-normal">{currentSlide.reviewCount}</span>
                  </div>

                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                    {currentSlide.badge}
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-[1.2] tracking-tight mb-3 sm:mb-4">
                  {currentSlide.title}
                </h1>

                {/* Subtitle / Narrative */}
                <p className="text-xs sm:text-base text-stone-600 font-normal leading-relaxed mb-6 sm:mb-8 max-w-xl">
                  {currentSlide.subtitle}
                </p>

                {/* Action Buttons & Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                  <Link 
                    href="/menu" 
                    className="w-full sm:w-auto h-12 sm:h-11 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm px-6 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-subtle active:scale-[0.99]"
                  >
                    <span>Jelajahi Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => {
                      const targetProd = currentSlide.product || activeProducts.find(p => p.id === currentSlide.id) || activeProducts[0];
                      if (targetProd) openDetailModal(targetProd);
                    }}
                    className="w-full sm:w-auto h-12 sm:h-11 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-xs sm:text-sm px-5 rounded-lg flex items-center justify-center transition-colors shadow-subtle active:scale-[0.99] cursor-pointer"
                  >
                    Detail Hidangan
                  </button>
                </div>

                {/* Slide Nav Dots */}
                <div className="flex items-center gap-2 mt-6 sm:mt-8">
                  {dynamicHeroSlides.map((_item: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === (heroIndex % dynamicHeroSlides.length) ? 'w-8 bg-[#C2410C]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                      }`}
                      aria-label={`Ke slide ${i + 1}`}
                    />
                  ))}
                </div>

              </div>

              {/* Right Column: Culinary Presentation Frame */}
              <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end">
                <div 
                  onClick={() => {
                    const targetProd = currentSlide.product || activeProducts.find(p => p.id === currentSlide.id) || activeProducts[0];
                    if (targetProd) openDetailModal(targetProd);
                  }}
                  className="relative w-full max-w-sm lg:max-w-md aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden shadow-card border border-stone-200 bg-stone-100 group cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    alt={currentSlide.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
                    src={currentSlide.image}
                  />

                  {/* Gradient Overlay for Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20 pointer-events-none"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="backdrop-blur-md bg-stone-900/80 text-stone-100 text-[11px] font-medium px-2.5 py-1 rounded-md border border-stone-700">
                      {currentSlide.category || 'Kuliner Nusantara'}
                    </span>
                    <span className="backdrop-blur-md bg-[#C2410C] text-white text-xs font-semibold px-3 py-1 rounded-md">
                      Rp {(currentSlide.price || 35000).toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Bottom Dish Title in Card */}
                  <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between pointer-events-none">
                    <div>
                      <p className="text-[10px] uppercase text-stone-300 font-medium tracking-wider">Pilihan Utama</p>
                      <h4 className="font-serif text-sm sm:text-lg font-bold text-white line-clamp-1">{currentSlide.title}</h4>
                    </div>
                    <span className="p-1.5 rounded-md bg-white/20 backdrop-blur-sm text-white">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Slider Prev / Next Controls */}
                <div className="flex items-center justify-between w-full max-w-sm lg:max-w-md mt-3 px-1">
                  <span className="text-xs text-stone-500 font-mono">
                    0{(heroIndex % dynamicHeroSlides.length) + 1} / 0{dynamicHeroSlides.length}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setHeroIndex((heroIndex - 1 + dynamicHeroSlides.length) % dynamicHeroSlides.length)}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-stone-800 border border-stone-200 shadow-subtle hover:bg-stone-50 transition-colors cursor-pointer"
                      aria-label="Slide Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setHeroIndex((heroIndex + 1) % dynamicHeroSlides.length)}
                      className="w-8 h-8 flex items-center justify-center rounded-md bg-stone-900 text-white shadow-subtle hover:bg-stone-800 transition-colors cursor-pointer"
                      aria-label="Slide Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* 4 VALUE PILLARS STRIP (Clean Warm Stone Strip) */}
          <section className="w-full bg-stone-900 text-stone-100 py-5 sm:py-6 border-b border-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-stone-800 flex items-center justify-center text-[#C2410C] shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Dimasak Segar</h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-400">Saat pesanan dikonfirmasi</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-stone-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <Leaf className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">100% Rempah Alami</h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-400">Tanpa bahan pengawet</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-stone-800 flex items-center justify-center text-[#D97706] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Pengantaran Cepat</h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-400">Pelacakan pesanan real-time</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Standar Higienis</h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-400">Dapur bersih teruji</p>
                </div>
              </div>
            </div>
          </section>

          {/* ACTIVE VOUCHER STRIP */}
          {currentVoucher && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 w-full">
              <div className="bg-white rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-5 border border-stone-200 shadow-subtle">
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-stone-100 flex items-center justify-center text-[#C2410C] shrink-0 border border-stone-200 mt-0.5 sm:mt-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold bg-[#C2410C] text-white px-2 py-0.5 rounded tracking-wider">
                        {currentVoucher.code}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                        Hemat {currentVoucher.discountPercent}%
                      </h3>
                      {currentVoucher.event && (
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-medium rounded border border-stone-200 uppercase">
                          {currentVoucher.event}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {currentVoucher.name} • Min. belanja Rp {(currentVoucher.minSpend || 0).toLocaleString('id-ID')}. Berlaku: {currentVoucher.expiry || 'Aktif'}.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {activeVouchers.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-stone-50 p-1 rounded-lg border border-stone-200 overflow-x-auto no-scrollbar max-w-full">
                      {activeVouchers.map((v) => (
                        <button
                          key={v.id || v.code}
                          type="button"
                          onClick={() => setSelectedVoucherCode(v.code)}
                          className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            (cleanPromoCode(currentVoucher?.code) === cleanPromoCode(v.code)) 
                              ? 'bg-stone-900 text-white' 
                              : 'text-stone-600 hover:text-stone-900 hover:bg-white'
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
                    className="h-11 sm:h-10 w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm px-5 rounded-lg whitespace-nowrap active:scale-[0.99] transition-colors cursor-pointer flex items-center justify-center"
                  >
                    Klaim Kupon
                  </button>
                </div>
              </div>

              {claimedNotice && (
                <div className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2.5 animate-fade-in font-medium ${
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

          {/* QUICK CATEGORY FILTER TABS */}
          <section className="sticky top-16 sm:top-18 z-30 bg-[#FBFBFA]/95 backdrop-blur-md border-y border-stone-200 py-2.5 sm:py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 w-full sm:w-auto">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`min-h-[40px] px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-subtle'
                          : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300 hover:text-stone-900'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              <Link 
                href="/menu" 
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#C2410C] hover:underline shrink-0"
              >
                <span>Lihat Seluruh Katalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* FEATURED MENU GRID */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-stone-200 pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C2410C] block mb-1">
                  Menu Unggulan
                </span>
                <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 leading-tight">
                  Pilihan Favorit Pelanggan
                </h2>
              </div>
              <Link 
                href="/menu" 
                className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#C2410C] hover:underline pt-1 sm:pt-0"
              >
                <span>Katalog Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Grid Kartu Produk */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              {displayedFavorites.map((product) => {
                const inCart = cartItems.find(i => i.id === product.id);
                const cartQty = inCart?.quantity || 0;
                const isFav = favorites.includes(product.id);
                const rating = Number(product.rating) || 4.9;
                const soldCount = String(product.soldCount || 'Terlaris');
                const price = Number(product.price) || 0;
                const isBestSeller = soldCount.includes('1.') || soldCount.includes('2.') || rating >= 4.8;
                const isOutOfStock = (product.stock ?? 10) <= 0;

                return (
                  <article 
                    key={product.id}
                    onClick={() => openDetailModal(product)}
                    className="group flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-card transition-all duration-200 cursor-pointer justify-between"
                  >
                    {/* Image Container - Aspect ratio controlled for mobile (not excessively tall) */}
                    <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] bg-stone-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out" 
                        src={product.image}
                      />

                      {/* Rating Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-md text-xs font-semibold text-stone-900 border border-stone-200 flex items-center gap-1 shadow-subtle z-10">
                        <Star className="w-3 h-3 fill-[#D97706] text-[#D97706]" />
                        <span>{rating.toFixed(1)}</span>
                      </div>

                      {/* Wishlist Heart Button - Min 40x40px touch friendly */}
                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(product.id, e)}
                        className={`absolute top-2.5 right-2.5 w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors z-10 ${
                          isFav ? 'bg-rose-50 text-rose-600' : 'bg-stone-900/40 text-white hover:bg-stone-900/60'
                        }`}
                        title="Simpan ke Favorit"
                        aria-label="Simpan ke Favorit"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>

                      {/* Status Badges */}
                      {isOutOfStock ? (
                        <div className="absolute bottom-2.5 left-2.5 z-10">
                          <span className="bg-rose-700 text-white px-2.5 py-0.5 rounded font-medium text-[10px] uppercase">
                            Habis
                          </span>
                        </div>
                      ) : isBestSeller ? (
                        <div className="absolute bottom-2.5 left-2.5 z-10">
                          <span className="bg-[#C2410C] text-white px-2.5 py-0.5 rounded font-medium text-[10px] uppercase flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Paling Diminati
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 sm:p-4 flex flex-col gap-2 flex-1 justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">
                          {product.category || 'Makanan Berat'}
                        </span>
                        
                        <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900 leading-snug group-hover:text-[#C2410C] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed font-normal">
                          {product.description}
                        </p>
                      </div>

                      {/* Footer Row: Price & Quantity Controls */}
                      <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase text-stone-400 block font-normal">Harga</span>
                          <span className="font-semibold text-sm sm:text-base text-stone-900">
                            Rp {price.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {isOutOfStock ? (
                            <button
                              onClick={() => setDetailProduct(product)}
                              className="h-10 sm:h-9 px-3.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors cursor-pointer"
                              title="Produk habis, klik untuk reservasi"
                            >
                              Reservasi
                            </button>
                          ) : cartQty > 0 ? (
                            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="w-8 h-8 sm:w-7 sm:h-7 bg-white text-stone-800 rounded-md flex items-center justify-center font-medium hover:bg-stone-50 transition-colors shadow-subtle active:scale-95"
                                aria-label="Kurangi kuantitas"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-semibold text-stone-900 px-1.5 min-w-[20px] text-center">{cartQty}</span>
                              <button
                                onClick={() => addToCart(product.id)}
                                className="w-8 h-8 sm:w-7 sm:h-7 bg-stone-900 text-white rounded-md flex items-center justify-center font-medium hover:bg-stone-800 transition-colors shadow-subtle active:scale-95"
                                aria-label="Tambah kuantitas"
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
                              className="h-11 sm:h-9 px-4 sm:px-3.5 rounded-lg bg-stone-900 hover:bg-[#C2410C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-subtle active:scale-[0.98] cursor-pointer min-w-[80px]"
                              title="Pesan Hidangan"
                            >
                              <Plus className="w-3.5 h-3.5" />
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
          <section className="w-full bg-stone-100/60 border-y border-stone-200 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left: 2 Balanced Food Photos */}
              <div className="lg:col-span-6 relative h-[360px] sm:h-[420px] w-full">
                <div 
                  className="absolute top-0 left-0 w-3/4 h-3/4 bg-cover bg-center rounded-xl border border-stone-200 z-10 shadow-card" 
                  style={{ backgroundImage: "url('/images/ayam_bakar.jpg')" }}
                ></div>
                <div 
                  className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-cover bg-center rounded-xl border border-stone-200 z-20 shadow-elevated" 
                  style={{ backgroundImage: "url('/images/gudeg.jpg')" }}
                ></div>
              </div>

              {/* Right: Narrative Content */}
              <div className="lg:col-span-6 flex flex-col space-y-4 text-left">
                <span className="text-xs text-[#C2410C] font-semibold uppercase tracking-wider block">
                  Filosofi Dapur Kami
                </span>
                
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight">
                  Merawat Resep Warisan, Menghormati Waktu & Bahan
                </h2>
                
                <p className="text-xs sm:text-sm text-stone-600 font-normal leading-relaxed">
                  Di Nefakky, kami meyakini bahwa masakan otentik nusantara tidak dapat dipercepat. Kami mempertahankan teknik ungkep perlahan, paduan bumbu rempah ulek asli, dan ketelitian rasa demi menghadirkan kehangatan masakan rumah di setiap hidangan.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1 shadow-subtle">
                    <Hourglass className="w-5 h-5 text-[#C2410C]" />
                    <h4 className="font-semibold text-xs text-stone-900">Ungkep Perlahan</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Daging dimasak berjam-jam agar bumbu rempah tradisional meresap hingga ke bagian terdalam.
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1 shadow-subtle">
                    <Leaf className="w-5 h-5 text-emerald-700" />
                    <h4 className="font-semibold text-xs text-stone-900">Bahan Segar Alami</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Dipasok segar setiap pagi dari mitra tani lokal tanpa bahan pengawet sintesis.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* COMMUNITY TESTIMONIALS (REALTIME ULASAN RASA) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs text-[#C2410C] font-semibold uppercase tracking-wider block mb-1">
                  Ulasan Rasa Pelanggan
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Pengalaman Sahabat Nefakky
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Ulasan jujur dan cerita rasa otentik langsung dari pelanggan setia kami.
                </p>
              </div>

              <Link 
                href="/comments" 
                className="font-medium text-xs text-[#C2410C] flex items-center gap-1 hover:underline shrink-0"
              >
                <span>Lihat Semua Ulasan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {liveCommunityReviews.map((item: any, idx: number) => {
                const author = item.authorName || item.author || 'Pelanggan Nefakky';
                const initial = author[0]?.toUpperCase() || 'P';
                const dish = item.productName || item.dish || 'Menu Pilihan';
                const rating = typeof item.rating === 'number' ? item.rating : 5;
                const avatar = item.authorAvatar || item.avatar;
                const dateText = item.date || 'Baru saja';

                return (
                  <div 
                    key={item.id || idx}
                    className="bg-white p-5 rounded-xl border border-stone-200 shadow-subtle flex flex-col justify-between space-y-4 hover:border-stone-300 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex text-[#D97706]">
                          {[...Array(Math.min(5, Math.max(1, Math.round(rating))))].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#D97706]" />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                          {dish}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed italic line-clamp-3">
                        "{item.comment || item.text}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-semibold text-xs overflow-hidden shrink-0">
                          {avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatar} alt={author} className="w-full h-full object-cover" />
                          ) : (
                            <span>{initial}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">{author}</h4>
                          <p className="text-[10px] text-stone-400">{dateText}</p>
                        </div>
                      </div>

                      {item.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={item.photoUrl} 
                          alt="Foto Makanan" 
                          className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0" 
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
