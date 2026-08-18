'use client';

/**
 * ============================================================================
 * MODULE: Halaman Komentar & Ulasan Pelanggan (Comments Page)
 * DESKRIPSI: Memungkinkan pelanggan melihat serta menuliskan ulasan rasa
 *            beserta foto produk masakan (Google Stitch AI Design System).
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useData, sortReviewsNewestFirst } from '@/context/DataContext';
import Navbar from '@/components/Navbar';
import { 
  Star, 
  Send, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  Quote,
  Camera,
  Image as ImageIcon,
  X,
  Trash2,
  UploadCloud,
  MessageCircle
} from 'lucide-react';

export default function CommentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dishParam = searchParams?.get('dish');

  const { user, loading } = useAuth();
  const { products, reviews, addReview, addReviewReply } = useData();

  // Urutkan ulasan agar Ulasan Terbaru selalu berada di paling atas
  const sortedReviews = React.useMemo(() => {
    return sortReviewsNewestFirst(reviews || []);
  }, [reviews]);

  // Ref Input Berkas Foto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Lokal Formulir Komentar
  const [newComment, setNewComment] = useState<string>('');
  const [ratingInput, setRatingInput] = useState<string>('5.0');
  const [selectedDish, setSelectedDish] = useState<string>(dishParam || products[0]?.name || 'Ayam Bakar');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (dishParam) {
      setSelectedDish(dishParam);
    }
  }, [dishParam]);

  // State Balasan Komentar Ulasan
  const [activeReplyReviewId, setActiveReplyReviewId] = useState<string | null>(null);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Handler Kirim Balasan Komentar
  const handleSendReply = (reviewId: string) => {
    if (!user) {
      alert('Silakan Masuk (Login) terlebih dahulu untuk membalas ulasan.');
      router.push('/login');
      return;
    }

    const text = replyTextMap[reviewId]?.trim();
    if (!text) return;

    const authorName = user.displayName || user.email?.split('@')[0] || 'Pengguna Nefakky';
    const authorAvatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=3C2A21&color=ffffff&bold=true`;

    addReviewReply(reviewId, {
      authorName,
      authorEmail: user.email || undefined,
      authorAvatar,
      comment: text
    });

    setReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
  };

  // Nilai desimal numerik terhitung untuk kalkulasi presisi bintang
  const parsedRating = parseFloat(ratingInput);
  const currentRatingNum = isNaN(parsedRating)
    ? 5.0
    : Math.max(1.0, Math.min(5.0, Number(parsedRating.toFixed(1))));

  // Helper render bintang rating dengan dukungan desimal (presisi partial fill)
  const renderStarRating = (ratingVal: number, starSize = "w-4 h-4") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIdx) => {
          const fillPercent = Math.max(0, Math.min(100, (ratingVal - (starIdx - 1)) * 100));
          return (
            <div key={starIdx} className="relative inline-flex items-center">
              <Star className={`${starSize} text-stone-200 fill-stone-100`} />
              {fillPercent > 0 && (
                <div 
                  className="absolute top-0 left-0 overflow-hidden" 
                  style={{ width: `${fillPercent}%` }}
                >
                  <Star className={`${starSize} fill-amber-400 text-amber-400`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Fungsi Menangani Unggah Foto dari Perangkat
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Batasi ukuran maksimal 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal ukuran file adalah 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hapus Foto Terpilih
  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Silakan Masuk (Login) terlebih dahulu untuk menulis ulasan.');
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    const authorName = user.displayName || user.email?.split('@')[0] || 'Pengguna Nefakky';
    
    addReview({
      authorName,
      authorEmail: user.email || undefined,
      avatar: user.photoURL || undefined,
      rating: currentRatingNum,
      productName: selectedDish,
      comment: newComment,
      photos: photoPreview ? [photoPreview] : undefined,
      productImage: photoPreview || undefined
    });

    setNewComment('');
    setRatingInput('5.0');
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-stone-300 border-t-[#25160E] rounded-full animate-spin mb-4" />
        <p className="text-xs text-[#4F4540] font-medium tracking-wide">Memuat Komentar & Ulasan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1B1C1A] font-sans selection:bg-[#934B19]/10 selection:text-[#934B19] pb-20 lg:pb-0">
      
      {/* 1. BILAH NAVIGASI UTAMA */}
      <Navbar />

      {/* 2. KONTEN UTAMA HALAMAN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-12 py-6 sm:py-10 space-y-6 sm:space-y-10">
        
        {/* Header Judul Halaman (Google Stitch Design Token) */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3.5 py-1.5 bg-[#934B19]/10 text-[#934B19] text-xs font-bold rounded-full border border-[#934B19]/20 uppercase tracking-wider inline-block">
            Komunitas Pecinta Kuliner
          </span>
          <h1 className="font-serif text-2xl sm:text-5xl font-bold text-[#25160E] tracking-tight">
            Ulasan & Pengalaman Pelanggan
          </h1>
          <p className="text-xs sm:text-sm text-[#4F4540] font-medium leading-relaxed">
            Temukan cerita cita rasa otentik dari pelanggan Nefakky. Bagikan masukan dan foto hidangan masakan Anda bersama kami.
          </p>
        </div>

        {/* Grid 2 Kolom: Form Komentar (Kiri) & Daftar Ulasan (Kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI: FORMULIR TAMBAH ULASAN */}
          <div className="lg:col-span-4 bg-white border border-amber-900/10 rounded-3xl p-6 shadow-xl shadow-amber-950/5 space-y-4 sticky top-24">
            <h2 className="font-serif text-xl font-bold text-[#25160E] flex items-center gap-2 border-b border-stone-100 pb-3">
              <MessageSquare className="w-5 h-5 text-[#934B19]" />
              <span>Tulis Ulasan Rasa</span>
            </h2>

            {/* Pesan Berhasil Terbit */}
            {submitSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-fade-in font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ulasan & foto Anda berhasil diterbitkan!</span>
              </div>
            )}

            <form onSubmit={handleSubmitComment} className="space-y-4">
              
              {/* Pilihan Hidangan */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-1.5">Pilih Menu Hidangan</label>
                <select
                  value={selectedDish}
                  onChange={(e) => setSelectedDish(e.target.value)}
                  className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 cursor-pointer shadow-sm"
                >
                  {(products || []).map((prod) => (
                    <option key={prod.id} value={prod.name}>
                      {prod.name} ({prod.category}) — Rating: {prod.rating.toFixed(1)} ★
                    </option>
                  ))}
                </select>
              </div>

              {/* Bintang Penilaian - Input Custom Rating */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#934B19]" />
                    <span>Bintang Penilaian (Rating 1.0 - 5.0) *</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-medium">Bisa Ketik Custom (contoh: 4.8)</span>
                </label>
                
                <div className="flex items-center gap-3 bg-[#FBF9F5] p-3 rounded-2xl border border-amber-900/15">
                  {/* Input Angka Custom Rating (Ketik Bebas Desimal) */}
                  <div className="relative shrink-0">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={ratingInput}
                      onChange={(e) => {
                        // Izinkan hanya angka, titik, koma
                        const val = e.target.value.replace(',', '.');
                        setRatingInput(val);
                      }}
                      onBlur={() => {
                        const val = parseFloat(ratingInput);
                        if (isNaN(val) || val < 1) {
                          setRatingInput('1.0');
                        } else if (val > 5) {
                          setRatingInput('5.0');
                        } else {
                          setRatingInput(Number(val.toFixed(1)).toString());
                        }
                      }}
                      placeholder="4.8"
                      className="w-20 px-3 py-2 bg-white border border-amber-900/20 rounded-xl text-sm font-extrabold text-[#934B19] text-center focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 shadow-xs"
                      required
                    />
                    <span className="absolute -top-2 -right-1 text-[9px] font-bold bg-[#934B19] text-white px-1.5 py-0.2 rounded-full shadow-xs">
                      ★
                    </span>
                  </div>

                  {/* Visual Live Star Preview & Score Text */}
                  <div className="flex-1 flex items-center justify-between pl-1">
                    <div>
                      {renderStarRating(currentRatingNum, "w-5 h-5")}
                      <p className="text-[10px] text-stone-500 font-medium mt-0.5">Rating: {currentRatingNum.toFixed(1)} / 5.0</p>
                    </div>
                    <span className="text-xs font-mono font-black text-[#934B19] bg-amber-100/80 px-2.5 py-1 rounded-xl border border-amber-300/60">
                      {currentRatingNum.toFixed(1)} ★
                    </span>
                  </div>
                </div>
              </div>

              {/* Input Teks Komentar */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-1.5">Komentar / Ulasan Rasa</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bagikan kelezatan masakan yang Anda rasakan..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#FBF9F5] border border-amber-900/15 rounded-2xl text-xs text-[#1B1C1A] placeholder-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 shadow-sm"
                  required
                />
              </div>

              {/* Unggah Foto Hidangan / Makanan */}
              <div>
                <label className="block text-xs font-bold text-[#25160E] mb-1.5">
                  Foto Hidangan Makanan (Opsional)
                </label>
                
                {/* Input File Tersembunyi */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {!photoPreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3.5 px-4 bg-[#FBF9F5] hover:bg-amber-900/5 border border-dashed border-amber-900/30 rounded-2xl text-xs text-[#934B19] font-bold transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
                  >
                    <Camera className="w-4 h-4 text-[#934B19] group-hover:scale-110 transition-transform" />
                    <span>Tambah Foto Masakan</span>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-amber-900/20 shadow-sm bg-stone-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={photoPreview} 
                      alt="Pratinjau Foto Ulasan" 
                      className="w-full h-40 object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs shadow transition-colors cursor-pointer"
                      title="Hapus Foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#25160E] hover:bg-[#3C2A21] text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] uppercase tracking-wider cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Kirim Ulasan</span>
              </button>
            </form>
          </div>

          {/* KOLOM KANAN: DAFTAR ULASAN PELANGGAN */}
          <div className="lg:col-span-8 space-y-6">
            {sortedReviews.map((item) => {
              const avatarUrl = item.avatar || item.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.authorName)}&background=3C2A21&color=ffffff&bold=true`;
              const attachedPhoto = item.photos?.[0] || item.productImage;
              
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl shadow-amber-950/5 space-y-4 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-[#3C2A21] border border-amber-900/20 shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatarUrl} alt={item.authorName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#25160E]">
                          {item.authorName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#4F4540] font-medium mt-0.5">
                          <span>{item.date}</span>
                          {item.productName && (
                            <>
                              <span>•</span>
                              <span className="text-[#934B19] font-bold">{item.productName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bintang Penilaian */}
                    <div className="flex items-center gap-1.5 bg-[#FBF9F5] px-2.5 py-1 rounded-xl border border-amber-900/10 shrink-0">
                      {renderStarRating(item.rating, "w-4 h-4")}
                      <span className="text-xs font-black text-[#934B19] ml-0.5">
                        {Number(item.rating).toFixed(1)} ★
                      </span>
                    </div>
                  </div>

                  {/* Isi Komentar */}
                  <p className="text-xs text-[#1B1C1A] font-light leading-relaxed pt-1 flex items-start gap-2">
                    <Quote className="w-4 h-4 text-[#934B19] shrink-0 rotate-180" />
                    <span>{item.comment}</span>
                  </p>

                  {/* Tampilan Foto Makanan yang Ditempelkan */}
                  {attachedPhoto && (
                    <div className="pt-2">
                      <div className="relative rounded-2xl overflow-hidden max-h-64 w-full sm:max-w-md border border-amber-900/15 shadow-sm bg-stone-100 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={attachedPhoto} 
                          alt={`Foto Ulasan ${item.productName || 'Hidangan'}`} 
                          className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => window.open(attachedPhoto, '_blank')}
                        />
                        <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium rounded-lg flex items-center gap-1 pointer-events-none">
                          <ImageIcon className="w-3 h-3 text-amber-300" />
                          <span>Foto Makanan</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Seksi Balasan Komentar antar Pengguna */}
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    {/* Bar Akses Tombol Balas */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveReplyReviewId(activeReplyReviewId === item.id ? null : item.id)}
                        className="text-xs font-bold text-[#934B19] hover:text-[#783603] flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          {item.replies && item.replies.length > 0 
                            ? `Balasan Komentar (${item.replies.length})` 
                            : 'Balas Komentar Ini'}
                        </span>
                      </button>
                    </div>

                    {/* Daftar Balasan Komentar yang Sudah Ada */}
                    {item.replies && item.replies.length > 0 && (
                      <div className="bg-[#FBF9F5] p-3.5 rounded-2xl border border-amber-900/10 space-y-3">
                        {item.replies.map((reply) => {
                          const replyAvatar = reply.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.authorName)}&background=934B19&color=ffffff`;
                          const isAdmin = reply.authorName.toLowerCase().includes('admin') || reply.authorEmail === 'admin@nefakky.com';
                          
                          return (
                            <div key={reply.id} className="flex items-start gap-2.5 text-xs border-b border-amber-900/5 pb-2.5 last:border-b-0 last:pb-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={replyAvatar} alt={reply.authorName} className="w-7 h-7 rounded-full object-cover shrink-0 border border-amber-900/20" />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#25160E]">{reply.authorName}</span>
                                    {isAdmin && (
                                      <span className="bg-[#934B19] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-md">
                                        CS ADMIN
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-stone-400 font-medium">{reply.date}</span>
                                </div>
                                <p className="text-[#4F4540] font-normal leading-relaxed text-[11px]">{reply.comment}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Form Balas Inline */}
                    {activeReplyReviewId === item.id && (
                      <div className="flex items-center gap-2 pt-1 animate-fade-in">
                        <input
                          type="text"
                          value={replyTextMap[item.id] || ''}
                          onChange={(e) => setReplyTextMap({ ...replyTextMap, [item.id]: e.target.value })}
                          placeholder={`Tulis balasan untuk ${item.authorName}...`}
                          className="flex-1 px-3.5 py-2 bg-[#FBF9F5] border border-amber-900/15 rounded-xl text-xs text-[#1B1C1A] focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendReply(item.id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReply(item.id)}
                          disabled={!replyTextMap[item.id]?.trim()}
                          className="px-3.5 py-2 bg-[#934B19] hover:bg-[#783603] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1 shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </main>
    </div>
  );
}

