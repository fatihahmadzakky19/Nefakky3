'use client';

/**
 * ============================================================================
 * HALAMAN: Katalog Menu (src/app/menu/page.tsx)
 * DESKRIPSI: Halaman etalase kuliner UMKM Nefakky yang menyajikan seluruh
 *            koleksi hidangan utama, minuman, menu hemat, dan hidangan segera hadir.
 * FITUR UTAMA:
 * 1. Navbar terintegrasi dengan deteksi rute aktif dan badge keranjang live.
 * 2. Banner Header Hero Nuansa Cita Rasa Nusantara.
 * 3. Filter Kategori Multi-Pilihan (Semua, Makanan Berat, Minuman, Menu Hemat, Segera Hadir).
 * 4. Bilah Pencarian Realtime & Sorting Dinamis (Populer, Harga Terendah/Tertinggi, Rating).
 * 5. Kartu Produk Presisi dengan Badge Promo, Rating Bintang, dan Kontrol Jumlah Keranjang.
 * 6. Modal Pop-up Rincian Menu & Informasi Nutrisi.
 * 7. Footer Editorial Minimalis.
 * ============================================================================
 */

// Mengimpor React dan useState untuk pengelolaan state filter, pencarian, dan modal
import React, { useState } from 'react';
// Mengimpor Image dari Next.js untuk render gambar teroptimasi
import Image from 'next/image';
// Mengimpor Link untuk navigasi client-side
import Link from 'next/link';
// Mengimpor DataContext untuk membaca data produk dari Firestore & Laravel API
import { useData } from '@/context/DataContext';
// Mengimpor CartContext untuk memanipulasi keranjang belanja
import { useCart } from '@/context/CartContext';
// Mengimpor Komponen Modal Detail Menu
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';
// Mengimpor Navbar & Footer terpadu
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
// Mengimpor ikon-ikon semantik dan jelas dari Lucide React
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
  ChefHat
} from 'lucide-react';

/**
 * Komponen Utama MenuCatalogPage
 * Menyediakan katalog lengkap produk kuliner Nefakky
 */
export default function MenuCatalogPage() {
  // Mengambil daftar produk aktif dari DataContext
  const { products } = useData();
  // Mengambil state dan fungsi manipulasi keranjang dari CartContext
  const { cartItems, addToCart, removeFromCart } = useCart();

  // State untuk kategori aktif yang dipilih oleh pengguna
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  // State teks pencarian kata kunci produk
  const [searchQuery, setSearchQuery] = useState<string>('');
  // State opsi pengurutan data produk (popular, price-low, price-high, rating)
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
  // State objek produk yang sedang dibuka pada modal pop-up detail
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);
  // State daftar ID produk favorit/wishlist yang disimpan di memori sesi
  const [favorites, setFavorites] = useState<string[]>([]);

  // Daftar opsi kategori yang dapat difilter
  const categories = ['Semua', 'Makanan Berat', 'Minuman', 'Menu Hemat', 'Segera Hadir'];

  /**
   * Handler untuk menambah / menghapus produk dari daftar favorit pengguna
   * @param productId ID unik produk yang diklik
   */
  const toggleWishlist = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  /**
   * Filter dan Pengurutan Produk Dinamis:
   * 1. Mencocokkan kategori yang dipilih.
   * 2. Mencocokkan query pencarian pada nama produk atau deskripsi.
   * 3. Memastikan produk tidak diarsipkan/dihapus dan visibility true.
   * 4. Mengurutkan berdasarkan pilihan sortir aktif.
   */
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

  return (
    <div className="bg-[#FAF8F5] font-sans text-[#25160E] min-h-screen selection:bg-[#934b19]/20 selection:text-[#934b19] flex flex-col justify-between">
      
      {/* 1. NAVBAR UTAMA TERPADU */}
      <Navbar />

      {/* 2. AREA KONTEN UTAMA */}
      <main className="w-full flex-1">
        
        {/* Banner Header Section Cita Rasa Nusantara */}
        <section className="w-full bg-[#25160E] px-4 sm:px-6 lg:px-16 py-10 sm:py-14 text-white relative overflow-hidden shadow-xl border-b border-stone-800">
          {/* Efek Gradien Latar Belakang */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-amber-900/30 via-amber-950/10 to-transparent pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Kolom Kiri: Informasi Judul & Tagline */}
            <div className="lg:col-span-7 flex flex-col items-start gap-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/15 text-xs font-semibold text-amber-200 tracking-wider uppercase">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" />
                <span>Koleksi Hidangan Utama</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Kelezatan Autentik Dapur Nusantara
              </h1>
              <p className="text-sm sm:text-base text-stone-300 font-light max-w-xl leading-relaxed">
                Setiap resep diracik dari rempah alami berkualitas tinggi, diolah higienis setiap hari, dan diantar hangat langsung ke meja Anda.
              </p>
            </div>

            {/* Kolom Kanan: Highlight Keunggulan Dapur */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ChefHat className="w-6 h-6 text-amber-400 mb-2" />
                <h2 className="text-sm font-bold text-white">Resep Warisan</h2>
                <p className="text-xs text-stone-300 mt-0.5">Bumbu alami tanpa pengawet buatan</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Flame className="w-6 h-6 text-amber-400 mb-2" />
                <h2 className="text-sm font-bold text-white">Segar Dimasak</h2>
                <p className="text-xs text-stone-300 mt-0.5">Made-by-order setiap hari</p>
              </div>
            </div>

          </div>
        </section>

        {/* 3. STICKY FILTER & SEARCH CONTROL BAR */}
        <section className="sticky top-20 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-4 sm:px-6 lg:px-16 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Tab Navigasi Kategori Produk */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-[#25160E] text-white shadow-md'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Bilah Pencarian Teks & Dropdown Pengurutan */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              
              {/* Input Pencarian Produk */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari hidangan favorit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#25160E] transition-all"
                />
              </div>

              {/* Dropdown Urutkan Produk */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none pl-3 pr-8 py-2 bg-white rounded-full border border-stone-200 text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#25160E] cursor-pointer"
                  aria-label="Urutkan menu berdasarkan"
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

        {/* 4. GRID KATALOG PRODUK */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-10">
          
          {/* Indikator Jika Hasil Filter Kosong */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm max-w-md mx-auto p-8">
              <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-stone-800 mb-1">Menu Tidak Ditemukan</h3>
              <p className="text-xs text-stone-500 mb-6">
                Tidak ada hidangan yang cocok dengan kata kunci &quot;{searchQuery}&quot; pada kategori &quot;{activeCategory}&quot;.
              </p>
              <button
                onClick={() => { setActiveCategory('Semua'); setSearchQuery(''); }}
                className="px-5 py-2.5 bg-[#25160E] text-white text-xs font-semibold rounded-full hover:bg-stone-800 transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            /* Grid Kartu Produk 3 Kolom Responsif */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => {
                // Periksa kuantitas item produk saat ini di keranjang belanja
                const inCart = cartItems.find(item => item.id === product.id);
                const cartQty = inCart ? inCart.quantity : 0;
                const isFav = favorites.includes(product.id);

                return (
                  <article
                    key={product.id}
                    className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Container Foto Produk dengan Badge */}
                      <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => setDetailProduct(product)}>
                        <Image
                          src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Badge Kategori / Promo Terpopuler / Stok Habis */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          {product.stock <= 0 ? (
                            <span className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase rounded-full shadow-md">
                              Produk Habis
                            </span>
                          ) : (
                            <>
                              {product.badge && (
                                <span className="px-2.5 py-1 bg-[#25160E] text-white text-[10px] font-bold uppercase rounded-full shadow-md">
                                  {product.badge}
                                </span>
                              )}
                              {product.isComingSoon && (
                                <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase rounded-full shadow-md">
                                  Segera Hadir
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Tombol Wishlist / Favorit */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors z-10 ${
                            isFav ? 'bg-rose-50 text-rose-500' : 'bg-white/80 text-stone-600 hover:text-rose-500'
                          }`}
                          aria-label="Simpan ke Favorit"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* Detail Teks & Informasi Nutrisi */}
                      <div className="p-5">
                        
                        {/* Rating & Jumlah Ulasan */}
                        <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-stone-800">{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                            <span>({product.reviewsCount || 0} ulasan)</span>
                          </div>
                          <span className="text-[11px] text-stone-400">{product.category}</span>
                        </div>

                        {/* Nama Produk */}
                        <h3 
                          onClick={() => setDetailProduct(product)}
                          className="font-serif text-lg font-bold text-[#25160E] group-hover:text-[#934b19] transition-colors cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </h3>

                        {/* Cuplikan Deskripsi */}
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed font-light">
                          {product.description}
                        </p>

                      </div>
                    </div>

                    {/* Harga & Tombol Tambah ke Keranjang */}
                    <div className="p-5 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                      <div>
                        <span className="text-[11px] text-stone-400 block font-light">Harga Porsi</span>
                        <span className="font-bold text-[#25160E] text-base sm:text-lg">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Kontrol Kuantitas Keranjang / Reservasi */}
                      <div>
                        {product.stock <= 0 ? (
                          <button
                            onClick={() => setDetailProduct(product)}
                            className="px-3.5 py-2 rounded-xl text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Produk habis, klik untuk reservasi ke CS"
                          >
                            <span>Reservasi CS</span>
                          </button>
                        ) : cartQty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="w-7 h-7 bg-white text-stone-800 rounded-lg flex items-center justify-center font-bold hover:bg-stone-200 transition-colors shadow-xs"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[#25160E] px-1.5">{cartQty}</span>
                            <button
                              onClick={() => addToCart(product.id)}
                              className="w-7 h-7 bg-[#25160E] text-white rounded-lg flex items-center justify-center font-bold hover:bg-stone-800 transition-colors shadow-xs"
                              aria-label="Tambah jumlah"
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
                            disabled={Boolean(product.isComingSoon)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                              product.isComingSoon
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-[#25160E] hover:bg-[#934b19] text-white active:scale-95'
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

      {/* 5. MODAL POPUP RINCIAN DETAIL PRODUK */}
      {detailProduct && (
        <MenuDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
        />
      )}

      {/* 6. FOOTER EDITORIAL TERPADU */}
      <Footer />

    </div>
  );
}
