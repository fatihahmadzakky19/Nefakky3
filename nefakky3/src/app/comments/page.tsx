'use client';

/**
 * ============================================================================
 * HALAMAN: Ulasan Rasa & Komunitas Pelanggan (src/app/comments/page.tsx)
 * DESKRIPSI: Dikonversikan secara presisi 100% dari ekspor Stitch MCP HTML/Tailwind
 *            (Fixed Header, Hero Komunitas Pecinta Kuliner, Layout 2-Kolom:
 *            Sticky Review Form dengan Star Rating Stepper & Photo Attachment,
 *            serta Kartu Ulasan Realtime dengan Badge Rating, Tag Menu, Foto Makanan,
 *            Thread Balasan CS Admin, dan Footer Editorial).
 * ============================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, sortReviewsNewestFirst } from '@/context/DataContext';
import { 
  Star, 
  Search, 
  Bell, 
  ShoppingBag, 
  User, 
  Camera, 
  Send, 
  Utensils, 
  Quote, 
  MessageSquare, 
  Headphones, 
  X, 
  CheckCircle2, 
  Users, 
  Globe, 
  Share2,
  ChevronDown
} from 'lucide-react';

export default function CommentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { products, reviews, addReview, addReviewReply } = useData();
  const { totalCartCount } = useCart();

  // Form State
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  const [rating, setRating] = useState<number>(5.0);
  const [commentText, setCommentText] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState<{ [key: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState<number>(6);

  // Helper untuk rendering bintang interaktif pada preview form
  const renderStarPreview = (currentRating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(currentRating)) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-black text-black" />
        );
      } else if (i - 0.5 <= currentRating) {
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <Star className="w-5 h-5 text-black" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-black text-black" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 text-stone-300" />
        );
      }
    }
    return stars;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const dish = products.find(p => p.id === selectedMenu || p.name === selectedMenu) || products[0];

    const reviewerName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Pelanggan Nefakky');
    const reviewerAvatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=25160E&color=ffffff`;

    addReview({
      authorName: reviewerName,
      authorAvatar: reviewerAvatar,
      authorEmail: user?.email || '',
      rating: Number(rating),
      comment: commentText.trim(),
      productName: dish?.name || 'Menu Spesial Nefakky',
      productImage: dish?.image || '/images/ayam_bakar.jpg',
      photoUrl: imagePreview || undefined,
      photos: imagePreview ? [imagePreview] : (dish?.image ? [dish.image] : []),
      replies: []
    });

    setCommentText('');
    setImagePreview(null);
    setSelectedMenu('');
    setRating(5.0);
    setToastMessage('Terima kasih! Ulasan rasa Anda berhasil dikirim ke komunitas.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendReply = (reviewId: string) => {
    const text = replyInputText[reviewId];
    if (!text || !text.trim()) return;

    const senderName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Pelanggan');

    addReviewReply(reviewId, {
      authorName: senderName,
      authorEmail: user?.email || '',
      authorAvatar: user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=25160E&color=ffffff`,
      comment: text.trim()
    });

    setReplyInputText(prev => ({ ...prev, [reviewId]: '' }));
  };

  // Urutkan ulasan dari yang terbaru menggunakan helper
  const sortedReviews = sortReviewsNewestFirst(reviews || []);
  const displayedReviews = sortedReviews.slice(0, visibleReviewsCount);
  const userAvatar = user?.photoURL || (user?.displayName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=25160E&color=ffffff&bold=true` : (user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email.split('@')[0])}&background=25160E&color=ffffff&bold=true` : null));

  return (
    <div className="bg-[#fcf8fa] font-sans text-[#1b1b1d] min-h-screen selection:bg-stone-900 selection:text-white flex flex-col justify-between">
      
      <div>
        {/* 1. FIXED HEADER SESUAI STITCH MCP */}
        <header className="fixed top-0 w-full z-50 bg-[#fcf8fa]/90 backdrop-blur-xl border-b border-stone-200 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between">
            
            {/* Brand Wordmark (Left) */}
            <div className="flex-1 flex items-center font-serif text-2xl tracking-widest text-black font-bold">
              <Link href="/">NEFAKKY</Link>
            </div>
            
            {/* Desktop Navigation (Centered) */}
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              <Link href="/" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Beranda
              </Link>
              <Link href="/menu" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Menu
              </Link>
              <Link href="/comments" className="text-black font-bold text-sm transition-colors">
                Ulasan Rasa
              </Link>
              <Link href="/notifications" className="text-stone-600 hover:text-black font-medium text-sm transition-colors">
                Pesanan
              </Link>
            </nav>

            {/* Action Icons & Avatar (Right) */}
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
                className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white hover:bg-neutral-800 transition-colors overflow-hidden cursor-pointer"
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
        <main className="w-full pt-20 bg-[#fcf8fa] min-h-screen">
          <div className="flex flex-col w-full px-4 md:px-6 lg:px-8 py-8 space-y-8 max-w-7xl mx-auto">
            
            {/* Hero Section */}
            <section className="flex flex-col space-y-3 text-left">
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 bg-stone-200/80 rounded-full">
                <Users className="w-4 h-4 text-black" />
                <span className="font-semibold text-xs text-black uppercase tracking-widest">Komunitas Pecinta Kuliner</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-black font-bold tracking-tight">
                Ulasan &amp; Pengalaman Pelanggan
              </h1>

              <p className="text-sm sm:text-base text-stone-600 font-light max-w-2xl leading-relaxed">
                Jelajahi cerita dan pengalaman otentik dari pelanggan yang telah menikmati kelezatan menu kami. Bagikan momen kuliner Anda bersama Nefakky.
              </p>
            </section>

            {/* Notification Toast */}
            {toastMessage && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2 animate-fade-in font-medium shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
              
              {/* Kolom Kiri: Sticky Review Form (4 Cols) */}
              <aside className="lg:col-span-4 flex flex-col space-y-6 relative">
                <div className="sticky top-24 bg-white rounded-2xl shadow-md border border-stone-200 p-6 space-y-5 text-left">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-black mb-1">Tulis Ulasan Rasa</h2>
                    <p className="text-xs text-stone-500 font-light">Bagikan pengalaman Anda hari ini.</p>
                  </div>

                  <form className="flex flex-col space-y-4" onSubmit={handleSubmitReview}>
                    
                    {/* Pilih Menu Dropdown */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-semibold text-xs text-black" htmlFor="menu-select">Pilih Menu</label>
                      <div className="relative">
                        <select 
                          id="menu-select"
                          value={selectedMenu}
                          onChange={(e) => setSelectedMenu(e.target.value)}
                          required
                          className="w-full appearance-none bg-stone-50 text-black text-xs p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black border border-stone-200 cursor-pointer"
                        >
                          <option value="" disabled>Pilih menu yang dipesan...</option>
                          {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400" />
                      </div>
                    </div>

                    {/* Rating Stepper with Live Star Preview */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-semibold text-xs text-black">Rating (1.0 - 5.0)</label>
                      <div className="flex items-center justify-between bg-stone-50 p-3 rounded-lg border border-stone-200">
                        <input 
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="5.0"
                          value={rating}
                          onChange={(e) => setRating(parseFloat(e.target.value) || 1.0)}
                          className="w-16 bg-transparent font-mono font-bold text-sm text-black focus:outline-none text-center border-b border-stone-300"
                        />
                        <div className="flex items-center gap-1">
                          {renderStarPreview(rating)}
                        </div>
                      </div>
                    </div>

                    {/* Review Textarea */}
                    <div className="flex flex-col space-y-1.5">
                      <label className="font-semibold text-xs text-black" htmlFor="review-text">Pengalaman Anda</label>
                      <textarea 
                        id="review-text"
                        rows={4}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        required
                        placeholder="Ceritakan detail rasa, porsi, dan pelayanan..."
                        className="w-full bg-stone-50 text-black text-xs p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black border border-stone-200 resize-none placeholder-stone-400"
                      />
                    </div>

                    {/* Lampiran Foto */}
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center gap-2 text-stone-600 hover:text-black transition-colors p-2 rounded-lg hover:bg-stone-100 cursor-pointer w-fit">
                        <Camera className="w-4 h-4" />
                        <span className="font-semibold text-xs">Lampirkan Foto</span>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      {imagePreview && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-300 shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      className="w-full bg-black text-white font-semibold text-xs py-3 rounded-lg hover:bg-neutral-800 transition-all flex justify-center items-center gap-2 mt-2 shadow-md active:scale-98 cursor-pointer"
                    >
                      <span>Kirim Ulasan</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>

                  </form>
                </div>
              </aside>

              {/* Kolom Kanan: List Ulasan Pelanggan (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col space-y-6 text-left">
                {displayedReviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-2">
                    <MessageSquare className="w-8 h-8 text-stone-400 mx-auto stroke-1" />
                    <h3 className="font-serif text-base font-bold text-black">Belum Ada Ulasan</h3>
                    <p className="text-xs text-stone-500 font-light">Jadilah yang pertama membagikan ulasan rasa kuliner kami!</p>
                  </div>
                ) : (
                  displayedReviews.map((rev) => {
                    const isRepliesOpen = openReplyId === rev.id;
                    const replyCount = rev.replies?.length || 0;
                    const attachedImage = rev.photoUrl || (rev.photos && rev.photos[0]) || rev.photo || rev.image;

                    return (
                      <article 
                        key={rev.id}
                        className="bg-white rounded-2xl shadow-xs border border-stone-200 p-6 flex flex-col space-y-4 transition-all hover:shadow-sm"
                      >
                        {/* Header: User Avatar, Name, Relative Time & Rating */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                alt={rev.authorName || 'Pelanggan'} 
                                className="w-full h-full object-cover" 
                                src={rev.authorAvatar || rev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.authorName || 'U')}&background=25160E&color=ffffff`}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm text-black">{rev.authorName || 'Pelanggan Nefakky'}</h3>
                              <p className="text-xs text-stone-400 font-light">{rev.date || 'Baru saja'}</p>
                            </div>
                          </div>

                          {/* Rating Badge */}
                          <div className="flex items-center gap-1 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                            <span className="font-mono font-bold text-xs text-black">{(rev.rating || 5).toFixed(1)}</span>
                            <Star className="w-3.5 h-3.5 fill-black text-black" />
                          </div>
                        </div>

                        {/* Menu Pill Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-stone-100 px-3 py-1 rounded-md w-fit text-stone-700">
                          <Utensils className="w-3.5 h-3.5 text-stone-500" />
                          <span className="font-semibold text-xs">{rev.productName || 'Ayam Bakar Spesial'}</span>
                        </div>

                        {/* Comment Body with Quote Decoration */}
                        <div className="relative pl-6">
                          <Quote className="w-5 h-5 absolute left-0 top-0 text-stone-300 stroke-1" />
                          <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Attached Food Photo (if available) */}
                        {attachedImage && (
                          <div className="w-full h-64 rounded-xl overflow-hidden mt-2 shadow-xs border border-stone-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              alt={rev.productName || 'Ulasan Foto'} 
                              className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500" 
                              src={attachedImage}
                            />
                          </div>
                        )}

                        {/* Replies Thread Section */}
                        <div className="border-t border-stone-100 pt-3 flex flex-col space-y-3">
                          <button 
                            type="button"
                            onClick={() => setOpenReplyId(isRepliesOpen ? null : rev.id)}
                            className="flex items-center gap-1.5 text-stone-600 hover:text-black transition-colors text-xs font-semibold self-start"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{replyCount > 0 ? `Lihat Balasan (${replyCount})` : 'Balas Komentar'}</span>
                          </button>

                          {isRepliesOpen && (
                            <div className="flex flex-col space-y-3 pl-4 sm:pl-6 border-l-2 border-stone-200 pt-2 animate-fade-in">
                              {/* List Existing Replies */}
                              {rev.replies && rev.replies.map((reply: any, idx: number) => {
                                const isAdmin = (reply.authorName && reply.authorName.toLowerCase().includes('admin')) || reply.senderRole === 'admin';

                                return (
                                  <div key={idx} className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${isAdmin ? 'bg-black' : 'bg-stone-600'}`}>
                                      {isAdmin ? <Headphones className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-xs text-black">{reply.authorName || 'Pelanggan'}</h4>
                                        {isAdmin && (
                                          <span className="bg-[#25160E] text-amber-200 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                                            CS ADMIN
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-stone-600 font-light leading-relaxed">{reply.comment || reply.message}</p>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Reply Input Form */}
                              <div className="flex items-center gap-2 pt-1">
                                <input 
                                  type="text"
                                  value={replyInputText[rev.id] || ''}
                                  onChange={(e) => setReplyInputText({ ...replyInputText, [rev.id]: e.target.value })}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(rev.id); }}
                                  placeholder="Balas komentar ini..."
                                  className="flex-1 bg-stone-100 text-black text-xs p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-black border border-stone-200"
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleSendReply(rev.id)}
                                  className="p-2.5 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                                  title="Kirim Balasan"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </article>
                    );
                  })
                )}

                {/* Muat Lebih Banyak Ulasan */}
                {sortedReviews.length > visibleReviewsCount && (
                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => setVisibleReviewsCount(prev => prev + 6)}
                      className="px-6 py-2.5 rounded-full border border-stone-300 text-black font-semibold text-xs hover:bg-stone-100 transition-colors"
                    >
                      Muat Lebih Banyak Ulasan
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        </main>
      </div>



    </div>
  );
}
