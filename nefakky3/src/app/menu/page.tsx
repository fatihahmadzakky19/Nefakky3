'use client';

/**
 * ============================================================================
 * HALAMAN: Katalog Menu (src/app/menu/page.tsx)
 * TEMA: Nefakky Editorial Culinary (Dapur Otentik Nusantara)
 * DESKRIPSI: Etalase kuliner bersih, elegan, dan manusiawi dengan tipografi tajam,
 *            filter kategori intuitif, dan kartu menu berestetika editorial.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';
import AuthRequiredModal from '@/components/AuthRequiredModal';
import Navbar from '@/components/Navbar';
import { 
  Plus, 
  Minus, 
  Heart,
  X
} from 'lucide-react';
import { Search, Clock, Flame, ShieldCheck, Leaf, Star, SlidersHorizontal, UtensilsCrossed, ChefHat } from '@/components/icons/CustomIcons';

export default function MenuCatalogPage() {
  const { user } = useAuth();
  const { products } = useData();
  const { cartItems, addToCart, removeFromCart } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authActionName, setAuthActionName] = useState<string>('memesan hidangan');

  const categories = ['Semua', 'Makanan Berat', 'Minuman', 'Menu Hemat', 'Segera Hadir'];

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {
      'Semua': 0,
      'Makanan Berat': 0,
      'Minuman': 0,
      'Menu Hemat': 0,
      'Segera Hadir': 0
    };

    (products || []).forEach(p => {
      if (p.visibility === false || p.isDeleted) return;
      counts['Semua'] = (counts['Semua'] || 0) + 1;
      if (p.isComingSoon) {
        counts['Segera Hadir'] = (counts['Segera Hadir'] || 0) + 1;
      } else if (p.category && counts[p.category] !== undefined) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });

    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter(product => {
      let matchCategory = true;
      if (activeCategory === 'Segera Hadir') {
        matchCategory = Boolean(product.isComingSoon);
      } else if (activeCategory !== 'Semua') {
        matchCategory = product.category === activeCategory && !product.isComingSoon;
      }
      const matchSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch && product.visibility !== false && !product.isDeleted;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      return (b.reviewsCount || 0) - (a.reviewsCount || 0);
    });
  }, [products, activeCategory, searchQuery, sortBy]);

  return (
    <div className="bg-[#FBFBFA] font-sans text-stone-900 min-h-screen selection:bg-[#C2410C]/15 selection:text-[#C2410C] flex flex-col justify-between">
      
      {/* 1. NAVBAR UTAMA */}
      <Navbar />

      {/* 2. MAIN CONTENT */}
      <main className="w-full flex-1 pb-28 lg:pb-12">
        
        {/* Editorial Culinary Header */}
        <section className="w-full bg-[#FBFBFA] text-stone-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-14 border-b border-stone-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left: Headline */}
            <div className="lg:col-span-7 flex flex-col items-start gap-3 sm:gap-3.5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-md border border-stone-200 text-xs font-medium text-stone-700 shadow-subtle">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>Koleksi Dapur Nusantara</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
                Cita Rasa Otentik, Diracik Sepenuh Hati
              </h1>
              <p className="text-xs sm:text-base text-stone-600 font-normal max-w-xl leading-relaxed">
                Setiap menu dimasak segar saat pesanan masuk dengan paduan bumbu rempah pilihan petani lokal, siap diantar hangat ke kediaman Anda.
              </p>
            </div>

            {/* Right: Highlights */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3.5 sm:p-5 rounded-xl bg-white border border-stone-200 shadow-subtle space-y-1.5 sm:space-y-2">
                <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2410C]" />
                <h3 className="text-xs sm:text-sm font-semibold text-stone-900">Resep Warisan</h3>
                <p className="text-[10px] sm:text-[11px] text-stone-500 leading-relaxed">Bumbu alami tanpa bahan pengawet sintesis.</p>
              </div>
              <div className="p-3.5 sm:p-5 rounded-xl bg-white border border-stone-200 shadow-subtle space-y-1.5 sm:space-y-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97706]" />
                <h3 className="text-xs sm:text-sm font-semibold text-stone-900">Dimasak Segar</h3>
                <p className="text-[10px] sm:text-[11px] text-stone-500 leading-relaxed">Made-by-order untuk kelezatan optimal.</p>
              </div>
            </div>

          </div>
        </section>

        {/* 3. STICKY FILTER & SEARCH CONTROL BAR */}
        <section className="sticky top-16 sm:top-18 z-30 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-stone-200 py-2.5 sm:py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
            
            {/* Category Navigation Pills with Edge-to-Edge mobile scroll */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto -mx-4 px-4 sm:mx-0 sm:px-0 py-0.5 no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-subtle'
                        : 'bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 border border-stone-200'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      isActive ? 'bg-[#C2410C] text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Sort Selector */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto">
              
              {/* Search Box */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari hidangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 sm:h-10 pl-9 pr-8 bg-white rounded-lg border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#C2410C] focus:border-[#C2410C] transition-colors shadow-subtle"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-11 sm:h-10 appearance-none pl-3.5 pr-8 bg-white rounded-lg border border-stone-200 text-xs sm:text-sm font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C2410C] focus:border-[#C2410C] cursor-pointer shadow-subtle"
                  aria-label="Urutkan menu"
                >
                  <option value="popular">Terpopuler</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="price-low">Harga: Rendah ke Tinggi</option>
                  <option value="price-high">Harga: Tinggi ke Rendah</option>
                </select>
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

            </div>

          </div>
        </section>

        {/* 4. PRODUCTS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          {/* Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-stone-200 shadow-subtle max-w-md mx-auto p-8 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">Menu Tidak Ditemukan</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tidak ada hidangan yang cocok dengan kata kunci &quot;{searchQuery}&quot; pada kategori &quot;{activeCategory}&quot;.
              </p>
              <button
                onClick={() => { setActiveCategory('Semua'); setSearchQuery(''); }}
                className="h-11 px-5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            /* Product Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
              {filteredProducts.map((product) => {
                const inCart = cartItems.find(item => item.id === product.id);
                const cartQty = inCart ? inCart.quantity : 0;
                const isFav = favorites.includes(product.id);
                const rating = Number(product.rating) || 4.9;
                const price = Number(product.price) || 0;
                const isOutOfStock = (product.stock ?? 10) <= 0;

                return (
                  <article
                    key={product.id}
                    className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-subtle hover:border-stone-300 hover:shadow-card transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame - Controlled aspect ratio for mobile */}
                      <div 
                        className="relative w-full aspect-[16/10] sm:aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" 
                        onClick={() => setDetailProduct(product)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                        />
                        
                        {/* Rating Badge */}
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-md text-xs font-semibold text-stone-900 border border-stone-200 flex items-center gap-1 shadow-subtle z-10">
                          <Star className="w-3 h-3 fill-[#D97706] text-[#D97706]" />
                          <span>{rating.toFixed(1)}</span>
                          <span className="text-stone-400 text-[10px] font-normal">({product.reviewsCount || 0})</span>
                        </div>

                        {/* Status Badges */}
                        <div className="absolute bottom-2.5 left-2.5 flex flex-col gap-1 z-10">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-0.5 bg-rose-700 text-white text-[10px] font-medium uppercase rounded">
                              Habis
                            </span>
                          ) : (
                            <>
                              {product.badge && (
                                <span className="px-2.5 py-0.5 bg-stone-900 text-white text-[10px] font-medium uppercase rounded">
                                  {product.badge}
                                </span>
                              )}
                              {product.isComingSoon && (
                                <span className="px-2.5 py-0.5 bg-[#D97706] text-white text-[10px] font-semibold uppercase rounded">
                                  Segera Hadir{(product as any).releaseDate ? ` • Rilis ${(product as any).releaseDate}` : ''}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Wishlist Heart Button - Min 40x40px touch friendly */}
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className={`absolute top-2.5 right-2.5 w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors z-10 ${
                            isFav ? 'bg-rose-50 text-rose-600' : 'bg-stone-900/40 text-white hover:bg-stone-900/60'
                          }`}
                          aria-label="Simpan ke Favorit"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="p-3.5 sm:p-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block mb-0.5">
                          {product.category}
                        </span>

                        <h3 
                          onClick={() => setDetailProduct(product)}
                          className="font-serif text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#C2410C] transition-colors cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </h3>

                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="p-3.5 sm:p-4 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                      <div>
                        <span className="text-[10px] uppercase text-stone-400 block font-normal">Harga</span>
                        <span className="font-semibold text-sm sm:text-base text-stone-900">
                          Rp {price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div>
                        {isOutOfStock ? (
                          <button
                            onClick={() => setDetailProduct(product)}
                            className="h-10 sm:h-9 px-3.5 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
                            title="Produk habis, klik untuk reservasi"
                          >
                            Reservasi
                          </button>
                        ) : cartQty > 0 ? (
                          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="w-8 h-8 sm:w-7 sm:h-7 bg-white text-stone-800 rounded-md flex items-center justify-center font-medium hover:bg-stone-50 transition-colors shadow-subtle active:scale-95"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-semibold text-stone-900 px-1.5 min-w-[20px] text-center">{cartQty}</span>
                            <button
                              onClick={() => addToCart(product.id)}
                              className="w-8 h-8 sm:w-7 sm:h-7 bg-stone-900 text-white rounded-md flex items-center justify-center font-medium hover:bg-stone-800 transition-colors shadow-subtle active:scale-95"
                              aria-label="Tambah jumlah"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (!user) {
                                setAuthActionName('memesan hidangan');
                                setShowAuthModal(true);
                                return;
                              }
                              const hasCustomVariants = Array.isArray((product as any).variants) && ((product as any).variants as any[]).length > 0;
                              const hasVariantStocks = Object.keys((product as any).variantStocks || {}).length > 0;
                              if (hasCustomVariants || hasVariantStocks || product.category === 'Minuman' || product.id === 'm6' || product.name.toLowerCase().includes('jus')) {
                                setDetailProduct(product);
                              } else {
                                addToCart(product.id);
                              }
                            }}
                            disabled={Boolean(product.isComingSoon)}
                            className={`h-11 sm:h-9 px-4 sm:px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-subtle cursor-pointer min-w-[80px] ${
                              product.isComingSoon
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-stone-900 hover:bg-[#C2410C] text-white active:scale-[0.98]'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Pesan</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </article>
                );
              })}
            </div>
          )}

        </section>

      </main>

      {/* 5. MODAL POPUP DETAIL PRODUK */}
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
