'use client';

/**
 * ============================================================================
 * HALAMAN: Katalog Menu (Koleksi Hidangan Utama - src/app/menu/page.tsx)
 * DESKRIPSI: Dikonversikan secara presisi 100% dari ekspor Stitch MCP Menu HTML/Tailwind
 *            (Fixed Header, Page Header Espresso Nusantara, Sticky Control Bar
 *            dengan Filter Kategori & Pencarian/Sortir, Grid Katalog 3-Kolom
 *            berbadge rating/terjual/best-seller, Modal Detail Produk, dan Footer).
 * ============================================================================
 */

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData } from '@/context/DataContext';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';
import { 
  Star, 
  Search, 
  Bell, 
  ShoppingBag, 
  Heart, 
  Plus, 
  Minus, 
  SlidersHorizontal, 
  UtensilsCrossed, 
  Sparkles,
  User
} from 'lucide-react';

export default function MenuCatalogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { products } = useData();
  const { cartItems, totalCartCount, addToCart, removeFromCart } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = ['Semua', 'Makanan Berat', 'Minuman', 'Menu Hemat', 'Segera Hadir'];

  const toggleWishlist = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Filter & Pengurutan Produk Dinamis
  const filteredProducts = products.filter(product => {
    let matchCategory = true;
    if (activeCategory === 'Segera Hadir') {
      matchCategory = Boolean(product.isComingSoon);
    } else if (activeCategory !== 'Semua') {
      matchCategory = product.category === activeCategory && !product.isComingSoon;
    }
    const matchSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch && product.visibility !== false && !product.isDeleted;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.reviewsCount || 0) - (a.reviewsCount || 0);
  });

  const userAvatar = user?.photoURL || (user?.displayName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=25160E&color=ffffff&bold=true` : (user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=25160E&color=ffffff&bold=true` : null));

  return (
    <div className="bg-[#fcf8fa] font-sans text-[#1b1b1d] min-h-screen selection:bg-stone-900 selection:text-white flex flex-col justify-between">
      
      <div>
        {/* 1. HEADER NAVIGASI FIXED SESUAI STITCH MCP */}
        <header className="fixed top-0 w-full z-50 bg-[#fcf8fa]/90 backdrop-blur-xl border-b border-stone-200 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
            
            {/* Brand Wordmark */}
            <div className="flex-1 font-serif text-2xl tracking-widest text-black font-bold">
              <Link href="/">NEFAKKY</Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link href="/" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Beranda
              </Link>
              <Link href="/menu" className="text-black font-bold text-sm transition-colors">
                Menu
              </Link>
              <Link href="/comments" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Ulasan Rasa
              </Link>
              <Link href="/notifications" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Pesanan
              </Link>
            </nav>

            {/* Action Icons */}
            <div className="flex-1 flex items-center justify-end gap-6">

              <div className="relative flex items-center">
                <Link href="/cart" className="text-stone-600 hover:text-black transition-colors" title="Keranjang Belanja">
                  <ShoppingBag className="w-5 h-5" />
                </Link>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 bg-black text-white text-[10px] font-bold rounded-full">
                    {totalCartCount}
                  </span>
                )}
              </div>

              <Link 
                href={user ? "/profile" : "/login"}
                className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:bg-neutral-800 transition-colors overflow-hidden"
              >
                {userAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </Link>
            </div>

          </div>
        </header>

        {/* 2. MAIN CONTENT AREA */}
        <main className="w-full pt-20 bg-[#fcf8fa]">
          <div className="flex flex-col w-full min-h-screen">
            
            {/* Page Header Section with Real Food Showcase */}
            <section className="w-full bg-[#25160E] px-6 py-10 sm:py-14 text-white rounded-b-3xl relative overflow-hidden shadow-xl border-b border-stone-800">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-amber-900/30 via-amber-950/10 to-transparent pointer-events-none"></div>
              
              <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left: Text & Badges */}
                <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-xs font-semibold text-amber-200 tracking-wider uppercase">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" />
                    <span>Koleksi Hidangan Utama</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-bold leading-tight tracking-tight">
                    Katalog Kuliner <br /> Otentik Nefakky
                  </h1>

                  <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xl leading-relaxed">
                    Menghadirkan cita rasa warisan nusantara melalui proses artisanal yang cermat. Setiap hidangan diracik dengan rempah segar alami untuk pengalaman gastronomi yang tak terlupakan.
                  </p>

                  {/* Highlights / Quick Stats */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-stone-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Dibuat Segar Setiap Hari</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-stone-200">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>100% Rempah Alami</span>
                    </div>
                  </div>
                </div>

                {/* Right: Single Real Food Showcase Card */}
                <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
                  <div className="relative w-full max-w-sm sm:max-w-md h-[240px] sm:h-[280px] rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl bg-stone-900 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/images/ayam_bakar.jpg" 
                      alt="Ayam Bakar Madu Nusantara" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    
                    {/* Subtle Gradient Shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Top Floating Badge */}
                    <div className="absolute top-3.5 left-3.5 pointer-events-none">
                      <span className="backdrop-blur-md bg-black/60 text-white text-[10px] font-semibold px-3 py-1 rounded-full border border-white/20">
                        Hidangan Utama Terlaris
                      </span>
                    </div>

                    {/* Bottom Floating Info */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-white pointer-events-none">
                      <div>
                        <h4 className="text-sm font-bold text-white drop-shadow-sm">Ayam Bakar Madu</h4>
                        <span className="text-[11px] text-amber-200 font-medium">Rp 35.000</span>
                      </div>
                      <div className="backdrop-blur-md bg-white/20 px-3 py-1 rounded-full border border-white/30 text-[10px] font-medium">
                        100% Otentik
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Sticky Control Bar (Filters & Search) */}
            <section className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-40 bg-[#fcf8fa]/95 backdrop-blur-md border-b border-stone-200">
              
              {/* Filters */}
              <div className="flex-1 w-full overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                <div className="flex items-center gap-2 min-w-max">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full font-semibold text-xs transition-colors ${
                          isActive
                            ? 'bg-black text-white border border-black shadow-xs'
                            : 'bg-stone-100 text-[#1b1b1d] border border-stone-200 hover:bg-stone-200/80'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search & Sort Dropdown */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input 
                    id="search-menu-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-full text-xs text-[#1b1b1d] placeholder-stone-400 focus:outline-none focus:border-black transition-colors" 
                    placeholder="Cari menu..." 
                    type="text"
                  />
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-white border border-stone-200 text-xs text-stone-700 font-medium py-2 px-3.5 rounded-full focus:outline-none focus:border-black cursor-pointer shadow-xs"
                  >
                    <option value="popular">Terpopuler</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="price-low">Harga Termurah</option>
                    <option value="price-high">Harga Tertinggi</option>
                  </select>
                </div>
              </div>

            </section>

            {/* Product Grid Section */}
            <section className="w-full max-w-7xl mx-auto px-6 py-8">
              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#1b1b1d]">Menu Tidak Ditemukan</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Tidak ada hidangan yang cocok dengan kata kunci &quot;{searchQuery}&quot;. Coba kata kunci lain atau pilih kategori Semua.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('Semua'); }}
                    className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-full mt-2"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const inCart = cartItems.find(i => i.id === product.id);
                    const cartQty = inCart?.quantity || 0;
                    const isFav = favorites.includes(product.id);
                    const isBestSeller = (product.soldCount && (product.soldCount.includes('1.') || product.soldCount.includes('2.'))) || product.rating >= 4.8;

                    const openDetail = () => {
                      setDetailProduct({
                        id: product.id,
                        name: product.name,
                        category: product.category,
                        price: product.price,
                        rating: product.rating,
                        reviewsCount: product.isComingSoon ? 'Segera Hadir' : `${product.reviewsCount || 120} Ulasan`,
                        image: product.image,
                        description: product.description,
                        ingredients: product.ingredients || 'Bahan baku koki pilihan alami 100%.',
                        storage: product.usageAdvice || 'Santap selagi hangat untuk kenikmatan maksimal.',
                        isComingSoon: product.isComingSoon,
                        releaseDate: product.releaseDate || 'Segera Meluncur'
                      });
                    };

                    return (
                      <article 
                        key={product.id}
                        onClick={openDetail}
                        className="group flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer justify-between"
                      >
                        {/* Image Container */}
                        <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
                          <Image
                            src={product.image || '/images/ayam_bakar.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />

                          {/* Wishlist Heart Button */}
                          <div className="absolute top-3 right-3 z-10">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                              aria-label="Tambah ke Favorit" 
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-stone-600 hover:text-rose-500 transition-colors shadow-sm active:scale-95"
                            >
                              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>

                          {/* Rating & Sold Badge */}
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-semibold text-[#1b1b1d] border border-stone-200 flex items-center gap-1 shadow-2xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{product.rating.toFixed(1)}</span>
                            <span className="text-stone-400 text-[10px] ml-0.5">({product.soldCount || '850 terjual'})</span>
                          </div>

                          {/* Best Seller / Coming Soon Tag */}
                          {isBestSeller && !product.isComingSoon && (
                            <div className="absolute bottom-3 left-3">
                              <span className="bg-[#934B19] text-white px-2.5 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase shadow-xs">
                                BEST SELLER
                              </span>
                            </div>
                          )}

                          {product.isComingSoon && (
                            <div className="absolute bottom-3 left-3">
                              <span className="bg-black text-amber-300 px-2.5 py-0.5 rounded font-bold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-xs">
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>SEGERA HADIR</span>
                              </span>
                            </div>
                          )}
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

                          {/* Footer Row: Category & Price */}
                          <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
                              {product.category === 'Minuman' ? 'Minuman' : product.category === 'Makanan Berat' ? 'Makanan Berat' : 'Pendamping'}
                            </span>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <span className="font-serif text-base font-bold text-[#1b1b1d]">
                                Rp {product.price.toLocaleString('id-ID')}
                              </span>

                              {product.isComingSoon ? (
                                <button
                                  onClick={openDetail}
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors text-xs font-medium"
                                  title="Lihat Detail Rilis"
                                >
                                  Detail
                                </button>
                              ) : cartQty > 0 ? (
                                <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                                  <button
                                    onClick={() => removeFromCart(product.id)}
                                    className="w-6 h-6 bg-white text-stone-800 rounded flex items-center justify-center font-bold hover:bg-stone-200"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-xs font-bold text-neutral-900 px-1">{cartQty}</span>
                                  <button
                                    onClick={() => addToCart(product.id)}
                                    className="w-6 h-6 bg-black text-white rounded flex items-center justify-center font-bold hover:bg-neutral-800"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => addToCart(product.id)}
                                  className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-xs active:scale-95"
                                  title="Tambah ke Keranjang"
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
              )}
            </section>

          </div>
        </main>

        {/* 3. MODAL DETAIL PRODUK TERINTEGRASI */}
        {detailProduct && (
          <MenuDetailModal
            product={detailProduct}
            onClose={() => setDetailProduct(null)}
          />
        )}
      </div>



    </div>
  );
}
