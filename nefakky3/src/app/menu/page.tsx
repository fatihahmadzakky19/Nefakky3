'use client';

/**
 * ============================================================================
 * HALAMAN: Katalog Menu Hidangan (Menu Catalog Page - /menu)
 * DESKRIPSI: Memungkinkan pelanggan mencari, memfilter berdasarkan kategori,
 *            dan melihat rincian detail makanan otentik Nefakky.
 * ============================================================================
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';
import { 
  Search, 
  Filter, 
  Star, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  Heart,
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

export default function MenuCatalogPage() {
  const { user } = useAuth();
  const { products } = useData();
  const { cart, cartItems, addToCart, removeFromCart } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = ['Semua', 'Makanan Berat', 'Minuman', 'Menu Hemat', '⏳ Segera Hadir'];

  const toggleWishlist = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Processing products list
  const filteredProducts = products.filter(product => {
    let matchCategory = true;
    if (activeCategory === '⏳ Segera Hadir') {
      matchCategory = Boolean(product.isComingSoon);
    } else if (activeCategory !== 'Semua') {
      matchCategory = product.category === activeCategory && !product.isComingSoon;
    }
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && product.visibility !== false && !product.isDeleted;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans selection:bg-[#934B19]/10 selection:text-[#934B19] pb-28 lg:pb-12">
      
      {/* 1. BILAH NAVIGASI UTAMA */}
      <Navbar />

      {/* 2. HEADER BANNER KATALOG */}
      <section className="bg-[#25160E] text-white py-8 sm:py-12 px-4 sm:px-12 relative overflow-hidden text-center sm:text-left">
        <div className="max-w-7xl mx-auto space-y-2.5 sm:space-y-3 relative z-10">
          <span className="px-3.5 py-1 bg-[#934B19] text-[#FBF9F5] text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider inline-block">
            Koleksi Hidangan Utama
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FBF9F5]">
            Katalog Kuliner Otentik Nefakky
          </h1>
          <p className="text-xs sm:text-sm text-[#FBF9F5]/80 font-light max-w-xl mx-auto sm:mx-0 leading-relaxed">
            Nikmati cita rasa kelezatan resep warisan rumahan yang dimasak segar setiap hari menggunakan bahan alami pilihan.
          </p>
        </div>
      </section>

      {/* 3. KONTEN KATALOG & FILTER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-8">
        
        {/* Bilah Filter & Pencarian Mobile/Desktop */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-900/10 shadow-xl shadow-amber-950/5">
          
          {/* Input Pencarian (Search Bar) */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu (Ayam Bakar, Gudeg, Jus)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FBF9F5] border border-amber-900/15 rounded-xl sm:rounded-2xl text-xs text-[#25160E] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 transition-all font-medium"
            />
          </div>

          {/* Controls: Pills Kategori & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Pills Kategori */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    activeCategory === cat
                      ? 'bg-[#25160E] text-white shadow-md'
                      : 'bg-[#FBF9F5] text-[#4F4540] hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Opsi Pengurutan Sort By */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-[#934B19] shrink-0 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-[#FBF9F5] border border-amber-900/15 text-xs text-[#25160E] font-semibold py-2 px-3 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 cursor-pointer"
              >
                <option value="popular">Terpopuler</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
              </select>
            </div>
          </div>

        </div>

        {/* GRID DAFTAR PRODUK (Google Stitch Card Token) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const inCart = cartItems.find(i => i.id === product.id);
            const cartQty = inCart?.quantity || 0;
            const isFav = favorites.includes(product.id);

            return (
              <div 
                key={product.id}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-900/10 shadow-xl shadow-amber-950/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                {/* Image Aspect Ratio Container */}
                <div 
                  className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#25160E] cursor-pointer"
                  onClick={() => setDetailProduct({
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    rating: product.rating,
                    reviewsCount: product.isComingSoon ? 'Segera Hadir' : `${product.reviewsCount || 120} Ulasan`,
                    image: product.image,
                    description: product.description,
                    ingredients: product.ingredients || 'Bahan baku koki pilihan.',
                    storage: product.usageAdvice || 'Santap selagi hangat.',
                    isComingSoon: product.isComingSoon,
                    releaseDate: product.releaseDate || 'Segera Meluncur'
                  })}
                >
                  <img
                    src={product.image || '/images/ayam_bakar.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-stone-700 hover:text-rose-500 transition-colors active:scale-95 z-10"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {/* Rating & Sales Badge or Coming Soon Badge */}
                  {product.isComingSoon ? (
                    <div className="absolute top-3 left-3 bg-[#934B19] text-white px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shadow-md">
                      <Sparkles className="w-3 h-3 text-amber-200 animate-pulse" />
                      <span>{product.releaseDate || 'Segera Hadir'}</span>
                    </div>
                  ) : (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold text-[#25160E] flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-[#4F4540] font-normal ml-1">• {product.soldCount || '500+ Terjual'}</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#934B19] uppercase tracking-wider">
                        {product.category}
                      </span>
                      {product.isComingSoon && (
                        <span className="text-[9px] bg-amber-100 text-[#934B19] px-2 py-0.5 rounded-full font-bold border border-amber-300">
                          COMING SOON
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => setDetailProduct({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        rating: product.rating,
                        reviewsCount: product.isComingSoon ? 'Segera Hadir' : `${product.reviewsCount || 120} Ulasan`,
                        image: product.image,
                        description: product.description,
                        ingredients: product.ingredients || 'Bahan baku koki pilihan.',
                        storage: product.usageAdvice || 'Santap selagi hangat.',
                        isComingSoon: product.isComingSoon,
                        releaseDate: product.releaseDate || 'Segera Meluncur'
                      })}
                      className="font-serif text-base sm:text-lg font-bold text-[#25160E] hover:text-[#934B19] cursor-pointer transition-colors line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#4F4540] line-clamp-2 leading-relaxed font-light">
                      {product.description}
                    </p>
                  </div>

                  {/* Footer Price & Add To Cart Button / Coming Soon Button */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-stone-400 font-medium block">
                        {product.isComingSoon ? 'Estimasi Harga' : 'Harga Porsi'}
                      </span>
                      <span className="font-serif text-sm sm:text-base font-bold text-[#25160E]">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {product.isComingSoon ? (
                      <button
                        onClick={() => setDetailProduct({
                          id: product.id,
                          name: product.name,
                          category: product.category,
                          price: product.price,
                          rating: product.rating,
                          reviewsCount: 'Segera Hadir',
                          image: product.image,
                          description: product.description,
                          ingredients: product.ingredients || 'Bahan baku koki pilihan.',
                          storage: product.usageAdvice || 'Nantikan peluncuran resmi menu istimewa ini.',
                          isComingSoon: true,
                          releaseDate: product.releaseDate || 'Segera Meluncur'
                        })}
                        className="px-3.5 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-[#934B19] to-[#25160E] text-amber-200 text-xs font-bold rounded-xl sm:rounded-2xl shadow transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Segera Hadir</span>
                      </button>
                    ) : cartQty > 0 ? (
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-[#FBF9F5] border border-amber-900/15 p-1 rounded-xl sm:rounded-2xl">
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="w-7 h-7 bg-white text-[#25160E] rounded-lg sm:rounded-xl flex items-center justify-center font-bold hover:bg-stone-100 shadow-xs active:scale-95"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-[#25160E] px-1">{cartQty}</span>
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-7 h-7 bg-[#25160E] text-white rounded-lg sm:rounded-xl flex items-center justify-center font-bold hover:bg-[#3C2A21] shadow-xs active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#25160E] hover:bg-[#3C2A21] text-white text-xs font-bold rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pesan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
