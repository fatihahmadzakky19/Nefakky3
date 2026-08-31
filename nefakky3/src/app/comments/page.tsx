'use client';

/**
 * ============================================================================
 * HALAMAN: Ulasan Rasa & Komunitas Pelanggan (src/app/comments/page.tsx)
 * DESKRIPSI: Ruang komunitas pelanggan Nefakky untuk membagikan pengalaman,
 *            memberi penilaian rasa makanan dengan rating bintang presisi,
 *            melampirkan foto hidangan, serta berdiskusi dalam thread komentar.
 * FITUR UTAMA:
 * 1. Navbar terintegrasi dengan active route indicator dan cart counter.
 * 2. Hero Section Komunitas Pecinta Kuliner.
 * 3. Form Ulasan Rasa Lengkap (Pilih Menu, Star Rating Dinamis, Textarea, Upload Foto).
 * 4. List Kartu Ulasan Realtime (Foto Makanan, Rating Badge, Tag Menu, Thread Balasan CS Admin).
 * 5. Fitur Balas Komentar Interaktif (Reply Form & Role CS Admin Badge).
 * 6. Paginasi "Muat Lebih Banyak Ulasan".
 * 7. Footer Editorial Terpadu.
 * ============================================================================
 */

// Mengimpor React dan useState untuk state formulir, review, dan upload
import React, { useState } from 'react';
// Mengimpor Image dari Next.js untuk foto ulasan
import Image from 'next/image';
// Mengimpor AuthContext untuk identitas pengguna yang sedang mengulas
import { useAuth } from '@/context/AuthContext';
// Mengimpor DataContext untuk membaca dan menambah ulasan ke Firestore / Laravel API
import { useData, sortReviewsNewestFirst } from '@/context/DataContext';
// Mengimpor Navbar & Footer terpadu
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthRequiredModal from '@/components/AuthRequiredModal';
// Mengimpor ikon-ikon semantik dan jelas dari Lucide React
import { 
  Star, 
  Camera, 
  Send, 
  Utensils, 
  Quote, 
  MessageSquare, 
  Headphones, 
  X, 
  CheckCircle2, 
  Users, 
  ChevronDown,
  User,
  Lock,
  UserCheck
} from 'lucide-react';

/**
 * Komponen Utama CommentsPage
 * Mengelola interaksi komunitas dan ulasan rasa masakan
 */
export default function CommentsPage() {
  // Destruktur data sesi user aktif dari AuthContext
  const { user } = useAuth();
  // Destruktur data produk, ulasan, serta handler tambah ulasan/balasan dari DataContext
  const { products, reviews, addReview, addReviewReply } = useData();

  // State menu yang dipilih pada dropdown ulasan
  const [selectedMenu, setSelectedMenu] = useState<string>('');
  // State angka rating bintang (1.0 s/d 5.0)
  const [rating, setRating] = useState<number>(5.0);
  // State teks isi komentar / pengalaman rasa
  const [commentText, setCommentText] = useState<string>('');
  // State preview gambar yang diunggah oleh pengguna
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // State ID ulasan yang sedang dibuka thread balasannya
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  // State teks input balasan per ID ulasan
  const [replyInputText, setReplyInputText] = useState<{ [key: string]: string }>({});
  // State pesan notifikasi toast setelah berhasil kirim ulasan
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // State batas jumlah ulasan yang ditampilkan di awal
  const [visibleReviewsCount, setVisibleReviewsCount] = useState<number>(6);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authActionName, setAuthActionName] = useState<string>('menulis ulasan rasa makanan');

  /**
   * Helper fungsi untuk merender bintang interaktif pada preview formulir
   * Menampilkan bintang penuh, bintang setengah (half), atau bintang kosong
   * @param currentRating Nilai rating float antara 1.0 sampai 5.0
   */
  const renderStarPreview = (currentRating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(currentRating)) {
        // Bintang penuh (terisi kuning keemasan)
        stars.push(
          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
        );
      } else if (i - 0.5 <= currentRating) {
        // Bintang separuh (half star)
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <Star className="w-5 h-5 text-stone-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        // Bintang kosong (abu-abu netral)
        stars.push(
          <Star key={i} className="w-5 h-5 text-stone-300" />
        );
      }
    }
    return stars;
  };

  /**
   * Handler untuk membaca file foto lokal dan mengubahnya menjadi DataURL Base64
   * @param e Event perubahan input file
   */
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

  /**
   * Handler untuk mengirimkan formulir ulasan baru
   * @param e Form submission event
   */
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthActionName('menulis ulasan rasa makanan');
      setShowAuthModal(true);
      return;
    }
    // Cegah submit jika teks ulasan kosong
    if (!commentText.trim()) return;

    // Temukan produk yang diulas berdasarkan ID atau nama
    const dish = products.find(p => p.id === selectedMenu || p.name === selectedMenu) || products[0];

    // Tentukan nama pengulas dan avatar
    const reviewerName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Pelanggan Nefakky');
    const reviewerAvatar = user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=25160E&color=ffffff`;

    // Kirim data ulasan ke DataContext
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

    // Reset seluruh isian formulir
    setCommentText('');
    setImagePreview(null);
    setSelectedMenu('');
    setRating(5.0);
    setToastMessage('Terima kasih! Ulasan rasa Anda berhasil dikirim ke komunitas.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  /**
   * Handler untuk mengirim balasan pada ulasan tertentu
   * @param reviewId ID unik ulasan yang dibalas
   */
  const handleSendReply = (reviewId: string) => {
    if (!user) {
      setAuthActionName('membalas komentar ulasan');
      setShowAuthModal(true);
      return;
    }
    const text = replyInputText[reviewId];
    if (!text || !text.trim()) return;

    const senderName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Pelanggan');

    addReviewReply(reviewId, {
      authorName: senderName,
      authorEmail: user?.email || '',
      authorAvatar: user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=25160E&color=ffffff`,
      comment: text.trim()
    });

    // Kosongkan input balasan untuk ID ulasan terkait
    setReplyInputText(prev => ({ ...prev, [reviewId]: '' }));
  };

  // Mengurutkan ulasan secara kronologis dari yang paling baru
  const sortedReviews = sortReviewsNewestFirst(reviews || []);
  // Mengambil daftar ulasan sesuai limit paginasi aktif
  const displayedReviews = sortedReviews.slice(0, visibleReviewsCount);

  return (
    <div className="bg-[#FAF8F5] font-sans text-[#25160E] min-h-screen selection:bg-[#934b19]/20 selection:text-[#934b19] flex flex-col justify-between">
      
      {/* 1. NAVBAR UTAMA TERPADU */}
      <Navbar />

      {/* 2. AREA KONTEN UTAMA */}
      <main className="w-full flex-1">
        <div className="flex flex-col w-full px-4 sm:px-6 lg:px-16 py-8 space-y-8 max-w-7xl mx-auto">
          
          {/* Hero Section Banner Komunitas */}
          <section className="flex flex-col space-y-3 text-left">
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 bg-stone-200/80 rounded-full">
              <Users className="w-4 h-4 text-[#25160E]" />
              <span className="font-semibold text-xs text-[#25160E] uppercase tracking-widest">
                Komunitas Pecinta Kuliner
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#25160E] font-bold tracking-tight">
              Ulasan &amp; Pengalaman Pelanggan
            </h1>

            <p className="text-sm sm:text-base text-stone-600 font-light max-w-2xl leading-relaxed">
              Jelajahi cerita dan pengalaman otentik dari pelanggan yang telah menikmati kelezatan menu kami. Bagikan momen kuliner Anda bersama Nefakky.
            </p>
          </section>

          {/* Notifikasi Toast Keberhasilan Kirim Ulasan */}
          {toastMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2 animate-fade-in font-medium shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Grid Layout 2-Kolom (Form Kiri & Daftar Ulasan Kanan) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            
            {/* Kolom Kiri: Sticky Review Form (4 Kolom Desktop) */}
            <aside className="lg:col-span-4 flex flex-col space-y-6 relative">
              <div className="sticky top-28 bg-white rounded-3xl shadow-sm border border-stone-200 p-6 space-y-5 text-left">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#25160E] mb-1">Tulis Ulasan Rasa</h2>
                  <p className="text-xs text-stone-500 font-light">Bagikan pengalaman kuliner Anda hari ini.</p>
                </div>

                {!user && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-start gap-2 text-amber-900 text-xs">
                      <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-medium">
                        Anda sedang menjelajah sebagai <strong>Tamu (Guest)</strong>. Silakan masuk atau daftar akun untuk menulis ulasan dan berdiskusi dengan komunitas.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthActionName('menulis ulasan rasa dan berdiskusi di komunitas');
                        setShowAuthModal(true);
                      }}
                      className="w-full py-2.5 bg-[#25160E] hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-amber-200" />
                      <span>Masuk / Daftar Akun</span>
                    </button>
                  </div>
                )}

                <form className="flex flex-col space-y-4" onSubmit={handleSubmitReview}>
                  
                  {/* Dropdown Pemilihan Menu */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-semibold text-xs text-[#25160E]" htmlFor="menu-select">
                      Pilih Menu
                    </label>
                    <div className="relative">
                      <select 
                        id="menu-select"
                        value={selectedMenu}
                        onChange={(e) => setSelectedMenu(e.target.value)}
                        required
                        className="w-full appearance-none bg-stone-50 text-stone-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25160E] border border-stone-200 cursor-pointer"
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

                  {/* Rating Stepper dengan Bintang Dinamis */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-semibold text-xs text-[#25160E]">
                      Rating Rasa (1.0 - 5.0)
                    </label>
                    <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <input 
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="5.0"
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value) || 1.0)}
                        className="w-16 bg-transparent font-mono font-bold text-sm text-[#25160E] focus:outline-none text-center border-b border-stone-300"
                        aria-label="Input angka rating"
                      />
                      <div className="flex items-center gap-1">
                        {renderStarPreview(rating)}
                      </div>
                    </div>
                  </div>

                  {/* Textarea Isi Ulasan */}
                  <div className="flex flex-col space-y-1.5">
                    <label className="font-semibold text-xs text-[#25160E]" htmlFor="review-text">
                      Cerita &amp; Pengalaman Rasa
                    </label>
                    <textarea 
                      id="review-text"
                      rows={4}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      required
                      placeholder="Ceritakan detail kelezatan rasa, bumbu rempah, porsi hidangan, dan pelayanan..."
                      className="w-full bg-stone-50 text-stone-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25160E] border border-stone-200 resize-none placeholder-stone-400 leading-relaxed"
                    />
                  </div>

                  {/* Tombol Lampiran Foto Masakan */}
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center gap-2 text-stone-600 hover:text-[#25160E] transition-colors p-2 rounded-xl hover:bg-stone-100 cursor-pointer w-fit border border-dashed border-stone-300">
                      <Camera className="w-4 h-4 text-stone-500" />
                      <span className="font-semibold text-xs">Lampirkan Foto Makanan</span>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {/* Preview Thumbnail Foto */}
                    {imagePreview && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-300 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview Ulasan" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black transition-colors"
                          aria-label="Hapus foto preview"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tombol Submit Ulasan */}
                  <button 
                    type="submit"
                    className="w-full bg-[#25160E] text-white font-semibold text-xs py-3 rounded-xl hover:bg-[#934b19] transition-all flex justify-center items-center gap-2 mt-2 shadow-md active:scale-98 cursor-pointer"
                  >
                    <span>Kirim Ulasan</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                </form>
              </div>
            </aside>

            {/* Kolom Kanan: Daftar Ulasan Pelanggan (8 Kolom Desktop) */}
            <div className="lg:col-span-8 flex flex-col space-y-6 text-left">
              {displayedReviews.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-2 shadow-sm">
                  <MessageSquare className="w-10 h-10 text-stone-400 mx-auto stroke-1" />
                  <h3 className="font-serif text-lg font-bold text-[#25160E]">Belum Ada Ulasan</h3>
                  <p className="text-xs text-stone-500 font-light">
                    Jadilah yang pertama membagikan ulasan kelezatan kuliner kami!
                  </p>
                </div>
              ) : (
                displayedReviews.map((rev) => {
                  const isRepliesOpen = openReplyId === rev.id;
                  const replyCount = rev.replies?.length || 0;
                  const attachedImage = rev.photoUrl || (rev.photos && rev.photos[0]) || rev.photo || rev.image;

                  return (
                    <article 
                      key={rev.id}
                      className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 flex flex-col space-y-4 transition-all hover:shadow-md"
                    >
                      {/* Header Kartu: Avatar Pengulas, Nama, Waktu, & Badge Bintang */}
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
                            <h3 className="font-semibold text-sm text-[#25160E]">{rev.authorName || 'Pelanggan Nefakky'}</h3>
                            <p className="text-xs text-stone-400 font-light">{rev.date || 'Baru saja'}</p>
                          </div>
                        </div>

                        {/* Badge Rating Bintang */}
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                          <span className="font-mono font-bold text-xs text-[#25160E]">{(rev.rating || 5).toFixed(1)}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </div>
                      </div>

                      {/* Tag Menu yang Diulas */}
                      <div className="inline-flex items-center gap-1.5 bg-stone-100 px-3 py-1 rounded-lg w-fit text-stone-700">
                        <Utensils className="w-3.5 h-3.5 text-stone-500" />
                        <span className="font-semibold text-xs">{rev.productName || 'Menu Spesial Nefakky'}</span>
                      </div>

                      {/* Isi Ulasan dengan Ikon Kutipan */}
                      <div className="relative pl-6">
                        <Quote className="w-5 h-5 absolute left-0 top-0 text-amber-900/20 stroke-1" />
                        <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>

                      {/* Foto Makanan yang Dilampirkan (Jika Ada) */}
                      {attachedImage && (
                        <div className="w-full h-64 rounded-2xl overflow-hidden mt-2 shadow-xs border border-stone-200 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            alt={rev.productName || 'Ulasan Foto'} 
                            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500" 
                            src={attachedImage}
                          />
                        </div>
                      )}

                      {/* Thread Balasan Ulasan */}
                      <div className="border-t border-stone-100 pt-3 flex flex-col space-y-3">
                        <button 
                          type="button"
                          onClick={() => setOpenReplyId(isRepliesOpen ? null : rev.id)}
                          className="flex items-center gap-1.5 text-stone-600 hover:text-[#25160E] transition-colors text-xs font-semibold self-start"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{replyCount > 0 ? `Lihat Balasan (${replyCount})` : 'Balas Komentar'}</span>
                        </button>

                        {/* Dropdown Daftar Balasan */}
                        {isRepliesOpen && (
                          <div className="flex flex-col space-y-3 pl-4 sm:pl-6 border-l-2 border-amber-900/20 pt-2 animate-fade-in">
                            {/* Render Balasan yang Sudah Ada */}
                            {rev.replies && rev.replies.map((reply: any, idx: number) => {
                              const isCsAdmin = (reply.authorName && reply.authorName.toLowerCase().includes('admin')) || reply.senderRole === 'admin';

                              return (
                                <div key={idx} className="flex items-start gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${isCsAdmin ? 'bg-[#25160E]' : 'bg-stone-600'}`}>
                                    {isCsAdmin ? <Headphones className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-xs text-[#25160E]">{reply.authorName || 'Pelanggan'}</h4>
                                      {isCsAdmin && (
                                        <span className="bg-[#25160E] text-amber-200 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">
                                          CS ADMIN
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-stone-600 font-light leading-relaxed">{reply.comment || reply.message}</p>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Form Input Balasan Baru */}
                            <div className="flex items-center gap-2 pt-1">
                              <input 
                                type="text"
                                value={replyInputText[rev.id] || ''}
                                onChange={(e) => setReplyInputText({ ...replyInputText, [rev.id]: e.target.value })}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendReply(rev.id); }}
                                placeholder="Tulis balasan untuk ulasan ini..."
                                className="flex-1 bg-stone-100 text-stone-800 text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#25160E] border border-stone-200"
                              />
                              <button 
                                type="button"
                                onClick={() => handleSendReply(rev.id)}
                                className="p-3 bg-[#25160E] text-white rounded-xl hover:bg-[#934b19] transition-colors cursor-pointer"
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

              {/* Tombol Muat Lebih Banyak Ulasan */}
              {sortedReviews.length > visibleReviewsCount && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => setVisibleReviewsCount(prev => prev + 6)}
                    className="px-6 py-2.5 rounded-full border border-stone-300 text-[#25160E] font-semibold text-xs hover:bg-stone-100 transition-colors"
                  >
                    Muat Lebih Banyak Ulasan
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* MODAL WAJIB AUTENTIKASI UNTUK PENGGUNA GUEST */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionName={authActionName}
      />

      {/* 3. FOOTER EDITORIAL TERPADU */}
      <Footer />

    </div>
  );
}
