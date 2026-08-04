'use client';

/**
 * ============================================================================
 * HALAMAN: Katalog Menu Utama (src/app/menu/page.tsx)
 * DESKRIPSI: Antarmuka katalog produk kuliner dengan pencarian real-time,
 *            filter 3 kategori utama (Makanan Berat, Menu Hemat, Minuman),
 *            pengurutan harga & popularitas, modal pratinjau produk,
 *            serta integrasi Keranjang Kerajinan & Autentikasi Pengguna.
 * GUIDELINES: Mengikuti Standar Industri UI/UX, Clean Code, Aksesibilitas,
 *            dan 100% Bahasa Indonesia.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  Star, 
  ChevronDown, 
  ArrowUpDown, 
  LogOut, 
  Plus, 
  Minus, 
  Utensils 
} from 'lucide-react';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';

interface MenuProduct {
  id: string;
  name: string;
  category: string; // Makanan | Minuman | Snack | Dessert | Paket Hemat
  price: number;
  rating: number;
  description: string;
  soldCount: string;
  image: string;
  gallery?: string[];
  badge?: 'BEST SELLER' | 'NEW';
}

const MENU_PRODUCTS: MenuProduct[] = [
  {
    id: 'm1',
    name: 'Ayam Bakar',
    category: 'Makanan Berat',
    price: 35000,
    rating: 4.9,
    description: 'Ayam pejantan pilihan dibakar dengan lumuran bumbu kecap rempah tradisional yang meresap hingga ke tulang.',
    soldCount: '1.5k+ Terjual',
    image: '/images/ayam_bakar.jpg',
    badge: 'BEST SELLER'
  },
  {
    id: 'm2',
    name: 'Nasi Bakar',
    category: 'Makanan Berat',
    price: 28000,
    rating: 4.8,
    description: 'Nasi gurih rempah dibungkus daun pisang dengan isian cumi pedas manis yang dibakar harum khas nusantara.',
    soldCount: '920 Terjual',
    image: '/images/nasi_bakar.jpg',
    badge: 'NEW'
  },
  {
    id: 'm3',
    name: 'Krecek',
    category: 'Menu Hemat',
    price: 22000,
    rating: 4.9,
    description: 'Olahan krecek kulit sapi lembut dimasak dengan santan kental gurih, cabai rawit pedas, dan kacang tolo.',
    soldCount: '2.1k Terjual',
    image: '/images/krecek.jpg'
  },
  {
    id: 'm4',
    name: 'Gudeg',
    category: 'Makanan Berat',
    price: 40000,
    rating: 5.0,
    description: 'Nangka muda dimasak perlahan dengan santan dan gula jawa disajikan dengan telur bacem, suwiran ayam, dan krecek.',
    soldCount: '3.5k Terjual',
    image: '/images/gudeg.jpg',
    badge: 'BEST SELLER'
  },
  {
    id: 'm5',
    name: 'Garang Asam',
    category: 'Menu Hemat',
    price: 32000,
    rating: 4.8,
    description: 'Potongan ayam kampung segar dikukus dalam bungkus daun pisang dengan kuah santan asam segar, belimbing wulung, dan cabai rawit.',
    soldCount: '750 Terjual',
    image: '/images/garang_asam.jpg'
  },
  {
    id: 'm6',
    name: 'Jus (Jambu, Sirsak, Mangga)',
    category: 'Minuman',
    price: 15000,
    rating: 4.7,
    description: 'Aneka pilihan jus buah segar alami berkualitas premium: Jambu Biji Merah, Sirsak Manis, atau Mangga Harum Manis.',
    soldCount: '1.8k Terjual',
    image: '/images/jus_mangga.jpg',
    gallery: ['/images/jus_mangga.jpg', '/images/jus_sirsak.jpg', '/images/jus_jambu.jpg']
  }
];


export default function MenuCatalogPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { products } = useData();
  const { cart, totalCartCount, addToCart, removeFromCart } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'bestseller' | 'rating' | 'price-asc' | 'price-desc'>('bestseller');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Filter visible products from DataContext
  const visibleProducts = products.filter(p => p.visibility !== false);


  const categories = ['Semua', 'Makanan Berat', 'Menu Hemat', 'Minuman'];

  const toggleWishlist = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter & Sort Logic
  const filteredProducts = visibleProducts.filter(item => {
    const matchCategory = activeCategory === 'Semua' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  const topRowProducts = filteredProducts.slice(0, 4);
  const bottomRowProducts = filteredProducts.slice(4);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#5E3A20] rounded-full animate-spin mb-4" />
        <p className="text-xs text-stone-500 font-medium">Memuat Katalog Menu Nefakky...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-[#5E3A20]/10 selection:text-[#5E3A20]">
      
      {/* 1. TOP NAVBAR */}
      <Navbar showSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* 2. MAIN MENU SECTION */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-8">
        
        {/* HERO TITLE BANNER */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#3D2512] tracking-tight">
            Temukan Menu Favoritmu
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light leading-relaxed">
            Explore our collection of artisanal homemade dishes, crafted with the finest local ingredients and generations of culinary wisdom.
          </p>
        </div>

        {/* SEARCH, SORTING & CATEGORY FILTER BAR */}
        <div className="space-y-4 max-w-5xl mx-auto">
          
          {/* Row 1: Main Search Bar & Sort Dropdowns */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input Box */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sate, rendang, atau cendol..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200/80 rounded-full text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5E3A20]/20 focus:border-[#5E3A20] shadow-sm transition-all"
              />
            </div>

            {/* Sorting Selectors */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              
              {/* Best Seller Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto appearance-none bg-white border border-stone-200/80 rounded-full px-4 py-2.5 pr-8 text-xs font-medium text-stone-700 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="bestseller">Sorting: Best Seller</option>
                  <option value="rating">Sorting: Rating Tertinggi</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              </div>

              {/* Price Sort Dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto appearance-none bg-white border border-stone-200/80 rounded-full px-4 py-2.5 pr-8 text-xs font-medium text-stone-700 focus:outline-none cursor-pointer shadow-sm"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              </div>

            </div>

          </div>

          {/* Row 2: Category Filter Pills */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none justify-center">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#5E3A20] text-white shadow-md'
                      : 'bg-white text-stone-600 border border-stone-200/70 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* 3. PRODUCT GRID - ROW 1 (4 CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {topRowProducts.map((item) => {
            const isFav = favorites.includes(item.id);
            const qty = cart[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Wishlist Button */}
                  <div 
                    onClick={() => setDetailProduct(item as any)}
                    className="relative h-48 w-full bg-stone-100 overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge Top Left */}
                    {item.badge && (
                      <span className="absolute top-3 left-3 bg-[#4A3222] text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                        {item.badge}
                      </span>
                    )}

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>

                  {/* Content Info */}
                  <div className="p-5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-semibold text-stone-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-stone-700 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed font-light">
                      {item.description}
                    </p>

                    <div className="pt-1 text-[11px] text-stone-400 font-medium">
                      {item.soldCount}
                    </div>
                  </div>
                </div>

                {/* Price & Add Cart Action */}
                <div className="px-5 pb-5 pt-1 flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#3D2512]">
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
                        onClick={() => addToCart(item.id)}
                        className="w-6 h-6 rounded-full bg-[#5E3A20] text-white flex items-center justify-center shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-9 h-9 rounded-full bg-[#5E3A20] hover:bg-[#472B17] text-white flex items-center justify-center transition-all shadow active:scale-95"
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* 4. MIDDLE HERO BANNER: CHEF'S HERITAGE CHOICE (LAMB SHANK TONGSENG) */}
        <div className="relative rounded-[32px] overflow-hidden bg-stone-900 text-white min-h-[320px] sm:min-h-[360px] flex flex-col justify-center p-8 sm:p-12 shadow-xl border border-stone-800">
          <Image
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
            alt="Chef preparing Lamb Shank Tongseng"
            fill
            className="object-cover object-center opacity-40 brightness-[0.7]"
          />
          <div className="relative z-10 max-w-xl space-y-4 text-left">
            <span className="inline-block px-3.5 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase rounded-full">
              WEEKEND SPECIAL
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white tracking-tight">
              Chef's Heritage Choice: Lamb Shank Tongseng
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 font-light leading-relaxed">
              Indulge in our tender 18-hour braised lamb shank, served with a modern twist on the classic Tongseng broth. Only available this weekend.
            </p>

            <div className="pt-2">
              <button 
                onClick={() => alert('Pesanan Spesial Lamb Shank Tongseng berhasil direservasi untuk akhir pekan Anda!')}
                className="px-6 py-3 bg-white hover:bg-stone-100 text-stone-900 text-xs font-semibold rounded-full shadow-lg transition-colors"
              >
                Reserve Your Dish
              </button>
            </div>
          </div>
        </div>

        {/* 5. PRODUCT GRID - ROW 2 (4 CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {bottomRowProducts.map((item) => {
            const isFav = favorites.includes(item.id);
            const qty = cart[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Wishlist Button */}
                  <div 
                    onClick={() => setDetailProduct(item as any)}
                    className="relative h-48 w-full bg-stone-100 overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge Top Left */}
                    {item.badge && (
                      <span className={`absolute top-3 left-3 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow ${
                        item.badge === 'NEW' ? 'bg-red-600' : 'bg-[#4A3222]'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Wishlist Heart Button */}
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>

                  {/* Content Info */}
                  <div className="p-5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-semibold text-stone-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-stone-700 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed font-light">
                      {item.description}
                    </p>

                    <div className="pt-1 text-[11px] text-stone-400 font-medium">
                      {item.soldCount}
                    </div>
                  </div>
                </div>

                {/* Price & Add Cart Action */}
                <div className="px-5 pb-5 pt-1 flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#3D2512]">
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
                        onClick={() => addToCart(item.id)}
                        className="w-6 h-6 rounded-full bg-[#5E3A20] text-white flex items-center justify-center shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-9 h-9 rounded-full bg-[#5E3A20] hover:bg-[#472B17] text-white flex items-center justify-center transition-all shadow active:scale-95"
                      title="Tambah ke Keranjang"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#4A3222] text-stone-300 py-12 px-6 sm:px-12 mt-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-light">
          <div>
            <span className="font-serif text-2xl font-bold text-white block mb-1">
              Nefakky
            </span>
            <p className="text-stone-400 max-w-xs">
              Temukan hidangan rumahan terbaik dengan cita rasa warisan Indonesia.
            </p>
          </div>

          <div className="text-center sm:text-right text-stone-400 space-y-1">
            <p>&copy; 2026 Nefakky Marketplace. All rights reserved.</p>
            <p className="text-[11px] text-amber-400/80">Nikmati Masakan Rumahan, Semudah Satu Sentuhan.</p>
          </div>
        </div>
      </footer>

      {/* Menu Detail Modal Overlay */}
      <MenuDetailModal product={detailProduct} onClose={() => setDetailProduct(null)} />

      {/* Guest Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-amber-100 text-[#5C3D28] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl font-bold text-stone-900">Silakan Masuk Terlebih Dahulu</h3>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                Anda perlu masuk atau mendaftar akun untuk menambahkan makanan ini ke keranjang atau memesan.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-3 bg-[#7A4B29] hover:bg-[#613A1F] text-white font-medium text-xs rounded-full shadow transition-all"
              >
                Masuk ke Akun Saya
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full py-3 border border-[#7A4B29] text-[#7A4B29] hover:bg-[#7A4B29]/5 font-medium text-xs rounded-full transition-all"
              >
                Daftar Akun Baru
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-stone-400 hover:text-stone-600 font-light pt-1"
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
