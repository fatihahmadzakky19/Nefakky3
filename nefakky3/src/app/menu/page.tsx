'use client';

/**
 * ============================================================================
 * HALAMAN: Katalog Menu (src/app/menu/page.tsx)
 * TEMA: Nordic Citrus & Deep Navy
 * DESKRIPSI: Etalase kuliner segar, tajam, dan modern: Deep Navy (#0F172A),
 *            Electric Blood Orange (#FF5400), dan Sun Gold (#FFB703).
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
  Star, 
  Search, 
  Plus, 
  Minus, 
  SlidersHorizontal, 
  UtensilsCrossed, 
  Sparkles,
  Heart,
  Clock,
  Flame,
  ChefHat,
  X,
  ShieldCheck,
  Leaf
} from 'lucide-react';

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
    <div className="bg-[#F8FAFC] font-sans text-[#0F172A] min-h-screen selection:bg-[#FF5400]/20 selection:text-[#FF5400] flex flex-col justify-between">
      
      {/* 1. NAVBAR UTAMA */}
      <Navbar />

      {/* 2. MAIN CONTENT */}
      <main className="w-full flex-1 pb-20 lg:pb-12">
        
        {/* Banner Header (Deep Navy & Citrus Glow) */}
        <section className="w-full bg-[#0F172A] text-white px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5400]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFB703]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Headline */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-xs font-bold text-[#FFB703] uppercase tracking-widest font-mono">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Koleksi Kuliner Otentik</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                Cita Rasa Segar yang Menggugah Selera
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl leading-relaxed">
                Setiap hidangan diracik dari rempah alami berkualitas, dimasak higienis made-by-order setiap hari, dan diantar hangat langsung ke meja Anda.
              </p>
            </div>

            {/* Right: Craftsmanship Highlights */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                <ChefHat className="w-6 h-6 text-[#FFB703]" />
                <h3 className="text-xs sm:text-sm font-bold text-white">Resep Warisan</h3>
                <p className="text-[11px] text-slate-300 font-light leading-relaxed">Bumbu alami pilihan tanpa pengawet sintesis.</p>
              </div>
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                <Flame className="w-6 h-6 text-[#FF5400]" />
                <h3 className="text-xs sm:text-sm font-bold text-white">Segar Dimasak</h3>
                <p className="text-[11px] text-slate-300 font-light leading-relaxed">Dimasak hangat made-by-order setiap hari.</p>
              </div>
            </div>

          </div>
        </section>

        {/* 3. STICKY FILTER & SEARCH CONTROL BAR */}
        <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Navigation Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#0F172A] text-white shadow-md scale-105'
                        : 'bg-slate-100 text-slate-600 hover:text-[#0F172A] hover:bg-slate-200/80 border border-slate-200'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-[#FF5400] text-white' : 'bg-white text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Sort Selector */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              
              {/* Search Box */}
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari hidangan favorit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5400]/30 focus:border-[#FF5400] transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5400]/30 focus:border-[#FF5400] cursor-pointer shadow-2xs"
                  aria-label="Urutkan menu"
                >
                  <option value="popular">Terpopuler</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="price-low">Harga: Rendah ke Tinggi</option>
                  <option value="price-high">Harga: Tinggi ke Rendah</option>
                </select>
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

            </div>

          </div>
        </section>

        {/* 4. PRODUCTS GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF5400] flex items-center justify-center mx-auto">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#0F172A]">Menu Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Tidak ada hidangan yang cocok dengan kata kunci &quot;{searchQuery}&quot; pada kategori &quot;{activeCategory}&quot;.
              </p>
              <button
                onClick={() => { setActiveCategory('Semua'); setSearchQuery(''); }}
                className="px-5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            /* Product Cards Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                    className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:border-[#FF5400]/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame */}
                      <div 
                        className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer" 
                        onClick={() => setDetailProduct(product)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        
                        {/* Rating Badge */}
                        <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-[#0F172A] border border-slate-200 flex items-center gap-1.5 shadow-2xs z-10">
                          <Star className="w-3.5 h-3.5 fill-[#FFB703] text-[#FFB703]" />
                          <span>{rating.toFixed(1)}</span>
                          <span className="text-slate-400 text-[10px] font-normal">({product.reviewsCount || 0})</span>
                        </div>

                        {/* Status Badges */}
                        <div className="absolute bottom-3.5 left-3.5 flex flex-col gap-1.5 z-10">
                          {isOutOfStock ? (
                            <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase rounded-full shadow-sm">
                              Produk Habis
                            </span>
                          ) : (
                            <>
                              {product.badge && (
                                <span className="px-3 py-1 bg-[#0F172A] text-white text-[10px] font-bold uppercase rounded-full shadow-sm">
                                  {product.badge}
                                </span>
                              )}
                              {product.isComingSoon && (
                                <span className="px-3 py-1 bg-[#FFB703] text-slate-950 text-[10px] font-black uppercase rounded-full shadow-sm">
                                  Segera Hadir
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Wishlist Heart Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(product.id, e)}
                          className={`absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-10 ${
                            isFav ? 'bg-rose-50 text-rose-500' : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                          aria-label="Simpan ke Favorit"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="p-5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5400] font-mono block mb-1">
                          {product.category}
                        </span>

                        <h3 
                          onClick={() => setDetailProduct(product)}
                          className="font-serif text-lg font-bold text-[#0F172A] group-hover:text-[#FF5400] transition-colors cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-slate-400 block font-normal">Harga Porsi</span>
                        <span className="font-serif font-bold text-[#0F172A] text-base sm:text-lg">
                          Rp {price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div>
                        {isOutOfStock ? (
                          <button
                            onClick={() => setDetailProduct(product)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Produk habis, klik untuk reservasi ke CS"
                          >
                            <span>Reservasi CS</span>
                          </button>
                        ) : cartQty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="w-7 h-7 bg-white text-slate-800 rounded-lg flex items-center justify-center font-bold hover:bg-slate-200 transition-colors shadow-2xs"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-[#0F172A] px-1.5">{cartQty}</span>
                            <button
                              onClick={() => addToCart(product.id)}
                              className="w-7 h-7 bg-[#0F172A] text-white rounded-lg flex items-center justify-center font-bold hover:bg-[#1E293B] transition-colors shadow-2xs"
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
                              if (product.category === 'Minuman' || product.id === 'm6' || product.name.toLowerCase().includes('jus')) {
                                setDetailProduct(product);
                              } else {
                                addToCart(product.id);
                              }
                            }}
                            disabled={Boolean(product.isComingSoon)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              product.isComingSoon
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-[#0F172A] hover:bg-[#FF5400] text-white active:scale-95'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5 text-[#FFB703]" />
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
