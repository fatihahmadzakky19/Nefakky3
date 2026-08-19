'use client';

import React, { useState, useMemo } from 'react';
import { Star, MessageCircle, Send, Camera, Maximize2, X, ExternalLink } from 'lucide-react';
import { sortReviewsNewestFirst } from '@/context/DataContext';

interface AdminReviewsTabProps {
  reviewList: any[];
  deleteReview: (id: string) => void;
  addReviewReply?: (reviewId: string, replyData: { authorName: string; authorEmail?: string; authorAvatar?: string; comment: string }) => void;
}

export default function AdminReviewsTab({
  reviewList,
  deleteReview,
  addReviewReply
}: AdminReviewsTabProps) {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [adminReplyTextMap, setAdminReplyTextMap] = useState<Record<string, string>>({});
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);

  // Urutkan ulasan agar Ulasan Terbaru selalu berada di paling atas
  const sortedReviews = useMemo(() => {
    return sortReviewsNewestFirst(reviewList || []);
  }, [reviewList]);

  const handleSendAdminReply = (reviewId: string) => {
    const text = adminReplyTextMap[reviewId]?.trim();
    if (!text || !addReviewReply) return;

    addReviewReply(reviewId, {
      authorName: 'Admin CS Nefakky',
      authorEmail: 'admin@nefakky.com',
      authorAvatar: 'https://ui-avatars.com/api/?name=Admin+CS&background=934B19&color=ffffff&bold=true',
      comment: text
    });

    setAdminReplyTextMap((prev) => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#25160e]">Moderasi Ulasan Pelanggan</h1>
        <p className="text-xs text-[#4f4540]">Pantau ulasan cita rasa dan berikan tanggapan resmi dari manajemen.</p>
      </div>

      <div className="space-y-4">
        {sortedReviews.map((rev) => {
          // Kumpulkan seluruh sumber foto ulasan yang dilampirkan pelanggan (termasuk foto produk seperti di tampilan user)
          const photos: string[] = [];
          if (Array.isArray(rev.photos) && rev.photos.length > 0) {
            photos.push(...rev.photos.filter(Boolean));
          }
          if (rev.photoUrl && !photos.includes(rev.photoUrl)) {
            photos.push(rev.photoUrl);
          }
          if (rev.photo && !photos.includes(rev.photo)) {
            photos.push(rev.photo);
          }
          if (rev.image && !photos.includes(rev.image)) {
            photos.push(rev.image);
          }
          if (rev.productImage && !photos.includes(rev.productImage)) {
            photos.push(rev.productImage);
          }

          return (
            <div key={rev.id} className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-xl space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#25160e] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                    {rev.avatar || rev.authorAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={rev.avatar || rev.authorAvatar} alt={rev.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{rev.authorName ? rev.authorName.charAt(0) : 'U'}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#25160e]">{rev.authorName}</h3>
                    <span className="text-[11px] text-[#4f4540]">{rev.date} • {rev.productName || 'Ayam Bakar'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[#fbf9f5] px-2.5 py-1 rounded-xl border border-amber-900/10">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((starIdx) => {
                      const fillPercent = Math.max(0, Math.min(100, (rev.rating - (starIdx - 1)) * 100));
                      return (
                        <div key={starIdx} className="relative inline-flex items-center">
                          <Star className="w-4 h-4 text-stone-300 fill-stone-100" />
                          {fillPercent > 0 && (
                            <div
                              className="absolute top-0 left-0 overflow-hidden"
                              style={{ width: `${fillPercent}%` }}
                            >
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs font-black text-[#934b19] ml-0.5">
                    {Number(rev.rating).toFixed(1)} ★
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#1b1c1a] font-light leading-relaxed">
                "{rev.comment}"
              </p>

              {/* FOTO LAMPIRAN ULASAN PELANGGAN (JIKA ADA) */}
              {photos.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#934b19] mb-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Foto Lampiran Ulasan ({photos.length}):</span>
                  </div>
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {photos.map((photoSrc: string, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPhotoZoom(photoSrc)}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-900/15 group cursor-pointer shadow-xs hover:border-[#934b19] transition-all shrink-0 bg-stone-100"
                        title="Klik untuk memperbesar foto ulasan"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoSrc}
                          alt={`Foto Ulasan ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* List Balasan Komentar Terkait */}
              {rev.replies && rev.replies.length > 0 && (
                <div className="bg-[#fbf9f5] p-3.5 rounded-2xl border border-amber-900/10 space-y-2.5 pt-3">
                  <p className="text-[11px] font-bold text-[#934b19] flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Tanggapan &amp; Diskusi Komentar ({rev.replies.length}):</span>
                  </p>
                  {rev.replies.map((reply: any) => (
                    <div key={reply.id} className="text-xs space-y-0.5 border-b border-amber-900/5 pb-2 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#25160e] text-[11px]">{reply.authorName}</span>
                        <span className="text-[10px] text-stone-400">{reply.date}</span>
                      </div>
                      <p className="text-stone-600 text-[11px] font-normal">{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
                <button
                  onClick={() => setActiveReplyId(activeReplyId === rev.id ? null : rev.id)}
                  className="text-xs font-bold text-[#934b19] hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Tanggapi / Balas Ulasan</span>
                </button>

                <button
                  onClick={() => deleteReview(rev.id)}
                  className="text-rose-600 font-bold hover:underline"
                >
                  Hapus Ulasan
                </button>
              </div>

              {/* Form Balasan Admin Inline */}
              {activeReplyId === rev.id && (
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                  <input
                    type="text"
                    value={adminReplyTextMap[rev.id] || ''}
                    onChange={(e) => setAdminReplyTextMap({ ...adminReplyTextMap, [rev.id]: e.target.value })}
                    placeholder={`Tulis balasan resmi manajemen untuk ${rev.authorName}...`}
                    className="flex-1 px-3.5 py-2 bg-[#fbf9f5] border border-amber-900/15 rounded-xl text-xs outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendAdminReply(rev.id);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSendAdminReply(rev.id)}
                    disabled={!adminReplyTextMap[rev.id]?.trim()}
                    className="px-4 py-2 bg-[#934b19] text-white text-xs font-bold rounded-xl flex items-center gap-1 hover:bg-[#783603] disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Kirim</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL ZOOM FULL-SCREEN FOTO ULASAN */}
      {selectedPhotoZoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedPhotoZoom(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#25160E] rounded-3xl overflow-hidden shadow-2xl border border-amber-900/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#1e110a] flex items-center justify-between border-b border-amber-900/30">
              <span className="font-serif text-sm font-bold text-amber-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Foto Ulasan Pelanggan</span>
              </span>
              <button
                onClick={() => setSelectedPhotoZoom(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhotoZoom}
                alt="Foto Ulasan Full Size"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="p-4 bg-[#1e110a] border-t border-amber-900/30 flex justify-between items-center text-xs text-amber-200/80">
              <span>Lampiran Foto Ulasan Terverifikasi Pelanggan</span>
              <a
                href={selectedPhotoZoom}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#934B19] hover:bg-[#783603] text-white font-bold rounded-xl flex items-center gap-1.5 shadow transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Tab Baru</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
