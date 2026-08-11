'use client';

/**
 * ============================================================================
 * HALAMAN: Dashboard Utama Pelanggan (User Homepage - /)
 * DESKRIPSI: Presisi 100% sesuai Google Stitch Design System & HTML Layout
 *            (Primary Espresso #25160E, Secondary Terracotta #934B19, Canvas #FBF9F5).
 * FITUR: Hero Showcase Slider, Floating Category Pills, Featured Menu Grid,
 *        Filosofi Rasa Split Section, Modal Detail Nutrisi.
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
  Gift, 
  ArrowRight,
  ShieldCheck,
  LogOut,
  Ticket,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Sparkles,
  Flame,
  ChevronRight,
  Flame as FireIcon,
  ChefHat,
  Leaf,
  Sparkle
} from 'lucide-react';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';

export default function UserHomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { products, vouchers } = useData();
  const { cart, totalCartCount, addToCart, removeFromCart, cartItems, subtotal, claimPromo } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);

  // Filter visible products from DataContext
  const visibleProducts = products.filter(p => p.visibility !== false);

  // Dynamic Hero Slides from Google Stitch Specification
  const heroSlides = visibleProducts.length > 0 
    ? visibleProducts.slice(0, 5).map((p, idx) => ({
        id: p.id,
        name: p.name,
        tagline: p.description,
        rating: `${p.rating.toFixed(1)}/5`,
        reviews: `${p.reviewsCount || 100}+ Ulasan`,
        price: `Rp ${p.price.toLocaleString('id-ID')}`,
        image: p.image || '/images/ayam_bakar.jpg',
        badgeText: p.badge ? `🔥 ${p.badge}` : idx === 0 ? '🌟 BEST SELLER' : idx === 1 ? '👨‍🍳 SIGNATURE CHEF' : '✨ BARU'
      }))
    : [
        {
          id: 'm1',
          name: 'Ayam Bakar',
          tagline: 'Kurasi rasa terbaik dari warisan dapur Nusantara, disajikan dengan sentuhan modern untuk penikmat sejati.',
          rating: '4.9/5',
          reviews: '2.500+ Ulasan',
          price: 'Rp 35.000',
          image: '/images/ayam_bakar.jpg',
          badgeText: '🌟 EDISI SPESIAL CHEF'
        }
      ];

  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160e] rounded-full animate-spin mb-3" />
        <p className="text-xs text-[#4f4540] font-medium tracking-wide">Memuat Nefakky Marketplace...</p>
      </div>
    );
  }

  // Quick categories matching exact 3 categories requirement
  const categoriesList = [
    { name: 'Makanan Berat', icon: Utensils, catKey: 'Makanan Berat' },
    { name: 'Minuman', icon: Coffee, catKey: 'Minuman' },
    { name: 'Menu Hemat', icon: Gift, catKey: 'Menu Hemat' },
  ];

  const filteredProducts = visibleProducts.filter(item => {
    const matchCat = activeCategory === 'Semua' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeVouchers = (vouchers || []).filter(v => isVoucherValidNow(v));

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans selection:bg-[#934b19]/10 selection:text-[#934b19]">
      
      {/* 1. GOOGLE STITCH NAVBAR */}
      <Navbar />

      {/* 2. DYNAMIC HERO SHOWCASE SLIDER (Google Stitch Exact Specification) */}
      <section className="relative w-full h-[640px] lg:h-[800px] min-h-[550px] overflow-hidden bg-[#25160e]">
        
        {/* Active Hero Image Background */}
        {heroSlides.map((slide, index) => {
          const isActive = index === heroSlideIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.name}
                fill
                className="object-cover object-center brightness-[0.75] contrast-[1.05]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#25160e] via-[#25160e]/50 to-transparent" />
            </div>
          );
        })}

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 max-w-[1280px] mx-auto px-6 lg:px-16 flex flex-col justify-end pb-16 z-20">
          <div className="max-w-2xl space-y-6">
            
            {/* Main Headline */}
            <h1 className="font-serif text-4xl lg:text-[56px] text-white font-bold leading-[1.15] tracking-tight">
              Nikmati Kelezatan Kuliner Otentik Tradisional Khas Nusantara
            </h1>

            {/* Subtitle */}
            <p className="text-sm lg:text-base text-white/85 font-light max-w-xl leading-relaxed">
              Kurasi rasa terbaik dari warisan dapur Nusantara, disajikan dengan sentuhan modern untuk penikmat sejati.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-3 bg-[#934b19] text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-[#ffa26a] hover:text-[#783603] transition-all shadow-[0_4px_24px_rgba(147,75,25,0.4)] group"
              >
                <span>Eksplorasi Menu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

        {/* Slider Controls */}
        <div className="absolute right-6 lg:right-16 bottom-16 flex items-center gap-3 z-30">
          <button 
            onClick={() => setHeroSlideIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors shadow-md"
          >
            ‹
          </button>
          <button 
            onClick={() => setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length)}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors shadow-md"
          >
            ›
          </button>
        </div>

      </section>

      {/* 3. QUICK CATEGORY PILLS (Google Stitch Floating Card) */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-16 w-full -mt-10 relative z-30">
        <div className="bg-[#fbf9f5]/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(69,26,3,0.08)] border border-amber-900/10 p-6 lg:p-8 flex flex-wrap items-center justify-center gap-4 lg:gap-8">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.catKey;
            return (
              <div
                key={cat.name}
                onClick={() => setActiveCategory(cat.catKey)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-full cursor-pointer transition-all group ${
                  isActive
                    ? 'bg-[#25160e] text-white shadow-md'
                    : 'bg-[#25160e]/5 hover:bg-[#25160e]/10 text-[#25160e]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#934b19]'} group-hover:scale-110 transition-transform`} />
                <span className="font-semibold text-xs">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ACTIVE VOUCHERS PROMO STRIP */}
      {activeVouchers.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-6 lg:px-16 pt-10">
          <div className="bg-gradient-to-r from-[#25160e] via-[#3c2a21] to-[#934b19] rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-amber-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded-full uppercase tracking-wider mb-1 border border-amber-400/30">
                <Ticket className="w-3.5 h-3.5" />
                Voucher Diskon Spesial
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">Gunakan Kode Promo Nefakky</h3>
              <p className="text-xs text-white/80 font-light">Klaim kupon belanja diskon hingga 50% untuk setiap pemesanan hari ini.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {activeVouchers.map((v) => (
                <div key={v.id} className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl text-left">
                  <div className="text-xs font-mono font-bold text-amber-300">{v.code}</div>
                  <div className="text-[10px] text-white/80">Diskon (Min Rp {v.minSpend.toLocaleString('id-ID')})</div>
                  <button
                    onClick={() => {
                      claimPromo(v.code);
                      alert(`Voucher ${v.code} berhasil dklaim!`);
                    }}
                    className="mt-1.5 px-3 py-1 bg-amber-400 text-[#25160e] text-[10px] font-bold rounded-lg hover:bg-amber-300 transition-colors block text-center"
                  >
                    Klaim Kupon
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. FEATURED MENU GRID (Google Stitch Koleksi Terpopuler) */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-16 w-full py-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl font-bold text-[#25160e] mb-2 flex items-center gap-3">
              <span className="w-12 h-[2px] bg-[#934b19] hidden md:block"></span>
              Koleksi Terpopuler
            </h2>
            <p className="text-xs text-[#4f4540] font-normal">
              Pilihan favorit para pencinta kuliner yang diolah dengan resep rahasia turun-temurun.
            </p>
          </div>
          <Link href="/menu" className="text-[#934b19] font-bold text-xs flex items-center gap-1.5 hover:text-[#25160e] transition-colors">
            <span>Lihat Semua Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.slice(0, 6).map((product) => {
            const inCart = cartItems.find(i => i.id === product.id);
            const cartQty = inCart?.quantity || 0;

            return (
              <article 
                key={product.id}
                className="group cursor-pointer rounded-2xl bg-white shadow-[0_4px_24px_rgba(69,26,3,0.05)] hover:shadow-[0_12px_48px_rgba(69,26,3,0.12)] transition-all duration-500 overflow-hidden relative flex flex-col h-full hover:-translate-y-2 border border-amber-900/10"
              >
                <div 
                  className="relative w-full aspect-[4/3] overflow-hidden bg-[#25160e]"
                  onClick={() => setDetailProduct({
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    rating: product.rating,
                    reviewsCount: `${product.reviewsCount || 120} Ulasan`,
                    image: product.image,
                    description: product.description,
                    ingredients: product.ingredients || 'Bahan baku koki pilihan.',
                    storage: product.usageAdvice || 'Santap selagi hangat.'
                  })}
                >
                  <img 
                    src={product.image || '/images/ayam_bakar.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                  />
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 
                        onClick={() => setDetailProduct({
                          id: product.id,
                          name: product.name,
                          category: product.category,
                          price: product.price,
                          rating: product.rating,
                          reviewsCount: `${product.reviewsCount || 120} Ulasan`,
                          image: product.image,
                          description: product.description,
                          ingredients: product.ingredients || 'Bahan baku koki pilihan.',
                          storage: product.usageAdvice || 'Santap selagi hangat.'
                        })}
                        className="font-serif text-xl font-bold text-[#25160e] group-hover:text-[#934b19] transition-colors line-clamp-1"
                      >
                        {product.name}
                      </h3>
                      <span className="font-bold text-xs text-[#25160e] bg-[#25160e]/5 px-3 py-1 rounded-full whitespace-nowrap">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-[#4f4540] line-clamp-2 leading-relaxed font-light">
                      {product.description}
                    </p>
                  </div>

                  <button 
                    onClick={() => addToCart(product.id)}
                    className="w-full py-3 px-4 rounded-xl text-[#25160e] border border-[#25160e]/20 font-bold text-xs group-hover:bg-[#25160e] group-hover:text-white transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{cartQty > 0 ? `Tambah Porsi (${cartQty})` : 'Tambah ke Keranjang'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 6. SPLIT PANEL: ART OF COOKING / FILOSOFI RASA (Google Stitch Specification) */}
      <section className="w-full bg-[#25160e] text-white mt-12 py-16 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="order-2 lg:order-1 flex gap-4">
            <div className="w-1/2 flex flex-col gap-4 mt-8">
              <div 
                className="w-full aspect-[3/4] bg-cover bg-center rounded-2xl shadow-xl border border-white/10" 
                style={{ backgroundImage: `url('/images/krecek.jpg')` }}
              />
              <div className="w-full p-6 bg-[#3c2a21] rounded-2xl border border-amber-900/20">
                <h4 className="font-serif text-2xl font-bold text-amber-300 mb-1">100%</h4>
                <p className="text-xs text-white/80 font-medium">Rempah Alami Nusantara</p>
              </div>
            </div>
            <div className="w-1/2 flex flex-col gap-4">
              <div 
                className="w-full aspect-[3/4] bg-cover bg-center rounded-2xl shadow-xl border border-white/10" 
                style={{ backgroundImage: `url('/images/gudeg.jpg')` }}
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-block border border-amber-300/30 rounded-full px-4 py-1.5">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Filosofi Rasa</span>
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold leading-tight text-white">
              Seni Memasak yang Merawat Tradisi Kuliner
            </h2>
            <p className="text-xs lg:text-sm text-white/80 font-light leading-relaxed max-w-lg">
              Kami percaya bahwa setiap hidangan adalah cerita. Menggunakan resep otentik dan metode memasak tradisional yang perlahan, kami memastikan setiap suapan membawa Anda pada perjalanan nostalgia rasa yang mendalam.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <ChefHat className="w-7 h-7 text-[#ffa26a] mb-1" />
                <h4 className="font-bold text-xs text-white">Slow Cooked</h4>
                <p className="text-[11px] text-white/60">Tekstur lembut & bumbu meresap</p>
              </div>
              <div className="space-y-1">
                <Leaf className="w-7 h-7 text-[#ffa26a] mb-1" />
                <h4 className="font-bold text-xs text-white">Bahan Segar</h4>
                <p className="text-[11px] text-white/60">Dipilih segar setiap hari</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. MODAL DETAIL PRODUK */}
      {detailProduct && (
        <MenuDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}

    </div>
  );
}
