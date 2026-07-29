'use client';

import React, { useEffect, useState } from 'react';
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
  Bell, 
  User, 
  Star, 
  Utensils, 
  Cookie, 
  Coffee, 
  IceCream, 
  Gift, 
  ArrowRight,
  ShieldCheck,
  LogOut,
  Ticket,
  Plus,
  Minus,
  X,
  CheckCircle2
} from 'lucide-react';
import MenuDetailModal, { DetailProduct } from '@/components/MenuDetailModal';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviewsCount?: number;
  image: string;
  description: string;
  badge?: 'TERPOPULER' | 'BARU';
}

const ALL_MENUS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Special Wagyu Bowl',
    category: 'Makanan Berat',
    price: 85000,
    rating: 4.9,
    image: '/images/wagyu_bowl.png',
    description: 'Nasi hangat dengan irisan daging wagyu premium dan kualitas istimewa disajikan dengan kuning telur segar.',
    badge: 'TERPOPULER'
  },
  {
    id: 'm2',
    name: 'Creamy Truffle Pasta',
    category: 'Makanan Berat',
    price: 72000,
    rating: 4.8,
    image: '/images/truffle_pasta.png',
    description: 'Pasta artisanal dengan saus truffle putih yang wangi dan bumbu rempah pilihan yang creamy.'
  },
  {
    id: 'm3',
    name: 'Berry Cheesecake',
    category: 'Dessert',
    price: 45000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
    description: 'Cheesecake lembut ala Jepang dengan topping buah beri segar dan taburan gula halus.',
    badge: 'BARU'
  },
  {
    id: 'm4',
    name: 'Ceremonial Matcha',
    category: 'Minuman',
    price: 38000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    description: 'Matcha berkualitas tinggi yang diimpor langsung dari Uji dengan racikan susu segar gurih.'
  },
  {
    id: 'm5',
    name: 'Rendang Sapi Rempah Padang',
    category: 'Makanan Berat',
    price: 65000,
    rating: 5.0,
    image: '/images/hero_rendang.png',
    description: 'Daging sapi empuk bumbu racikan warisan yang dimasak perlahan 8 jam.'
  },
  {
    id: 'm6',
    name: 'Croissant Butter Paris',
    category: 'Snack',
    price: 28000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    description: 'Pastry mentega impor renyah berlapis dengan aroma khas toko roti Paris.'
  },
  {
    id: 'm7',
    name: 'Paket Family Bento Box',
    category: 'Paket Hemat',
    price: 120000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    description: 'Paket hemat hidangan lengkap untuk keluarga dengan lauk pauk komplit.'
  }
];


export default function UserHomePage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const { products } = useData();
  const { cart, totalCartCount, addToCart, removeFromCart, cartItems, subtotal, claimPromo } = useCart();

  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [detailProduct, setDetailProduct] = useState<DetailProduct | null>(null);

  // Filter visible products from DataContext
  const visibleProducts = products.filter(p => p.visibility !== false);

  // Authentication Guard: Redirect unauthenticated visitors to /login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-amber-800/20 border-t-[#7A4B29] rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-500 font-medium">Memuat Nefakky Marketplace...</p>
      </div>
    );
  }

  // Categories list matching visual design
  const categoriesList = [
    { name: 'Makanan Berat', icon: Utensils },
    { name: 'Snack', icon: Cookie },
    { name: 'Minuman', icon: Coffee },
    { name: 'Dessert', icon: IceCream },
    { name: 'Paket Hemat', icon: Gift },
  ];

  // Filtering products
  const filteredProducts = visibleProducts.filter(item => {
    const matchCat = activeCategory === 'Semua' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const bestsellers = filteredProducts.slice(0, 4);

  const discount = promoApplied ? subtotal * 0.3 : 0;
  const finalPrice = Math.max(0, subtotal - discount);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans selection:bg-[#7A4B29]/10 selection:text-[#7A4B29]">
      
      {/* 1. HEADER / NAVBAR */}
      <Navbar showSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* 2. HERO SECTION */}
      <section className="px-4 sm:px-8 py-10 md:py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#7A4B29]/5 border border-[#7A4B29]/20 rounded-full text-[11px] font-medium text-[#7A4B29]">
              Premium Food Marketplace
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] leading-[1.12] font-normal text-[#4A3222] tracking-tight">
              Nikmati Hidangan Rumahan dengan Rasa Istimewa
            </h1>

            {/* Subtitle Paragraph */}
            <p className="text-xs sm:text-sm text-stone-600 font-light max-w-lg leading-relaxed">
              Kurasi makanan terbaik dari dapur pilihan, siap diantar ke meja makan Anda dengan kehangatan dan kemewahan yang tak terlupakan.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('menu-terlaris');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-[#7A4B29] hover:bg-[#613A1F] text-white font-medium text-xs rounded-full shadow-md transition-all active:scale-[0.98]"
              >
                Pesan Sekarang
              </button>
              <button 
                onClick={() => setActiveCategory('Semua')}
                className="px-6 py-3 border border-[#7A4B29] text-[#7A4B29] hover:bg-[#7A4B29]/5 font-medium text-xs rounded-full transition-all"
              >
                Lihat Menu
              </button>
            </div>

          </div>

          {/* Hero Right Image Card */}
          <div className="lg:col-span-6">
            <div className="relative w-full h-[340px] sm:h-[400px] md:h-[440px] rounded-[32px] overflow-hidden shadow-xl border border-stone-200/60 bg-stone-100">
              <Image
                src="/images/hero_rendang.png"
                alt="Gourmet Rendang Sapi Rumahan dengan Sambal & Nasi Warm"
                fill
                className="object-cover object-center"
                priority
              />

              {/* Rating Overlay Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-lg border border-stone-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 leading-tight">
                    4.8/5 Rating
                  </div>
                  <div className="text-[10px] text-stone-400 font-normal">
                    Dari 2,000+ Pelanggan
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section id="kategori" className="px-4 sm:px-8 py-12 bg-[#F5F2EC]/60 border-y border-stone-200/40">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          
          {/* Title & Decorative Accent */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#4A3222]">
              Pilih Kategori Favoritmu
            </h2>
            <div className="w-12 h-0.5 bg-[#8A5A36] mx-auto rounded-full mt-2.5" />
          </div>

          {/* 5 Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
            {categoriesList.map((cat) => {
              const IconComp = cat.icon;
              const isActive = activeCategory === cat.name;

              return (
                <div
                  key={cat.name}
                  onClick={() => setActiveCategory(isActive ? 'Semua' : cat.name)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 group ${
                    isActive 
                      ? 'bg-[#7A4B29] border-[#7A4B29] text-white shadow-md' 
                      : 'bg-white border-stone-100 text-stone-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#F7EFE5] text-[#7A4B29] group-hover:bg-[#7A4B29] group-hover:text-white'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-tight text-center">
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. BESTSELLERS MENU SECTION */}
      <section id="menu-terlaris" className="px-4 sm:px-8 py-14 max-w-6xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between border-b border-stone-200/60 pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#4A3222]">
              Menu Terlaris
            </h2>
            <p className="text-xs text-stone-500 mt-1 font-light">
              Pilihan pelanggan yang paling dicintai minggu ini.
            </p>
          </div>
          <button 
            onClick={() => setActiveCategory('Semua')}
            className="text-xs font-medium text-[#7A4B29] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestsellers.map((item) => {
            const qty = cart[item.id] || 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image */}
                  <div 
                    onClick={() => setDetailProduct(item as any)}
                    className="relative h-44 w-full bg-stone-100 overflow-hidden cursor-pointer"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.badge && (
                      <span className={`absolute top-3 left-3 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        item.badge === 'TERPOPULER' ? 'bg-[#D9A353]' : 'bg-[#7A4B29]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-stone-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-stone-700 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Price & Cart Action */}
                <div className="px-4 pb-4 pt-2 flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-[#4A3222]">
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
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* 5. WEEKEND PROMO BANNER */}
      <section id="promo-section" className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
        <div className="bg-[#7D4A2B] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          
          {/* Left Text */}
          <div className="space-y-4 max-w-md text-left relative z-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight text-stone-50">
              Weekend Promo: Diskon 30%
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 font-light leading-relaxed">
              Meriahkan akhir pekanmu dengan sajian istimewa dari Nefakky. Gunakan kode promo <strong className="underline text-amber-200">WEEKENDSERU</strong>.
            </p>
            <div>
              <button 
                onClick={() => {
                  claimPromo('WEEKENDSERU');
                  if (totalCartCount === 0) {
                    addToCart('m2');
                  }
                  router.push('/cart');
                }}
                className="px-6 py-3 bg-[#D9A353] hover:bg-[#C28E42] text-[#3D2512] font-semibold text-xs rounded-full shadow-md transition-colors flex items-center gap-2"
              >
                <span>Ambil Promonya &amp; Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Ticket Illustration */}
          <div className="relative z-10 shrink-0">
            <div className="w-48 h-32 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col items-center justify-center gap-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform">
              <Ticket className="w-10 h-10 text-amber-300" />
              <span className="font-mono text-xs font-bold tracking-wider text-amber-200">
                WEEKENDSERU
              </span>
              <span className="text-[10px] text-stone-200">Diskon 30% All Items</span>
            </div>
          </div>

          {/* Background Decorative Pattern */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>
      </section>

      {/* 6. CART DRAWER SLIDE-OVER */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6">
            
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-4">
                <h3 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#7A4B29]" />
                  <span>Keranjang Belanja</span>
                </h3>
                <button 
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              {totalCartCount === 0 ? (
                <div className="text-center py-12 text-stone-400 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-stone-300" />
                  <p className="text-xs">Keranjang Anda masih kosong.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = ALL_MENUS.find(m => m.id === id);
                    if (!item) return null;

                    return (
                      <div key={id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                        <div>
                          <h4 className="text-xs font-semibold text-stone-800">{item.name}</h4>
                          <p className="text-[11px] text-[#7A4B29] font-serif font-bold">
                            Rp {item.price.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromCart(id)} className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold">-</button>
                          <span className="text-xs font-bold text-stone-800">{qty}</span>
                          <button onClick={() => addToCart(id)} className="w-5 h-5 rounded-full bg-[#7A4B29] text-white flex items-center justify-center text-xs font-bold">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total & Checkout */}
            {totalCartCount > 0 && (
              <div className="border-t border-stone-200 pt-4 space-y-3">
                <div className="space-y-1 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promo Diskon (30%):</span>
                      <span>- Rp {discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-serif text-base font-bold text-stone-900 pt-2 border-t border-stone-100">
                    <span>Total Pembayaran:</span>
                    <span>Rp {finalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button 
                  onClick={() => alert('Fitur Pembayaran QRIS / Bank Transfer siap diproses! Pesanan berhasil dikirim ke Dapur Nefakky.')}
                  className="w-full py-3.5 bg-[#7A4B29] hover:bg-[#613A1F] text-white font-medium text-xs rounded-full shadow transition-all"
                >
                  Lanjut ke Checkout
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer id="footer-section" className="bg-[#4A3222] text-stone-300 py-12 px-4 sm:px-8 mt-16 border-t border-stone-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-light">
          <div>
            <span className="font-serif text-2xl font-bold text-white block mb-1">
              Nefakky
            </span>
            <p className="text-stone-400 max-w-xs">
              Platform pemesanan makanan rumahan UMKM terpercaya dengan cita rasa istimewa.
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

    </div>
  );
}
