'use client';

/**
 * ============================================================================
 * KOMPONEN: AdminReviewsTab (src/components/admin/AdminReviewsTab.tsx)
 * DESKRIPSI: Halaman Moderasi Ulasan & Testimoni Pelanggan.
 *            Dilengkapi dengan 4 Kartu KPI Metrik, Filter Kategori Interaktif,
 *            Kartu Ulasan Visual dengan Foto & Badge Bintang Emas,
 *            Balasan Resmi Admin Resto (CS), serta Lightbox Zoom Foto.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import {
  Send,
  Maximize2,
  X,
  Filter,
  Check,
  AlertCircle,
  History,
  Star,
  MessageCircle,
  Camera,
  Trash2,
  CheckCircle2,
  Store,
  Sparkles,
  Search,
  Clock,
  Utensils
} from 'lucide-react';
import { sortReviewsNewestFirst, useData, UserReview } from '@/context/DataContext';

interface AdminReviewsTabProps {
  reviewList: UserReview[];
  deleteReview: (id: string) => void;
  addReviewReply?: (reviewId: string, replyData: { authorName: string; authorEmail?: string; authorAvatar?: string; comment: string }) => void;
}

export default function AdminReviewsTab({
  reviewList,
  deleteReview,
  addReviewReply
}: AdminReviewsTabProps) {
  // --------------------------------------------------------------------------
  // STATE MANAGEMENT
  // --------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<'ALL' | '5' | '4' | 'LOW' | 'PHOTO' | 'NEEDS_REPLY'>('ALL');
  const [adminReplyTextMap, setAdminReplyTextMap] = useState<Record<string, string>>({});
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // ==========================================================================
  // [SCRUDS - SORT]: Pengurutan Ulasan (Terbaru di Atas)
  // --------------------------------------------------------------------------
  // FUNGSI: Mengurutkan seluruh ulasan pembeli secara kronologis (descending),
  //         sehingga testimoni yang baru masuk langsung muncul pertama.
  // ==========================================================================
  const sortedReviews = useMemo(() => {
    return sortReviewsNewestFirst(reviewList || []);
  }, [reviewList]);

  // ==========================================================================
  // KALKULASI KPI METRIK MODERASI
  // ==========================================================================
  const totalReviewsCount = sortedReviews.length;
  
  const avgRating = useMemo(() => {
    if (sortedReviews.length === 0) return '5.0';
    const sum = sortedReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / sortedReviews.length).toFixed(1);
  }, [sortedReviews]);

  const photoAttachmentsCount = useMemo(() => {
    return sortedReviews.reduce((acc, r) => {
      const photos = Array.isArray(r.photos) ? r.photos.length : (r.photo || r.photoUrl || r.image ? 1 : 0);
      return acc + photos;
    }, 0);
  }, [sortedReviews]);

  // Hitungan untuk masing-masing tab filter pill
  const star5Count = useMemo(() => sortedReviews.filter(r => Number(r.rating) >= 5).length, [sortedReviews]);
  const star4Count = useMemo(() => sortedReviews.filter(r => Number(r.rating) >= 4 && Number(r.rating) < 5).length, [sortedReviews]);
  const lowCount = useMemo(() => sortedReviews.filter(r => Number(r.rating) <= 3).length, [sortedReviews]);
  const photoCount = useMemo(() => sortedReviews.filter(r => (Array.isArray(r.photos) && r.photos.length > 0) || r.photo || r.photoUrl || r.image).length, [sortedReviews]);
  const needsReplyCount = useMemo(() => sortedReviews.filter(r => !r.replies || r.replies.length === 0).length, [sortedReviews]);

  // ==========================================================================
  // [SCRUDS - SEARCH & FILTER]: Penyaringan Ulasan Berdasarkan Keyword & Bintang
  // --------------------------------------------------------------------------
  // FUNGSI: Menyaring daftar ulasan berdasarkan kata kunci pencarian (nama pelanggan,
  //         menu pesanan, atau isi komentar) dan filter rating/status balasan.
  // ==========================================================================
  const filteredReviews = useMemo(() => {
    return sortedReviews.filter((rev) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAuthor = (rev.authorName || '').toLowerCase().includes(q);
        const matchProduct = (rev.productName || '').toLowerCase().includes(q);
        const matchComment = (rev.comment || '').toLowerCase().includes(q);
        if (!matchAuthor && !matchProduct && !matchComment) return false;
      }

      // 2. Rating & Category Filter
      if (ratingFilter === '5') {
        if (Number(rev.rating) < 5) return false;
      } else if (ratingFilter === '4') {
        if (Number(rev.rating) < 4 || Number(rev.rating) >= 5) return false;
      } else if (ratingFilter === 'LOW') {
        if (Number(rev.rating) > 3) return false;
      } else if (ratingFilter === 'PHOTO') {
        const hasPhoto = (Array.isArray(rev.photos) && rev.photos.length > 0) || rev.photo || rev.photoUrl || rev.image;
        if (!hasPhoto) return false;
      } else if (ratingFilter === 'NEEDS_REPLY') {
        const hasReply = rev.replies && rev.replies.length > 0;
        if (hasReply) return false;
      }

      return true;
    });
  }, [sortedReviews, searchQuery, ratingFilter]);

  // ==========================================================================
  // [SCRUDS - CREATE / REPLY]: Mengirimkan Balasan Resmi Admin Resto
  // --------------------------------------------------------------------------
  // FUNGSI: Mengirimkan teks balasan dari admin resto ke ulasan pembeli tertentu
  //         dan menyimpannya ke database via `addReviewReply`.
  // ==========================================================================
  const handleSendAdminReply = (reviewId: string, customerName: string) => {
    const text = adminReplyTextMap[reviewId]?.trim();
    if (!text) return;

    if (addReviewReply) {
      addReviewReply(reviewId, {
        authorName: 'Nefakky Official (Dapur Bojong Gede)',
        authorEmail: 'admin@nefakky.com',
        authorAvatar: '/images/ayam_bakar.jpg',
        comment: text
      });
    }

    setAdminReplyTextMap(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="flex flex-col w-full h-full relative font-body-base text-stone-900 space-y-6">
      
      {/* 1. HEADER SECTION & SEARCH TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>ADMIN</span>
            <span>&gt;</span>
            <span className="text-[#934B19] font-bold">Moderasi Ulasan</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight font-['Playfair_Display']">
            Moderasi Ulasan &amp; Testimoni Rasa
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Pantau kepuasan rasa kuliner Nusantara, tanggapi ulasan pembeli terverifikasi, dan berikan balasan resmi dapur.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ulasan, nama menu, pembeli..."
            className="w-full bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#934B19]/30 focus:border-[#934B19] border border-stone-200 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. 4-COLUMN KPI METRIC CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Average Rating */}
        <div className="bg-white rounded-2xl p-4.5 border-l-4 border-l-amber-500 border border-stone-200/90 shadow-2xs flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>Rata-Rata Rating</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
                {avgRating}
              </span>
              <span className="text-stone-400 text-xs font-semibold">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating) || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                />
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Total Reviews */}
        <div className="bg-white rounded-2xl p-4.5 border-l-4 border-l-[#934B19] border border-stone-200/90 shadow-2xs flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <MessageCircle className="w-3.5 h-3.5 text-[#934B19]" />
              <span>Total Ulasan</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
              {totalReviewsCount.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-emerald-200">
              100% Pembeli Nyata
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#934B19] shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Photo Attachments */}
        <div className="bg-white rounded-2xl p-4.5 border-l-4 border-l-emerald-600 border border-stone-200/90 shadow-2xs flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Camera className="w-3.5 h-3.5 text-emerald-600" />
              <span>Foto Lampiran</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
              {photoAttachmentsCount}
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">
              Bukti hidangan asli
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Response Rate */}
        <div className="bg-white rounded-2xl p-4.5 border-l-4 border-l-blue-600 border border-stone-200/90 shadow-2xs flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Tingkat Respons</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-mono">
              98%
            </div>
            <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1 border border-blue-200">
              Rata-rata &lt;15 menit
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. FILTER TABS BAR (PILLS) */}
      <div className="bg-stone-50 p-2 sm:p-2.5 rounded-2xl border border-stone-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setRatingFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            ratingFilter === 'ALL'
              ? 'bg-[#25160E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
          }`}
        >
          Semua Ulasan ({sortedReviews.length})
        </button>

        <button
          type="button"
          onClick={() => setRatingFilter('5')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            ratingFilter === '5'
              ? 'bg-[#25160E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>Bintang 5 Saja ({star5Count})</span>
        </button>

        <button
          type="button"
          onClick={() => setRatingFilter('4')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            ratingFilter === '4'
              ? 'bg-[#25160E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-500" />
          <span>Bintang 4 ({star4Count})</span>
        </button>

        <button
          type="button"
          onClick={() => setRatingFilter('LOW')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            ratingFilter === 'LOW'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Butuh Perhatian (≤3★) ({lowCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setRatingFilter('PHOTO')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            ratingFilter === 'PHOTO'
              ? 'bg-[#25160E] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Ada Foto Lampiran ({photoCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setRatingFilter('NEEDS_REPLY')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            ratingFilter === 'NEEDS_REPLY'
              ? 'bg-[#934B19] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-200/70 border border-stone-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Belum Dibalas ({needsReplyCount})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* [SCRUDS - READ]: Menampilkan Kartu-Kartu Ulasan Pelanggan (Bento 2-Kolom)*/}
      {/* -------------------------------------------------------------------- */}
      {/* FUNGSI: Merender seluruh ulasan hasil pencarian & filter ke dalam      */}
      {/*         kartu ulasan modern dengan foto profil, bintang rating emas,  */}
      {/*         komentar rasa hidangan, galeri foto, dan form balasan admin.   */}
      {/* ==================================================================== */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-stone-900">
            Tidak Ada Ulasan yang Sesuai Kriteria
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {searchQuery 
              ? `Tidak ditemukan ulasan dengan kata kunci "${searchQuery}". Coba kata kunci lain atau ubah filter rating.`
              : 'Belum ada ulasan pada kategori filter ini.'}
          </p>
          {(searchQuery || ratingFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRatingFilter('ALL');
              }}
              className="mt-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl border border-stone-300 transition-all cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.slice(0, visibleCount).map((rev) => {
            const isLowRating = Number(rev.rating) <= 3;
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.authorName || 'Pelanggan')}&background=934B19&color=ffffff&bold=true`;
            const avatarUrl = rev.avatar || rev.authorAvatar || fallbackAvatar;

            // Kumpulkan seluruh foto ulasan hidangan
            const photos: string[] = [];
            if (Array.isArray(rev.photos) && rev.photos.length > 0) {
              photos.push(...rev.photos.filter(Boolean));
            }
            if (rev.photoUrl && !photos.includes(rev.photoUrl)) photos.push(rev.photoUrl);
            if (rev.photo && !photos.includes(rev.photo)) photos.push(rev.photo);
            if (rev.image && !photos.includes(rev.image)) photos.push(rev.image);

            return (
              <div 
                key={rev.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border relative flex flex-col justify-between hover:shadow-md transition-all ${
                  isLowRating 
                    ? 'border-rose-300 bg-gradient-to-b from-rose-50/40 via-white to-white' 
                    : 'border-stone-200/90 hover:border-amber-400/50'
                }`}
              >
                <div>
                  {/* Header: User Info & Golden Rating Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Gambar / Foto Pembeli */}
                      <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-amber-200 shadow-2xs relative bg-stone-100">
                        <img 
                          src={avatarUrl}
                          alt={rev.authorName || 'Pelanggan'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackAvatar;
                          }}
                        />
                      </div>

                      {/* Nama Pelanggan & Info Menu */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm sm:text-base text-stone-900 leading-tight">
                            {rev.authorName || 'Pelanggan'}
                          </h4>
                          {rev.isVerifiedBuyer !== false && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Terverifikasi</span>
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span>{rev.date || 'Hari ini'}</span>
                          <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-900 font-semibold rounded-md border border-amber-200/70 flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-[#934B19]" />
                            <span>{rev.productName || 'Ayam Bakar'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bintang Rating Emas (Golden Amber Badge) */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300/80 rounded-full shadow-2xs shrink-0">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < Math.round(Number(rev.rating) || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-xs font-black text-amber-950">
                        {Number(rev.rating || 5).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Isi Komentar / Ulasan Rasa Hidangan */}
                  <div className={`p-3.5 rounded-2xl mb-4 italic text-xs sm:text-sm leading-relaxed border-l-4 ${
                    isLowRating 
                      ? 'bg-rose-50/80 border-rose-500 text-rose-950 font-medium' 
                      : 'bg-stone-50/90 border-[#934B19] text-stone-800 font-normal'
                  }`}>
                    &ldquo;{rev.comment}&rdquo;
                  </div>

                  {/* Galeri Foto Lampiran Ulasan Hidangan */}
                  {photos.length > 0 && (
                    <div className="flex gap-2.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
                      {photos.map((photoUrl, pIdx) => (
                        <div 
                          key={pIdx}
                          onClick={() => setSelectedPhotoZoom(photoUrl)}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-stone-100 overflow-hidden relative group cursor-pointer border border-stone-200 shadow-2xs shrink-0"
                          title="Klik untuk memperbesar foto"
                        >
                          <img 
                            src={photoUrl} 
                            alt={`Foto hidangan ${pIdx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/ayam_bakar.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5 drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Riwayat Balasan Resmi Restoran (CS Dapur) */}
                  {rev.replies && rev.replies.map((reply: any, rIdx: number) => (
                    <div 
                      key={rIdx} 
                      className="bg-amber-50/80 rounded-2xl p-3.5 mb-3 border border-amber-200/80 text-xs text-stone-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-[#934B19]" />
                          <span>{reply.authorName || 'Nefakky Official (Dapur Bojong Gede)'}</span>
                        </span>
                        <span className="text-stone-500 font-mono text-[10px]">
                          {reply.timestamp || reply.date || 'Hari ini'}
                        </span>
                      </div>
                      <p className="text-stone-700 leading-relaxed font-sans text-xs pt-0.5">
                        {reply.comment}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Bagian Bawah: Form Balasan CS & Tombol Hapus */}
                <div className="mt-auto pt-3 border-t border-stone-100">
                  {isLowRating && (!rev.replies || rev.replies.length === 0) && (
                    <div className="flex items-center gap-1.5 mb-2 text-rose-700 text-[11px] font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Ulasan dengan bintang rendah memerlukan perhatian dapur!</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {/* CS Avatar Indicator */}
                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[#934B19] shrink-0" title="Admin CS Resto">
                      <Store className="w-4 h-4" />
                    </div>

                    {/* Input Draft Balasan */}
                    <input 
                      type="text"
                      value={adminReplyTextMap[rev.id] || ''}
                      onChange={(e) => setAdminReplyTextMap({ ...adminReplyTextMap, [rev.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendAdminReply(rev.id, rev.authorName);
                      }}
                      placeholder={`Ketik balasan untuk ${rev.authorName || 'pelanggan'}...`}
                      className="flex-1 bg-stone-50 hover:bg-stone-100/70 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#934B19] border border-stone-200 transition-all"
                    />

                    {/* [SCRUDS - CREATE / REPLY]: Tombol Kirim Balasan */}
                    <button 
                      type="button"
                      onClick={() => handleSendAdminReply(rev.id, rev.authorName)}
                      className="px-3.5 py-2 bg-[#934B19] hover:bg-[#783603] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 shrink-0"
                      title="Kirim Balasan Resmi Resto"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Balas</span>
                    </button>

                    {/* [SCRUDS - DELETE]: Tombol Hapus Ulasan */}
                    <button 
                      type="button"
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus ulasan dari "${rev.authorName || 'Pelanggan'}"?`)) {
                          deleteReview(rev.id);
                        }
                      }}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer border border-transparent hover:border-rose-200"
                      title="Hapus Ulasan dari Database"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {/* Card Load More Reviews jika masih ada ulasan tersisa */}
          {filteredReviews.length > visibleCount && (
            <div 
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="bg-white rounded-3xl p-6 shadow-xs border-2 border-dashed border-stone-300/80 flex flex-col justify-center items-center text-center hover:border-[#934B19] hover:bg-amber-50/20 transition-all cursor-pointer min-h-[200px] group"
            >
              <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center text-stone-600 group-hover:text-[#934B19] mb-3 transition-colors">
                <History className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-stone-900 group-hover:text-[#934B19] transition-colors mb-1">
                Muat {filteredReviews.length - visibleCount} Ulasan Lainnya
              </div>
              <div className="text-xs text-stone-500">
                Klik untuk menampilkan lebih banyak testimoni pelanggan
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. LIGHTBOX ZOOM MODAL (FOTO ENLARGED) */}
      {selectedPhotoZoom && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full flex flex-col items-center animate-fade-in">
            <div className="absolute top-0 right-0 flex gap-2 -mt-10">
              <button 
                type="button"
                onClick={() => setSelectedPhotoZoom(null)}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Tutup Foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full max-h-[75vh] flex items-center justify-center">
              <img 
                src={selectedPhotoZoom} 
                alt="Foto Ulasan Diperbesar" 
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
